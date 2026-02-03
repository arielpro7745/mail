export interface Street {
  id: string;
  name: string;
  area: number;
  lastDelivered?: string; // תאריך ISO
  deliveryTimes?: number[]; 
  averageTime?: number;
}

export type Area = 7 | 12 | 14 | 45; // 45 נשמר לתמיכה לאחור