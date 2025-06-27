import { streets } from "../data/streets";
import { walkOrder45 } from "../data/walkOrder";

export default function WalkingOrder({ area }: { area: 14 | 45 }) {
  if (area !== 45) return null;
  const names = walkOrder45
    .map((id) => streets.find((s) => s.id === id)?.name.split(" ")[0])
    .filter(Boolean)
    .join(" → ");

  return (
    <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
      <b>סדר הליכה מומלץ:</b> {names}
    </p>
  );
}
