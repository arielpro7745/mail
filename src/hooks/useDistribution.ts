import { useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";
import { Street, Area } from "../types";
import { isSameDay } from "../utils/isSameDay";
import { optimizeRoute } from "../utils/routeOptimizer";
import { pickForToday } from "../utils/schedule";
import { useSettings } from "./useSettings";

const STREETS_COLLECTION = "streets";
const SETTINGS_COLLECTION = "settings";
const GENERAL_SETTINGS_DOC = "general";
const AREA_SPLIT_HISTORY_COLLECTION = "areaSplitHistory";
const AREA_SPLIT_HISTORY_DOC = "latest";

// === רשימת חירום: רחובות שחייבים להיות ב-DB ===
const EMERGENCY_STREETS: Street[] = [
  { id: "borla_7", name: "בורלא", area: 7 },
  { id: "marcus_7", name: "משה מרקוס", area: 7 },
  { id: "brod_7", name: "מקס ברוד", area: 7 },
  { id: "broida_7", name: "ברוידה", area: 7 },
  { id: "joseph_haim_7", name: "חכם יוסף חיים", area: 7 },
  { id: "rozov_7", name: "האחים רוזוב", area: 7 },
  { id: "oli_bavel_7", name: "עולי בבל", area: 7 },
  { id: "orlov_7", name: "אורלוב", area: 7 },
  { id: "liberman_7", name: "ליברמן", area: 7 },
  { id: "streit_7", name: "האחים שטרייט", area: 7 },
  { id: "tel_hai_7", name: "תל חי", area: 7 },
  { id: "pinsker_7", name: "פינסקר", area: 7 },
  { id: "barcus_7", name: "משה ברקוס", area: 7 }
];

export function useDistribution() {
  const [data, setData] = useState<Street[]>([]);
  // ברירת מחדל בטוחה (7) למניעת קריסה בטעינה
  const [todayArea, setTodayArea] = useState<Area>(7); 
  const [loading, setLoading] = useState(true);
  const [lastAreaSplitAt, setLastAreaSplitAt] = useState<string | null>(null);
  const { settings } = useSettings();

  const updateAreaInFirebase = async (newArea: number) => {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC), { 
        currentArea: newArea,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      // עדכון מקומי מיידי
      setTodayArea(newArea as Area);
    } catch (e) { console.error("Error updating area:", e); }
  };

  useEffect(() => {
    // 1. טעינת רחובות + תיקון נתונים חסרים
    const unsubscribeStreets = onSnapshot(collection(db, STREETS_COLLECTION), async (snapshot) => {
      const firebaseStreets: Street[] = [];
      const existingIds = new Set<string>();

      snapshot.forEach((doc) => {
        const d = doc.data();
        existingIds.add(doc.id);
        firebaseStreets.push({ 
            id: doc.id, 
            name: d.name || "ללא שם",
            area: d.area || 7,
            ...d 
        } as Street);
      });

      // בדיקה אם חסרים רחובות קריטיים
      const missing = EMERGENCY_STREETS.filter(s => !existingIds.has(s.id));
      if (missing.length > 0) {
        console.log(`🛠️ מתקן ${missing.length} רחובות חסרים...`);
        missing.forEach(s => {
            setDoc(doc(db, STREETS_COLLECTION, s.id), { ...s, lastDelivered: "", deliveryTimes: [] }).catch(console.error);
            firebaseStreets.push(s); // הוספה זמנית לתצוגה
        });
      }

      setData(firebaseStreets);
      setLoading(false);
    }, (err) => {
      console.error("Firebase Error:", err);
      setLoading(false);
    });

    // 2. טעינת אזור + תיקון באג 45
    const unsubscribeArea = onSnapshot(doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC), (docSnap) => {
      if (docSnap.exists()) {
        const saved = docSnap.data().currentArea;
        if (saved === 45) {
          console.log("Detecting old area 45, fixing to 7...");
          updateAreaInFirebase(7);
        } else {
          setTodayArea(saved);
        }
      } else {
        updateAreaInFirebase(7);
      }
    });

    const unsubscribeSplitHistory = onSnapshot(doc(db, AREA_SPLIT_HISTORY_COLLECTION, AREA_SPLIT_HISTORY_DOC), (docSnap) => {
      if (docSnap.exists()) {
        setLastAreaSplitAt(docSnap.data().lastSplitAt || null);
      } else {
        setLastAreaSplitAt(null);
      }
    });

    return () => {
      unsubscribeStreets();
      unsubscribeArea();
      unsubscribeSplitHistory();
    };
  }, []);

  // לוגיקה
  const today = new Date();
  const filterArea = todayArea === 45 ? 7 : todayArea;
  const areaStreets = data.filter(s => s.area === filterArea);

  const completedToday = areaStreets.filter(s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today));
  const streetsNeedingDelivery = areaStreets.filter(s => !(s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)));

  let pendingToday = streetsNeedingDelivery.sort((a, b) => a.name.localeCompare(b.name));

  if (settings?.optimizeRoutes && pendingToday.length > 0) {
    try { pendingToday = optimizeRoute(pendingToday, filterArea); } catch(e){}
  }

  const recommended = pickForToday(pendingToday);

  // Actions
  const markDelivered = async (id: string, deliveryTime?: number) => {
    try {
        const updates: any = { lastDelivered: new Date().toISOString() };
        if (deliveryTime) {
            const current = data.find(s => s.id === id);
            if (current) {
                const times = [...(current.deliveryTimes || []), deliveryTime];
                updates.deliveryTimes = times;
                updates.averageTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            }
        }
        await updateDoc(doc(db, STREETS_COLLECTION, id), updates);
    } catch (e) { console.error(e); }
  };

  const undoDelivered = async (id: string) => {
    try { await updateDoc(doc(db, STREETS_COLLECTION, id), { lastDelivered: "" }); } catch(e){}
  };

  const endDay = async () => {
    const nextMap: Record<number, number> = { 14: 12, 12: 7, 7: 14 };
    const next = nextMap[todayArea] || 7;
    const now = new Date().toISOString();

    try {
      await setDoc(doc(db, AREA_SPLIT_HISTORY_COLLECTION, AREA_SPLIT_HISTORY_DOC), {
        lastSplitAt: now,
        previousArea: todayArea,
        nextArea: next
      }, { merge: true });
    } catch (e) {
      console.error("Error recording split history:", e);
    }

    await updateAreaInFirebase(next);
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
    lastAreaSplitAt,
    allCompletedToday: completedToday,
    setManualArea: updateAreaInFirebase, // חובה לכפתורים
    allStreets: data
  };
}
