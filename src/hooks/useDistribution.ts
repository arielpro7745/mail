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
    
    // אם לא חולק מעולם או עברו 14 ימים כוללים, צריך להופיע
    return shouldStreetReappear(s.lastDelivered);
  });

  // לוגיקה חדשה: אם יש רחובות שצריכים חלוקה, הצג רק אותם
  // אם כל הרחובות לא צריכים חלוקה, הצג הכל לפי סדר חלוקה
  let pendingToday: Street[];
  let displayCompletedToday: Street[];
  let isAllCompleted: boolean;

  if (streetsNeedingDelivery.length > 0) {
    // יש רחובות שצריכים חלוקה - הצג רק אותם
    pendingToday = sortByUrgency(streetsNeedingDelivery, today);
    displayCompletedToday = completedToday;
    isAllCompleted = false;
  } else {
    // כל הרחובות לא צריכים חלוקה - הצג הכל לפי סדר חלוקה
    const allStreetsSorted = [...areaStreets].sort((a, b) => {
      // קודם לפי תאריך חלוקה (מי שחולק קודם יופיע ראשון)
      if (a.lastDelivered && b.lastDelivered) {
        const dateA = new Date(a.lastDelivered).getTime();
        const dateB = new Date(b.lastDelivered).getTime();
        if (dateA !== dateB) {
          return dateA - dateB; // מוקדם יותר = ראשון
        }
      }
      
      // אם אחד חולק והשני לא
      if (a.lastDelivered && !b.lastDelivered) return -1;
      if (!a.lastDelivered && b.lastDelivered) return 1;
      
      // אם שניהם לא חולקו או חולקו באותו זמן, מיין לפי דחיפות
      return sortByUrgency([a, b], today)[0].id === a.id ? -1 : 1;
    });
    
    pendingToday = allStreetsSorted;
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
    
    // בדיקה אם האזור הנוכחי הושלם לחלוטין
    const currentAreaStreets = data.filter(s => s.area === todayArea);
    const allStreetsDelivered = currentAreaStreets.every(street => 
      street.lastDelivered && shouldStreetReappear(street.lastDelivered) === false
    );
    
    // אם האזור הושלם לחלוטין, איפוס המחזור
    if (allStreetsDelivered) {
      try {
        const resetPromises = currentAreaStreets.map(street => 
          updateDoc(doc(db, COLLECTION_NAME, street.id), {
            lastDelivered: "",
            deliveryTimes: [],
            averageTime: undefined
          })
        );
        await Promise.all(resetPromises);
        console.log(`מחזור חלוקה באזור ${todayArea} אופס בהצלחה`);
      } catch (error) {
        console.error("Error resetting delivery cycle:", error);
      }
    }
    
    setTodayArea(newArea);
    await saveCurrentArea(newArea);
  };

  return {
    todayArea,
    pendingToday,
    completedToday: displayCompletedToday,
    recommended,
    markDelivered,
    undoDelivered,
    endDay,
    loading,
    // נתונים נוספים לסטטיסטיקה
    allCompletedToday: completedToday,
    totalStreetsInArea: areaStreets.length,
    isAllCompleted,
    streetsNeedingDelivery: streetsNeedingDelivery.length,
        allStreets: data,
  };
}