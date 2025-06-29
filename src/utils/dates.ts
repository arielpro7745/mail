export const isWeekend = (d: Date) => [5,6].includes(d.getDay());

export function businessDaysBetween(from: Date, to: Date): number {
  let days = 0, cur = new Date(from);
  while (cur < to) {
    cur.setDate(cur.getDate()+1);
    if (!isWeekend(cur)) days++;
  }
  return days;
}

// פונקציה חדשה לחישוב אם רחוב צריך להופיע שוב
export function shouldStreetReappear(lastDelivered: string | null): boolean {
  if (!lastDelivered) return true; // אם לא חולק מעולם
  
  const deliveryDate = new Date(lastDelivered);
  const today = new Date();
  const businessDaysElapsed = businessDaysBetween(deliveryDate, today);
  
  // אם עברו 10 ימי עסקים או יותר, הרחוב צריך להופיע שוב
  return businessDaysElapsed >= 10;
}

// פונקציה לחישוב כמה ימי עסקים נותרו עד שהרחוב יחזור
export function daysUntilReappear(lastDelivered: string): number {
  const deliveryDate = new Date(lastDelivered);
  const today = new Date();
  const businessDaysElapsed = businessDaysBetween(deliveryDate, today);
  
  return Math.max(0, 10 - businessDaysElapsed);
}

// פונקציה לחישוב רמת דחיפות לפי ימי עסקים
export function getUrgencyLevel(lastDelivered: string | null): 'normal' | 'urgent' | 'critical' {
  if (!lastDelivered) return 'critical'; // לא חולק מעולם
  
  const businessDaysElapsed = businessDaysBetween(new Date(lastDelivered), new Date());
  
  if (businessDaysElapsed >= 14) return 'critical'; // מעל 14 ימי עסקים
  if (businessDaysElapsed >= 10) return 'urgent';   // 10-13 ימי עסקים
  return 'normal'; // פחות מ-10 ימי עסקים
}