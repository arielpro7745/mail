import { useState, useEffect } from 'react';
import { AIPredictor, WorkloadForecast } from '../utils/aiPredictor';
import { useDistribution } from '../hooks/useDistribution';
import { Brain, TrendingUp, Calendar, Clock, AlertCircle, Lightbulb, Zap } from 'lucide-react';

export default function AIPredictions() {
  const { allStreets, todayArea } = useDistribution();
  const [forecasts, setForecasts] = useState<WorkloadForecast[]>([]);
  const [patterns, setPatterns] = useState<any>(null);

  useEffect(() => {
    if (allStreets.length > 0) {
      const predictor = new AIPredictor(allStreets);
      const weeklyForecast = predictor.forecastWorkload(todayArea, 2);
      const analyzedPatterns = predictor.analyzePatterns();

      setForecasts(weeklyForecast);
      setPatterns(analyzedPatterns);
    }
  }, [allStreets, todayArea]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'קל';
      case 'medium': return 'בינוני';
      case 'hard': return 'קשה';
      default: return 'לא ידוע';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
          <Brain className="text-white" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">חיזוי חכם מבוסס AI</h2>
          <p className="text-sm text-gray-600">המערכת לומדת מדפוסי החלוקה שלך ומציעה המלצות מותאמות אישית</p>
        </div>
      </div>

      {patterns && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-blue-600" size={20} />
            <h3 className="font-bold text-lg text-blue-900">ניתוח דפוסים</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">יום הביצועים הטוב ביותר</div>
              <div className="text-xl font-bold text-gray-800">{patterns.bestPerformanceDay}</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">ממוצע רחובות ליום</div>
              <div className="text-xl font-bold text-gray-800">{patterns.averageStreetsPerDay}</div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">זמן יעילות שיא</div>
              <div className="text-xl font-bold text-gray-800">{patterns.peakEfficiencyTime}</div>
            </div>
          </div>

          <div className="space-y-2">
            {patterns.insights.map((insight: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 bg-white bg-opacity-50 rounded-lg p-3">
                <Lightbulb className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                <span className="text-sm text-gray-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-indigo-600" size={20} />
          <h3 className="font-bold text-lg text-gray-800">תחזית עומס לשבועיים הבאים</h3>
        </div>

        <div className="space-y-3">
          {forecasts.slice(0, 14).map((forecast, idx) => {
            const isToday = idx === 0;
            const isWeekend = new Date(forecast.date).getDay() === 5 || new Date(forecast.date).getDay() === 6;

            return (
              <div
                key={forecast.date}
                className={`rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-md ${
                  isToday ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' :
                  isWeekend ? 'bg-gray-50 border-gray-300' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg text-gray-800">
                        {formatDate(forecast.date)}
                        {isToday && <span className="mr-2 text-blue-600 text-sm">(היום)</span>}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(forecast.difficulty)}`}>
                        {getDifficultyLabel(forecast.difficulty)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          <strong>{forecast.estimatedStreets}</strong> רחובות
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">
                          <strong>{Math.round(forecast.estimatedTime / 60)}</strong> שעות
                        </span>
                      </div>

                      {forecast.urgentCount > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-red-500" />
                          <span className="text-sm text-red-700">
                            <strong>{forecast.urgentCount}</strong> דחופים
                          </span>
                        </div>
                      )}
                    </div>

                    {forecast.recommendations.length > 0 && (
                      <div className="space-y-1">
                        {forecast.recommendations.map((rec, recIdx) => (
                          <div key={recIdx} className="flex items-start gap-2 text-sm">
                            <Zap size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-5 border border-green-200">
        <div className="flex items-start gap-3">
          <div className="bg-green-500 p-2 rounded-lg">
            <Brain className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-green-900 mb-2">איך המערכת לומדת?</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>📊 ניתוח זמני חלוקה היסטוריים</li>
              <li>🎯 זיהוי דפוסים חוזרים בביצועים</li>
              <li>⚡ חישוב רמת דחיפות לכל רחוב</li>
              <li>📈 תחזית עומס עבודה עתידי</li>
              <li>💡 המלצות מותאמות אישית לשיפור יעילות</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
