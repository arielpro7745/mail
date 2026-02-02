import { useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import { streets as initialStreets } from "../data/streets"; // וודא שקובץ זה מכיל את הרשימה המעודכנת
import { Street, Area } from "../types";
import { pickForToday } from "../utils/schedule";
import { optimizeRoute } from "../utils/routeOptimizer";
import { isSameDay } from "../utils/isSameDay";
import { totalDaysBetween } from "../utils/dates";
import { useSettings } from "./useSettings";
import { getNextArea } from "../utils/areaColors";

const STREETS_COLLECTION = "streets";
const SETTINGS_COLLECTION = "settings";
const GENERAL_SETTINGS_DOC = "general";

export function useDistribution() {
  const [data, setData] = useState<Street[]>([]);
  const [todayArea, setTodayArea] = useState<Area>(12); // ברירת מחדל בטוחה עד שה-Firebase נטען
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  // === 1. טעינת והאזנה לרחובות מ-Firebase ===
  useEffect(() => {
    // מאזין לשינויים ברחובות בזמן אמת
    const unsubscribeStreets = onSnapshot(collection(db, STREETS_COLLECTION), async (snapshot) => {
      if (snapshot.empty) {
        console.log("⚠️ מסד הנתונים ריק, מאתחל נתונים ראשוניים...");
        await initializeStreets();
        return;
      }

      const firebaseStreets: Street[] = [];
      snapshot.forEach((doc) => {
        const streetData = doc.data();
        firebaseStreets.push({ 
          id: doc.id, 
          ...streetData,
          // מוודא ששדות קריטיים קיימים
          lastDelivered: streetData.lastDelivered || "",
          deliveryTimes: streetData.deliveryTimes || [],
        } as Street);
      });

      // בדיקה אם חסרים רחובות (למשל אם הוספת את אזור 7 בקוד אבל הוא לא ב-DB)
      await checkForMissingStreets(firebaseStreets);

      setData(firebaseStreets);
      setLoading(false);
    }, (error) => {
      console.error("❌ שגיאה בטעינת רחובות מ-Firebase:", error);
      setLoading(false);
    });

    // מאזין לשינויים באזור הנוכחי (Current Area)
    const unsubscribeArea = onSnapshot(doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC), (docSnap) => {
      if (docSnap.exists()) {
        const savedArea = docSnap.data().currentArea;
        
        // --- תיקון אוטומטי למסך לבן ---
        // אם בבסיס הנתונים שמור 45, נשנה אותו מיד ל-7
        if (savedArea === 45) {
          console.log("התגלה אזור מיושן (45), מתקן ל-7...");
          updateAreaInFirebase(7);
          setTodayArea(7);
        } else {
          setTodayArea(savedArea);
        }
      } else {
        // אם אין הגדרה, ניצור אחת עם ברירת מחדל (12)
        updateAreaInFirebase(12);
        setTodayArea(12);
      }
    });

    return () => {
      unsubscribeStreets();
      unsubscribeArea();
    };
  }, []);

  // === פונקציות עזר ל-Firebase ===

  // אתחול ראשוני של רחובות
  const initializeStreets = async () => {
    const batch = initialStreets.map(street => 
      setDoc(doc(db, STREETS_COLLECTION, street.id), street)
    );
    await Promise.all(batch);
    console.log("✅ כל הרחובות הועלו ל-Firebase בהצלחה");
  };

  // הוספת רחובות חדשים שנוספו לקוד אך חסרים ב-DB
  const checkForMissingStreets = async (currentStreets: Street[]) => {
    const existingIds = new Set(currentStreets.map(s => s.id));
    const missing = initialStreets.filter(s => !existingIds.has(s.id));

    if (missing.length > 0) {
      console.log(`📥 מוסיף ${missing.length} רחובות חדשים ל-Firebase...`);
      const updates = missing.map(street => 
        setDoc(doc(db, STREETS_COLLECTION, street.id), street)
      );
      await Promise.all(updates);
    }
  };

  // עדכון האזור ב-Firebase
  const updateAreaInFirebase = async (newArea: number) => {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC), { 
        currentArea: newArea,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log("🌎 אזור עודכן ב-Firebase:", newArea);
    } catch (e) {
      console.error("שגיאה בעדכון אזור:", e);
    }
  };

  // === לוגיקה עסקית (חישובים, מיון וסינון) ===

  const today = new Date();
  const areaStreets = data.filter(s => s.area === todayArea);
  
  // רחובות שחולקו היום
  const completedToday = areaStreets.filter(
    s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)
  );
  
  // רחובות שצריכים חלוקה
  const streetsNeedingDelivery = areaStreets.filter(s => {
    if (s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)) return false;
    return true;
  });

  // מיון חכם לפי דחיפות
  const sortedStreets = [...streetsNeedingDelivery].sort((a, b) => {
    // 1. רחובות שלא חולקו מעולם - ראשונים
    if (!a.lastDelivered && !b.lastDelivered) return a.name.localeCompare(b.name);
    if (!a.lastDelivered) return -1;
    if (!b.lastDelivered) return 1;
    
    // 2. מיון לפי זמן (הכי ישן קודם)
    const aTime = new Date(a.lastDelivered).getTime();
    const bTime = new Date(b.lastDelivered).getTime();
    if (aTime !== bTime) return aTime - bTime; // ישן יותר = מספר קטן יותר = ראשון
    
    // 3. שם רחוב
    return a.name.localeCompare(b.name);
  });

  let pendingToday = sortedStreets;

  // אופטימיזציה של המסלול (אם מופעל בהגדרות)
  if (settings.optimizeRoutes && pendingToday.length > 0) {
    pendingToday = optimizeRoute(pendingToday, todayArea);
  }

  const recommended = pickForToday(pendingToday);

  // === פעולות משתמש (Actions) ===

  const markDelivered = async (id: string, deliveryTime?: number) => {
    const streetRef = doc(db, STREETS_COLLECTION, id);
    const updates: any = {
      lastDelivered: new Date().toISOString(),
    };

    // אם נשלח זמן ביצוע, נעדכן ממוצעים
    if (deliveryTime) {
      // אנחנו צריכים את המידע הנוכחי כדי לעדכן את המערך, אז נשתמש ב-data המקומי
      const currentStreet = data.find(s => s.id === id);
      if (currentStreet) {
        const newTimes = [...(currentStreet.deliveryTimes || []), deliveryTime];
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length);
        updates.deliveryTimes = newTimes;
        updates.averageTime = avg;
      }
    }

    try {
      await updateDoc(streetRef, updates);
    } catch (error) {
      console.error("שגיאה בסימון חלוקה:", error);
    }
  };

  const undoDelivered = async (id: string) => {
    try {
      await updateDoc(doc(db, STREETS_COLLECTION, id), {
        lastDelivered: "" // איפוס תאריך אחרון
      });
    } catch (error) {
      console.error("שגיאה בביטול חלוקה:", error);
    }
  };

  const endDay = async () => {
    const nextArea = getNextArea(todayArea);
    await updateAreaInFirebase(nextArea);
  };

  // פונקציה לאיפוס מלא של האזור (שימוש ידני דרך ההגדרות אם צריך)
  const resetCycle = async () => {
     console.log("פונקציית איפוס לא מופעלת כרגע כדי למנוע מחיקת מידע בטעות");
  };

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
    // הוספתי את הפונקציה הזו כדי שתוכל להשתמש בה בכפתורים הידניים שיצרנו קודם
    setManualArea: updateAreaInFirebase 
  };
}