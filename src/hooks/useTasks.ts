import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Task } from "../types";
import { nanoid } from "nanoid";

const COLLECTION_NAME = "tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    const initializeTasks = async () => {
      try {
        // בדוק חיבור Firebase
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        setFirebaseConnected(true);
        
        const tasksData: Task[] = [];
        snapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() } as Task);
        });
        setTasks(tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        console.log("📥 משימות נטענו מ-Firebase:", tasksData.length);
        
        // הגדר מאזין לשינויים בזמן אמת
        const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
          const tasksData: Task[] = [];
          snapshot.forEach((doc) => {
            tasksData.push({ id: doc.id, ...doc.data() } as Task);
          });
          setTasks(tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          console.log("🔄 עדכון משימות מ-Firebase בזמן אמת");
        }, (error) => {
          console.error("Error in tasks snapshot listener:", error);
          setFirebaseConnected(false);
        });
        
        setLoading(false);
        return unsubscribe;
      } catch (error) {
        console.error("Error initializing tasks:", error);
        setFirebaseConnected(false);
        setTasks([]);
        setLoading(false);
      }
    };

    const unsubscribe = initializeTasks();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const task: Task = {
        ...taskData,
        id: nanoid(8),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, COLLECTION_NAME, task.id), task);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const completeTask = async (id: string, actualTime?: number) => {
    try {
      const updates: Partial<Task> = {
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      if (actualTime) {
        updates.actualTime = actualTime;
      }
      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    loading,
  };
}