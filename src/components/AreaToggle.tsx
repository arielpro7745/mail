import { Area } from "../types";
import { RotateCcw, MousePointerClick, AlertTriangle } from "lucide-react";

const SAFE_COLORS: any = {
  7: { bg: "bg-blue-600", text: "text-blue-600", light: "bg-blue-50", label: "כחול" },
  14: { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-50", label: "ירוק" },
  12: { bg: "bg-red-600", text: "text-red-600", light: "bg-red-50", label: "אדום" },
  45: { bg: "bg-gray-600", text: "text-gray-600", light: "bg-gray-50", label: "ישן" }
};

interface AreaToggleProps {
  area: Area;
  onEnd: () => void;
  onChange?: (newArea: number) => void;
  lastSplitAt?: string | null;
}

export function AreaToggle({ area, onEnd, onChange, lastSplitAt }: AreaToggleProps) {
  // אם מגיע אזור לא מוכר, נציג אותו כ-7
  const displayArea = SAFE_COLORS[area] ? area : 7;
  const colors = SAFE_COLORS[displayArea];

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* אזהרה אם זוהה אזור ישן */}
      {area === 45 && (
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 flex items-center gap-2 text-yellow-800 text-sm">
            <AlertTriangle size={16}/> זוהה אזור ישן. המערכת תתקן זאת אוטומטית.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-2 h-full ${colors.bg}`}></div>
        <div className="p-5 flex justify-between items-center">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold ${colors.text} px-2 py-0.5 rounded-md ${colors.light}`}>
                  אזור {displayArea} ({colors.label})
                </span>
             </div>
             <h2 className="text-xl font-black text-gray-800">יום חלוקה פעיל</h2>
             <p className="text-gray-400 text-sm">לחץ לסיום המעבר לאזור הבא</p>
          </div>
          
          <button 
            onClick={onEnd}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl ${colors.bg} text-white shadow-lg hover:scale-105 transition-transform`}
          >
            <RotateCcw size={20} className="mb-1" />
            <span className="text-[10px] font-bold">סיים</span>
          </button>
        </div>

        <div className="px-5 pb-4 text-xs text-gray-500">
          חלוקה אחרונה: {lastSplitAt ? new Date(lastSplitAt).toLocaleString('he-IL') : 'עדיין לא עודכן'}
        </div>
      </div>

      {onChange && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
           <h3 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
             <MousePointerClick size={14} /> מעבר ידני (למקרה הצורך):
           </h3>
           <div className="grid grid-cols-3 gap-3">
              <button onClick={() => onChange(7)} className={`py-3 rounded-xl font-bold border transition-all ${area === 7 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>7</button>
              <button onClick={() => onChange(14)} className={`py-3 rounded-xl font-bold border transition-all ${area === 14 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'}`}>14</button>
              <button onClick={() => onChange(12)} className={`py-3 rounded-xl font-bold border transition-all ${area === 12 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-600'}`}>12</button>
           </div>
        </div>
      )}
    </div>
  );
}
