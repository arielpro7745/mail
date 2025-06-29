export const isWeekend = (d: Date) => [5,6].includes(d.getDay());

export function businessDaysBetween(from: Date, to: Date): number {
  let days = 0, cur = new Date(from);
  while (cur < to) {
    cur.setDate(cur.getDate()+1);
    if (!isWeekend(cur)) days++;
  }
  return days;
}

// פונקציה לחישוב ימים כוללים (כולל סוף שבוע)
export function totalDaysBetween(from: Date, to: Date): number {
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// פונקציה חדשה לחישוב אם רחוב צריך להופיע שוב (14 ימים כוללים)
export function shouldStreetReappear(lastDelivered: string | null): boolean {
  if (!lastDelivered) return true; // אם לא חולק מעולם
  
  const deliveryDate = new Date(lastDelivered);
  const today = new Date();
  const totalDaysElapsed = totalDaysBetween(deliveryDate, today);
  
  // אם עברו 14 ימים כוללים (כולל שישי ושבת), הרחוב צריך להופיע שוב
  return totalDaysElapsed >= 14;
}

// פונקציה לחישוב כמה ימים נותרו עד שהרחוב יחזור (14 ימים כוללים)
export function daysUntilReappear(lastDelivered: string): number {
  const deliveryDate = new Date(lastDelivered);
  const today = new Date();
  const totalDaysElapsed = totalDaysBetween(deliveryDate, today);
  
  return Math.max(0, 14 - totalDaysElapsed);
}

// פונקציה לחישוב רמת דחיפות לפי ימים כוללים
export function getUrgencyLevel(lastDelivered: string | null): 'normal' | 'urgent' | 'critical' {
  if (!lastDelivered) return 'critical'; // לא חולק מעולם
  
  const totalDaysElapsed = totalDaysBetween(new Date(lastDelivered), new Date());
  
  if (totalDaysElapsed >= 20) return 'critical'; // מעל 20 ימים כוללים
  if (totalDaysElapsed >= 14) return 'urgent';   // 14-19 ימים כוללים
  return 'normal'; // פחות מ-14 ימים כוללים
}