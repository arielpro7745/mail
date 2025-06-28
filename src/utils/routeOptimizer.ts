import { Street } from "../types";
import { walkOrder45, walkOrder14 } from "../data/walkOrder";

export function optimizeRoute(streets: Street[], area: 14 | 45): Street[] {
  const walkOrder = area === 45 ? walkOrder45 : walkOrder14;
  
  if (!walkOrder.length) {
    // Fallback: sort by urgency and size
    return streets.sort((a, b) => {
      // Prioritize big streets
      if (a.isBig !== b.isBig) return a.isBig ? -1 : 1;
      
      // Then by urgency (days since last delivery)
      const aDays = a.lastDelivered ? 
        Math.floor((Date.now() - new Date(a.lastDelivered).getTime()) / 86400000) : 999;
      const bDays = b.lastDelivered ? 
        Math.floor((Date.now() - new Date(b.lastDelivered).getTime()) / 86400000) : 999;
      
      return bDays - aDays;
    });
  }

  // Sort by predefined walking order
  const sortedStreets = [...streets].sort((a, b) => {
    const aIndex = walkOrder.indexOf(a.id);
    const bIndex = walkOrder.indexOf(b.id);
    
    // If both streets are in the walking order, sort by order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order, sort by urgency
    const aDays = a.lastDelivered ? 
      Math.floor((Date.now() - new Date(a.lastDelivered).getTime()) / 86400000) : 999;
    const bDays = b.lastDelivered ? 
      Math.floor((Date.now() - new Date(b.lastDelivered).getTime()) / 86400000) : 999;
    
    return bDays - aDays;
  });

  return sortedStreets;
}

export function calculateEstimatedTime(streets: Street[]): number {
  return streets.reduce((total, street) => {
    const avgTime = street.averageTime || (street.isBig ? 45 : 25); // default times
    return total + avgTime;
  }, 0);
}

export function getRouteEfficiency(streets: Street[]): number {
  if (streets.length === 0) return 100;
  
  const totalTime = calculateEstimatedTime(streets);
  const optimalTime = streets.length * 20; // 20 minutes per street is considered optimal
  
  return Math.max(0, Math.min(100, (optimalTime / totalTime) * 100));
}