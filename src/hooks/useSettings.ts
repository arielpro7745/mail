import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { AppSettings } from "../types";

const SETTINGS_DOC = "appSettings";

const defaultSettings: AppSettings = {
  dailyReminder: true,
  reminderTime: "08:00",
  soundEnabled: true,
  optimizeRoutes: true,
  shortAddresses: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", SETTINGS_DOC));
        if (settingsDoc.exists()) {
          setSettings({ ...defaultSettings, ...settingsDoc.data() });
        } else {
          // Initialize with default settings
          await setDoc(doc(db, "settings", SETTINGS_DOC), defaultSettings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        // Handle permission errors gracefully
        if (error.code === 'permission-denied') {
          console.warn("Firebase permission denied. Using default settings. Please check your Firestore Security Rules.");
          setSettings(defaultSettings);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Listen to real-time updates
    const unsubscribe = onSnapshot(doc(db, "settings", SETTINGS_DOC), (doc) => {
      if (doc.exists()) {
        setSettings({ ...defaultSettings, ...doc.data() });
      }
    }, (error) => {
      console.error("Error in settings snapshot listener:", error);
      if (error.code === 'permission-denied') {
        console.warn("Firebase permission denied for real-time updates. Using default settings.");
        setSettings(defaultSettings);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await setDoc(doc(db, "settings", SETTINGS_DOC), updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  return { settings, updateSettings, loading };
}