import { Street } from "../types";
import StreetRow from "./StreetRow";

export default function StreetTable({
  list,
  onDone,
  onStartTimer,
  showCompletionStatus = false,
}: {
  list: Street[];
  onDone: (id: string) => void;
  onStartTimer?: (street: Street) => void;
  showCompletionStatus?: boolean;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-right py-2 px-3 font-semibold text-gray-700">רחוב</th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">סוג</th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">
            {showCompletionStatus ? "סדר חלוקה" : "ימים מאז"}
          </th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">זמן ממוצע</th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">פעולות</th>
        </tr>
      </thead>
      <tbody>
        {list.map((s, index) => (
          <StreetRow 
            key={s.id} 
            s={s} 
            onDone={onDone} 
            onStartTimer={onStartTimer}
            showCompletionStatus={showCompletionStatus}
            completionOrder={showCompletionStatus ? index + 1 : undefined}
          />
        ))}
      </tbody>
    </table>
  );
}