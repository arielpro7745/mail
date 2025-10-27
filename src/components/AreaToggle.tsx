import { Area } from "../types";
import { RotateCcw, Calendar, TrendingUp } from "lucide-react";
import { getAreaColor, getAreaName, getNextArea } from "../utils/areaColors";

export function AreaToggle({area,onEnd}:{area:Area;onEnd:()=>void}){
  const getAreaProgress = () => {
    const mockProgress = Math.floor(Math.random() * 40) + 60;
    return mockProgress;
  };

  const progress = getAreaProgress();
  const areaColor = getAreaColor(area);
  const nextArea = getNextArea(area);
  const nextAreaColor = getAreaColor(nextArea);

  return(
    <div className={`bg-gradient-to-r ${areaColor.bg} border-2 ${areaColor.border} rounded-xl p-6 my-6 shadow-lg`}>
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${areaColor.bgSolid} rounded-2xl flex items-center justify-center shadow-lg`}>
            <span className="text-2xl font-bold text-white">{area}</span>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${areaColor.text}`}>{getAreaName(area)}</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className={areaColor.text} />
                <span>{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp size={16} />
                <span>התקדמות: {progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className={`bg-white rounded-lg px-4 py-2 border-2 ${nextAreaColor.border} shadow-sm`}>
            <div className="text-xs text-gray-500 mb-1">אזור הבא</div>
            <div className={`font-bold ${nextAreaColor.text}`}>
              {getAreaName(nextArea)}
            </div>
          </div>
          <button
            className={`flex items-center gap-2 px-6 py-3 ${areaColor.bgSolid} ${areaColor.bgHover} text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium`}
            onClick={onEnd}
          >
            <RotateCcw size={18} />
            סיים יום → לאזור הבא
          </button>
        </div>
      </div>
    </div>
  );
}
