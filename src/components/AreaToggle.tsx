import { Area } from "../types";

export function AreaToggle({area,onEnd}:{area:Area;onEnd:()=>void}){
  return(
    <div className="flex flex-col sm:flex-row gap-4 items-center my-4">
      <span className="text-lg">אזור נוכחי: <b className="text-indigo-700">{area}</b></span>
      <button className="btn" onClick={onEnd}>סיים יום → לאזור הבא</button>
    </div>
  );
}
