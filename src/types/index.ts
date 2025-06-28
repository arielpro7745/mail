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
export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship?: string; // קשר משפחתי
}

export interface Resident {
  id: string;
  fullName: string;
  apartment: string;
  phone?: string;
  familyPhones?: string[];
  contacts?: Contact[]; // רשימת אנשי קשר עם שמות
  allowMailbox?: boolean;
  allowDoor?: boolean;
  isPrimary?: boolean; // דייר ראשי בדירה
  relationship?: string; // קשר משפחתי (בן/בת, הורה, וכו')
  entranceId?: string | null; // קישור לכניסה ספציפית
}

export interface Building {
  id: string;
  streetId: string;
  number: number;
  entrance?: string | null;
  code?: string | null;
  residents: Resident[];
  entrances?: BuildingEntrance[]; // כניסות מרובות
}

export interface BuildingEntrance {
  id: string;
  name: string; // כניסה א', כניסה ב' וכו'
  code?: string | null;
  mailboxes?: Mailbox[];
}

export interface Mailbox {
  id: string;
  number: string;
  familyName?: string | null; // שם משפחה
  contacts?: Contact[]; // אנשי קשר עם שמות וטלפונים
  hasKey?: boolean;
  notes?: string | null; // הערות נוספות
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