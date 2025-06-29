import { useMemo } from "react";
import { useDistribution } from "./useDistribution";
import { useBuildings } from "./useBuildings";
import { useTasks } from "./useTasks";
import { ReportData, UndeliveredStreet, PerformanceMetrics, PhoneDirectoryEntry } from "../types";
import { businessDaysBetween } from "../utils/dates";
import { streets } from "../data/streets";

export function useReports() {
  const { pendingToday, completedToday } = useDistribution();
  const { buildings } = useBuildings();
  const { tasks } = useTasks();

  const reportData: ReportData = useMemo(() => {
    const today = new Date();

    // רחובות שלא חולקו
    const undeliveredStreets: UndeliveredStreet[] = pendingToday.map(street => {
      const daysSince = street.lastDelivered 
        ? businessDaysBetween(new Date(street.lastDelivered), today)
        : 999;
      
      let urgencyLevel: 'normal' | 'urgent' | 'critical' = 'normal';
      if (daysSince >= 14) urgencyLevel = 'critical';
      else if (daysSince >= 10) urgencyLevel = 'urgent';

      return {
        street,
        daysSinceLastDelivery: daysSince,
        urgencyLevel,
        estimatedTime: street.averageTime || (street.isBig ? 45 : 25)
      };
    });

    // רחובות שעברו 10 ימים
    const overdueStreets = pendingToday.filter(street => {
      if (!street.lastDelivered) return true;
      const days = businessDaysBetween(new Date(street.lastDelivered), today);
      return days >= 10;
    });

    // מדדי ביצועים
    const completedTimes = completedToday
      .map(s => s.averageTime)
      .filter(Boolean) as number[];
    
    const avgTime = completedTimes.length > 0 
      ? completedTimes.reduce((a, b) => a + b, 0) / completedTimes.length 
      : 0;

    const performanceMetrics: PerformanceMetrics = {
      dailyAverage: completedToday.length,
      weeklyAverage: completedToday.length * 5, // הערכה
      monthlyAverage: completedToday.length * 22, // הערכה
      efficiency: Math.min(100, (completedToday.length / (completedToday.length + pendingToday.length)) * 100),
      completionRate: Math.min(100, (completedToday.length / streets.length) * 100),
      timePerStreet: avgTime
    };

    // ספר טלפונים
    const phoneDirectory: PhoneDirectoryEntry[] = [];
    buildings.forEach(building => {
      const streetName = streets.find(s => s.id === building.streetId)?.name || building.streetId;
      
      building.residents.forEach(resident => {
        phoneDirectory.push({
          name: resident.fullName,
          phone: resident.phone || '',
          address: `${streetName} ${building.number}${building.entrance ? ` כניסה ${building.entrance}` : ''}`,
          apartment: resident.apartment,
          relationship: resident.relationship,
          allowsMailbox: resident.allowMailbox || false,
          allowsDoor: resident.allowDoor || false,
          isPrimary: resident.isPrimary || false,
          additionalPhones: resident.familyPhones || [],
          contacts: resident.contacts || []
        });
      });
    });

    return {
      undeliveredStreets,
      overdueStreets,
      performanceMetrics,
      phoneDirectory: phoneDirectory.sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [pendingToday, completedToday, buildings]);

  return { reportData };
}