export type Area = 12 | 14 | 45;

/* ---------- חלוקה רגילה ---------- */
export interface Street {
  id: string;
  name: string;
  area: Area;
  isBig: boolean;
  lastDelivered: string;
  cycleStartDate?: string; // תאריך תחילת המחזור הנוכחי
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
  contactPreference?: 'call' | 'whatsapp' | 'whatsapp_photo' | 'both' | 'none'; // העדפת קשר
  notes?: string; // הערות נוספות
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
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
}

export interface DailyStats {
  date: string;
  streetsCompleted: number;
  totalTime: number;
  area: Area;
  efficiency: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  streetsCompleted: number;
  totalTime: number;
  averageDaily: number;
  efficiency: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  streetsCompleted: number;
  totalTime: number;
  averageDaily: number;
  efficiency: number;
  bestDay: string;
  worstDay: string;
}

/* ---------- משימות ---------- */
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'delivery' | 'sorting' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate?: string;
  assignedArea?: Area;
  streetId?: string;
  buildingId?: string;
  estimatedTime?: number; // בדקות
  actualTime?: number; // בדקות
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

/* ---------- דוחות ---------- */
export interface ReportData {
  undeliveredStreets: UndeliveredStreet[];
  overdueStreets: Street[];
  performanceMetrics: PerformanceMetrics;
  phoneDirectory: PhoneDirectoryEntry[];
}

export interface UndeliveredStreet {
  street: Street;
  daysSinceLastDelivery: number;
  urgencyLevel: 'normal' | 'urgent' | 'critical';
  estimatedTime: number;
}

export interface PerformanceMetrics {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  efficiency: number;
  completionRate: number;
  timePerStreet: number;
}

export interface PhoneDirectoryEntry {
  name: string;
  phone: string;
  address: string;
  apartment?: string;
  relationship?: string;
  allowsMailbox: boolean;
  allowsDoor: boolean;
  isPrimary: boolean;
  additionalPhones: string[];
  contacts: Contact[];
}

/* ---------- ייצוא נתונים ---------- */
export interface ExportData {
  streets: Street[];
  buildings: Building[];
  residents: Resident[];
  tasks: Task[];
  stats: DeliveryStats;
  exportDate: string;
  version: string;
}