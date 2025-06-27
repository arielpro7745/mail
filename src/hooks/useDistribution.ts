import { useEffect, useState } from "react";
import { streets } from "../data/streets";
import { Street, Area } from "../types";
import { sortByUrgency, pickForToday } from "../utils/schedule";
import { isSameDay } from "../utils/isSameDay";

const LS_KEY = "post-schedule";
const LS_AREA = "post-prev-area";

export function useDistribution() {
  const [data, setData] = useState<Street[]>(() => {
    const raw = localStorage.getItem(LS_KEY);
    try {
      return raw ? JSON.parse(raw) : streets;
    } catch {
      return streets;
    }
  });
  const [todayArea, setTodayArea] = useState<Area>(() => {
    return localStorage.getItem(LS_AREA) === "14" ? 45 : 14;
  });

  useEffect(()=>localStorage.setItem(LS_KEY,JSON.stringify(data)),[data]);
  useEffect(()=>localStorage.setItem(LS_AREA,String(todayArea)),[todayArea]);

  const today=new Date();
  const todayList=sortByUrgency(data.filter(s=>s.area===todayArea),today);
  const completedToday=todayList.filter(
    s=>s.lastDelivered && isSameDay(new Date(s.lastDelivered),today)
  );
  const pendingToday=todayList.filter(
    s=>!s.lastDelivered || !isSameDay(new Date(s.lastDelivered),today)
  );

  const recommended = pickForToday(pendingToday);

  const markDelivered = (id: string) =>
    setData((d) =>
      d.map((s) =>
        s.id === id ? { ...s, lastDelivered: new Date().toISOString() } : s
      )
    );

  const undoDelivered = (id: string) =>
    setData((d) =>
      d.map((s) => (s.id === id ? { ...s, lastDelivered: "" } : s))
    );
  const endDay = () => setTodayArea((a) => (a === 14 ? 45 : 14));

  return {
    todayArea,
    pendingToday,
    completedToday,
    recommended,
    markDelivered,
    undoDelivered,
    endDay,
  };
}