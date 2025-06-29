import { useState } from "react";
import { Task, Street, Building } from "../types";
import { streets } from "../data/streets";
import { totalDaysBetween, getUrgencyLevel } from "../utils/dates";
import { Zap, MapPin, Clock, TrendingUp, Lightbulb, Plus, AlertTriangle, CheckCircle } from "lucide-react";

interface OptimizedTask extends Task {
  optimizationScore: number;
  suggestedOrder: number;
  estimatedEfficiency: number;
  urgencyReason?: string;
}

interface Props {
  tasks: Task[];
  buildings: Building[];
  currentArea: 14 | 45;
  onOptimize: (optimizedTasks: OptimizedTask[]) => void;
  onCreateSuggestedTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
}

export default function TaskOptimizer({ 
  tasks, 
  buildings, 
  currentArea, 
  onOptimize, 
  onCreateSuggestedTask 
}: Props) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // קבלת מצב הרחובות באזור הנוכחי
  const getAreaStreetStatus = () => {
    const areaStreets = streets.filter(s => s.area === currentArea);
    const today = new Date();
    
    return areaStreets.map(street => {
      const daysSinceDelivery = street.lastDelivered 
        ? totalDaysBetween(new Date(street.lastDelivered), today)
        : 999;
      
      const urgencyLevel = getUrgencyLevel(street.lastDelivered);
      const needsDelivery = !street.lastDelivered || daysSinceDelivery >= 14;
      
      return {
        ...street,
        daysSinceDelivery,
        urgencyLevel,
        needsDelivery
      };
    });
  };

  // חישוב ציון אופטימיזציה מתקדם למשימה
  const calculateOptimizationScore = (task: Task): { score: number; reason: string } => {
    let score = 0;
    let reasons: string[] = [];

    // ציון לפי עדיפות (בסיסי)
    const priorityScores = { urgent: 100, high: 75, medium: 50, low: 25 };
    score += priorityScores[task.priority];
    reasons.push(`עדיפות ${task.priority}: +${priorityScores[task.priority]}`);

    // ציון לפי תאריך יעד
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 0) {
        score += 80;
        reasons.push("פג תוקף: +80");
      } else if (daysUntilDue <= 1) {
        score += 60;
        reasons.push("דדליין היום: +60");
      } else if (daysUntilDue <= 3) {
        score += 40;
        reasons.push("דדליין קרוב: +40");
      } else if (daysUntilDue <= 7) {
        score += 20;
        reasons.push("דדליין השבוע: +20");
      }
    }

    // ציון מתקדם לפי מצב הרחובות באזור
    if (task.assignedArea === currentArea) {
      score += 30;
      reasons.push("אזור נוכחי: +30");

      // בונוס נוסף אם המשימה קשורה לרחוב דחוף
      if (task.streetId) {
        const street = streets.find(s => s.id === task.streetId);
        if (street) {
          const daysSinceDelivery = street.lastDelivered 
            ? totalDaysBetween(new Date(street.lastDelivered), new Date())
            : 999;
          
          const urgencyLevel = getUrgencyLevel(street.lastDelivered);
          
          if (urgencyLevel === 'critical') {
            score += 70;
            reasons.push(`רחוב קריטי (${daysSinceDelivery} ימים): +70`);
          } else if (urgencyLevel === 'urgent') {
            score += 50;
            reasons.push(`רחוב דחוף (${daysSinceDelivery} ימים): +50`);
          } else if (daysSinceDelivery < 7) {
            // רחוב שחולק לאחרונה - מעט פחות עדיפות
            score -= 20;
            reasons.push(`רחוב חולק לאחרונה: -20`);
          }
        }
      }
    } else if (task.assignedArea) {
      // משימה באזור אחר - פחות עדיפות
      score -= 15;
      reasons.push("אזור אחר: -15");
    }

    // ציון לפי זמן משוער (משימות קצרות יותר מועדפות)
    if (task.estimatedTime) {
      if (task.estimatedTime <= 15) {
        score += 25;
        reasons.push("משימה קצרה: +25");
      } else if (task.estimatedTime <= 30) {
        score += 15;
        reasons.push("משימה בינונית: +15");
      } else if (task.estimatedTime > 60) {
        score -= 10;
        reasons.push("משימה ארוכה: -10");
      }
    }

    // בונוס למשימות חלוקה ברחובות שלא חולקו זמן רב
    if (task.type === 'delivery' && task.streetId) {
      const street = streets.find(s => s.id === task.streetId);
      if (street && (!street.lastDelivered || 
          totalDaysBetween(new Date(street.lastDelivered), new Date()) >= 14)) {
        score += 40;
        reasons.push("חלוקה ברחוב שלא חולק: +40");
      }
    }

    // פיצוי למשימות תחזוקה חשובות
    if (task.type === 'maintenance' && task.priority === 'high') {
      score += 30;
      reasons.push("תחזוקה חשובה: +30");
    }

    return { 
      score: Math.max(0, score), 
      reason: reasons.slice(0, 3).join(', ') 
    };
  };

  // אופטימיזציה של משימות
  const optimizeTasks = () => {
    setIsOptimizing(true);

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    // חישוב ציונים ומיון
    const optimizedTasks: OptimizedTask[] = pendingTasks
      .map(task => {
        const { score, reason } = calculateOptimizationScore(task);
        return {
          ...task,
          optimizationScore: score,
          suggestedOrder: 0,
          estimatedEfficiency: 0,
          urgencyReason: reason
        };
      })
      .sort((a, b) => b.optimizationScore - a.optimizationScore)
      .map((task, index) => ({
        ...task,
        suggestedOrder: index + 1,
        estimatedEfficiency: Math.max(60, Math.min(100, 100 - (index * 3)))
      }));

    setTimeout(() => {
      onOptimize(optimizedTasks);
      setIsOptimizing(false);
    }, 1000);
  };

  // הצעות משימות חכמות מבוססות דחיפות רחובות
  const generateSmartSuggestions = () => {
    const suggestions: Array<Omit<Task, 'id' | 'createdAt'>> = [];
    const areaStreetStatus = getAreaStreetStatus();

    // הצעות לפי רחובות דחופים
    const urgentStreets = areaStreetStatus
      .filter(s => s.urgencyLevel === 'critical' || s.urgencyLevel === 'urgent')
      .sort((a, b) => b.daysSinceDelivery - a.daysSinceDelivery)
      .slice(0, 3);

    urgentStreets.forEach(street => {
      const priorityLevel = street.urgencyLevel === 'critical' ? 'urgent' : 'high';
      suggestions.push({
        title: `חלוקה דחופה - ${street.name}`,
        description: `חלוקה דחופה ברחוב ${street.name} (${street.daysSinceDelivery} ימים ללא חלוקה)`,
        type: 'delivery',
        priority: priorityLevel,
        status: 'pending',
        assignedArea: currentArea,
        streetId: street.id,
        estimatedTime: street.isBig ? 45 : 25,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // מחר
      });
    });

    // הצעות תחזוקה לבניינים באזור הנוכחי
    const areaBuildings = buildings.filter(b => {
      const street = streets.find(s => s.id === b.streetId);
      return street?.area === currentArea;
    });

    areaBuildings.slice(0, 2).forEach(building => {
      const street = streets.find(s => s.id === building.streetId);
      suggestions.push({
        title: `בדיקת תיבות - ${street?.name} ${building.number}`,
        description: `בדיקה שגרתית של תיבות הדואר בבניין`,
        type: 'maintenance',
        priority: 'medium',
        status: 'pending',
        buildingId: building.id,
        assignedArea: currentArea,
        estimatedTime: 20
      });
    });

    // הצעת מיון דואר יומי
    suggestions.push({
      title: `מיון דואר אזור ${currentArea}`,
      description: 'מיון והכנת דואר לחלוקה באזור הנוכחי',
      type: 'sorting',
      priority: 'medium',
      status: 'pending',
      assignedArea: currentArea,
      estimatedTime: 30
    });

    return suggestions.slice(0, 6);
  };

  const suggestions = generateSmartSuggestions();
  const areaStreetStatus = getAreaStreetStatus();
  const urgentStreetsCount = areaStreetStatus.filter(s => s.urgencyLevel === 'critical' || s.urgencyLevel === 'urgent').length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-6">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-purple-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">אופטימיזציה חכמה מתקדמת</h3>
              <p className="text-sm text-gray-600">
                מיון משימות לפי דחיפות רחובות ויעילות אזורית
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Lightbulb size={16} />
              הצעות חכמות ({suggestions.length})
            </button>
            <button
              onClick={optimizeTasks}
              disabled={isOptimizing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isOptimizing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <TrendingUp size={16} />
              )}
              {isOptimizing ? 'מבצע אופטימיזציה...' : 'בצע אופטימיזציה'}
            </button>
          </div>
        </div>
      </div>

      {/* סטטוס אזור נוכחי */}
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" />
          מצב אזור {currentArea}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">רחובות דחופים</span>
              <span className={`font-bold text-lg ${urgentStreetsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {urgentStreetsCount}
              </span>
            </div>
            {urgentStreetsCount > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertTriangle size={12} />
                דורש טיפול דחוף
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">סה״כ רחובות</span>
              <span className="font-bold text-lg text-blue-600">
                {areaStreetStatus.length}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">רחובות מעודכנים</span>
              <span className="font-bold text-lg text-green-600">
                {areaStreetStatus.filter(s => s.urgencyLevel === 'normal').length}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <CheckCircle size={12} />
              חולקו לאחרונה
            </div>
          </div>
        </div>
      </div>

      {/* הצעות חכמות */}
      {showSuggestions && (
        <div className="p-6 border-b border-gray-200 bg-green-50">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-green-600" />
            הצעות משימות מבוססות דחיפות
          </h4>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-800">{suggestion.title}</h5>
                      {suggestion.priority === 'urgent' && (
                        <AlertTriangle size={16} className="text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        suggestion.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        suggestion.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {suggestion.priority === 'urgent' ? 'דחוף' :
                         suggestion.priority === 'high' ? 'גבוה' :
                         suggestion.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                      {suggestion.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {suggestion.estimatedTime} דק׳
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        אזור {suggestion.assignedArea}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onCreateSuggestedTask(suggestion)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus size={14} />
                    הוסף
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* מידע על האופטימיזציה */}
      <div className="p-6">
        <h4 className="font-semibold text-gray-800 mb-3">קריטריונים מתקדמים לאופטימיזציה</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h5 className="font-medium text-red-800 mb-1">דחיפות רחובות</h5>
            <p className="text-sm text-red-600">רחובות שלא חולקו 14+ ימים</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h5 className="font-medium text-orange-800 mb-1">אזור נוכחי</h5>
            <p className="text-sm text-orange-600">עדיפות למשימות באזור הפעיל</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-1">איזון עומסים</h5>
            <p className="text-sm text-blue-600">פחות עדיפות לאזורים שחולקו</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-1">יעילות זמן</h5>
            <p className="text-sm text-green-600">משימות קצרות ודדליינים</p>
          </div>
        </div>
      </div>
    </div>
  );
}