import { useEffect, useState, useMemo, useCallback } from "react";
import { collection, doc, getDocs, setDoc, updateDoc, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { streets as initialStreets } from "../data/streets";
import { Street, Area } from "../types";
import { pickForToday } from "../utils/schedule";
import { optimizeRoute } from "../utils/routeOptimizer";
import { isSameDay } from "../utils/isSameDay";
import { totalDaysBetween } from "../utils/dates";
import { useSettings } from "./useSettings";

// Constants for better readability and maintainability
const COLLECTION_NAME = "streets";
const SETTINGS_COLLECTION = "settings";
const AREA_DOC_ID = "currentArea";
const DEFAULT_AREA: Area = 14;

// Urgency thresholds - can be configured later if needed
const URGENCY_THRESHOLDS = {
  critical: 14,
  urgent: 10,
  warning: 7,
};

// Urgency levels as enum-like object
const URGENCY_LEVELS = {
  never: 'never',
  critical: 'critical',
  urgent: 'urgent',
  warning: 'warning',
  normal: 'normal',
} as const;

type UrgencyLevel = keyof typeof URGENCY_LEVELS;

export function useDistribution() {
  const [data, setData] = useState<Street[]>([]);
  const [todayArea, setTodayArea] = useState<Area>(DEFAULT_AREA);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  // Helper function to initialize streets data if collection is empty
  const initializeData = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      if (snapshot.empty) {
        const batchPromises = initialStreets.map(street => 
          setDoc(doc(db, COLLECTION_NAME, street.id), street)
        );
        await Promise.all(batchPromises);
        console.log("Initialized streets data in Firestore");
      }
    } catch (error) {
      console.error("Error initializing streets data:", error);
      // TODO: Add user-facing error notification
    }
  }, []);

  // Helper function to load current area from settings
  const loadCurrentArea = useCallback(async () => {
    try {
      const settingsCollection = collection(db, SETTINGS_COLLECTION);
      const areaDocSnap = await getDocs(settingsCollection);
      const areaDoc = areaDocSnap.docs.find(d => d.id === AREA_DOC_ID);
      
      if (areaDoc) {
        setTodayArea(areaDoc.data().area as Area);
      } else {
        // Initialize default area
        await setDoc(doc(db, SETTINGS_COLLECTION, AREA_DOC_ID), { area: DEFAULT_AREA });
        setTodayArea(DEFAULT_AREA);
      }
    } catch (error) {
      console.error("Error loading current area:", error);
      setTodayArea(DEFAULT_AREA); // Fallback to default
    }
  }, []);

  // Function to save current area
  const saveCurrentArea = useCallback(async (area: Area) => {
    try {
      await setDoc(doc(db, SETTINGS_COLLECTION, AREA_DOC_ID), { area });
      setTodayArea(area);
    } catch (error) {
      console.error("Error saving current area:", error);
    }
  }, []);

  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      await initializeData();
      await loadCurrentArea();
      setLoading(false);
    };

    setup();

    // Real-time listener for streets data
    const unsubscribe = onSnapshot(
      collection(db, COLLECTION_NAME),
      (snapshot: QuerySnapshot) => {
        const streetsData: Street[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Street));
        setData(streetsData);
      },
      (error) => {
        console.error("Error in streets snapshot:", error);
        // TODO: Handle snapshot error, perhaps retry or show message
      }
    );

    return () => unsubscribe();
  }, [initializeData, loadCurrentArea]);

  // Memoized computations to avoid recalculating on every render
  const today = useMemo(() => new Date(), []); // Assuming today doesn't change during component lifetime
  const areaStreets = useMemo(() => data.filter(s => s.area === todayArea), [data, todayArea]);

  // Function to get urgency level
  const getStreetUrgencyLevel = useCallback((street: Street): UrgencyLevel => {
    if (!street.lastDelivered) return URGENCY_LEVELS.never;
    
    const days = totalDaysBetween(new Date(street.lastDelivered), today);
    if (days >= URGENCY_THRESHOLDS.critical) return URGENCY_LEVELS.critical;
    if (days >= URGENCY_THRESHOLDS.urgent) return URGENCY_LEVELS.urgent;
    if (days >= URGENCY_THRESHOLDS.warning) return URGENCY_LEVELS.warning;
    return URGENCY_LEVELS.normal;
  }, [today]);

  // Function to get urgency color class
  const getUrgencyColor = useCallback((level: UrgencyLevel): string => {
    switch (level) {
      case URGENCY_LEVELS.never: return 'bg-purple-50 border-purple-300';
      case URGENCY_LEVELS.critical: return 'bg-red-50 border-red-300';
      case URGENCY_LEVELS.urgent: return 'bg-orange-50 border-orange-300';
      case URGENCY_LEVELS.warning: return 'bg-yellow-50 border-yellow-300';
      default: return 'bg-white border-gray-200';
    }
  }, []);

  // Function to get urgency label
  const getUrgencyLabel = useCallback((level: UrgencyLevel): string => {
    switch (level) {
      case URGENCY_LEVELS.never: return 'לא חולק מעולם';
      case URGENCY_LEVELS.critical: return `קריטי - מעל ${URGENCY_THRESHOLDS.critical} ימים`;
      case URGENCY_LEVELS.urgent: return `דחוף - ${URGENCY_THRESHOLDS.urgent}-${URGENCY_THRESHOLDS.critical - 1} ימים`;
      case URGENCY_LEVELS.warning: return `אזהרה - ${URGENCY_THRESHOLDS.warning}-${URGENCY_THRESHOLDS.urgent - 1} ימים`;
      default: return 'רגיל';
    }
  }, []);

  // Function to sort streets by urgency
  const sortStreetsByUrgency = useCallback((streets: Street[]) => {
    return [...streets].sort((a, b) => {
      const aLevel = getStreetUrgencyLevel(a);
      const bLevel = getStreetUrgencyLevel(b);
      const levelOrder = ['never', 'critical', 'urgent', 'warning', 'normal'];
      const aIndex = levelOrder.indexOf(aLevel);
      const bIndex = levelOrder.indexOf(bLevel);
      
      if (aIndex !== bIndex) return aIndex - bIndex;
      
      const aDays = a.lastDelivered ? totalDaysBetween(new Date(a.lastDelivered), today) : 999;
      const bDays = b.lastDelivered ? totalDaysBetween(new Date(b.lastDelivered), today) : 999;
      
      if (aDays !== bDays) return bDays - aDays;
      
      if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [getStreetUrgencyLevel, today]);

  // Function to group streets by urgency
  const groupStreetsByUrgency = useCallback((streets: Street[]) => {
    const groups: Record<UrgencyLevel, Street[]> = {
      never: [],
      critical: [],
      urgent: [],
      warning: [],
      normal: [],
    };

    streets.forEach(street => {
      const level = getStreetUrgencyLevel(street);
      groups[level].push(street);
    });

    // Sort within each group
    Object.values(URGENCY_LEVELS).forEach(level => {
      groups[level].sort((a, b) => {
        const aDays = a.lastDelivered ? totalDaysBetween(new Date(a.lastDelivered), today) : 999;
        const bDays = b.lastDelivered ? totalDaysBetween(new Date(b.lastDelivered), today) : 999;
        
        if (aDays !== bDays) return bDays - aDays;
        if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    });

    return groups;
  }, [getStreetUrgencyLevel, today]);

  // Computed values
  const completedToday = useMemo(() => 
    areaStreets.filter(s => s.lastDelivered && isSameDay(new Date(s.lastDelivered), today)),
    [areaStreets, today]
  );

  const streetsNeedingDelivery = useMemo(() => 
    areaStreets.filter(s => !s.lastDelivered || !isSameDay(new Date(s.lastDelivered), today)),
    [areaStreets, today]
  );

  const urgencyGroups = useMemo(() => 
    groupStreetsByUrgency(streetsNeedingDelivery),
    [groupStreetsByUrgency, streetsNeedingDelivery]
  );

  const sortedStreetsByUrgency = useMemo(() => 
    sortStreetsByUrgency(streetsNeedingDelivery),
    [sortStreetsByUrgency, streetsNeedingDelivery]
  );

  const urgencyCounts = useMemo(() => ({
    never: urgencyGroups.never.length,
    critical: urgencyGroups.critical.length,
    urgent: urgencyGroups.urgent.length,
    warning: urgencyGroups.warning.length,
    normal: urgencyGroups.normal.length,
  }), [urgencyGroups]);

  const overdueStreets = useMemo(() => 
    streetsNeedingDelivery.filter(s => getStreetUrgencyLevel(s) === URGENCY_LEVELS.critical).length,
    [streetsNeedingDelivery, getStreetUrgencyLevel]
  );

  let pendingToday = sortedStreetsByUrgency;

  // Apply optimization if enabled
  if (settings.optimizeRoutes && pendingToday.length > 0) {
    pendingToday = optimizeRoute(pendingToday, todayArea);
  }

  const recommended = useMemo(() => pickForToday(pendingToday), [pendingToday]);

  const isAllCompleted = streetsNeedingDelivery.length === 0;

  // Function to mark street as delivered
  const markDelivered = useCallback(async (id: string, deliveryTime?: number) => {
    try {
      const street = data.find(s => s.id === id);
      if (!street) throw new Error(`Street with id ${id} not found`);

      const updates: Partial<Street> = {
        lastDelivered: new Date().toISOString(),
      };

      if (deliveryTime) {
        const newTimes = [...(street.deliveryTimes || []), deliveryTime];
        const averageTime = Math.round(newTimes.reduce((sum, time) => sum + time, 0) / newTimes.length);
        updates.deliveryTimes = newTimes;
        updates.averageTime = averageTime;
      }

      await updateDoc(doc(db, COLLECTION_NAME, id), updates);
    } catch (error) {
      console.error("Error marking street as delivered:", error);
      // TODO: Add error notification
    }
  }, [data]);

  // Function to undo delivery
  const undoDelivered = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        lastDelivered: null, // Or "" if that's the convention
      });
    } catch (error) {
      console.error("Error undoing delivery:", error);
    }
  }, []);

  // Function to end day and switch area
  const endDay = useCallback(async () => {
    const newArea: Area = todayArea === 14 ? 45 : 14;
    await saveCurrentArea(newArea);
  }, [todayArea, saveCurrentArea]);

  // Function to reset cycle
  const resetCycle = useCallback(async () => {
    const currentAreaStreets = data.filter(s => s.area === todayArea);
    
    try {
      const resetPromises = currentAreaStreets.map(street => 
        updateDoc(doc(db, COLLECTION_NAME, street.id), {
          cycleStartDate: new Date().toISOString(),
          deliveryTimes: street.deliveryTimes || [],
          averageTime: street.averageTime || undefined,
        })
      );
      await Promise.all(resetPromises);
      console.log(`Delivery cycle reset for area ${todayArea}`);
    } catch (error) {
      console.error("Error resetting delivery cycle:", error);
    }
  }, [data, todayArea]);

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
    totalStreetsInArea: areaStreets.length,
    isAllCompleted,
    streetsNeedingDelivery: streetsNeedingDelivery.length,
    overdueStreets,
    allStreets: data,
    urgencyGroups,
    urgencyCounts,
    getStreetUrgencyLevel,
    getUrgencyColor,
    getUrgencyLabel,
  };
}