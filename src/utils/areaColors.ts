import { Area } from '../types';

export const AREA_COLORS = {
  12: {
    name: 'ירוק',
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-800',
    bgSolid: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    ring: 'ring-green-400',
    badge: 'bg-green-100 text-green-700'
  },
  14: {
    name: 'אדום',
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-800',
    bgSolid: 'bg-red-500',
    bgHover: 'hover:bg-red-600',
    ring: 'ring-red-400',
    badge: 'bg-red-100 text-red-700'
  },
  45: {
    name: 'כחול',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
    bgSolid: 'bg-blue-500',
    bgHover: 'hover:bg-blue-600',
    ring: 'ring-blue-400',
    badge: 'bg-blue-100 text-blue-700'
  }
} as const;

export function getAreaColor(area: Area) {
  return AREA_COLORS[area];
}

export function getAreaName(area: Area): string {
  return `אזור ${area} (${AREA_COLORS[area].name})`;
}

export function isWorkingDay(date: Date = new Date()): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek !== 5 && dayOfWeek !== 6;
}

export function calculateTodayArea(referenceDate: Date = new Date()): Area {
  const baseDate = new Date('2025-10-26');
  baseDate.setHours(0, 0, 0, 0);

  const currentDate = new Date(referenceDate);
  currentDate.setHours(0, 0, 0, 0);

  let workingDaysCount = 0;
  const tempDate = new Date(baseDate);

  while (tempDate < currentDate) {
    const dayOfWeek = tempDate.getDay();
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      workingDaysCount++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const areaRotation: Area[] = [45, 14, 12];
  const areaIndex = workingDaysCount % 3;

  return areaRotation[areaIndex];
}

export function getAreaForDate(date: Date): Area {
  return calculateTodayArea(date);
}

export function getNextArea(currentArea: Area): Area {
  if (currentArea === 45) return 14;
  if (currentArea === 14) return 12;
  return 45;
}

export function getPreviousArea(currentArea: Area): Area {
  if (currentArea === 45) return 12;
  if (currentArea === 14) return 45;
  return 14;
}
