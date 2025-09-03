import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db, testFirebaseConnection } from "../firebase";
import { Building, Resident } from "../types";
import { buildings as initialBuildings } from "../data/buildings";

const COLLECTION_NAME = "buildings";
const LOCAL_STORAGE_KEY = "buildings_data_v3"; // גרסה חדשה

export function useBuildings() {
  const [data, setData] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // שמירה ב-localStorage עם חותמת זמן
  const saveToLocalStorage = (buildings: Building[]) => {
    try {
      const dataToSave = {
        buildings,
        timestamp: Date.now(),
        version: "3.0",
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("💾 נתונים נשמרו ב-localStorage:", buildings.length, "בניינים");
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
      
      console.log("📦 אין נתונים ב-localStorage, משתמש בנתונים ראשוניים");
      return initialBuildings;
    } catch (error) {
      console.error("❌ שגיאה בטעינה מ-localStorage:", error);
      return initialBuildings;
    }
  };

  // Initialize data
  useEffect(() => {
    console.log("🏢 מתחיל טעינת בניינים...");
    
    const initializeBuildings = async () => {
      try {
        // טען נתונים מקומיים מיד
        const localData = loadFromLocalStorage();
        setData(localData);
        console.log("✅ בניינים נטענו מקומית:", localData.length);
        
        // סיים טעינה מיד עם נתונים מקומיים
        setLoading(false);
        
        // נסה Firebase ברקע
        try {
          const connected = await testFirebaseConnection();
          setFirebaseConnected(connected);
          
          if (connected) {
            console.log("🔥 Firebase זמין, מסנכרן ברקע...");
            
            const snapshot = await getDocs(collection(db, COLLECTION_NAME));
            if (!snapshot.empty) {
              const firebaseData: Building[] = [];
              snapshot.forEach((doc) => {
                firebaseData.push({ id: doc.id, ...doc.data() } as Building);
              });
              setData(firebaseData);
              saveToLocalStorage(firebaseData);
              console.log("✅ סנכרון Firebase הושלם");
            }
          }
        } catch (error) {
          console.log("⚠️ Firebase לא זמין, ממשיך במצב מקומי");
          setFirebaseConnected(false);
        }
      } catch (error) {
        console.error("❌ שגיאה באתחול בניינים:", error);
        setFirebaseConnected(false);
        setLoading(false);
      }
    };

    initializeBuildings();
  }, []);

  const addBuilding = async (building: Building) => {
    console.log("➕ מוסיף בניין:", building.number, "ברחוב:", building.streetId);
    
    // עדכון מיידי של ה-state
    const newData = [...data, building];
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ בניין נוסף למצב מקומי");
    
    // שמירה ב-Firebase אם מחובר
    if (firebaseConnected) {
      try {
        await setDoc(doc(db, COLLECTION_NAME, building.id), building);
        console.log("🔥 בניין נשמר ב-Firebase בהצלחה");
      } catch (error) {
        console.error("❌ שגיאה בשמירת בניין ב-Firebase:", error);
      }
    } else {
      console.log("💾 Firebase לא מחובר, נשמר רק מקומית");
    }
  };

  const updateBuilding = async (id: string, patch: Partial<Building>) => {
    console.log("✏️ מעדכן בניין:", id);
    
    // עדכון מיידי של ה-state
    const newData = data.map(b => b.id === id ? { ...b, ...patch } : b);
    setData(newData);
    saveToLocalStorage(newData);
    console.log("✅ בניין עודכן במצב מקומי");
    
    // עדכון ב-Firebase אם מחובר
    if (firebaseConnected) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, id), patch);
        console.log("🔥 בניין עודכן ב-Firebase בהצלחה");
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
    console.log("✅ בניין נמחק מהמצב המקומי");
    
    // מחיקה מ-Firebase אם מחובר
    if (firebaseConnected) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        console.log("🔥 בניין נמחק מ-Firebase בהצלחה");
      } catch (error) {
        console.error("❌ שגיאה במחיקת בניין מ-Firebase:", error);
      }
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
    
    // שמירה ב-Firebase אם מחובר
    if (firebaseConnected) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
        console.log("🔥 דייר נשמר ב-Firebase בהצלחה");
      } catch (error) {
        console.error("❌ שגיאה בשמירת דייר ב-Firebase:", error);
      }
    }
  };

  const updateResident = async (buildingId: string, residentId: string, patch: Partial<Resident>) => {
    console.log("✏️ מעדכן דייר:", residentId);
    
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
    
    // עדכון ב-Firebase אם מחובר
    if (firebaseConnected) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
        console.log("🔥 דייר עודכן ב-Firebase בהצלחה");
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
    
    // מחיקה מ-Firebase אם מחובר
    if (firebaseConnected) {
      try {
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
        console.log("🔥 דייר נמחק מ-Firebase בהצלחה");
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
    firebaseConnected, // מידע על מצב החיבור
  };
}