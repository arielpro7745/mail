export const isWeekend = (d: Date) => [5,6].includes(d.getDay());

export function businessDaysBetween(from: Date, to: Date): number {
  let days = 0, cur = new Date(from);
  while (cur < to) {
    cur.setDate(cur.getDate()+1);
    if (!isWeekend(cur)) days++;
  }
  return days;
}
