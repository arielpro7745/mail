import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, onSnapshot, connectFirestoreEmulator } from "firebase/firestore";
import { db } from "../firebase";
import { streets as initialStreets } from "../data/streets";
import { Street, Area } from "../types";
import { sortByUrgency, pickForToday } from "../utils/schedule";
import { optimizeRoute } from "../utils/routeOptimizer";
import { isSameDay } from "../utils/isSameDay";
import { shouldStreetReappear, totalDaysBetween } from "../utils/dates";
import { useSettings } from "./useSettings";

const COLLECTION_NAME = "streets";

export function useDistribution() {
const FIREBASE_TIMEOUT = 5000; // 5 שניות timeout
  const [data, setData] = useState<Street[]>([]);
  const [todayArea, setTodayArea] = useState<Area>(12);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const { settings } = useSettings();

  console.log("🚀 useDistribution initialized");

  console.log("🚀 useDistribution initialized - Firebase only mode");

  // Initialize Firebase data with timeout
  const initializeFirebaseData = async () => {
    try {
      console.log("🔥 מתחיל אתחול Firebase...");
      setLoading(true);
      setFirebaseError(null);

      // טעינת אזור נוכחי
      const areaSnapshot = await getDocs(collection(db, "settings"));
      const areaDoc = areaSnapshot.docs.find(doc => doc.id === "currentArea");
      if (areaDoc) {
        const area = areaDoc.data().area as Area;
        setTodayArea(area);
        console.log("✅ אזור נוכחי נטען:", area);
      } else {
        // יצירת אזור ברירת מחדל
        await setDoc(doc(db, "settings", "currentArea"), { area: 12 });
        setTodayArea(12);
        console.log("✅ אזור ברירת מחדל נוצר: 12");
      }

      // בדיקה אם יש רחובות ב-Firebase
      const streetsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      if (streetsSnapshot.empty) {
        console.log("📦 אין רחובות ב-Firebase, מאתחל עם נתונים ראשוניים...");
        // אתחול עם נתונים ראשוניים
        const initPromises = initialStreets.map(street => 
          setDoc(doc(db, COLLECTION_NAME, street.id), street)
        );
        await Promise.all(initPromises);
        console.log("✅ רחובות ראשוניים נוצרו ב-Firebase");
        setData(initialStreets);
      } else {
        console.log("📥 טוען רחובות קיימים מ-Firebase...");
        const streets: Street[] = [];
        streetsSnapshot.forEach((doc) => {
          const streetData = doc.data();
          streets.push({ 
            id: doc.id, 
            ...streetData,
            lastDelivered: streetData.lastDelivered || "",
            deliveryTimes: streetData.deliveryTimes || [],
            averageTime: streetData.averageTime || undefined,
            cycleStartDate: streetData.cycleStartDate || undefined
          } as Street);
        });
        setData(streets);
        console.log("✅ רחובות נטענו מ-Firebase:", streets.length);
      }

      setLoading(false);
      console.log("🎉 אתחול Firebase הושלם בהצלחה!");

    } catch (error) {
      console.error("❌ שגיאה באתחול Firebase:", error);
      setFirebaseError(error.message || "שגיאה לא ידועה");
      setLoading(false);
      
      // הצגת הודעת שגיאה למשתמש
      if (error.code === 'permission-denied') {
        setFirebaseError("אין הרשאות ל-Firebase. בדוק את ה-Security Rules!");
      } else if (error.code === 'unavailable') {
        setFirebaseError("Firebase לא זמין כרגע. נסה שוב מאוחר יותר.");
      } else {
        setFirebaseError("שגיאה בחיבור ל-Firebase. בדוק את החיבור לאינטרנט.");
      }
    }
  };

  // Real-time listener for Firebase
  const setupFirebaseListener = () => {
    try {
      console.log("👂 מגדיר מאזין Firebase לעדכונים בזמן אמת...");
      
      const unsubscribe = onSnapshot(
        collection(db, COLLECTION_NAME), 
        (snapshot) => {
          console.log("📡 קיבלתי עדכון מ-Firebase:", snapshot.size, "רחובות");
          const streets: Street[] = [];
          snapshot.forEach((doc) => {
            const streetData = doc.data();
            streets.push({ 
              id: doc.id, 
              ...streetData,
              lastDelivered: streetData.lastDelivered || "",
              deliveryTimes: streetData.deliveryTimes || [],
              averageTime: streetData.averageTime || undefined,
              cycleStartDate: streetData.cycleStartDate || undefined
            } as Street);
          });
          
          setData(streets);
          console.log("✅ נתונים עודכנו מ-Firebase בזמן אמת");
        }, 
        (error) => {
          console.error("❌ שגיאה במאזין Firebase:", error);
          setFirebaseError("שגיאה בסנכרון בזמן אמת");
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error("❌ שגיאה בהגדרת מאזין Firebase:", error);
      return null;
    }
  };

  // Initialize on mount
  useEffect(() => {
    console.log("🎬 מתחיל אתחול useDistribution...");
    
    let unsubscribe: (() => void) | null = null;
    
    const initialize = async () => {
      // אתחול נתונים
      await initializeFirebaseData();
      
      // הגדרת מאזין לעדכונים בזמן אמת
      unsubscribe = setupFirebaseListener();
    };

    initialize();

    // Cleanup
    return () => {
      if (unsubscribe) {
        console.log("🧹 מנקה מאזין Firebase");
        unsubscribe();
      }
    };
  }, []);

  const today = new Date();
  const areaStreets = data.filter(s => s.area === todayArea);
  
  // מיון רחובות לפי דחיפות - מהישן לחדש
  const sortStreetsByUrgency = (streets: Street[]) => {
    console.log("🔍 מתחיל מיון רחובות:");
    streets.forEach(street => {
      const days = street.lastDelivered 
        ? totalDaysBetween(new Date(street.lastDelivered), today)
        : 999;
      console.log(`📍 ${street.name}: ${street.lastDelivered ? `${days} ימים (${street.lastDelivered})` : 'לא חולק מעולם'}`);
    });

    return [...streets].sort((a, b) => {
      // רחובות שלא חולקו מעולם - ראשונים
      if (!a.lastDelivered && !b.lastDelivered) {
        console.log(`🔄 שניהם לא חולקו: ${a.name} vs ${b.name} -> מיון לפי שם`);
        return a.name.localeCompare(b.name);
      }
      if (!a.lastDelivered) {
        console.log(`🔄 ${a.name} לא חולק מעולם, ${b.name} חולק -> ${a.name} ראשון`);
        return -1;
      }
      if (!b.lastDelivered) {
        console.log(`🔄 ${b.name} לא חולק מעולם, ${a.name} חולק -> ${b.name} ראשון`);
        return 1;
      }
      
      // מיון לפי מספר ימים - הכי הרבה ימים ראשון
      const aDays = totalDaysBetween(new Date(a.lastDelivered), today);
      const bDays = totalDaysBetween(new Date(b.lastDelivered), today);
      
      console.log(`🔄 ${a.name} (${aDays} ימים) vs ${b.name} (${bDays} ימים)`);
      
      if (aDays !== bDays) {
        const result = bDays - aDays;
        console.log(`📅 ימים שונים: ${result > 0 ? a.name : b.name} ראשון (${result > 0 ? aDays : bDays} ימים)`);
        return bDays - aDays;
      }
      
      // אם אותו תאריך, רחובות גדולים קודם
      if (a.isBig !== b.isBig) {
        console.log(`🏢 אותו מספר ימים, רחוב גדול: ${a.isBig ? a.name : b.name} ראשון`);
        return a.isBig ? -1 : 1;
      }
      
      // לבסוף מיין לפי שם הרחוב
      console.log(`📝 אותו מספר ימים ואותו סוג, מיון לפי שם: ${a.name.localeCompare(b.name) < 0 ? a.name : b.name} ראשון`);
      return a.name.localeCompare(b.name);
    });
  };

  // פונקציה לקבלת רמת דחיפות של רחוב
  const getStreetUrgencyLevel = (street: Street) => {
    if (!street.lastDelivered) return 'never';
    
    const days = totalDaysBetween(new Date(street.lastDelivered), today);
    if (days >= 14) return 'critical';
    if (days >= 10) return 'urgent';
    if (days >= 7) return 'warning';
    return 'normal';
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
        if (!a.lastDelivered && !b.lastDelivered) {
          return a.name.localeCompare(b.name);
        }
        if (!a.lastDelivered) return -1;
        if (!b.lastDelivered) return 1;
        
        const aDays = totalDaysBetween(new Date(a.lastDelivered), today);
        const bDays = totalDaysBetween(new Date(b.lastDelivered), today);
        
        if (aDays !== bDays) {
          return bDays - aDays;
        }
        
        if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
        
        return a.name.localeCompare(b.name);
      });
    });

    return groups;
  };

  // רחובות שחולקו היום
  // פונקציה לטעינה מהירה מ-localStorage
  const loadLocalDataImmediately = () => {
    console.log("⚡ טוען נתונים מקומיים מיד...");
    const localStreets = loadStreetsFromLocalStorage();
    const localArea = loadCurrentAreaFromLocalStorage();
        </div>
  const completedToday = areaStreets.filter(
    s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)
  );
  
  // רחובות שצריכים חלוקה
  const streetsNeedingDelivery = areaStreets.filter(s => {
    if (s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)) {
      return false;
    }
    return true;
  });

  // רחובות מקובצים לפי דחיפות
  const urgencyGroups = groupStreetsByUrgency(streetsNeedingDelivery);
  
  // רחובות ממוינים לפי דחיפות
  const sortedStreetsByUrgency = streetsNeedingDelivery.sort((a, b) => {
    if (!a.lastDelivered && !b.lastDelivered) {
      return a.name.localeCompare(b.name);
    }
    if (!a.lastDelivered) return -1;
    if (!b.lastDelivered) return 1;
    
    const aDays = totalDaysBetween(new Date(a.lastDelivered), today);
    const bDays = totalDaysBetween(new Date(b.lastDelivered), today);
    
    if (aDays !== bDays) {
      return bDays - aDays;
    }
    
    if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
    
    return a.name.localeCompare(b.name);
  });

  // ספירת רחובות לפי דחיפות
  const urgencyCounts = {
    never: urgencyGroups.never.length,
    critical: urgencyGroups.critical.length,
    urgent: urgencyGroups.urgent.length,
    warning: urgencyGroups.warning.length,
    normal: urgencyGroups.normal.length
  };

  // רחובות דחופים
  const overdueStreets = streetsNeedingDelivery.filter(s => {
    if (!s.lastDelivered) return true;
    const days = totalDaysBetween(new Date(s.lastDelivered), today);
    return days >= 14;
  });

  let pendingToday: Street[];
  let displayCompletedToday: Street[];
  let isAllCompleted: boolean;

  pendingToday = sortedStreetsByUrgency;
  displayCompletedToday = completedToday;
  isAllCompleted = streetsNeedingDelivery.length === 0;

  // Apply route optimization if enabled
  if (settings.optimizeRoutes && pendingToday.length > 0) {
    pendingToday = optimizeRoute(pendingToday, todayArea);
    console.log("🛣️ אופטימיזציה הופעלה");
  }

  const recommended = pickForToday(pendingToday);

  const markDelivered = async (id: string, deliveryTime?: number) => {
    try {
      console.log("✅ מסמן רחוב כחולק:", id);
      const street = data.find(s => s.id === id);
      if (!street) {
        console.error("❌ רחוב לא נמצא:", id);
        return;
      }

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
      console.log("🔥 רחוב עודכן ב-Firebase בהצלחה - יסונכרן לכל המכשירים");
    } catch (error) {
      console.error("❌ שגיאה בעדכון רחוב:", error);
      setFirebaseError("שגיאה בעדכון הרחוב");
    }
  };

  const undoDelivered = async (id: string) => {
    try {
      console.log("↩️ מבטל חלוקת רחוב:", id);
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        lastDelivered: ""
      });
      console.log("🔥 ביטול חלוקה עודכן ב-Firebase - יסונכרן לכל המכשירים");
    } catch (error) {
      console.error("❌ שגיאה בביטול חלוקה:", error);
      setFirebaseError("שגיאה בביטול החלוקה");
    }
  };

  const endDay = async () => {
    const newArea: Area = todayArea === 12 ? 14 : todayArea === 14 ? 45 : 12;
    
    try {
      console.log("🔄 מעבר לאזור:", newArea);
      await setDoc(doc(db, "settings", "currentArea"), { area: newArea });
      setTodayArea(newArea);
      console.log("✅ מעבר לאזור הושלם - מסונכרן לכל המכשירים");
    } catch (error) {
      console.error("❌ שגיאה במעבר אזור:", error);
      setFirebaseError("שגיאה במעבר לאזור הבא");
    }
  };

  const resetCycle = async () => {
    const currentAreaStreets = data.filter(s => s.area === todayArea);
    
    try {
      console.log("🔄 מאפס מחזור חלוקה לאזור:", todayArea);
      const resetPromises = currentAreaStreets.map(street => {
        const updates: Partial<Street> = {
          cycleStartDate: new Date().toISOString(),
          deliveryTimes: street.deliveryTimes || [],
          averageTime: street.averageTime || undefined
        };
        return updateDoc(doc(db, COLLECTION_NAME, street.id), updates);
      });
      await Promise.all(resetPromises);
      console.log(`✅ מחזור חלוקה באזור ${todayArea} אופס בהצלחה`);
    } catch (error) {
      console.error("❌ שגיאה באיפוס מחזור:", error);
      setFirebaseError("שגיאה באיפוס המחזור");
    }
  };

  // אם יש שגיאת Firebase, הצג אותה
  if (firebaseError) {
    return {
      todayArea,
      pendingToday: [],
      completedToday: [],
      recommended: [],
      markDelivered: async () => {},
      undoDelivered: async () => {},
      endDay: async () => {},
      loading: false,
      resetCycle: async () => {},
      allCompletedToday: [],
      totalStreetsInArea: 0,
      isAllCompleted: true,
      streetsNeedingDelivery: 0,
      overdueStreets: 0,
      allStreets: [],
      urgencyGroups: { never: [], critical: [], urgent: [], warning: [], normal: [] },
      urgencyCounts: { never: 0, critical: 0, urgent: 0, warning: 0, normal: 0 },
      getStreetUrgencyLevel,
      getUrgencyColor,
      getUrgencyLabel,
      firebaseError // הוספת שגיאה למידע שמוחזר
    };
  }

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