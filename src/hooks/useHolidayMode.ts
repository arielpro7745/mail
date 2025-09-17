import { useState, useEffect } from "react";
import { holidayPeriods } from "../data/holidayMail";
import { HolidayPeriod } from "../types/holiday";

export function useHolidayMode() {
  const [currentHoliday, setCurrentHoliday] = useState<HolidayPeriod | null>(null);
  const [isPreHoliday, setIsPreHoliday] = useState(false);
  const [daysUntilHoliday, setDaysUntilHoliday] = useState<number | null>(null);

  useEffect(() => {
    const checkHolidayStatus = () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // בדוק אם אנחנו בתקופת חג
      const activeHoliday = holidayPeriods.find(period => 
        todayStr >= period.startDate && todayStr <= period.endDate
      );

      if (activeHoliday) {
        setCurrentHoliday(activeHoliday);
        setIsPreHoliday(false);
        setDaysUntilHoliday(null);
        return;
      }

      // בדוק אם אנחנו לפני חג (עד 14 ימים)
      const upcomingHoliday = holidayPeriods
        .filter(period => period.startDate > todayStr)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

      if (upcomingHoliday) {
        const holidayDate = new Date(upcomingHoliday.startDate);
        const diffTime = holidayDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 14) {
          setCurrentHoliday(upcomingHoliday);
          setIsPreHoliday(true);
          setDaysUntilHoliday(diffDays);
          return;
        }
      }

      // אין חג קרוב
      setCurrentHoliday(null);
      setIsPreHoliday(false);
      setDaysUntilHoliday(null);
    };

    checkHolidayStatus();
    
    // בדוק כל יום בחצות
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      checkHolidayStatus();
      // המשך לבדוק כל 24 שעות
      const interval = setInterval(checkHolidayStatus, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return {
    currentHoliday,
    isPreHoliday,
    daysUntilHoliday,
    isHolidayMode: currentHoliday !== null,
    getHolidayStatus: () => {
      if (!currentHoliday) return null;
      
      if (isPreHoliday) {
        return {
          type: 'preparation' as const,
          message: `מתכונן ל${currentHoliday.name} (עוד ${daysUntilHoliday} ימים)`,
          urgency: daysUntilHoliday! <= 7 ? 'high' : 'medium'
        };
      } else {
        return {
          type: 'active' as const,
          message: `תקופת ${currentHoliday.name} פעילה`,
          urgency: 'high'
        };
      }
    }
  };
}