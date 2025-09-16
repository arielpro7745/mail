import { useState, useEffect } from "react";
import { useDistribution } from "../hooks/useDistribution";
import { useBuildings } from "../hooks/useBuildings";
import { holidayMailTypes, holidayPeriods, holidayStrategies } from "../data/holidayMail";
import { HolidayPeriod, DailyMailLoad, HolidayStrategy } from "../types/holiday";
import { 
  Calendar, Clock, TrendingUp, AlertTriangle, 
  Package, Mail, Star, Target, CheckCircle,
  BarChart3, Lightbulb, Timer, MapPin, Zap
} from "lucide-react";

export default function HolidayManager() {
  const { todayArea, allStreets } = useDistribution();
  const { buildings } = useBuildings();
  const [selectedPeriod, setSelectedPeriod] = useState<HolidayPeriod | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<HolidayStrategy | null>(null);
  const [dailyLoads, setDailyLoads] = useState<DailyMailLoad[]>([]);
  const [showPlanner, setShowPlanner] = useState(false);

  // זיהוי תקופת חג נוכחית
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentPeriod = holidayPeriods.find(period => 
      today >= period.startDate && today <= period.endDate
    );
    
    if (currentPeriod) {
      setSelectedPeriod(currentPeriod);
      
      // בחירת אסטרטגיה מתאימה
      const strategy = currentPeriod.estimatedVolume === 'extreme' ? holidayStrategies[0] :
                     currentPeriod.estimatedVolume === 'high' ? holidayStrategies[1] :
                     holidayStrategies[2];
      setSelectedStrategy(strategy);
    }
  }, []);

  // חישוב זמן משוער לאזור
  const calculateAreaTime = (area: 12 | 14 | 45, mailTypeIds: string[]) => {
    const areaStreets = allStreets.filter(s => s.area === area);
    const areaBuildings = buildings.filter(b => {
      const street = allStreets.find(s => s.id === b.streetId);
      return street?.area === area;
    });

    let totalTime = 0;
    
    mailTypeIds.forEach(typeId => {
      const mailType = holidayMailTypes.find(mt => mt.id === typeId);
      if (mailType) {
        totalTime += areaBuildings.length * mailType.estimatedTimePerBuilding;
      }
    });

    return {
      buildings: areaBuildings.length,
      streets: areaStreets.length,
      estimatedTime: totalTime,
      estimatedHours: Math.round(totalTime / 60 * 10) / 10
    };
  };

  // יצירת תכנית יומית
  const generateDailyPlan = () => {
    if (!selectedPeriod || !selectedStrategy) return;

    const startDate = new Date();
    const plan: DailyMailLoad[] = [];

    for (let i = 0; i < selectedStrategy.recommendedDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const area = (i % 3 === 0) ? 12 : (i % 3 === 1) ? 14 : 45;
      const areaStats = calculateAreaTime(area, selectedPeriod.mailTypes);
      
      // חלוקת סוגי הדואר לפי יום
      const dailyMailTypes = selectedPeriod.mailTypes.map(typeId => {
        const mailType = holidayMailTypes.find(mt => mt.id === typeId);
        if (!mailType) return null;
        
        const volume = Math.floor(areaStats.buildings * 0.8); // 80% מהבניינים
        const time = volume * mailType.estimatedTimePerBuilding;
        
        return {
          typeId,
          volume,
          estimatedTime: time
        };
      }).filter(Boolean) as any[];

      plan.push({
        date: date.toISOString().split('T')[0],
        area,
        mailTypes: dailyMailTypes,
        totalEstimatedTime: dailyMailTypes.reduce((sum, mt) => sum + mt.estimatedTime, 0),
        status: 'planned'
      });
    }

    setDailyLoads(plan);
    setShowPlanner(true);
  };

  // עדכון סטטוס יום
  const updateDayStatus = (date: string, status: DailyMailLoad['status'], actualTime?: number) => {
    setDailyLoads(prev => prev.map(day => 
      day.date === date 
        ? { ...day, status, actualTime }
        : day
    ));
  };

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'extreme': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getVolumeLabel = (volume: string) => {
    switch (volume) {
      case 'extreme': return 'קיצוני 🔥';
      case 'high': return 'גבוה ⚡';
      case 'medium': return 'בינוני 📊';
      default: return 'נמוך ✅';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎄 ניהול דואר לחגים</h2>
        <p className="text-gray-600">תכנון מסודר להתמודדות עם עומסי החגים</p>
      </div>

      {/* תקופות חג */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-purple-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">תקופות חגים</h3>
              <p className="text-sm text-gray-600">בחר תקופת חג לתכנון</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holidayPeriods.map(period => {
              const isSelected = selectedPeriod?.id === period.id;
              const today = new Date().toISOString().split('T')[0];
              const isActive = today >= period.startDate && today <= period.endDate;
              const isUpcoming = today < period.startDate;
              
              return (
                <div
                  key={period.id}
                  onClick={() => setSelectedPeriod(period)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected ? 'border-purple-500 bg-purple-50 shadow-md' : 
                    isActive ? 'border-green-500 bg-green-50' :
                    isUpcoming ? 'border-blue-500 bg-blue-50' :
                    'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">{period.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVolumeColor(period.estimatedVolume)}`}>
                      {getVolumeLabel(period.estimatedVolume)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📅 {new Date(period.startDate).toLocaleDateString('he-IL')} - {new Date(period.endDate).toLocaleDateString('he-IL')}</div>
                    <div>📮 {period.mailTypes.length} סוגי דואר</div>
                    {isActive && <div className="text-green-600 font-medium">🟢 פעיל עכשיו</div>}
                    {isUpcoming && <div className="text-blue-600 font-medium">🔵 מתקרב</div>}
                  </div>

                  {period.specialInstructions && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      💡 {period.specialInstructions}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* אסטרטגיות */}
      {selectedPeriod && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target size={24} className="text-blue-600" />
                <div>
                  <h3 className="font-bold text-xl text-gray-800">אסטרטגיית חלוקה</h3>
                  <p className="text-sm text-gray-600">תכנון מותאם לעומס {selectedPeriod.name}</p>
                </div>
              </div>
              <button
                onClick={generateDailyPlan}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-lg"
              >
                <Zap size={16} />
                צור תכנית יומית
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {holidayStrategies.map(strategy => {
                const isSelected = selectedStrategy?.id === strategy.id;
                const isRecommended = 
                  (selectedPeriod.estimatedVolume === 'extreme' && strategy.id === 'extreme-load') ||
                  (selectedPeriod.estimatedVolume === 'high' && strategy.id === 'high-load') ||
                  (selectedPeriod.estimatedVolume === 'medium' && strategy.id === 'normal-load');

                return (
                  <div
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 
                      isRecommended ? 'border-green-500 bg-green-50' :
                      'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold text-gray-800">{strategy.name}</h4>
                      {isRecommended && (
                        <Star size={16} className="text-green-600" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        <span>{strategy.recommendedDays} ימי הכנה</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-green-500" />
                        <span>{strategy.dailyHours} שעות ביום</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-1">טיפים עיקריים:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {strategy.tips.slice(0, 3).map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* תכנית יומית */}
      {showPlanner && dailyLoads.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <BarChart3 size={24} className="text-green-600" />
              <div>
                <h3 className="font-bold text-xl text-gray-800">תכנית יומית מפורטת</h3>
                <p className="text-sm text-gray-600">
                  {selectedPeriod?.name} - {selectedStrategy?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {dailyLoads.map((day, index) => {
                const dayDate = new Date(day.date);
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const isPast = day.date < new Date().toISOString().split('T')[0];
                
                return (
                  <div
                    key={day.date}
                    className={`border rounded-xl p-4 transition-all duration-200 ${
                      isToday ? 'border-blue-500 bg-blue-50 shadow-md' :
                      isPast ? 'border-gray-300 bg-gray-50' :
                      'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                          day.area === 12 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                          day.area === 14 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        }`}>
                          {day.area}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            יום {index + 1} - {dayDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              אזור {day.area}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {Math.round(day.totalEstimatedTime / 60 * 10) / 10} שעות
                            </div>
                            <div className="flex items-center gap-1">
                              <Package size={14} />
                              {day.mailTypes.length} סוגי דואר
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          day.status === 'completed' ? 'bg-green-100 text-green-800' :
                          day.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {day.status === 'completed' ? 'הושלם' :
                           day.status === 'in-progress' ? 'בביצוע' : 'מתוכנן'}
                        </span>
                        
                        {day.status === 'planned' && (
                          <button
                            onClick={() => updateDayStatus(day.date, 'in-progress')}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                          >
                            התחל יום
                          </button>
                        )}
                        
                        {day.status === 'in-progress' && (
                          <button
                            onClick={() => {
                              const actualTime = prompt('כמה זמן לקח בפועל? (דקות)');
                              if (actualTime) {
                                updateDayStatus(day.date, 'completed', parseInt(actualTime));
                              }
                            }}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                          >
                            סיים יום
                          </button>
                        )}
                      </div>
                    </div>

                    {/* פירוט סוגי דואר */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {day.mailTypes.map(mailType => {
                        const type = holidayMailTypes.find(mt => mt.id === mailType.typeId);
                        if (!type) return null;

                        return (
                          <div key={mailType.typeId} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{type.icon}</span>
                              <div>
                                <h5 className="font-medium text-gray-800 text-sm">{type.name}</h5>
                                <p className="text-xs text-gray-600">{mailType.volume} יחידות</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`px-2 py-1 rounded-full ${type.color} text-white`}>
                                {type.priority === 'urgent' ? 'דחוף' :
                                 type.priority === 'high' ? 'גבוה' :
                                 type.priority === 'medium' ? 'בינוני' : 'נמוך'}
                              </span>
                              <span className="text-gray-600">
                                {Math.round(mailType.estimatedTime)} דק׳
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {day.actualTime && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-green-800 font-medium">
                            הושלם בפועל: {Math.round(day.actualTime / 60 * 10) / 10} שעות
                          </span>
                          <span className={`text-sm ${
                            day.actualTime <= day.totalEstimatedTime ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            ({day.actualTime <= day.totalEstimatedTime ? 'מהר מהצפוי!' : 'לקח יותר זמן'})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* טיפים ואסטרטגיות */}
      {selectedStrategy && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center gap-3">
              <Lightbulb size={24} className="text-yellow-600" />
              <div>
                <h3 className="font-bold text-xl text-gray-800">טיפים להצלחה</h3>
                <p className="text-sm text-gray-600">{selectedStrategy.name}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target size={18} className="text-blue-600" />
                  סדר עדיפויות
                </h4>
                <div className="space-y-2">
                  {selectedStrategy.priorityOrder.map((typeId, index) => {
                    const type = holidayMailTypes.find(mt => mt.id === typeId);
                    if (!type) return null;

                    return (
                      <div key={typeId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium text-gray-800">{type.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Lightbulb size={18} className="text-yellow-600" />
                  טיפים מעשיים
                </h4>
                <div className="space-y-2">
                  {selectedStrategy.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span className="text-sm text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* סטטיסטיקות לפי אזור */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-indigo-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">חישוב עומס לפי אזור</h3>
              <p className="text-sm text-gray-600">הערכת זמן נדרש לכל אזור</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[12, 14, 45].map(area => {
              const areaStats = selectedPeriod ? 
                calculateAreaTime(area as 12 | 14 | 45, selectedPeriod.mailTypes) :
                { buildings: 0, streets: 0, estimatedTime: 0, estimatedHours: 0 };

              return (
                <div key={area} className={`p-4 rounded-xl border-2 ${
                  area === todayArea ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
                      area === 12 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      area === 14 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      'bg-gradient-to-r from-indigo-500 to-indigo-600'
                    }`}>
                      {area}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">אזור {area}</h4>
                      {area === todayArea && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          אזור נוכחי
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">בניינים:</span>
                      <span className="font-semibold">{areaStats.buildings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">רחובות:</span>
                      <span className="font-semibold">{areaStats.streets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">זמן משוער:</span>
                      <span className="font-semibold text-blue-600">{areaStats.estimatedHours} שעות</span>
                    </div>
                    
                    {selectedStrategy && areaStats.estimatedHours > selectedStrategy.dailyHours && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        ⚠️ עומס גבוה! מומלץ לחלק על מספר ימים
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* סוגי דואר */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <Mail size={24} className="text-orange-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">סוגי דואר בחגים</h3>
              <p className="text-sm text-gray-600">זמנים משוערים ועדיפויות</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holidayMailTypes.map(type => (
              <div key={type.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{type.name}</h4>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">זמן לבניין:</span>
                    <span className="font-semibold">{type.estimatedTimePerBuilding} דק׳</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">עדיפות:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      type.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      type.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {type.priority === 'urgent' ? 'דחוף' :
                       type.priority === 'high' ? 'גבוה' :
                       type.priority === 'medium' ? 'בינוני' : 'נמוך'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* הנחיות כלליות */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-xl">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-blue-800 mb-3">עקרונות מנחים לחגים</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">🎯 סדר עדיפויות:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>דואר רשום וחבילות (תמיד ראשון!)</li>
                  <li>דואר רגיל יומי</li>
                  <li>לוחות שנה וכרטיסי ברכה</li>
                  <li>עלוני תרומות (אחרונים)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⏰ ניהול זמן:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>התחל מוקדם יותר בתקופות עומס</li>
                  <li>תכנן הפסקות קצרות כל שעתיים</li>
                  <li>עדכן זמנים בפועל לשיפור התכנון</li>
                  <li>השתמש במסלולים אופטימליים</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}