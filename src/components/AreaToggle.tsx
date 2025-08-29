import { Area } from "../types";
import { RotateCcw, Calendar, TrendingUp } from "lucide-react";

export function AreaToggle({area,onEnd}:{area:Area;onEnd:()=>void}){
  // חישוב סטטיסטיקות מהירות לאזור הנוכחי
  const getAreaProgress = () => {
    // זה יכול להיות מחושב מהנתונים הקיימים
    const mockProgress = Math.floor(Math.random() * 40) + 60; // 60-100%
    return mockProgress;
  };
  
  const progress = getAreaProgress();
  
  return(
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6 my-6 shadow-lg">
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{area}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">אזור נוכחי: {area}</h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-blue-500" />
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
          <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">אזור הבא</div>
            <div className="font-bold text-gray-800">
              {area === 12 ? 'אזור 14' : area === 14 ? 'אזור 45' : 'אזור 12'}
            </div>
          </div>
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
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
