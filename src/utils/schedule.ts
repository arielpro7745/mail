import { Street } from "../types";
import { totalDaysBetween } from "./dates";

export function sortByUrgency(list: Street[], today=new Date()): Street[] {
  return [...list].sort((a,b)=>{
    const da=a.lastDelivered?totalDaysBetween(new Date(a.lastDelivered),today):Infinity;
    const db=b.lastDelivered?totalDaysBetween(new Date(b.lastDelivered),today):Infinity;
    if ((da>=14)!==(db>=14)) return da>=14?-1:1;
    if (da!==db) return db-da;
    return a.isBig===b.isBig?0:(a.isBig?-1:1);
  });
}

export function pickForToday(sorted: Street[]): Street[] {
  const big = sorted.find(s=>s.isBig);
  return big?[big]:sorted.slice(0,3);
}