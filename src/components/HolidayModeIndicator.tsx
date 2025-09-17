import { useHolidayMode } from "../hooks/useHolidayMode";
import { Calendar, AlertTriangle, Clock, Zap } from "lucide-react";

export default function HolidayModeIndicator() {
  const { currentHoliday, isPreHoliday, daysUntilHoliday, getHolidayStatus } = useHolidayMode();
  
  const status = getHolidayStatus();
  if (!status) return null;

  const getStatusColor = () => {
    if (status.urgency === 'high') return 'from-red-500 to-pink-600';
    if (status.urgency === 'medium') return 'from-orange-500 to-yellow-600';
    return 'from-blue-500 to-indigo-600';
  };

  const getStatusIcon = () => {
    if (status.type === 'active') return <Calendar size={24} className="text-white" />;
    if (status.urgency === 'high') return <AlertTriangle size={24} className="text-white animate-pulse" />;
    return <Clock size={24} className="text-white" />;
  };

  return (
    <div className={`bg-gradient-to-r ${getStatusColor()} text-white rounded-xl p-4 mb-6 shadow-lg`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white bg-opacity-20 rounded-xl">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-1">
            {status.type === 'active' ? '🎄 מצב חג פעיל' : '⏰ הכנה לחג'}
          </h3>
          <p className="text-white text-opacity-90 font-medium">
            {status.message}
          </p>
          {isPreHoliday && currentHoliday && (
            <div className="mt-2 text-sm text-white text-opacity-80">
              💡 {currentHoliday.specialInstructions}
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {currentHoliday?.estimatedVolume === 'extreme' ? '🔥' :
             currentHoliday?.estimatedVolume === 'high' ? '⚡' :
             currentHoliday?.estimatedVolume === 'medium' ? '📊' : '✅'}
          </div>
          <div className="text-xs text-white text-opacity-80">
            עומס {currentHoliday?.estimatedVolume === 'extreme' ? 'קיצוני' :
                   currentHoliday?.estimatedVolume === 'high' ? 'גבוה' :
                   currentHoliday?.estimatedVolume === 'medium' ? 'בינוני' : 'נמוך'}
          </div>
        </div>
      </div>
      
      {isPreHoliday && daysUntilHoliday && daysUntilHoliday <= 7 && (
        <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-white" />
            <span className="font-semibold text-white">
              פעולות מומלצות עכשיו:
            </span>
          </div>
          <ul className="mt-2 text-sm text-white text-opacity-90 space-y-1">
            <li>• עבור לטאב "חגים" ליצירת תכנית מפורטת</li>
            <li>• התחל עם דואר רשום וחבילות</li>
            <li>• תכנן מסלולים אופטימליים</li>
            {daysUntilHoliday <= 3 && (
              <li className="font-semibold">• דחוף! התחל עבודה מוגברת</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}