import { useEffect } from "react";
import { useSettings } from "./useSettings";

export function useNotifications() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings.dailyReminder) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const scheduleReminder = () => {
      const now = new Date();
      const [hours, minutes] = settings.reminderTime.split(":").map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // If reminder time has passed today, schedule for tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("תזכורת חלוקת דואר", {
            body: "זמן להתחיל את חלוקת הדואר היומית!",
            icon: "/favicon.svg",
          });
        }
        
        // Schedule next reminder
        scheduleReminder();
      }, timeUntilReminder);

      return timeoutId;
    };

    const timeoutId = scheduleReminder();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [settings.dailyReminder, settings.reminderTime]);

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted" && settings.soundEnabled) {
      new Notification(title, { body, icon: "/favicon.svg" });
    }
  };

  return { showNotification };
}