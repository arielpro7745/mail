import { Street } from "../types";
import { businessDaysBetween, daysUntilReappear, getUrgencyLevel } from "../utils/dates";
import { isSameDay } from "../utils/isSameDay";
import { Clock, CheckCircle, RotateCcw, Calendar, AlertTriangle } from "lucide-react";

export default function StreetRow({
  s,
  onDone,
  onUndo,
  onStartTimer,
  showCompletionStatus = false,
  completionOrder,
}: {
  s: Street;
  onDone?: (id: string) => void;
  onUndo?: (id: string) => void;
  onStartTimer?: (street: Street) => void;
  showCompletionStatus?: boolean;
  completionOrder?: number;
}) {
  const today = new Date();
  const businessDays = s.lastDelivered
    ? businessDaysBetween(new Date(s.lastDelivered), today)
    : undefined;

  const doneToday =
    s.lastDelivered && isSameDay(new Date(s.lastDelivered), today);

  const urgencyLevel = getUrgencyLevel(s.lastDelivered);
  const daysUntilNext = s.lastDelivered ? daysUntilReappear(s.lastDelivered) : 0;

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
    if (showCompletionStatus) return "";
    
    switch (urgencyLevel) {
      case 'critical': return "bg-red-50";
      case 'urgent': return "bg-orange-50";
      default: return "";
    }
  };

  // אייקון דחיפות
  const getUrgencyIcon = () => {
    if (urgencyLevel === 'critical') {
      return <AlertTriangle size={14} className="text-red-500" />;
    }
    if (urgencyLevel === 'urgent') {
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
        {showCompletionStatus ? (
          <div className="flex items-center justify-center gap-1">
            <span className="font-medium text-gray-700">#{completionOrder}</span>
            <span className="text-xs text-gray-500">
              ({getDeliveryTime()})
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className={`font-medium ${
              urgencyLevel === 'critical' ? "text-red-600" : 
              urgencyLevel === 'urgent' ? "text-orange-600" : 
              "text-gray-700"
            }`}>
              {businessDays ?? "—"}
            </span>
            {s.lastDelivered && daysUntilNext > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={10} />
                <span>עוד {daysUntilNext} ימים</span>
              </div>
            )}
          </div>
        )}
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