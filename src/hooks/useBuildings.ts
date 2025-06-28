import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Building, Resident } from "../types";
import { buildings as initialBuildings } from "../data/buildings";

const COLLECTION_NAME = "buildings";

export function useBuildings() {
  const [data, setData] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data if collection is empty
  const initializeData = async () => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      if (snapshot.empty && initialBuildings.length > 0) {
        // Initialize with default buildings data
        const batch = initialBuildings.map(building => 
          setDoc(doc(db, COLLECTION_NAME, building.id), building)
        );
        await Promise.all(batch);
        console.log("Initialized buildings data in Firestore");
      }
    } catch (error) {
      console.error("Error initializing buildings data:", error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await initializeData();
      setLoading(false);
    };

    initializeApp();

    // Listen to real-time updates for buildings
    const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
      const buildings: Building[] = [];
      snapshot.forEach((doc) => {
        buildings.push({ id: doc.id, ...doc.data() } as Building);
      });
      setData(buildings);
    });

    return () => unsubscribe();
  }, []);

  const addBuilding = async (building: Building) => {
    try {
      await setDoc(doc(db, COLLECTION_NAME, building.id), building);
    } catch (error) {
      console.error("Error adding building:", error);
    }
  };

  const updateBuilding = async (id: string, patch: Partial<Building>) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), patch);
    } catch (error) {
      console.error("Error updating building:", error);
    }
  };

  const deleteBuilding = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting building:", error);
    }
  };

  const addResident = async (buildingId: string, resident: Resident) => {
    try {
      const building = data.find(b => b.id === buildingId);
      if (building) {
        const updatedResidents = [...building.residents, resident];
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
      }
    } catch (error) {
      console.error("Error adding resident:", error);
    }
  };

  const updateResident = async (buildingId: string, residentId: string, patch: Partial<Resident>) => {
    try {
      const building = data.find(b => b.id === buildingId);
      if (building) {
        const updatedResidents = building.residents.map(r => 
          r.id === residentId ? { ...r, ...patch } : r
        );
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
      }
    } catch (error) {
      console.error("Error updating resident:", error);
    }
  };

  const deleteResident = async (buildingId: string, residentId: string) => {
    try {
      const building = data.find(b => b.id === buildingId);
      if (building) {
        const updatedResidents = building.residents.filter(r => r.id !== residentId);
        await updateDoc(doc(db, COLLECTION_NAME, buildingId), {
          residents: updatedResidents
        });
      }
    } catch (error) {
      console.error("Error deleting resident:", error);
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