import { AlertTriangle, Calendar } from "lucide-react";

export default function Notifications({count}:{count:number}){
  if(!count) return null;
  return(
    <div className="bg-red-50 border border-red-200 text-red-900 p-4 mt-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-3">
        <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-800 mb-1">רחובות דחופים לחלוקה</h3>
          <p className="text-sm">
            <span className="font-medium">{count} רחובות</span> עברו 14 ימים ללא חלוקה – דורשים טיפול דחוף!
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-red-700">
            <Calendar size={12} />
            <span>מחזור חלוקה: 14 ימים כוללים (כולל שישי ושבת)</span>
          </div>
        </div>
      </div>
    </div>
  );
}