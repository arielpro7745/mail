import { streets } from "../data/streets";
import { walkOrder45, walkOrder14, walkOrder12 } from "../data/walkOrder";

export default function WalkingOrder({ area }: { area: 12 | 14 | 45 }) {
  const order = area === 45 ? walkOrder45 : area === 14 ? walkOrder14 : area === 12 ? walkOrder12 : [];
  if (!order.length) return null;
  const names = order
    .map((id) => streets.find((s) => s.id === id)?.name.split(" ")[0])
    .filter(Boolean)
    .join(" → ");

  return (
    <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
      <b>סדר הליכה מומלץ:</b> {names}
    </p>
  );
}