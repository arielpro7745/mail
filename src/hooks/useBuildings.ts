import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Building, Resident } from "../types";
import { buildings as initialBuildings } from "../data/buildings";

const COLLECTION_NAME = "buildings";
const LOCAL_STORAGE_KEY = "buildings_data_v2"; // שינוי מפתח לגרסה חדשה

export function useBuildings() {
  const [data, setData] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  // שמירה ב-localStorage
  const saveToLocalStorage = (buildings: Building[]) => {
    try {
      const dataToSave = {
        buildings,
        timestamp: Date.now(),
        version: "2.0"
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("✅ נתונים נשמרו ב-localStorage:", buildings.length, "בניינים");
    } catch (error) {
      console.error("❌ שגיאה בשמירה ב-localStorage:", error);
    }
  };

  // טעינה מ-localStorage
  const loadFromLocalStorage = (): Building[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.buildings && Array.isArray(parsed.buildings)) {
          console.log("✅ נתונים נטענו מ-localStorage:", parsed.buildings.length, "בניינים");
          return parsed.buildings;
        }
      }
      
      // נסה לטעון מהמפתח הישן
      const oldSaved = localStorage.getItem("buildings_data");
      if (oldSaved) {
        const oldParsed = JSON.parse(oldSaved);
        if (Array.isArray(oldParsed)) {
          console.log("✅ נתונים נטענו מהמפתח הישן:", oldParsed.length, "בניינים");
          // שמור בפורמט החדש
          saveToLocalStorage(oldParsed);
          return oldParsed;
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בטעינה מ-localStorage:", error);
    }
    
    console.log("📦 משתמש בנתונים ראשוניים");
    return initialBuildings;
  };

  // Initialize data - טעינה מיידית מ-localStorage
  useEffect(() => {
    console.log("🔄 מתחיל טעינת נתונים...");
    
    // טען מיד מ-localStorage
    const localData = loadFromLocalStorage();
    setData(localData);
    setLoading(false);
    console.log("⚡ נתונים נטענו מיד מ-localStorage");

    // נסה להתחבר ל-Firebase ברקע
    const initializeFirebase = async () => {
      try {
        console.log("🔥 מנסה להתחבר ל-Firebase...");
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        
        if (snapshot.empty && localData.length > 0) {
          // אם Firebase ריק אבל יש נתונים מקומיים, העלה אותם
          console.log("📤 מעלה נתונים מקומיים ל-Firebase...");
          const batch = localData.map(building => 
            setDoc(doc(db, COLLECTION_NAME, building.id), building)
          );
          await Promise.all(batch);
          console.log("✅ נתונים הועלו ל-Firebase");
        } else if (!snapshot.empty) {
          // אם יש נתונים ב-Firebase, בדוק אם הם חדשים יותר
          const firebaseData: Building[] = [];
          snapshot.forEach((doc) => {
            firebaseData.push({ id: doc.id, ...doc.data() } as Building);
          });
          
          console.log("✅ נתונים נטענו מ-Firebase:", firebaseData.length, "בניינים");
          
          // עדכן רק אם יש הבדל
          if (JSON.stringify(firebaseData) !== JSON.stringify(localData)) {
            setData(firebaseData);
            saveToLocalStorage(firebaseData);
            console.log("🔄 נתונים עודכנו מ-Firebase");
          }
        }

        // האזן לעדכונים בזמן אמת
        const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
          const buildings: Building[] = [];
          snapshot.forEach((doc) => {
            buildings.push({ id: doc.id, ...doc.data() } as Building);
          });
          console.log("🔄 עדכון בזמן אמת מ-Firebase:", buildings.length, "בניינים");
          setData(buildings);
          saveToLocalStorage(buildings);
        }, (error) => {
          console.error("❌ שגיאה ב-Firebase listener:", error);
          console.log("🔄 ממשיך עם נתונים מקומיים");
        });

        return () => unsubscribe();
        
      } catch (error) {
        console.error("❌ שגיאה בחיבור ל-Firebase:", error);
        console.log("🔄 עובד במצב מקומי בלבד");
      }
    };

    initializeFirebase();
  }, []);

  const addBuilding = async (building: Building) => {
    console.log("➕ מוסיף בניין:", building.id, building.number);
    
    // עדכון מיידי של ה-state
    const newData = [...data, building];
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ בניין נוסף למצב מקומי");
    
    // נסה לשמור ב-Firebase
    try {
      await setDoc(doc(db, COLLECTION_NAME, building.id), building);
      console.log("✅ בניין נשמר ב-Firebase בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה בשמירת בניין ב-Firebase:", error);
      console.log("💾 הבניין נשמר מקומית בכל מקרה");
    }
  };

  const updateBuilding = async (id: string, patch: Partial<Building>) => {
    console.log("✏️ מעדכן בניין:", id, patch);
    
    // עדכון מיידי של ה-state
    const newData = data.map(b => b.id === id ? { ...b, ...patch } : b);
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ בניין עודכן במצב מקומי");
    
    // נסה לעדכן ב-Firebase
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), patch);
      console.log("✅ בניין עודכן ב-Firebase בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה בעדכון בניין ב-Firebase:", error);
      console.log("💾 הבניין עודכן מקומית בכל מקרה");
    }
  };

  const deleteBuilding = async (id: string) => {
    console.log("🗑️ מוחק בניין:", id);
    
    // עדכון מיידי של ה-state
    const newData = data.filter(b => b.id !== id);
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ בניין נמחק מהמצב המקומי");
    
    // נסה למחוק מ-Firebase
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      console.log("✅ בניין נמחק מ-Firebase בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה במחיקת בניין מ-Firebase:", error);
      console.log("💾 הבניין נמחק מקומית בכל מקרה");
    }
  };

  const addResident = async (buildingId: string, resident: Resident) => {
    console.log("👤 מוסיף דייר:", resident.fullName, "לבניין:", buildingId);
    
    const building = data.find(b => b.id === buildingId);
    if (!building) {
      console.error("❌ בניין לא נמצא:", buildingId);
      return;
    }

    // עדכון מיידי של ה-state
    const updatedResidents = [...building.residents, resident];
    const newData = data.map(b => 
      b.id === buildingId 
        ? { ...b, residents: updatedResidents }
        : b
    );
    
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ דייר נוסף למצב מקומי");
    
    // נסה לשמור ב-Firebase
    try {
      await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
        residents: updatedResidents
      });
      console.log("✅ דייר נשמר ב-Firebase בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה בשמירת דייר ב-Firebase:", error);
      console.log("💾 הדייר נשמר מקומית בכל מקרה");
    }
  };

  const updateResident = async (buildingId: string, residentId: string, patch: Partial<Resident>) => {
    console.log("✏️ מעדכן דייר:", residentId, patch);
    
    const building = data.find(b => b.id === buildingId);
    if (!building) {
      console.error("❌ בניין לא נמצא:", buildingId);
      return;
    }

    // עדכון מיידי של ה-state
    const updatedResidents = building.residents.map(r => 
      r.id === residentId ? { ...r, ...patch } : r
    );
    const newData = data.map(b => 
      b.id === buildingId 
        ? { ...b, residents: updatedResidents }
        : b
    );
    
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ דייר עודכן במצב מקומי");
    
    // נסה לעדכן ב-Firebase
    try {
      await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
        residents: updatedResidents
      });
      console.log("✅ דייר עודכן ב-Firebase בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה בעדכון דייר ב-Firebase:", error);
      console.log("💾 הדייר עודכן מקומית בכל מקרה");
    }
  };

  const deleteResident = async (buildingId: string, residentId: string) => {
    console.log("🗑️ מוחק דייר:", residentId);
    
    const building = data.find(b => b.id === buildingId);
    if (!building) {
      console.error("❌ בניין לא נמצא:", buildingId);
      return;
    }

    // עדכון מיידי של ה-state
    const updatedResidents = building.residents.filter(r => r.id !== residentId);
    const newData = data.map(b => 
      b.id === buildingId 
        ? { ...b, residents: updatedResidents }
        : b
    );
    
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ דייר נמחק מהמצב המקומי");
    
    // נסה למחוק מ-Firebase
    try {
      await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
        residents: updatedResidents
      });
      console.log("✅ דייר נמחק מ-Firebase בהצלחה");
    } catch (error) {
      console.error("❌ שגיאה במחיקת דייר מ-Firebase:", error);
      console.log("💾 הדייר נמחק מקומית בכל מקרה");
    }
  };

  return {
    buildings: data,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    addResident,
    updateResident,
    deleteResident,
    loading,
  };
}