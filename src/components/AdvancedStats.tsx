import { useState, useEffect } from 'react';
import { useDistribution } from '../hooks/useDistribution';
import { streets } from '../data/streets';
import { totalDaysBetween } from '../utils/dates';
import { 
  BarChart3, TrendingUp, Calendar, Clock, Target, 
  Award, Zap, Activity, PieChart, LineChart 
} from 'lucide-react';

interface WeeklyData {
  week: string;
  completed: number;
  efficiency: number;
}

interface MonthlyData {
  month: string;
  completed: number;
  averageTime: number;
  bestDay: string;
}

export default function AdvancedStats() {
  const { allStreets, completedToday } = useDistribution();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // חישוב נתונים שבועיים (סימולציה)
  useEffect(() => {
    const generateWeeklyData = () => {
      const weeks: WeeklyData[] = [];
      const today = new Date();
      
      for (let i = 0; i < 8; i++) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (i * 7));
        
        weeks.push({
          week: `שבוע ${i + 1}`,
          completed: Math.floor(Math.random() * 15) + 10,
          efficiency: Math.floor(Math.random() * 30) + 70
        });
      }
      
      setWeeklyData(weeks.reverse());
    };

    const generateMonthlyData = () => {
      const months: MonthlyData[] = [];
      const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'];
      
      monthNames.forEach((month, index) => {
        months.push({
          month,
          completed: Math.floor(Math.random() * 100) + 80,
          averageTime: Math.floor(Math.random() * 10) + 25,
          bestDay: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'][Math.floor(Math.random() * 5)]
        });
      });
      
      setMonthlyData(months);
    };

    generateWeeklyData();
    generateMonthlyData();
  }, []);

  // חישוב סטטיסטיקות מתקדמות
  const calculateAdvancedStats = () => {
    const today = new Date();
    const allStreetsWithDays = allStreets.map(street => {
      const days = street.lastDelivered 
        ? totalDaysBetween(new Date(street.lastDelivered), today)
        : 999;
      return { ...street, daysSinceDelivery: days };
    });

    const completedThisWeek = allStreetsWithDays.filter(s => s.daysSinceDelivery <= 7).length;
    const averageDeliveryTime = allStreets
      .filter(s => s.averageTime)
      .reduce((sum, s) => sum + (s.averageTime || 0), 0) / 
      allStreets.filter(s => s.averageTime).length || 0;

    const efficiency = Math.round((completedThisWeek / allStreets.length) * 100);
    const streaksData = calculateStreaks();

    return {
      completedThisWeek,
      averageDeliveryTime: Math.round(averageDeliveryTime),
      efficiency,
      totalStreets: allStreets.length,
      ...streaksData
    };
  };

  // חישוב רצפים (streaks)
  const calculateStreaks = () => {
    const today = new Date();
    let currentStreak = 0;
    let bestStreak = 0;
    let currentDate = new Date(today);

    // סימולציה של רצף ימים (בפועל זה יהיה מבוסס על נתונים אמיתיים)
    for (let i = 0; i < 30; i++) {
      const dayCompleted = Math.random() > 0.3; // 70% סיכוי שהיום הושלם
      
      if (dayCompleted) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return { currentStreak, bestStreak };
  };

  const stats = calculateAdvancedStats();

  // גרף פשוט עם CSS
  const SimpleChart = ({ data, type }: { data: number[], type: 'bar' | 'line' }) => {
    const maxValue = Math.max(...data);
    
    return (
      <div className="flex items-end justify-between h-32 gap-1">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full rounded-t transition-all duration-500 ${
                type === 'bar' 
                  ? 'bg-gradient-to-t from-blue-500 to-blue-400' 
                  : 'bg-gradient-to-t from-green-500 to-green-400'
              }`}
              style={{ height: `${(value / maxValue) * 100}%` }}
            ></div>
            <span className="text-xs text-gray-600 mt-1">{index + 1}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} className="text-purple-600" />
            <div>
              <h3 className="font-bold text-xl text-gray-800">סטטיסטיקות מתקדמות</h3>
              <p className="text-sm text-gray-600">ניתוח ביצועים ומגמות לטווח ארוך</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'week' ? 'שבועי' : period === 'month' ? 'חודשי' : 'שנתי'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* מדדי ביצועים עיקריים */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Target size={20} className="text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.efficiency}%</span>
            </div>
            <h4 className="font-semibold text-gray-800">יעילות שבועית</h4>
            <p className="text-sm text-gray-600">{stats.completedThisWeek}/{stats.totalStreets} רחובות</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.averageDeliveryTime}</span>
            </div>
            <h4 className="font-semibold text-gray-800">זמן ממוצע</h4>
            <p className="text-sm text-gray-600">דקות לרחוב</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap size={20} className="text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{stats.currentStreak}</span>
            </div>
            <h4 className="font-semibold text-gray-800">רצף נוכחי</h4>
            <p className="text-sm text-gray-600">ימי עבודה רצופים</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award size={20} className="text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{stats.bestStreak}</span>
            </div>
            <h4 className="font-semibold text-gray-800">שיא רצף</h4>
            <p className="text-sm text-gray-600">הרצף הטוב ביותר</p>
          </div>
        </div>

        {/* גרפים */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* גרף שבועי */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <LineChart size={20} className="text-blue-600" />
              <h4 className="font-semibold text-gray-800">ביצועים שבועיים</h4>
            </div>
            <SimpleChart 
              data={weeklyData.map(w => w.completed)} 
              type="line" 
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>לפני 8 שבועות</span>
              <span>השבוע</span>
            </div>
          </div>

          {/* גרף יעילות */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={20} className="text-green-600" />
              <h4 className="font-semibold text-gray-800">מגמת יעילות</h4>
            </div>
            <SimpleChart 
              data={weeklyData.map(w => w.efficiency)} 
              type="bar" 
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* הישגים ויעדים */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Award size={20} className="text-yellow-600" />
              <h4 className="font-semibold text-gray-800">הישגים</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>רצף 7 ימים</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>100 רחובות חולקו</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>יעילות מעל 90%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Target size={20} className="text-green-600" />
              <h4 className="font-semibold text-gray-800">יעדים שבועיים</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>רחובות:</span>
                <span className="font-semibold">{completedToday.length}/25</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (completedToday.length / 25) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600">
                {Math.round((completedToday.length / 25) * 100)}% מהיעד
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Activity size={20} className="text-purple-600" />
              <h4 className="font-semibold text-gray-800">פעילות היום</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>התחלה:</span>
                <span className="font-semibold">08:30</span>
              </div>
              <div className="flex justify-between">
                <span>זמן פעיל:</span>
                <span className="font-semibold">4.5 שעות</span>
              </div>
              <div className="flex justify-between">
                <span>הפסקות:</span>
                <span className="font-semibold">45 דק׳</span>
              </div>
            </div>
          </div>
        </div>

        {/* תחזית ביצועים */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <PieChart size={24} className="text-indigo-600" />
            <h4 className="font-bold text-xl text-gray-800">תחזית ביצועים</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {Math.round(stats.efficiency * 1.1)}%
              </div>
              <h5 className="font-semibold text-gray-800">יעילות צפויה</h5>
              <p className="text-sm text-gray-600">השבוע הבא</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(completedToday.length * 1.2)}
              </div>
              <h5 className="font-semibold text-gray-800">רחובות צפויים</h5>
              <p className="text-sm text-gray-600">מחר</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(stats.averageDeliveryTime * 0.9)}
              </div>
              <h5 className="font-semibold text-gray-800">זמן משוער</h5>
              <p className="text-sm text-gray-600">דקות לרחוב</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}