import { Street } from "../types";
import { businessDaysBetween } from "../utils/dates";
import { isSameDay } from "../utils/isSameDay";
import { Clock, CheckCircle, RotateCcw } from "lucide-react";

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
  const days = s.lastDelivered
    ? businessDaysBetween(new Date(s.lastDelivered), today)
    : undefined;

  const doneToday =
    s.lastDelivered && isSameDay(new Date(s.lastDelivered), today);

  const isOverdue = days !== undefined && days >= 10;
  const isUrgent = days !== undefined && days >= 7;

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

  return (
    <tr className={`
      ${doneToday ? "done-today bg-green-50" : ""} 
      ${isOverdue ? "bg-red-50" : isUrgent ? "bg-yellow-50" : ""}
      hover:bg-gray-50 transition-colors
    `}>
      <td className="relative py-2 px-3">
        {doneToday && (
          <div className="absolute inset-0 bg-green-200 opacity-30 rounded"></div>
        )}
        <div className="flex items-center gap-2">
          {doneToday && (
            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          )}
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
          <span className={`font-medium ${
            isOverdue ? "text-red-600" : 
            isUrgent ? "text-orange-600" : 
            "text-gray-700"
          }`}>
            {days ?? "—"}
          </span>
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