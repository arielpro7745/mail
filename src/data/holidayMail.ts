// src/data/holidayMail.ts
import { HolidayMailType, HolidayPeriod, HolidayStrategy } from '../types/holiday';

export const holidayMailTypes: HolidayMailType[] = [
  {
    id: 'calendars',
    name: 'לוחות שנה',
    description: 'לוחות שנה לשנה החדשה',
    estimatedTimePerBuilding: 3,
    priority: 'medium',
    color: 'bg-blue-500',
    icon: '📅'
  },
  {
    id: 'charity-flyers',
    name: 'עלונים לתרומות',
    description: 'עלוני תרומות וצדקה',
    estimatedTimePerBuilding: 2,
    priority: 'low',
    color: 'bg-green-500',
    icon: '💝'
  },
  {
    id: 'holiday-cards',
    name: 'כרטיסי ברכה',
    description: 'כרטיסי ברכה לחגים',
    estimatedTimePerBuilding: 2,
    priority: 'medium',
    color: 'bg-purple-500',
    icon: '💌'
  },
  {
    id: 'regular-mail',
    name: 'דואר רגיל',
    description: 'דואר רגיל יומי',
    estimatedTimePerBuilding: 4,
    priority: 'high',
    color: 'bg-orange-500',
    icon: '📮'
  },
  {
    id: 'registered-mail',
    name: 'דואר רשום',
    description: 'דואר רשום ומסמכים חשובים',
    estimatedTimePerBuilding: 8,
    priority: 'urgent',
    color: 'bg-red-500',
    icon: '📋'
  },
  {
    id: 'packages',
    name: 'חבילות',
    description: 'חבילות ומשלוחים',
    estimatedTimePerBuilding: 10,
    priority: 'urgent',
    color: 'bg-indigo-500',
    icon: '📦'
  },
  {
    id: 'newspapers',
    name: 'עיתונים',
    description: 'עיתונים ומגזינים',
    estimatedTimePerBuilding: 1,
    priority: 'low',
    color: 'bg-gray-500',
    icon: '📰'
  }
];

export const holidayPeriods: HolidayPeriod[] = [
  {
    id: 'rosh-hashana',
    name: 'ראש השנה',
    startDate: '2024-09-01',
    endDate: '2024-09-20',
    isActive: false,
    mailTypes: ['calendars', 'charity-flyers', 'holiday-cards', 'regular-mail'],
    estimatedVolume: 'extreme',
    specialInstructions: 'עומס כבד של לוחות שנה ועלוני תרומות. מומלץ להתחיל 10 ימים מראש.'
  },
  {
    id: 'yom-kippur',
    name: 'יום כיפור',
    startDate: '2024-09-21',
    endDate: '2024-09-28',
    isActive: false,
    mailTypes: ['charity-flyers', 'regular-mail'],
    estimatedVolume: 'high',
    specialInstructions: 'הרבה עלוני תרומות לפני הצום.'
  },
  {
    id: 'sukkot',
    name: 'סוכות',
    startDate: '2024-10-01',
    endDate: '2024-10-15',
    isActive: false,
    mailTypes: ['holiday-cards', 'regular-mail'],
    estimatedVolume: 'medium'
  },
  {
    id: 'chanukah',
    name: 'חנוכה',
    startDate: '2024-12-01',
    endDate: '2024-12-20',
    isActive: false,
    mailTypes: ['holiday-cards', 'charity-flyers', 'regular-mail'],
    estimatedVolume: 'high'
  },
  {
    id: 'passover',
    name: 'פסח',
    startDate: '2025-04-01',
    endDate: '2025-04-20',
    isActive: false,
    mailTypes: ['holiday-cards', 'charity-flyers', 'regular-mail'],
    estimatedVolume: 'extreme',
    specialInstructions: 'עומס כבד מאוד. מומלץ להתחיל 14 ימים מראש.'
  }
];

export const holidayStrategies: HolidayStrategy[] = [
  {
    id: 'extreme-load',
    name: 'אסטרטגיית עומס קיצוני',
    description: 'לתקופות עם עומס דואר כבד מאוד (ראש השנה, פסח)',
    recommendedDays: 14,
    dailyHours: 8,
    priorityOrder: ['registered-mail', 'packages', 'regular-mail', 'calendars', 'holiday-cards', 'charity-flyers'],
    tips: [
      'התחל 14 ימים לפני החג',
      'עבוד 8 שעות ביום במקום 6',
      'דואר רשום וחבילות תמיד ראשונים',
      'חלק עלוני תרומות בסוף היום',
      'תכנן מראש איזה רחובות לעשות כל יום',
      'קח הפסקות קצרות כל שעתיים'
    ]
  },
  {
    id: 'high-load',
    name: 'אסטרטגיית עומס גבוה',
    description: 'לתקופות עם עומס דואר גבוה (יום כיפור, חנוכה)',
    recommendedDays: 10,
    dailyHours: 7,
    priorityOrder: ['registered-mail', 'packages', 'regular-mail', 'holiday-cards', 'charity-flyers'],
    tips: [
      'התחל 10 ימים לפני החג',
      'עבוד שעה נוספת ביום',
      'דואר רשום וחבילות ראשונים',
      'עלוני תרומות אחרונים',
      'תכנן מסלולים יעילים'
    ]
  },
  {
    id: 'normal-load',
    name: 'אסטרטגיה רגילה',
    description: 'לתקופות עם עומס דואר רגיל',
    recommendedDays: 7,
    dailyHours: 6,
    priorityOrder: ['registered-mail', 'packages', 'regular-mail', 'holiday-cards'],
    tips: [
      'התחל שבוע לפני החג',
      'שמור על שעות עבודה רגילות',
      'דואר רשום וחבילות ראשונים',
      'תכנן מראש'
    ]
  }
];