import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { streets as initialStreets } from "../data/streets";
import { Street, Area } from "../types";
import { sortByUrgency, pickForToday } from "../utils/schedule";
import { optimizeRoute } from "../utils/routeOptimizer";
import { isSameDay } from "../utils/isSameDay";
import { shouldStreetReappear, totalDaysBetween } from "../utils/dates";
import { useSettings } from "./useSettings";

const COLLECTION_NAME = "streets";
const AREA_DOC = "currentArea";

export function useDistribution() {
  const [data, setData] = useState<Street[]>([]);
  const [todayArea, setTodayArea] = useState<Area>(14);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  // Initialize data if collection is empty
  const initializeData = async () => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      if (snapshot.empty) {
        // Initialize with default streets data
        const batch = initialStreets.map(street => 
          setDoc(doc(db, COLLECTION_NAME, street.id), street)
        );
        await Promise.all(batch);
        console.log("Initialized streets data in Firestore");
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  // Load current area
  const loadCurrentArea = async () => {
    try {
      const areaDoc = await getDocs(collection(db, "settings"));
      const areaData = areaDoc.docs.find(doc => doc.id === AREA_DOC);
      if (areaData) {
        setTodayArea(areaData.data().area as Area);
      } else {
        // Initialize area setting
        await setDoc(doc(db, "settings", AREA_DOC), { area: 14 });
      }
    } catch (error) {
      console.error("Error loading current area:", error);
    }
  };

  // Save current area
  const saveCurrentArea = async (area: Area) => {
    try {
      await setDoc(doc(db, "settings", AREA_DOC), { area });
    } catch (error) {
      console.error("Error saving current area:", error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await initializeData();
      await loadCurrentArea();
      setLoading(false);
    };

    initializeApp();

    // Listen to real-time updates for streets
    const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
      const streets: Street[] = [];
      snapshot.forEach((doc) => {
        streets.push({ id: doc.id, ...doc.data() } as Street);
      });
      setData(streets);
    });

    return () => unsubscribe();
  }, []);

  const today = new Date();
  const areaStreets = data.filter(s => s.area === todayArea);
  
  // מיון רחובות לפי דחיפות - מהישן לחדש
  const sortStreetsByUrgency = (streets: Street[]) => {
    return [...streets].sort((a, b) => {
      // אם יש מחזור פעיל, מיין לפי תאריך החלוקה האחרון (ישן לחדש)
      if (a.cycleStartDate && b.cycleStartDate) {
        // רחובות שלא חולקו במחזור הנוכחי - עדיפות גבוהה
        const aDelivered = a.lastDelivered && new Date(a.lastDelivered) > new Date(a.cycleStartDate);
        const bDelivered = b.lastDelivered && new Date(b.lastDelivered) > new Date(b.cycleStartDate);
        
        if (aDelivered !== bDelivered) {
          return aDelivered ? 1 : -1; // לא חולק = עדיפות גבוהה
        }
        
        // אם שניהם חולקו או לא חולקו, מיין לפי תאריך החלוקה האחרון
        if (a.lastDelivered && b.lastDelivered) {
          return new Date(a.lastDelivered).getTime() - new Date(b.lastDelivered).getTime(); // ישן לחדש
        }
      }
      
      // מיון רגיל לפי דחיפות
      const aDays = a.lastDelivered ? totalDaysBetween(new Date(a.lastDelivered), today) : 999;
      const bDays = b.lastDelivered ? totalDaysBetween(new Date(b.lastDelivered), today) : 999;
      
      if (aDays !== bDays) return bDays - aDays; // יותר ימים = עדיפות גבוהה
      
      // אם אותו מספר ימים, רחובות גדולים קודם
      if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
      
      return 0;
    });
  };

  // רחובות שחולקו היום
  const completedToday = areaStreets.filter(
    s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)
  );
  
  // רחובות שצריכים להופיע (לא חולקו היום + עברו 14 ימים מהחלוקה האחרונה)
  const streetsNeedingDelivery = areaStreets.filter(s => {
    // אם חולק היום, לא צריך להופיע
    if (s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)) {
      return false;
    }
    
    // אם יש מחזור פעיל, בדוק אם הרחוב חולק במחזור הנוכחי
    if (s.cycleStartDate) {
      // אם לא חולק במחזור הנוכחי, צריך להופיע
      if (!s.lastDelivered || new Date(s.lastDelivered) <= new Date(s.cycleStartDate)) {
        return true;
      }
      // אם חולק במחזור הנוכחי, לא צריך להופיע
      return false;
    }
    
    // אם אין מחזור פעיל, השתמש בלוגיקה הרגילה
    return shouldStreetReappear(s.lastDelivered);
  });

  // לוגיקה חדשה: אם יש רחובות שצריכים חלוקה, הצג רק אותם
  // אם כל הרחובות לא צריכים חלוקה, הצג הכל לפי סדר חלוקה
  let pendingToday: Street[];
  let displayCompletedToday: Street[];
  let isAllCompleted: boolean;

  if (streetsNeedingDelivery.length > 0) {
    // יש רחובות שצריכים חלוקה - הצג רק אותם
    pendingToday = sortStreetsByUrgency(streetsNeedingDelivery);
    displayCompletedToday = completedToday;
    isAllCompleted = false;
  } else {
    // כל הרחובות לא צריכים חלוקה - הצג הכל לפי סדר חלוקה
    pendingToday = sortStreetsByUrgency(areaStreets);
    displayCompletedToday = [];
    isAllCompleted = true;
  }

  // Apply route optimization if enabled
  if (settings.optimizeRoutes && streetsNeedingDelivery.length > 0) {
    pendingToday = optimizeRoute(pendingToday, todayArea);
  }

  const recommended = pickForToday(pendingToday);

  const markDelivered = async (id: string, deliveryTime?: number) => {
    try {
      const street = data.find(s => s.id === id);
      if (!street) return;

      const updates: Partial<Street> = {
        lastDelivered: new Date().toISOString()
      };

      if (deliveryTime) {
        const newTimes = [...(street.deliveryTimes || []), deliveryTime];
        const averageTime = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        
        updates.deliveryTimes = newTimes;
        updates.averageTime = averageTime;
      }

      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
    } catch (error) {
      console.error("Error marking delivered:", error);
    }
  };

  const undoDelivered = async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        lastDelivered: ""
      });
    } catch (error) {
      console.error("Error undoing delivery:", error);
    }
  };

  const endDay = async () => {
    const newArea: Area = todayArea === 14 ? 45 : 14;
    
    setTodayArea(newArea);
    await saveCurrentArea(newArea);
  };

  // פונקציה נפרדת לאיפוס מחזור
  const resetCycle = async () => {
    const currentAreaStreets = data.filter(s => s.area === todayArea);
    
    try {
      const resetPromises = currentAreaStreets.map(street => {
        const updates: Partial<Street> = {
          cycleStartDate: new Date().toISOString(), // תחילת מחזור חדש
          lastDelivered: "", // איפוס לתחילת מחזור חדש
          deliveryTimes: street.deliveryTimes || [],
          averageTime: street.averageTime || undefined
        };
        return updateDoc(doc(db, COLLECTION_NAME, street.id), updates);
      });
      await Promise.all(resetPromises);
      console.log(`מחזור חלוקה באזור ${todayArea} אופס בהצלחה`);
    } catch (error) {
      console.error("Error resetting delivery cycle:", error);
    }
  };

  // בדיקה אוטומטית לאיפוס מחזור
  useEffect(() => {
    if (loading || !data.length) return;

    const currentAreaStreets = data.filter(s => s.area === todayArea);
    if (currentAreaStreets.length === 0) return;

    // בדיקה אם כל הרחובות באזור חולקו ולא צריכים חלוקה נוספת
    const allStreetsCompleted = currentAreaStreets.every(street => 
      street.lastDelivered && !shouldStreetReappear(street.lastDelivered)
    );

    // בדיקה אם עדיין לא התחיל מחזור חדש
    const hasActiveCycle = currentAreaStreets.some(street => street.cycleStartDate);

    if (allStreetsCompleted && !hasActiveCycle) {
      console.log(`כל הרחובות באזור ${todayArea} הושלמו - מתחיל איפוס מחזור אוטומטי`);
      resetCycle();
    }
  }, [data, todayArea, loading]);

  return {
    todayArea,
    pendingToday,
    completedToday: displayCompletedToday,
    recommended,
    markDelivered,
    undoDelivered,
    endDay,
    loading,
    resetCycle,
    // נתונים נוספים לסטטיסטיקה
    allCompletedToday: completedToday,
    totalStreetsInArea: areaStreets.length,
    isAllCompleted,
    streetsNeedingDelivery: streetsNeedingDelivery.length,
        allStreets: data,
  };
}