import { Street } from "../types";
import { businessDaysBetween } from "../utils/dates";
import { isSameDay } from "../utils/isSameDay";
import { Clock } from "lucide-react";

export default function StreetRow({
  s,
  onDone,
  onUndo,
  onStartTimer,
}: {
  s: Street;
  onDone?: (id: string) => void;
  onUndo?: (id: string) => void;
  onStartTimer?: (street: Street) => void;
}) {
  const today = new Date();
  const days = s.lastDelivered
    ? businessDaysBetween(new Date(s.lastDelivered), today)
    : undefined;

  const doneToday =
    s.lastDelivered && isSameDay(new Date(s.lastDelivered), today);

  const isOverdue = days !== undefined && days >= 10;
  const isUrgent = days !== undefined && days >= 7;

  return (
    <tr className={`
      ${doneToday ? "done-today bg-green-50" : ""} 
      ${isOverdue ? "bg-red-50" : isUrgent ? "bg-yellow-50" : ""}
    `}>
      <td className="relative">
        {doneToday && (
          <div className="absolute inset-0 bg-green-200 opacity-30 rounded"></div>
        )}
        <span className={doneToday ? "line-through text-gray-500" : ""}>
          {s.name}
        </span>
        {doneToday && (
          <span className="mr-2 text-green-600 font-bold">✓</span>
        )}
      </td>
      <td className="text-center">{s.isBig ? "גדול" : "קטן"}</td>
      <td className="text-center">
        <span className={isOverdue ? "text-red-600 font-bold" : isUrgent ? "text-yellow-600 font-bold" : ""}>
          {days ?? "—"}
        </span>
      </td>
      <td className="text-center">
        {s.averageTime ? `${s.averageTime} דק'` : "—"}
      </td>
      <td className="text-center">
        <div className="flex gap-1 justify-center">
          {onStartTimer && !doneToday && (
            <button 
              className="btn-sm bg-blue-500 hover:bg-blue-600" 
              onClick={() => onStartTimer(s)}
              title="התחל מדידת זמן"
            >
              <Clock size={14} />
            </button>
          )}
          {onDone && !doneToday && (
            <button className="btn-sm" onClick={() => onDone(s.id)}>✓</button>
          )}
          {onUndo && doneToday && (
            <button className="btn-sm" onClick={() => onUndo(s.id)}>↺</button>
          )}
        </div>
      </td>
    </tr>
  );
}