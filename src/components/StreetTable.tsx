import { Street } from "../types";
import StreetRow from "./StreetRow";

export default function StreetTable({
  list,
  onDone,
  onStartTimer,
}: {
  list: Street[];
  onDone: (id: string) => void;
  onStartTimer?: (street: Street) => void;
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th>רחוב</th>
          <th>סוג</th>
          <th>ימים מאז</th>
          <th>זמן ממוצע</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {list.map(s => (
          <StreetRow 
            key={s.id} 
            s={s} 
            onDone={onDone} 
            onStartTimer={onStartTimer}
          />
        ))}
      </tbody>
    </table>
  );
}