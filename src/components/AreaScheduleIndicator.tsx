import { Calendar, ChevronRight } from 'lucide-react';
import { getAreaColor, getAreaName, calculateTodayArea } from '../utils/areaColors';
import { Area } from '../types';

export default function AreaScheduleIndicator() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterdayArea = calculateTodayArea(yesterday);
  const todayArea = calculateTodayArea(today);
  const tomorrowArea = calculateTodayArea(tomorrow);

  const areas: { date: Date; area: Area; label: string }[] = [
    { date: yesterday, area: yesterdayArea, label: 'אתמול' },
    { date: today, area: todayArea, label: 'היום' },
    { date: tomorrow, area: tomorrowArea, label: 'מחר' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="text-gray-600" size={24} />
        <h3 className="text-xl font-bold text-gray-800">מחזור אזורים</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {areas.map(({ date, area, label }, idx) => {
          const areaColor = getAreaColor(area);
          const isToday = idx === 1;

          return (
            <div key={idx} className="relative">
              <div
                className={`rounded-lg p-4 border-2 transition-all duration-300 ${
                  isToday
                    ? `${areaColor.bg} ${areaColor.border} ring-4 ${areaColor.ring} ring-opacity-30`
                    : `bg-gray-50 border-gray-300`
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-bold ${
                      isToday ? areaColor.text : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </span>
                  {isToday && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      פעיל
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${
                      isToday ? areaColor.bgSolid : 'bg-gray-400'
                    } rounded-xl flex items-center justify-center shadow-md`}
                  >
                    <span className="text-xl font-bold text-white">{area}</span>
                  </div>

                  <div>
                    <div
                      className={`font-bold text-lg ${
                        isToday ? areaColor.text : 'text-gray-600'
                      }`}
                    >
                      {getAreaName(area)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {date.toLocaleDateString('he-IL', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {idx < areas.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -left-2 transform -translate-y-1/2 z-10">
                  <ChevronRight className="text-gray-400" size={24} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-1">מידע על מחזור האזורים</h4>
            <p className="text-sm text-blue-800 mb-2">
              המערכת מחשבת אוטומטית את האזור הנכון לכל יום לפי תאריך קבוע:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>26.10.2024</strong> היה אזור 45 (כחול)</li>
              <li>• <strong>27.10.2024</strong> הוא אזור 14 (אדום)</li>
              <li>• <strong>28.10.2024</strong> יהיה אזור 12 (ירוק)</li>
              <li>• המחזור חוזר על עצמו: 45 → 14 → 12 → 45...</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-center">
          <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <span className="text-white font-bold">12</span>
          </div>
          <div className="text-sm font-bold text-green-800">אזור 12</div>
          <div className="text-xs text-green-600">ירוק</div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-center">
          <div className="w-8 h-8 bg-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <span className="text-white font-bold">14</span>
          </div>
          <div className="text-sm font-bold text-red-800">אזור 14</div>
          <div className="text-xs text-red-600">אדום</div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 text-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
            <span className="text-white font-bold">45</span>
          </div>
          <div className="text-sm font-bold text-blue-800">אזור 45</div>
          <div className="text-xs text-blue-600">כחול</div>
        </div>
      </div>
    </div>
  );
}
