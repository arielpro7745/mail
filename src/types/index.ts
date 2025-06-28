export type Area = 14 | 45;

/* ---------- חלוקה רגילה ---------- */
export interface Street {
  id: string;
  name: string;
  area: Area;
  isBig: boolean;
  lastDelivered: string;
  deliveryTimes?: number[]; // זמני חלוקה בדקות
  averageTime?: number; // זמן ממוצע בדקות
}

/* ---------- בניינים ‑↠‑ דיירים ---------- */
export interface Resident {
  id: string;
  fullName: string;
  apartment: string;
  phone?: string;
  familyPhones?: string[];
  allowMailbox?: boolean;
  allowDoor?: boolean;
}

export interface Building {
  id: string;
  streetId: string;
  number: number;
  entrance?: string;
  code?: string;
  residents: Resident[];
  entrances?: BuildingEntrance[]; // כניסות מרובות
}

export interface BuildingEntrance {
  id: string;
  name: string; // כניסה א', כניסה ב' וכו'
  code?: string;
  mailboxes?: Mailbox[];
}

export interface Mailbox {
  id: string;
  number: string;
  familyName?: string; // שם משפחה
  phone?: string; // טלפון
  hasKey?: boolean;
  notes?: string; // הערות נוספות
  allowDoor?: boolean; // מאשר דלת
  allowMailbox?: boolean; // מאשר תיבה
  residentId?: string; // קישור לדייר (אופציונלי)
}

/* ---------- הגדרות מערכת ---------- */
export interface AppSettings {
  dailyReminder: boolean;
  reminderTime: string; // HH:MM format
  soundEnabled: boolean;
  optimizeRoutes: boolean;
}

/* ---------- סטטיסטיקות ---------- */
export interface DeliveryStats {
  totalDeliveries: number;
  averageTimePerStreet: number;
  completionRate: number;
  streetsPerDay: number;
}