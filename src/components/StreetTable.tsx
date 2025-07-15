import { Street } from "../types";
import StreetRow from "./StreetRow";

export default function StreetTable({
  list,
  onDone,
  onStartTimer,
  getStreetUrgencyLevel,
  getUrgencyColor,
  getUrgencyLabel,
}: {
  list: Street[];
  onDone: (id: string) => void;
  onStartTimer?: (street: Street) => void;
  getStreetUrgencyLevel?: (street: Street) => string;
  getUrgencyColor?: (urgencyLevel: string) => string;
  getUrgencyLabel?: (urgencyLevel: string) => string;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-right py-2 px-3 font-semibold text-gray-700">רחוב</th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">סוג</th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">
            ימים מאז
          </th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">זמן ממוצע</th>
          <th className="text-center py-2 px-3 font-semibold text-gray-700">פעולות</th>
        </tr>
      </thead>
      <tbody>
        {list.map((s) => (
          <StreetRow 
            key={s.id} 
            s={s} 
            onDone={onDone} 
            onStartTimer={onStartTimer}
            getStreetUrgencyLevel={getStreetUrgencyLevel}
            getUrgencyColor={getUrgencyColor}
            getUrgencyLabel={getUrgencyLabel}
          />
        ))}
      </tbody>
    </table>
  );
}