import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Building, Resident } from "../types";
import { buildings as initialBuildings } from "../data/buildings";

const COLLECTION_NAME = "buildings";
const LOCAL_STORAGE_KEY = "buildings_data";

export function useBuildings() {
  const [data, setData] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFirebase, setUseFirebase] = useState(true);

  // שמירה ב-localStorage
  const saveToLocalStorage = (buildings: Building[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(buildings));
      console.log("✅ נתונים נשמרו ב-localStorage");
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
        console.log("✅ נתונים נטענו מ-localStorage:", parsed.length, "בניינים");
        return parsed;
      }
    } catch (error) {
      console.error("❌ שגיאה בטעינה מ-localStorage:", error);
    }
    return initialBuildings;
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      console.log("🔄 מתחיל טעינת נתונים...");
      
      // תמיד טען מ-localStorage קודם
      const localData = loadFromLocalStorage();
      setData(localData);
      setLoading(false);

      // נסה להתחבר ל-Firebase
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
          // אם יש נתונים ב-Firebase, טען אותם
          const firebaseData: Building[] = [];
          snapshot.forEach((doc) => {
            firebaseData.push({ id: doc.id, ...doc.data() } as Building);
          });
          console.log("✅ נתונים נטענו מ-Firebase:", firebaseData.length, "בניינים");
          setData(firebaseData);
          saveToLocalStorage(firebaseData);
        }

        // האזן לעדכונים בזמן אמת
        const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
          const buildings: Building[] = [];
          snapshot.forEach((doc) => {
            buildings.push({ id: doc.id, ...doc.data() } as Building);
          });
          console.log("🔄 עדכון מ-Firebase:", buildings.length, "בניינים");
          setData(buildings);
          saveToLocalStorage(buildings);
        }, (error) => {
          console.error("❌ שגיאה ב-Firebase listener:", error);
          setUseFirebase(false);
        });

        return () => unsubscribe();
        
      } catch (error) {
        console.error("❌ שגיאה בחיבור ל-Firebase:", error);
        setUseFirebase(false);
        console.log("🔄 עובר למצב מקומי בלבד");
      }
    };

    initializeData();
  }, []);

  const addBuilding = async (building: Building) => {
    console.log("➕ מוסיף בניין:", building);
    
    // עדכון מיידי של ה-state
    const newData = [...data, building];
    setData(newData);
    saveToLocalStorage(newData);
    
    // נסה לשמור ב-Firebase
    if (useFirebase) {
      try {
        await setDoc(doc(db, COLLECTION_NAME, building.id), building);
        console.log("✅ בניין נשמר ב-Firebase");
      } catch (error) {
        console.error("❌ שגיאה בשמירת בניין ב-Firebase:", error);
      }
    }
  };

  const updateBuilding = async (id: string, patch: Partial<Building>) => {
    console.log("✏️ מעדכן בניין:", id, patch);
    
    // עדכון מיידי של ה-state
    const newData = data.map(b => b.id === id ? { ...b, ...patch } : b);
    setData(newData);
    saveToLocalStorage(newData);
    
    // נסה לעדכן ב-Firebase
    if (useFirebase) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, id), patch);
        console.log("✅ בניין עודכן ב-Firebase");
      } catch (error) {
        console.error("❌ שגיאה בעדכון בניין ב-Firebase:", error);
      }
    }
  };

  const deleteBuilding = async (id: string) => {
    console.log("🗑️ מוחק בניין:", id);
    
    // עדכון מיידי של ה-state
    const newData = data.filter(b => b.id !== id);
    setData(newData);
    saveToLocalStorage(newData);
    
    // נסה למחוק מ-Firebase
    if (useFirebase) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        console.log("✅ בניין נמחק מ-Firebase");
      } catch (error) {
        console.error("❌ שגיאה במחיקת בניין מ-Firebase:", error);
      }
    }
  };

  const addResident = async (buildingId: string, resident: Resident) => {
    console.log("👤 מוסיף דייר:", resident, "לבניין:", buildingId);
    
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
    if (useFirebase) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
        console.log("✅ דייר נשמר ב-Firebase");
      } catch (error) {
        console.error("❌ שגיאה בשמירת דייר ב-Firebase:", error);
      }
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
    if (useFirebase) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
        console.log("✅ דייר עודכן ב-Firebase");
      } catch (error) {
        console.error("❌ שגיאה בעדכון דייר ב-Firebase:", error);
      }
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
    if (useFirebase) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
        console.log("✅ דייר נמחק מ-Firebase");
      } catch (error) {
        console.error("❌ שגיאה במחיקת דייר מ-Firebase:", error);
      }
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