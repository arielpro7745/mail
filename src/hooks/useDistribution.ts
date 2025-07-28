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
      } else {
        console.log(`Found ${snapshot.size} existing streets in Firestore`);
        // Log existing data for debugging
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`Street ${doc.id}:`, {
            name: data.name,
            lastDelivered: data.lastDelivered,
            area: data.area
          });
        });
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      if (error.code === 'permission-denied') {
        console.warn("Firebase permission denied. Using local data. Please check your Firestore Security Rules.");
        setData(initialStreets);
      }
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
      if (error.code === 'permission-denied') {
        console.warn("Firebase permission denied. Using default area. Please check your Firestore Security Rules.");
        setTodayArea(14);
      }
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
        const streetData = doc.data();
        streets.push({ 
          id: doc.id, 
          ...streetData,
          // Ensure all required fields exist
          lastDelivered: streetData.lastDelivered || "",
          deliveryTimes: streetData.deliveryTimes || [],
          averageTime: streetData.averageTime || undefined,
          cycleStartDate: streetData.cycleStartDate || undefined
        } as Street);
      });
      console.log(`Loaded ${streets.length} streets from Firebase:`, streets.map(s => ({ id: s.id, lastDelivered: s.lastDelivered })));
      setData(streets);
    }, (error) => {
      console.error("Error in streets snapshot listener:", error);
      if (error.code === 'permission-denied') {
        console.warn("Firebase permission denied for real-time updates. Using local data.");
        setData(initialStreets);
      }
    });

    return () => unsubscribe();
  }, []);

  const today = new Date();
  const areaStreets = data.filter(s => s.area === todayArea);
  
  // מיון רחובות לפי דחיפות - מהישן לחדש
  const sortStreetsByUrgency = (streets: Street[]) => {
    return [...streets].sort((a, b) => {
      // חישוב ימים מהחלוקה האחרונה
      const aDays = a.lastDelivered ? totalDaysBetween(new Date(a.lastDelivered), today) : 999;
      const bDays = b.lastDelivered ? totalDaysBetween(new Date(b.lastDelivered), today) : 999;
      
      // קטגוריות דחיפות
      const aCritical = aDays >= 14; // קריטי - מעל 14 ימים
      const bCritical = bDays >= 14;
      
      const aUrgent = aDays >= 10 && aDays < 14; // דחוף - 10-13 ימים
      const bUrgent = bDays >= 10 && bDays < 14;
      
      const aNeverDelivered = !a.lastDelivered; // לא חולק מעולם
      const bNeverDelivered = !b.lastDelivered;
      
      // 1. רחובות שלא חולקו מעולם - עדיפות עליונה
      if (aNeverDelivered !== bNeverDelivered) {
        return aNeverDelivered ? -1 : 1;
      }
      
      // 2. רחובות קריטיים (מעל 14 ימים) - עדיפות שנייה
      if (aCritical !== bCritical) {
        return aCritical ? -1 : 1;
      }
      
      // 3. רחובות דחופים (10-13 ימים) - עדיפות שלישית
      if (aUrgent !== bUrgent) {
        return aUrgent ? -1 : 1;
      }
      
      // 4. בתוך אותה קטגוריה - מיין לפי מספר ימים (יותר ימים = עדיפות גבוהה)
      if (aDays !== bDays) {
        return bDays - aDays; // מהגבוה לנמוך - יותר ימים קודם (20, 19, 18, 17...)
      }
      
      // 5. אם אותו מספר ימים, רחובות גדולים קודם
      if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
      
      // 6. לבסוף מיין לפי שם הרחוב
      return a.name.localeCompare(b.name);
    });
  };

  // פונקציה לקבלת רמת דחיפות של רחוב
  const getStreetUrgencyLevel = (street: Street) => {
    if (!street.lastDelivered) return 'never'; // לא חולק מעולם
    
    const days = totalDaysBetween(new Date(street.lastDelivered), today);
    if (days >= 14) return 'critical'; // קריטי
    if (days >= 10) return 'urgent';   // דחוף
    if (days >= 7) return 'warning';   // אזהרה
    return 'normal'; // רגיל
  };

  // פונקציה לקבלת צבע לפי רמת דחיפות
  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'never': return 'bg-purple-50 border-purple-300';
      case 'critical': return 'bg-red-50 border-red-300';
      case 'urgent': return 'bg-orange-50 border-orange-300';
      case 'warning': return 'bg-yellow-50 border-yellow-300';
      default: return 'bg-white border-gray-200';
    }
  };

  // פונקציה לקבלת תווית דחיפות
  const getUrgencyLabel = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'never': return 'לא חולק מעולם';
      case 'critical': return 'קריטי - מעל 14 ימים';
      case 'urgent': return 'דחוף - 10-13 ימים';
      case 'warning': return 'אזהרה - 7-9 ימים';
      default: return 'רגיל';
    }
  };

  // קיבוץ רחובות לפי רמת דחיפות
  const groupStreetsByUrgency = (streets: Street[]) => {
    const groups = {
      never: [] as Street[],
      critical: [] as Street[],
      urgent: [] as Street[],
      warning: [] as Street[],
      normal: [] as Street[]
    };

    streets.forEach(street => {
      const urgencyLevel = getStreetUrgencyLevel(street);
      groups[urgencyLevel as keyof typeof groups].push(street);
    });

    // מיון בתוך כל קבוצה
    Object.keys(groups).forEach(key => {
      groups[key as keyof typeof groups].sort((a, b) => {
        const aDays = a.lastDelivered ? totalDaysBetween(new Date(a.lastDelivered), today) : 999;
        const bDays = b.lastDelivered ? totalDaysBetween(new Date(b.lastDelivered), today) : 999;
        
        // מיון מהמספר ימים הגבוה ביותר לנמוך ביותר (20, 19, 18, 17...)
        if (aDays !== bDays) {
          return bDays - aDays; // יותר ימים קודם
        }
        
        // אם אותו מספר ימים, רחובות גדולים קודם
        if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
        
        // לבסוף מיין לפי שם הרחוב
        return a.name.localeCompare(b.name);
      });
    });

    return groups;
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

  // רחובות מקובצים לפי דחיפות
  const urgencyGroups = groupStreetsByUrgency(streetsNeedingDelivery);
  
  // רחובות ממוינים לפי דחיפות (רשימה שטוחה)
  const sortedStreetsByUrgency = sortStreetsByUrgency(streetsNeedingDelivery);

  // ספירת רחובות לפי דחיפות
  const urgencyCounts = {
    never: urgencyGroups.never.length,
    critical: urgencyGroups.critical.length,
    urgent: urgencyGroups.urgent.length,
    warning: urgencyGroups.warning.length,
    normal: urgencyGroups.normal.length
  };

  // רחובות דחופים (קריטי + דחוף + לא חולק מעולם)
  const urgentStreetsCount = urgencyCounts.never + urgencyCounts.critical + urgencyCounts.urgent;

  // רחובות דחופים (עברו 14 ימים)
  const overdueStreets = streetsNeedingDelivery.filter(s => {
    if (!s.lastDelivered) return true; // לא חולק מעולם
    const days = totalDaysBetween(new Date(s.lastDelivered), today);
    return days >= 14;
  });

  let pendingToday: Street[];
  let displayCompletedToday: Street[];
  let isAllCompleted: boolean;

  // השתמש ברחובות הממוינים
  pendingToday = sortedStreetsByUrgency;
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
        lastDelivered: new Date().toISOString(),
        cycleStartDate: street.cycleStartDate || new Date().toISOString()
      };

      if (deliveryTime) {
        const newTimes = [...(street.deliveryTimes || []), deliveryTime];
        const averageTime = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        
        updates.deliveryTimes = newTimes;
        updates.averageTime = averageTime;
      }

      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
      console.log(`Street ${id} marked as delivered at ${updates.lastDelivered}`);
    } catch (error) {
      console.error("Error marking delivered:", error);
      // If Firebase fails, update local state as fallback
      setData(prevData => 
        prevData.map(s => 
          s.id === id 
            ? { ...s, lastDelivered: new Date().toISOString() }
            : s
        )
      );
    }
  };

  const undoDelivered = async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        lastDelivered: ""
      });
      console.log(`Street ${id} delivery undone`);
    } catch (error) {
      console.error("Error undoing delivery:", error);
      // If Firebase fails, update local state as fallback
      setData(prevData => 
        prevData.map(s => 
          s.id === id 
            ? { ...s, lastDelivered: "" }
            : s
        )
      );
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
    urgencyGroups,
    urgencyCounts,
    getStreetUrgencyLevel,
    getUrgencyColor,
    getUrgencyLabel,
  };
}