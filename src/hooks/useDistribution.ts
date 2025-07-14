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
      // חישוב ימים מהחלוקה האחרונה - רחובות שלא חולקו מעולם מקבלים 999 ימים
      const aDays = a.lastDelivered ? totalDaysBetween(new Date(a.lastDelivered), today) : 999;
      const bDays = b.lastDelivered ? totalDaysBetween(new Date(b.lastDelivered), today) : 999;
      
      // קטגוריות דחיפות:
      // 1. לא חולק מעולם (999 ימים) - דחיפות קריטית
      // 2. מעל 20 ימים - דחיפות קריטית
      // 3. 14-19 ימים - דחיפות גבוהה
      // 4. 10-13 ימים - דחיפות בינונית
      // 5. פחות מ-10 ימים - דחיפות נמוכה
      
      const getUrgencyScore = (days: number, isBig: boolean) => {
        let score = 0;
        
        // ציון בסיסי לפי ימים
        if (days >= 999) score = 1000; // לא חולק מעולם
        else if (days >= 20) score = 900; // מעל 20 ימים - קריטי
        else if (days >= 14) score = 800; // 14-19 ימים - דחוף
        else if (days >= 10) score = 600; // 10-13 ימים - בינוני
        else if (days >= 7) score = 400; // 7-9 ימים - נמוך
        else score = 200; // פחות מ-7 ימים - רגיל
        
        // בונוס לרחובות גדולים (יותר חשובים)
        if (isBig) score += 50;
        
        // בונוס נוסף לפי מספר הימים (יותר ימים = יותר דחוף)
        score += Math.min(days, 30); // מקסימום 30 נקודות בונוס
        
        return score;
      };
      
      const aScore = getUrgencyScore(aDays, a.isBig);
      const bScore = getUrgencyScore(bDays, b.isBig);
      
      // מיון לפי ציון דחיפות (גבוה יותר = דחוף יותר)
      if (aScore !== bScore) {
        return bScore - aScore; // ציון גבוה יותר קודם
      }
      
      // אם אותו ציון, מיין לפי מספר ימים (יותר ימים קודם)
      if (aDays !== bDays) return bDays - aDays;
      
      // אם אותו מספר ימים, רחובות גדולים קודם
      if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
      
      // לבסוף, מיון אלפביתי
      return a.name.localeCompare(b.name);
    });
  };

  // פונקציה לקבלת תווית דחיפות
  const getUrgencyLabel = (days: number) => {
    if (days >= 999) return { label: "לא חולק מעולם", color: "bg-red-600 text-white", priority: "critical" };
    if (days >= 20) return { label: "קריטי", color: "bg-red-500 text-white", priority: "critical" };
    if (days >= 14) return { label: "דחוף", color: "bg-orange-500 text-white", priority: "urgent" };
    if (days >= 10) return { label: "בינוני", color: "bg-yellow-500 text-white", priority: "medium" };
    if (days >= 7) return { label: "נמוך", color: "bg-blue-500 text-white", priority: "low" };
    return { label: "רגיל", color: "bg-green-500 text-white", priority: "normal" };
  };

  // קיבוץ רחובות לפי רמת דחיפות לתצוגה
  const groupStreetsByUrgency = (streets: Street[]) => {
    const groups = {
      critical: [] as Street[],
      urgent: [] as Street[],
      medium: [] as Street[],
      low: [] as Street[],
      normal: [] as Street[]
    };

    streets.forEach(street => {
      const days = street.lastDelivered ? totalDaysBetween(new Date(street.lastDelivered), today) : 999;
      const urgency = getUrgencyLabel(days);
      
      if (urgency.priority === "critical") groups.critical.push(street);
      else if (urgency.priority === "urgent") groups.urgent.push(street);
      else if (urgency.priority === "medium") groups.medium.push(street);
      else if (urgency.priority === "low") groups.low.push(street);
      else groups.normal.push(street);
    });

    return groups;
  };

  // מיון רחובות לפי דחיפות עם קיבוץ
  const sortedStreetsWithGroups = (streets: Street[]) => {
    const sorted = sortStreetsByUrgency(streets);
    const groups = groupStreetsByUrgency(sorted);
    
    // החזרת רשימה מסודרת: קריטי -> דחוף -> בינוני -> נמוך -> רגיל
    return [
      ...groups.critical,
      ...groups.urgent,
      ...groups.medium,
      ...groups.low,
      ...groups.normal
    ];
  };

  // רחובות שצריכים חלוקה (לא חולקו היום) - ממוינים לפי דחיפות
  const streetsNeedingDelivery = areaStreets.filter(s => {
    // אם חולק היום, לא צריך להופיע
    if (s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)) {
      return false;
    }
    
    // כל רחוב שלא חולק היום צריך להופיע ברשימה
    return true;
  });

  // רחובות דחופים (עברו 14 ימים או לא חולקו מעולם)
  const overdueStreets = streetsNeedingDelivery.filter(s => {
    if (!s.lastDelivered) return true; // לא חולק מעולם
    const days = totalDaysBetween(new Date(s.lastDelivered), today);
    return days >= 14;
  });

  let pendingToday: Street[];
  let displayCompletedToday: Street[];
  let isAllCompleted: boolean;

  // תמיד הצג רחובות שלא חולקו היום, ממוינים לפי דחיפות מתקדמת
  pendingToday = sortedStreetsWithGroups(streetsNeedingDelivery);
  displayCompletedToday = completedToday;
  isAllCompleted = streetsNeedingDelivery.length === 0;
      return 0;
    });
  };

  // רחובות שחולקו היום
  const completedToday = areaStreets.filter(
    s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)
  );
  
  // רחובות שצריכים חלוקה (לא חולקו היום)
  const streetsNeedingDelivery = areaStreets.filter(s => {
    // אם חולק היום, לא צריך להופיע
    if (s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)) {
      return false;
    }
    
    // כל רחוב שלא חולק היום צריך להופיע ברשימה
    return true;
  });

  // רחובות דחופים (עברו 14 ימים)
  const overdueStreets = streetsNeedingDelivery.filter(s => {
    if (!s.lastDelivered) return true; // לא חולק מעולם
    const days = totalDaysBetween(new Date(s.lastDelivered), today);
    return days >= 14;
  });

  let pendingToday: Street[];
  let displayCompletedToday: Street[];
  let isAllCompleted: boolean;

  // תמיד הצג רחובות שלא חולקו היום, ממוינים לפי דחיפות
  pendingToday = sortStreetsByUrgency(streetsNeedingDelivery);
  displayCompletedToday = completedToday;
  isAllCompleted = streetsNeedingDelivery.length === 0;

  // Apply route optimization if enabled
  if (settings.optimizeRoutes && pendingToday.length > 0) {
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
          // לא מאפסים את lastDelivered - שומרים את התאריך האחרון
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
    isAllCompleted: isAllCompleted,
    streetsNeedingDelivery: streetsNeedingDelivery.length,
    overdueStreets: overdueStreets.length,
    allStreets: data,
    getUrgencyLabel,
    groupStreetsByUrgency: () => groupStreetsByUrgency(pendingToday),
  };
}