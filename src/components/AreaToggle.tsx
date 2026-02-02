import { Area } from "../types";
import { RotateCcw, Calendar, TrendingUp, MapPin, ArrowRight, MousePointerClick } from "lucide-react";
import { getAreaColor, getAreaName, getNextArea } from "../utils/areaColors";

export function AreaToggle({ area, onEnd }: { area: Area; onEnd: () => void }) {
  
  // פונקציה שמבצעת את ההחלפה בפועל
  const manualChange = (newArea: number) => {
    localStorage.setItem("currentArea", newArea.toString());
    window.location.reload(); // רענון כדי שהשינוי יתפוס מיד
  };

  const getAreaProgress = () => {
    const mockProgress = Math.floor(Math.random() * 40) + 60;
    return mockProgress;
  };

  const progress = getAreaProgress();
  // אם האזור הוא 45 (הישן), נציג אותו כ-7 באופן זמני כדי לא לשבור את הצבעים
  const displayArea = area === 45 ? 7 : area; 
  
  const areaColor = getAreaColor(displayArea);
  const nextArea = getNextArea(displayArea);
  const nextAreaColor = getAreaColor(nextArea);

  return (
    <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 my-2">
            {/* רקע דקורטיבי */}
            <div className={`absolute inset-0 bg-gradient-to-br ${areaColor.bg} opacity-50`} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* מידע על האזור */}
                <div className="flex items-center gap-5">
                    <div className="relative">
                    <div className={`w-20 h-20 ${areaColor.bgSolid} rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-0`}>
                        <span className="text-3xl font-bold text-white">{displayArea}</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-gray-100">
                        <MapPin size={16} className={areaColor.text} />
                    </div>
                    </div>

                    <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className={`text-2xl font-bold ${areaColor.text}`}>
                        {getAreaName(displayArea)}
                        </h2>
                        <span className={`px-2 py-0.5 ${areaColor.bgSolid} text-white text-xs font-bold rounded-full`}>
                        פעיל
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
                        <TrendingUp size={14} />
                        <span className="font-medium">התקדמות: {progress}%</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 w-64">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${areaColor.bgSolid} rounded-full transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                        />
                        </div>
                    </div>
                    </div>
                </div>

                {/* פעולות */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* אזור הבא */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                        <div className="text-xs text-gray-500 mb-0.5">האזור הבא</div>
                        <div className={`font-bold text-lg ${nextAreaColor.text}`}>
                            {getAreaName(nextArea)}
                        </div>
                        </div>
                        <div className={`w-10 h-10 ${nextAreaColor.bgSolid} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold">{nextArea}</span>
                        </div>
                    </div>
                    </div>

                    <ArrowRight size={20} className="text-gray-300 hidden sm:block" />

                    {/* כפתור סיום */}
                    <button
                    className={`
                        group flex items-center gap-3 px-6 py-4 rounded-xl
                        bg-gradient-to-r ${areaColor.bgSolid} hover:opacity-90
                        text-white font-semibold shadow-lg
                        transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
                    `}
                    onClick={onEnd}
                    >
                    <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>סיים יום</span>
                    </button>
                </div>
                </div>
            </div>
        </div>

        {/* --- כפתורי בחירה (החלק החדש והחשוב) --- */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                <MousePointerClick size={16} /> לחץ למעבר מהיר לאזור אחר:
            </h3>
            <div className="grid grid-cols-3 gap-3">
                <button 
                    onClick={() => manualChange(7)} 
                    className={`py-3 rounded-lg font-bold text-lg transition-all ${area === 7 ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}
                >
                    7 (כחול)
                </button>
                <button 
                    onClick={() => manualChange(12)} 
                    className={`py-3 rounded-lg font-bold text-lg transition-all ${area === 12 ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300' : 'bg-gray-100 text-gray-600 hover:bg-emerald-50'}`}
                >
                    12 (ירוק)
                </button>
                <button 
                    onClick={() => manualChange(14)} 
                    className={`py-3 rounded-lg font-bold text-lg transition-all ${area === 14 ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300' : 'bg-gray-100 text-gray-600 hover:bg-red-50'}`}
                >
                    14 (אדום)
                </button>
            </div>
        </div>
    </div>
  );
}