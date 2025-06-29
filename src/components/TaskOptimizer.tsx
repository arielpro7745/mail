import { useState } from "react";
import { Task, Street, Building } from "../types";
import { streets } from "../data/streets";
import { Zap, MapPin, Clock, TrendingUp, Lightbulb, Plus } from "lucide-react";

interface OptimizedTask extends Task {
  optimizationScore: number;
  suggestedOrder: number;
  estimatedEfficiency: number;
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

  // חישוב ציון אופטימיזציה למשימה
  const calculateOptimizationScore = (task: Task): number => {
    let score = 0;

    // ציון לפי עדיפות
    const priorityScores = { urgent: 100, high: 75, medium: 50, low: 25 };
    score += priorityScores[task.priority];

    // ציון לפי תאריך יעד
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) score += 50;
      else if (daysUntilDue <= 3) score += 30;
      else if (daysUntilDue <= 7) score += 10;
    }

    // ציון לפי אזור נוכחי
    if (task.assignedArea === currentArea) score += 25;

    // ציון לפי זמן משוער (משימות קצרות יותר מועדפות)
    if (task.estimatedTime) {
      if (task.estimatedTime <= 15) score += 20;
      else if (task.estimatedTime <= 30) score += 10;
    }

    return score;
  };

  // אופטימיזציה של משימות
  const optimizeTasks = () => {
    setIsOptimizing(true);

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    // חישוב ציונים ומיון
    const optimizedTasks: OptimizedTask[] = pendingTasks
      .map(task => ({
        ...task,
        optimizationScore: calculateOptimizationScore(task),
        suggestedOrder: 0,
        estimatedEfficiency: 0
      }))
      .sort((a, b) => b.optimizationScore - a.optimizationScore)
      .map((task, index) => ({
        ...task,
        suggestedOrder: index + 1,
        estimatedEfficiency: Math.max(60, 100 - (index * 5))
      }));

    setTimeout(() => {
      onOptimize(optimizedTasks);
      setIsOptimizing(false);
    }, 1000);
  };

  // הצעות משימות חכמות
  const generateSmartSuggestions = () => {
    const suggestions: Array<Omit<Task, 'id' | 'createdAt'>> = [];

    // הצעות לפי רחובות שלא חולקו זמן רב
    const areaStreets = streets.filter(s => s.area === currentArea);
    areaStreets.forEach(street => {
      if (!street.lastDelivered || 
          (Date.now() - new Date(street.lastDelivered).getTime()) > 10 * 24 * 60 * 60 * 1000) {
        suggestions.push({
          title: `חלוקת דואר - ${street.name}`,
          description: `חלוקה דחופה ברחוב ${street.name}`,
          type: 'delivery',
          priority: 'high',
          status: 'pending',
          assignedArea: currentArea,
          streetId: street.id,
          estimatedTime: street.isBig ? 45 : 25
        });
      }
    });

    // הצעות תחזוקה לבניינים
    buildings.forEach(building => {
      const streetName = streets.find(s => s.id === building.streetId)?.name;
      if (building.residents.length > 5) {
        suggestions.push({
          title: `בדיקת תיבות דואר - ${streetName} ${building.number}`,
          description: `בדיקה שגרתית של תיבות הדואר בבניין`,
          type: 'maintenance',
          priority: 'medium',
          status: 'pending',
          buildingId: building.id,
          estimatedTime: 20
        });
      }
    });

    // הצעות מיון דואר
    suggestions.push({
      title: 'מיון דואר יומי',
      description: 'מיון והכנת דואר לחלוקה',
      type: 'sorting',
      priority: 'medium',
      status: 'pending',
      estimatedTime: 30
    });

    return suggestions.slice(0, 5); // מגביל ל-5 הצעות
  };

  const suggestions = generateSmartSuggestions();

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg mb-6">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-purple-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">אופטימיזציה חכמה</h3>
              <p className="text-sm text-gray-600">מיון משימות לפי עדיפות ויעילות</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Lightbulb size={16} />
              הצעות חכמות
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

      {/* הצעות חכמות */}
      {showSuggestions && (
        <div className="p-6 border-b border-gray-200 bg-green-50">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-green-600" />
            הצעות משימות חכמות
          </h4>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800 mb-1">{suggestion.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {suggestion.priority === 'high' ? 'גבוה' :
                         suggestion.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                      {suggestion.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          {suggestion.estimatedTime} דק׳
                        </div>
                      )}
                      {suggestion.assignedArea && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          אזור {suggestion.assignedArea}
                        </div>
                      )}
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
        <h4 className="font-semibold text-gray-800 mb-3">קריטריונים לאופטימיזציה</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h5 className="font-medium text-red-800 mb-1">עדיפות</h5>
            <p className="text-sm text-red-600">משימות דחופות קודם</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h5 className="font-medium text-orange-800 mb-1">תאריך יעד</h5>
            <p className="text-sm text-orange-600">משימות עם דדליין קרוב</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-1">מיקום</h5>
            <p className="text-sm text-blue-600">אזור נוכחי מועדף</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-1">זמן</h5>
            <p className="text-sm text-green-600">משימות קצרות מועדפות</p>
          </div>
        </div>
      </div>
    </div>
  );
}