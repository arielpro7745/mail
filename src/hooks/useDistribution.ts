import { useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";
import { streets as initialStreets } from "../data/streets"; // וודא שהקובץ הזה מעודכן!
import { Street, Area } from "../types";
import { pickForToday } from "../utils/schedule";
import { optimizeRoute } from "../utils/routeOptimizer";
import { isSameDay } from "../utils/isSameDay";
import { getNextArea } from "../utils/areaColors";
import { useSettings } from "./useSettings";

const STREETS_COLLECTION = "streets";
const SETTINGS_COLLECTION = "settings";
const GENERAL_SETTINGS_DOC = "general";

export function useDistribution() {
  // תיקון: מתחילים עם הנתונים המקומיים כדי שהדף לא יהיה ריק בזמן הטעינה
  const [data, setData] = useState<Street[]>(initialStreets);
  const [todayArea, setTodayArea] = useState<Area>(12); // ברירת מחדל התחלתית
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    // 1. האזנה לנתוני הרחובות מ-Firebase
    const unsubscribeStreets = onSnapshot(collection(db, STREETS_COLLECTION), async (snapshot) => {
      if (snapshot.empty) {
        // אם בסיס הנתונים ריק (פעם ראשונה), נעלה את הנתונים המקומיים
        console.log("⚠️ בסיס הנתונים ריק, מעלה נתונים ראשוניים...");
        const batchPromises = initialStreets.map(street => 
          setDoc(doc(db, STREETS_COLLECTION, street.id), street)
        );
        await Promise.all(batchPromises);
        return; // ה-Snapshot יתעדכן שוב מיד אחרי השמירה
      }

      const firebaseStreets: Street[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        firebaseStreets.push({ 
          id: doc.id, 
          ...d,
          lastDelivered: d.lastDelivered || "", // מונע קריסה אם שדה חסר
          deliveryTimes: d.deliveryTimes || [] 
        } as Street);
      });

      setData(firebaseStreets);
      setLoading(false);
    }, (error) => {
      console.error("❌ שגיאה בטעינת נתונים:", error);
      // במקרה של שגיאה, אנחנו נשארים עם initialStreets שהגדרנו בהתחלה
      setLoading(false);
    });

    // 2. האזנה לאזור הנוכחי (כדי לסנכרן בין מכשירים)
    const unsubscribeArea = onSnapshot(doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC), (docSnap) => {
      if (docSnap.exists()) {
        const serverArea = docSnap.data().currentArea;
        // תיקון אוטומטי לאזור 45 אם הוא עדיין קיים בשרת
        if (serverArea === 45) {
            updateAreaInFirebase(7);
            setTodayArea(7);
        } else {
            setTodayArea(serverArea);
        }
      } else {
        // אם אין הגדרה, צור ברירת מחדל
        updateAreaInFirebase(12);
      }
    });

    return () => {
      unsubscribeStreets();
      unsubscribeArea();
    };
  }, []);

  // עדכון אזור בשרת
  const updateAreaInFirebase = async (newArea: number) => {
    try {
        await setDoc(doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC), { 
            currentArea: newArea 
        }, { merge: true });
    } catch (e) {
        console.error("שגיאה בעדכון אזור:", e);
    }
  };

  // --- לוגיקה וחישובים ---

  const today = new Date();
  const areaStreets = data.filter(s => s.area === todayArea);
  
  // רחובות שהושלמו היום
  const completedToday = areaStreets.filter(
    s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)
  );
  
  // רחובות שנותרו
  const streetsNeedingDelivery = areaStreets.filter(s => {
    if (s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)) return false;
    return true;
  });

  // מיון
  let pendingToday = [...streetsNeedingDelivery].sort((a, b) => a.name.localeCompare(b.name));

  if (settings.optimizeRoutes && pendingToday.length > 0) {
    pendingToday = optimizeRoute(pendingToday, todayArea);
  }

  const recommended = pickForToday(pendingToday);

  // --- פעולות (Actions) ---

  const markDelivered = async (id: string, deliveryTime?: number) => {
    // עדכון אופטימי (מיידי) בממשק לפני השרת
    const updatedData = data.map(s => s.id === id ? { ...s, lastDelivered: new Date().toISOString() } : s);
    setData(updatedData);

    try {
        const updates: any = { lastDelivered: new Date().toISOString() };
        if (deliveryTime) {
            const street = data.find(s => s.id === id);
            if (street) {
                const newTimes = [...(street.deliveryTimes || []), deliveryTime];
                updates.deliveryTimes = newTimes;
            }
        }
        await updateDoc(doc(db, STREETS_COLLECTION, id), updates);
    } catch (e) {
        console.error("שגיאה בשמירה:", e);
    }
  };

  const undoDelivered = async (id: string) => {
    const updatedData = data.map(s => s.id === id ? { ...s, lastDelivered: "" } : s);
    setData(updatedData);
    await updateDoc(doc(db, STREETS_COLLECTION, id), { lastDelivered: "" });
  };

  const endDay = async () => {
    const next = getNextArea(todayArea);
    setTodayArea(next); // עדכון מיידי
    await updateAreaInFirebase(next);
  };

  // פונקציית דמה לאיפוס (לא בשימוש כרגע)
  const resetCycle = async () => {};

  return {
    todayArea,
    pendingToday,
    completedToday,
    recommended,
    markDelivered,
    undoDelivered,
    endDay,
    loading,
    resetCycle,
    allCompletedToday: completedToday,
    streetsNeedingDelivery: streetsNeedingDelivery.length,
    allStreets: data,
    setManualArea: updateAreaInFirebase // לשימוש בכפתורים הידניים
  };
}