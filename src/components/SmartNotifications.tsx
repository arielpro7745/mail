import { useState, useEffect } from 'react';
import {
  Bell, X, AlertTriangle, Clock, Sun, CloudRain,
  Package, MapPin, TrendingUp, Zap, Check
} from 'lucide-react';
import { useDistribution } from '../hooks/useDistribution';
import { getTodayAreaSchedule, getTomorrowAreaSchedule } from '../utils/areaRotation';
import { getAreaName } from '../utils/areaColors';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'reminder';
  title: string;
  message: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissable: boolean;
  timestamp: Date;
}

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const {
    todayArea,
    pendingToday,
    overdueStreets,
    allCompletedToday
  } = useDistribution();

  const todaySchedule = getTodayAreaSchedule();
  const tomorrowSchedule = getTomorrowAreaSchedule();

  useEffect(() => {
    generateNotifications();
    // עדכון כל 5 דקות
    const interval = setInterval(generateNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [pendingToday, overdueStreets, allCompletedToday]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const hour = new Date().getHours();
    const today = new Date().toISOString().split('T')[0];

    // תזכורת בוקר
    if (hour >= 7 && hour < 9 && pendingToday.length > 0) {
      newNotifications.push({
        id: `morning-${today}`,
        type: 'info',
        title: 'בוקר טוב! זמן להתחיל',
        message: `יש לך ${pendingToday.length} רחובות לחלוקה באזור ${todayArea}. בהצלחה!`,
        icon: <Sun className="text-yellow-500" size={20} />,
        dismissable: true,
        timestamp: new Date()
      });
    }

    // התראה על רחובות דחופים
    if (overdueStreets > 0) {
      newNotifications.push({
        id: `overdue-${today}`,
        type: 'warning',
        title: 'רחובות דחופים!',
        message: `${overdueStreets} רחובות לא קיבלו דואר מעל 14 יום. יש לתת להם עדיפות!`,
        icon: <AlertTriangle className="text-orange-500" size={20} />,
        dismissable: true,
        timestamp: new Date()
      });
    }

    // תזכורת הכנה לאזור מחר
    if (hour >= 14 && hour < 18) {
      newNotifications.push({
        id: `prep-tomorrow-${today}`,
        type: 'reminder',
        title: 'אל תשכח להכין למחר!',
        message: `מחר יוצא אזור ${tomorrowSchedule.delivery} (${getAreaName(tomorrowSchedule.delivery)}). הכן את השקים!`,
        icon: <Package className="text-purple-500" size={20} />,
        dismissable: true,
        timestamp: new Date()
      });
    }

    // סיכום יומי בערב
    if (hour >= 17 && allCompletedToday.length > 0) {
      newNotifications.push({
        id: `daily-summary-${today}`,
        type: 'success',
        title: 'סיכום היום',
        message: `חילקת ${allCompletedToday.length} רחובות היום! עבודה מצוינת 💪`,
        icon: <TrendingUp className="text-green-500" size={20} />,
        dismissable: true,
        timestamp: new Date()
      });
    }

    // התראה על מזג אוויר (סימולציה)
    if (hour >= 6 && hour < 8) {
      const isHot = new Date().getMonth() >= 5 && new Date().getMonth() <= 9;
      if (isHot) {
        newNotifications.push({
          id: `weather-hot-${today}`,
          type: 'info',
          title: 'מזג אוויר חם',
          message: 'צפוי יום חם - אל תשכח לקחת מים!',
          icon: <Sun className="text-orange-500" size={20} />,
          dismissable: true,
          timestamp: new Date()
        });
      }
    }

    // התראה על התקדמות טובה
    if (allCompletedToday.length >= 5 && pendingToday.length > 0) {
      const progress = Math.round((allCompletedToday.length / (allCompletedToday.length + pendingToday.length)) * 100);
      if (progress >= 50 && progress < 100) {
        newNotifications.push({
          id: `progress-${today}-${progress}`,
          type: 'success',
          title: 'התקדמות מצוינת!',
          message: `הגעת ל-${progress}% מהאזור. המשך כך!`,
          icon: <Zap className="text-blue-500" size={20} />,
          dismissable: true,
          timestamp: new Date()
        });
      }
    }

    // סנן התראות שכבר נמחקו
    const filteredNotifications = newNotifications.filter(n => !dismissed.includes(n.id));
    setNotifications(filteredNotifications);
  };

  const dismissNotification = (id: string) => {
    setDismissed(prev => [...prev, id]);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAll = () => {
    setDismissed(prev => [...prev, ...notifications.map(n => n.id)]);
    setNotifications([]);
  };

  if (notifications.length === 0) return null;

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200';
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'reminder':
        return 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200';
      default:
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200';
    }
  };

  return (
    <div className="mb-6">
      {/* כותרת */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-indigo-500" />
          <h3 className="font-bold text-gray-800">התראות ({notifications.length})</h3>
        </div>
        {notifications.length > 1 && (
          <button
            onClick={dismissAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            נקה הכל
          </button>
        )}
      </div>

      {/* רשימת התראות */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              relative rounded-xl border-2 p-4 transition-all duration-300
              ${getNotificationStyle(notification.type)}
            `}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.icon}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 mb-1">{notification.title}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>

                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {notification.action.label} →
                  </button>
                )}
              </div>

              {notification.dismissable && (
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}