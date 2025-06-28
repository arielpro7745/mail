import { useState } from "react";
import { Street } from "../types";
import { optimizeRoute, calculateEstimatedTime, getRouteEfficiency } from "../utils/routeOptimizer";
import { Map, Clock, TrendingUp } from "lucide-react";

interface Props {
  streets: Street[];
  area: 14 | 45;
  onOptimize: (optimizedStreets: Street[]) => void;
}

export default function RouteOptimizer({ streets, area, onOptimize }: Props) {
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOptimize = () => {
    const optimized = optimizeRoute(streets, area);
    onOptimize(optimized);
    setIsOptimized(true);
  };

  const estimatedTime = calculateEstimatedTime(streets);
  const efficiency = getRouteEfficiency(streets);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Map size={20} />
          אופטימיזציה של מסלול
        </h3>
        <button
          onClick={handleOptimize}
          className={`btn-sm ${isOptimized ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isOptimized ? 'מסלול מותאם' : 'בצע אופטימיזציה'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <span>זמן משוער: {Math.round(estimatedTime)} דקות</span>
        </div>
        
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-500" />
          <span>יעילות: {Math.round(efficiency)}%</span>
        </div>
        
        <div className="text-gray-600">
          רחובות: {streets.length}
        </div>
      </div>

      {isOptimized && (
        <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
          ✓ המסלול אותאם לפי סדר ההליכה המומלץ ורמת הדחיפות
        </div>
      )}
    </div>
  );
}