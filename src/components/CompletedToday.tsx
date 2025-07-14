import { Street } from "../types";
import StreetRow from "./StreetRow";
import { CheckCircle, RotateCcw } from "lucide-react";

export default function CompletedToday({
  list,
  onUndo,
  totalCompleted,
}: {
  list: Street[];
  onUndo: (id: string) => void;
  totalCompleted?: number;
}) {
  if (!list.length) return null;
  
  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <RotateCcw size={20} className="text-green-600" />
        <h2 className="text-lg font-semibold text-gray-800">בוצעו היום</h2>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
          {list.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-green-50">
              <th className="text-right py-2 px-3 font-semibold text-green-800">רחוב</th>
              <th className="text-center py-2 px-3 font-semibold text-green-800">סוג</th>
              <th className="text-center py-2 px-3 font-semibold text-green-800">זמן חלוקה</th>
              <th className="text-center py-2 px-3 font-semibold text-green-800">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <StreetRow key={s.id} s={s} onUndo={onUndo} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}