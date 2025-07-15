import { Street } from "../types";
import { totalDaysBetween, daysUntilReappear, getUrgencyLevel, daysSinceCycleStart, daysRemainingInCycle } from "../utils/dates";
import { isSameDay } from "../utils/isSameDay";
import { Clock, CheckCircle, RotateCcw, Calendar, AlertTriangle } from "lucide-react";

export default function StreetRow({
  s,
  onDone,
  onUndo,
  onStartTimer,
  getStreetUrgencyLevel,
  getUrgencyColor,
  getUrgencyLabel,
}: {
  s: Street;
  onDone?: (id: string) => void;
  onUndo?: (id: string) => void;
  onStartTimer?: (street: Street) => void;
  getStreetUrgencyLevel?: (street: Street) => string;
  getUrgencyColor?: (urgencyLevel: string) => string;
  getUrgencyLabel?: (urgencyLevel: string) => string;
}) {
  const today = new Date();
  const totalDays = s.lastDelivered
    ? totalDaysBetween(new Date(s.lastDelivered), today)
    : undefined;

  const doneToday =
    s.lastDelivered && isSameDay(new Date(s.lastDelivered), today);

  // שימוש בפונקציות החדשות אם הן זמינות
  const urgencyLevel = getStreetUrgencyLevel ? getStreetUrgencyLevel(s) : getUrgencyLevel(s.lastDelivered);
  const urgencyColor = getUrgencyColor ? getUrgencyColor(urgencyLevel) : "";
  const urgencyLabel = getUrgencyLabel ? getUrgencyLabel(urgencyLevel) : "";
  
  const isOverdue = urgencyLevel === 'critical' || urgencyLevel === 'never';
  const isUrgent = urgencyLevel === 'urgent';
  const isWarning = urgencyLevel === 'warning';

  // זמן חלוקה מעוצב
  const getDeliveryTime = () => {
    if (!s.lastDelivered) return "—";
    const deliveryDate = new Date(s.lastDelivered);
    if (isSameDay(deliveryDate, today)) {
      return deliveryDate.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return deliveryDate.toLocaleDateString('he-IL');
  };

  // צבע רקע לפי דחיפות
  const getRowBackground = () => {
    if (doneToday) return "bg-green-50";
    return urgencyColor || "";
  };

  // אייקון דחיפות
  const getUrgencyIcon = () => {
    if (urgencyLevel === 'never') {
      return <AlertTriangle size={16} className="text-purple-600 animate-pulse" />;
    }
    if (urgencyLevel === 'critical') {
      return <AlertTriangle size={16} className="text-red-600 animate-pulse" />;
    }
    if (urgencyLevel === 'urgent') {
      return <AlertTriangle size={14} className="text-orange-500" />;
    }
    if (urgencyLevel === 'warning') {
      return <AlertTriangle size={14} className="text-yellow-500" />;
    }
    return null;
  };

  return (
    <tr className={`${getRowBackground()} hover:bg-gray-50 transition-colors`}>
      <td className="relative py-2 px-3">
        {doneToday && (
          <div className="absolute inset-0 bg-green-200 opacity-30 rounded"></div>
        )}
        <div className="flex items-center gap-2">
          {doneToday && (
            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          )}
          {getUrgencyIcon()}
          <span className={doneToday ? "line-through text-gray-500" : ""}>
            {s.name}
          </span>
          {urgencyLevel === 'never' && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
              לא חולק מעולם
            </span>
          )}
          {urgencyLevel === 'critical' && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              קריטי!
            </span>
          )}
          {urgencyLevel === 'urgent' && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
              דחוף
            </span>
          )}
          {urgencyLevel === 'warning' && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">
              אזהרה
            </span>
          )}
        </div>
      </td>
      
      <td className="text-center py-2 px-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          s.isBig 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {s.isBig ? "גדול" : "קטן"}
        </span>
      </td>
      
      <td className="text-center py-2 px-3">
        <div className="flex flex-col items-center">
          <span className={`font-medium ${
            urgencyLevel === 'never' ? "text-purple-600 font-bold" :
            urgencyLevel === 'critical' ? "text-red-600 font-bold" : 
            urgencyLevel === 'urgent' ? "text-orange-600 font-bold" : 
            urgencyLevel === 'warning' ? "text-yellow-600 font-bold" : 
            "text-gray-700"
          }`}>
            {totalDays !== undefined ? `${totalDays} ימים` : "לא חולק"}
          </span>
          {s.lastDelivered && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(s.lastDelivered).toLocaleDateString('he-IL')}
            </div>
          )}
          {urgencyLabel && (
            <div className={`text-xs font-medium mt-1 ${
              urgencyLevel === 'never' ? 'text-purple-600' :
              urgencyLevel === 'critical' ? 'text-red-600' :
              urgencyLevel === 'urgent' ? 'text-orange-600' :
              urgencyLevel === 'warning' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>
              {urgencyLabel}
            </div>
          )}
        </div>
      </td>
      
      <td className="text-center py-2 px-3 text-gray-600">
        {s.averageTime ? `${s.averageTime} דק'` : "—"}
      </td>
      
      <td className="text-center py-2 px-3">
        <div className="flex gap-1 justify-center">
          {onStartTimer && !doneToday && (
            <button 
              className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors" 
              onClick={() => onStartTimer(s)}
              title="התחל מדידת זמן"
            >
              <Clock size={14} />
            </button>
          )}
          {onDone && !doneToday && (
            <button 
              className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors" 
              onClick={() => onDone(s.id)}
              title="סמן כחולק"
            >
              <CheckCircle size={14} />
            </button>
          )}
          {onUndo && doneToday && (
            <button 
              className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors" 
              onClick={() => onUndo(s.id)}
              title="בטל חלוקה"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}