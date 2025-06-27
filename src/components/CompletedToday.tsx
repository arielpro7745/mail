import { Street } from "../types";
import StreetRow from "./StreetRow";

export default function CompletedToday({ list }: { list: Street[] }) {
  if (!list.length) return null;
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">בוצעו היום</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>רחוב</th>
              <th>סוג</th>
              <th>ימים מאז</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <StreetRow key={s.id} s={s} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
