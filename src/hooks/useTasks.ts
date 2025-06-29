import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Task } from "../types";
import { nanoid } from "nanoid";

const COLLECTION_NAME = "tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
      const tasksData: Task[] = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
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