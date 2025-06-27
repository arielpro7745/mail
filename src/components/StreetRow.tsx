import { Street } from "../types";
import { businessDaysBetween } from "../utils/dates";
import { isSameDay } from "../utils/isSameDay";

export default function StreetRow({
  s,
  onDone,
}: {
  s: Street;
  onDone?: (id: string) => void;
}) {
  const today = new Date();
  const days = s.lastDelivered
    ? businessDaysBetween(new Date(s.lastDelivered), today)
    : undefined;

  const doneToday =
    s.lastDelivered && isSameDay(new Date(s.lastDelivered), today);

  return (
    <tr className={doneToday ? "done-today" : undefined}>
      <td>{s.name}</td>
      <td className="text-center">{s.isBig ? "גדול" : "קטן"}</td>
      <td className="text-center">{days ?? "—"}</td>
      <td className="text-center">
        {onDone && (
          <button className="btn-sm" onClick={() => onDone(s.id)}>
            ✓
          </button>
        )}
      </td>
    </tr>
  );
}
