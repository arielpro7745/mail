import { Street } from "../types";
import { totalDaysBetween, daysUntilReappear, getUrgencyLevel, daysSinceCycleStart, daysRemainingInCycle } from "../utils/dates";
import { isSameDay } from "../utils/isSameDay";
import { Clock, CheckCircle, RotateCcw, Calendar, AlertTriangle, Zap } from "lucide-react";

export default function StreetRow({
  s,
  onDone,
  onUndo,
  onStartTimer,
  getUrgencyLabel,
}: {
  s: Street;
  onDone?: (id: string) => void;
  onUndo?: (id: string) => void;
  onStartTimer?: (street: Street) => void;
  getUrgencyLabel?: (days: number) => { label: string; color: string; priority: string };
}) {
  const today = new Date();
  const totalDays = s.lastDelivered
    ? totalDaysBetween(new Date(s.lastDelivered), today)
    : 999;

  const doneToday =
    s.lastDelivered && isSameDay(new Date(s.lastDelivered), today);

  const urgencyInfo = getUrgencyLabel ? getUrgencyLabel(totalDays) : null;
  const isOverdue = totalDays >= 14;
  const isCritical = totalDays >= 20 || totalDays >= 999;

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
    if (isCritical) return "bg-red-50 border-red-200";
    if (isOverdue) return "bg-orange-50 border-orange-200";
    if (totalDays >= 10) return "bg-yellow-50 border-yellow-200";
    switch (urgencyLevel) {
      case 'critical': return "bg-red-50";
      case 'urgent': return "bg-orange-50";
      default: return "";
    }
  };

  // אייקון דחיפות
  const getUrgencyIcon = () => {
    if (isCritical) {
      return <AlertTriangle size={16} className="text-red-600 animate-bounce" />;
    }
    if (isOverdue) {
      return <AlertTriangle size={16} className="text-orange-600 animate-pulse" />;
    }
    if (totalDays >= 10) {
      return <AlertTriangle size={14} className="text-orange-500" />;
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
          {urgencyInfo && !doneToday && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${urgencyInfo.color} ${
              urgencyInfo.priority === 'critical' ? 'animate-pulse' : ''
            }`}>
              {urgencyInfo.label}
            </span>
          )}
          {s.isBig && <Zap size={12} className="text-blue-500" title="רחוב גדול" />}
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
            isCritical ? "text-red-600 font-bold" :
            isOverdue ? "text-orange-600 font-bold" : 
            totalDays >= 10 ? "text-yellow-600" : 
            "text-gray-700"
          }`}>
            {totalDays >= 999 ? "לא חולק" : `${totalDays} ימים`}
          </span>
          {s.lastDelivered && (
            <div className="text-xs text-gray-500 mt-1">
              {new Date(s.lastDelivered).toLocaleDateString('he-IL')}
            </div>
          )}
          {isCritical && (
            <div className="text-xs text-red-600 font-medium mt-1">
              {totalDays >= 999 ? "טרם חולק!" : "דחוף מאוד!"}
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