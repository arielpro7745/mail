import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { streets as initialStreets } from "../data/streets";
import { Street, Area } from "../types";
import { sortByUrgency, pickForToday } from "../utils/schedule";
import { isSameDay } from "../utils/isSameDay";

const COLLECTION_NAME = "streets";
const AREA_DOC = "currentArea";

export function useDistribution() {
  const [data, setData] = useState<Street[]>([]);
  const [todayArea, setTodayArea] = useState<Area>(14);
  const [loading, setLoading] = useState(true);

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
  const todayList = sortByUrgency(data.filter(s => s.area === todayArea), today);
  const completedToday = todayList.filter(
    s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)
  );
  const pendingToday = todayList.filter(
    s => !s.lastDelivered || !isSameDay(new Date(s.lastDelivered), today)
  );

  const recommended = pickForToday(pendingToday);

  const markDelivered = async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        lastDelivered: new Date().toISOString()
      });
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

  return {
    todayArea,
    pendingToday,
    completedToday,
    recommended,
    markDelivered,
    undoDelivered,
    endDay,
    loading,
  };
}