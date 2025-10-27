import { useEffect, useState } from "react";
import { Mail, Bell, Calendar } from "lucide-react";

type MailColor = 'green' | 'red' | 'blue';
type AreaNumber = 45 | 14 | 12;

interface ColorInfo {
  area: AreaNumber;
  color: MailColor;
  hebrewColor: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

const colorMap: Record<AreaNumber, ColorInfo> = {
  45: {
    area: 45,
    color: 'blue',
    hebrewColor: 'כחול',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
  },
  14: {
    area: 14,
    color: 'red',
    hebrewColor: 'אדום',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
  },
  12: {
    area: 12,
    color: 'green',
    hebrewColor: 'ירוק',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
  },
};

const getNextArea = (currentArea: AreaNumber): AreaNumber => {
  if (currentArea === 45) return 14;
  if (currentArea === 14) return 12;
  return 45;
};

interface MailSortingReminderProps {
  currentArea: AreaNumber;
}

export default function MailSortingReminder({ currentArea }: MailSortingReminderProps) {
  const [showNotification, setShowNotification] = useState(true);

  const todayColor = colorMap[currentArea];
  const tomorrowArea = getNextArea(currentArea);
  const tomorrowColor = colorMap[tomorrowArea];

  useEffect(() => {
    const hasSeenToday = localStorage.getItem(`mail-reminder-${new Date().toDateString()}`);
    if (hasSeenToday) {
      setShowNotification(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(`mail-reminder-${new Date().toDateString()}`, 'true');
    setShowNotification(false);
  };

  if (!showNotification) {
    return (
      <button
        onClick={() => setShowNotification(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-50"
        title="הצג תזכורת מיון"
      >
        <Bell size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Mail size={24} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">תזכורת מיון דואר</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`border-2 ${todayColor.borderClass} ${todayColor.bgClass} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className={todayColor.textClass} />
              <span className="font-semibold text-gray-700">היום</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">צבע מיון:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-2xl ${todayColor.textClass}`}>
                  {todayColor.hebrewColor}
                </span>
                <span className={`text-xl font-bold ${todayColor.textClass}`}>
                  (אזור {todayColor.area})
                </span>
              </div>
            </div>
          </div>

          <div className={`border-2 ${tomorrowColor.borderClass} ${tomorrowColor.bgClass} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Bell size={20} className={tomorrowColor.textClass} />
              <span className="font-semibold text-gray-700">מחר - הכן למיון</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">צבע מיון:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-2xl ${tomorrowColor.textClass}`}>
                  {tomorrowColor.hebrewColor}
                </span>
                <span className={`text-xl font-bold ${tomorrowColor.textClass}`}>
                  (אזור {tomorrowColor.area})
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 text-center">
              <strong>סדר המיון:</strong> כחול (45) → אדום (14) → ירוק (12) → כחול...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
