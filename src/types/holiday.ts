// src/types/holiday.ts
export interface HolidayMailType {
  id: string;
  name: string;
  description: string;
  estimatedTimePerBuilding: number; // דקות
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  icon: string;
}

export interface HolidayPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  mailTypes: string[]; // IDs של סוגי דואר
  estimatedVolume: 'low' | 'medium' | 'high' | 'extreme';
  specialInstructions?: string;
}

export interface DailyMailLoad {
  date: string;
  area: 12 | 14 | 45;
  mailTypes: {
    typeId: string;
    volume: number; // כמות חבילות/עלונים
    estimatedTime: number; // זמן משוער בדקות
  }[];
  totalEstimatedTime: number;
  status: 'planned' | 'in-progress' | 'completed';
  actualTime?: number;
  notes?: string;
}

export interface HolidayStrategy {
  id: string;
  name: string;
  description: string;
  recommendedDays: number; // כמה ימים לפני החג להתחיל
  dailyHours: number; // שעות עבודה מומלצות ביום
  priorityOrder: string[]; // סדר עדיפויות של סוגי דואר
  tips: string[];
}