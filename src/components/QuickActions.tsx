import { useState } from "react";
import { useDistribution } from "../hooks/useDistribution";
import { Zap, CheckCircle, RotateCcw, MapPin, Clock, Target } from "lucide-react";

export default function QuickActions() {
  const { 
    pendingToday, 
    markDelivered, 
    todayArea, 
    urgencyGroups,
    getStreetUrgencyLevel 
  } = useDistribution();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // פעולות מהירות
  const markAllSmallStreets = async () => {
    setIsProcessing(true);
    const smallStreets = pendingToday.filter(s => !s.isBig).slice(0, 3);
    
    for (const street of smallStreets) {
      await markDelivered(street.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // השהיה קצרה
    }
    
    setIsProcessing(false);
  };

  const markMostUrgent = async () => {
    setIsProcessing(true);
    const urgent = [...urgencyGroups.never, ...urgencyGroups.critical].slice(0, 2);
    
    for (const street of urgent) {
      await markDelivered(street.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsProcessing(false);
  };

  const quickStats = {
    never: urgencyGroups.never.length,
    critical: urgencyGroups.critical.length,
    urgent: urgencyGroups.urgent.length,
    small: pendingToday.filter(s => !s.isBig).length,
    big: pendingToday.filter(s => s.isBig).length
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Zap size={20} className="text-yellow-500" />
        <h3 className="font-semibold text-gray-800">פעולות מהירות</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          אזור {todayArea}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* סימון רחובות דחופים */}
        <button
          onClick={markMostUrgent}
          disabled={isProcessing || (quickStats.never + quickStats.critical) === 0}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target size={24} className="text-red-600" />
          <div className="text-center">
            <div className="font-semibold text-red-800 text-sm">סמן דחופים</div>
            <div className="text-xs text-red-600">
              {quickStats.never + quickStats.critical} רחובות
            </div>
          </div>
        </button>

        {/* סימון רחובות קטנים */}
        <button
          onClick={markAllSmallStreets}
          disabled={isProcessing || quickStats.small === 0}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPin size={24} className="text-blue-600" />
          <div className="text-center">
            <div className="font-semibold text-blue-800 text-sm">רחובות קטנים</div>
            <div className="text-xs text-blue-600">
              {quickStats.small} רחובות
            </div>
          </div>
        </button>

        {/* סטטיסטיקה מהירה */}
        <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <CheckCircle size={24} className="text-green-600" />
          <div className="text-center">
            <div className="font-semibold text-green-800 text-sm">רחובות גדולים</div>
            <div className="text-xs text-green-600">
              {quickStats.big} רחובות
            </div>
          </div>
        </div>

        {/* זמן משוער */}
        <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
          <Clock size={24} className="text-purple-600" />
          <div className="text-center">
            <div className="font-semibold text-purple-800 text-sm">זמן משוער</div>
            <div className="text-xs text-purple-600">
              {Math.round(pendingToday.reduce((sum, s) => sum + (s.averageTime || (s.isBig ? 45 : 25)), 0) / 60)} שעות
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">מבצע פעולות מהירות...</span>
          </div>
        </div>
      )}
    </div>
  );
}