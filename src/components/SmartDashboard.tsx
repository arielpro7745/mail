import { useState, useEffect } from 'react';
import {
  Sun, Cloud, CloudRain, Wind, Thermometer, Clock, MapPin,
  AlertTriangle, CheckCircle2, TrendingUp, Package, Navigation2,
  Calendar, Target, Zap, ChevronRight, ExternalLink
} from 'lucide-react';
import { useDistribution } from '../hooks/useDistribution';
import { getTodayAreaSchedule, getTomorrowAreaSchedule } from '../utils/areaRotation';
import { getAreaColor, getAreaName } from '../utils/areaColors';
import { streets } from '../data/streets';
import { walkOrder12, walkOrder14, walkOrder45 } from '../data/walkOrder';

interface WeatherData {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  description: string;
}

export default function SmartDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>({ temp: 22, condition: 'sunny', description: 'בהיר' });

  const {
    todayArea,
    pendingToday,
    allCompletedToday,
    overdueStreets,
    streetsNeedingDelivery
  } = useDistribution();

  const todaySchedule = getTodayAreaSchedule();
  const tomorrowSchedule = getTomorrowAreaSchedule();
  const areaColor = getAreaColor(todayArea);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    // סימולציה של מזג אוויר (בפתח תקווה)
    const conditions: WeatherData[] = [
      { temp: 24, condition: 'sunny', description: 'בהיר ונעים' },
      { temp: 22, condition: 'cloudy', description: 'מעונן חלקית' },
      { temp: 18, condition: 'rainy', description: 'גשום - קח מטריה!' },
      { temp: 20, condition: 'windy', description: 'רוחות חזקות' }
    ];
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setWeather(conditions[0]);
    } else if (hour >= 12 && hour < 17) {
      setWeather({ temp: 26, condition: 'sunny', description: 'חם - שתה מים!' });
    } else {
      setWeather(conditions[1]);
    }

    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="text-yellow-500" size={32} />;
      case 'cloudy': return <Cloud className="text-gray-400" size={32} />;
      case 'rainy': return <CloudRain className="text-blue-500" size={32} />;
      case 'windy': return <Wind className="text-cyan-500" size={32} />;
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'בוקר טוב! ☀️';
    if (hour < 17) return 'צהריים טובים! 🌤️';
    if (hour < 21) return 'ערב טוב! 🌅';
    return 'לילה טוב! 🌙';
  };

  // חישוב זמן משוער לסיום
  const estimatedMinutes = pendingToday.length * 8; // 8 דקות לרחוב בממוצע
  const estimatedHours = Math.floor(estimatedMinutes / 60);
  const estimatedMins = estimatedMinutes % 60;

  // קבלת סדר ההליכה לפי אזור
  const getWalkOrder = () => {
    switch (todayArea) {
      case 12: return walkOrder12;
      case 14: return walkOrder14;
      case 45: return walkOrder45;
      default: return [];
    }
  };

  const walkOrder = getWalkOrder();
  const nextStreets = walkOrder
    .filter(id => pendingToday.some(s => s.id === id))
    .slice(0, 3)
    .map(id => streets.find(s => s.id === id))
    .filter(Boolean);

  const progress = allCompletedToday.length + pendingToday.length > 0
    ? Math.round((allCompletedToday.length / (allCompletedToday.length + pendingToday.length)) * 100)
    : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* כרטיס ראשי - סיכום יומי */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-2xl shadow-xl text-white">
        {/* רקע דקורטיבי */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 p-6">
          {/* שורה עליונה - ברכה ומזג אוויר */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{getGreeting()}</h2>
              <p className="text-blue-100 flex items-center gap-2">
                <Calendar size={16} />
                {currentTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              {getWeatherIcon()}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Thermometer size={16} />
                  <span className="text-xl font-bold">{weather.temp}°</span>
                </div>
                <p className="text-xs text-blue-100">{weather.description}</p>
              </div>
            </div>
          </div>

          {/* סטטיסטיקות מהירות */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={18} className="text-blue-200" />
                <span className="text-sm text-blue-100">אזור היום</span>
              </div>
              <p className="text-2xl font-bold">{todayArea}</p>
              <p className="text-xs text-blue-200">{getAreaName(todayArea)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-green-300" />
                <span className="text-sm text-blue-100">הושלמו</span>
              </div>
              <p className="text-2xl font-bold">{allCompletedToday.length}</p>
              <p className="text-xs text-blue-200">מתוך {allCompletedToday.length + pendingToday.length}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={18} className="text-orange-300" />
                <span className="text-sm text-blue-100">ממתינים</span>
              </div>
              <p className="text-2xl font-bold">{streetsNeedingDelivery}</p>
              <p className="text-xs text-blue-200">רחובות</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-cyan-300" />
                <span className="text-sm text-blue-100">זמן משוער</span>
              </div>
              <p className="text-2xl font-bold">{estimatedHours}:{estimatedMins.toString().padStart(2, '0')}</p>
              <p className="text-xs text-blue-200">שעות</p>
            </div>
          </div>

          {/* פס התקדמות */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">התקדמות היום</span>
              <span className="text-sm font-bold">{progress}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* שורת כרטיסים משניים */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* רחובות דחופים */}
        {overdueStreets > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-red-800">רחובות דחופים</h3>
                <p className="text-xs text-red-600">{overdueStreets} רחובות מעל 14 יום</p>
              </div>
            </div>
            <p className="text-sm text-red-700">
              יש לתת עדיפות לרחובות אלה!
            </p>
          </div>
        )}

        {/* הרחובות הבאים */}
        <div className={`bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm ${overdueStreets === 0 ? 'md:col-span-2' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-10 h-10 ${areaColor.bgSolid} rounded-lg flex items-center justify-center`}>
              <Navigation2 className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">הרחובות הבאים</h3>
              <p className="text-xs text-gray-500">לפי סדר ההליכה המומלץ</p>
            </div>
          </div>

          <div className="space-y-2">
            {nextStreets.length > 0 ? nextStreets.map((street, idx) => (
              <div key={street?.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                <span className={`w-6 h-6 ${areaColor.bgSolid} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">{street?.name}</span>
                {street?.isBig && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">גדול</span>
                )}
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-2">כל הרחובות הושלמו!</p>
            )}
          </div>
        </div>

        {/* אזור מחר */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-orange-800">הכנה למחר</h3>
              <p className="text-xs text-orange-600">אזור {tomorrowSchedule.delivery}</p>
            </div>
          </div>
          <p className="text-sm text-orange-700">
            אל תשכח להכין את השקים לאזור {tomorrowSchedule.delivery} ({getAreaName(tomorrowSchedule.delivery)})
          </p>
        </div>
      </div>

      {/* קישורים מהירים */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-indigo-500" />
          ניווט מהיר - פתח תקווה
        </h3>
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://waze.com/ul?q=${encodeURIComponent(getAreaName(todayArea) + ' פתח תקווה')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
          >
            <ExternalLink size={14} />
            פתח ב-Waze
          </a>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(getAreaName(todayArea) + ' פתח תקווה')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
          >
            <ExternalLink size={14} />
            פתח ב-Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
