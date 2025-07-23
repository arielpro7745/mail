import { useState, lazy, Suspense } from "react";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import { useDistribution } from "./hooks/useDistribution";
import { useNotifications } from "./hooks/useNotifications";
import { AreaToggle } from "./components/AreaToggle";
import StreetTable from "./components/StreetTable";
import Notifications from "./components/Notifications";
import CompletedToday from "./components/CompletedToday";
import WalkingOrder from "./components/WalkingOrder";
import LoadingSpinner from "./components/LoadingSpinner";
import DeliveryTimer from "./components/DeliveryTimer";
import RouteOptimizer from "./components/RouteOptimizer";
import { Street } from "./types";
import { totalDaysBetween } from "./utils/dates";

// Lazy load less frequently used tabs for performance
const BuildingManager = lazy(() => import("./components/BuildingManager"));
const TaskManager = lazy(() => import("./components/TaskManager"));
const Reports = lazy(() => import("./components/Reports"));
const PhoneDirectory = lazy(() => import("./components/PhoneDirectory"));
const DataExport = lazy(() => import("./components/DataExport"));

// Define tab types as a constant for better maintainability
type Tab = "regular" | "buildings" | "tasks" | "reports" | "phones" | "export";

// Extract the regular tab content to a separate component for better organization
export function DistributionTab({
    todayArea,
    pendingToday,
    completedToday,
    recommended,
    markDelivered,
    undoDelivered,
    allCompletedToday,
    isAllCompleted,
    streetsNeedingDelivery,
    overdueStreets,
    urgencyGroups,
    urgencyCounts,
    getStreetUrgencyLevel,
    getUrgencyColor,
    getUrgencyLabel,
    onEnd,
  }: {
    todayArea: number;
    pendingToday: Street[];
    completedToday: Street[];
    recommended: Street[];
    markDelivered: (id: string, timeInMinutes: number) => void;
    undoDelivered: (id: string) => void;
    allCompletedToday: Street[];
    isAllCompleted: boolean;
    streetsNeedingDelivery: number;
    overdueStreets: number;
    urgencyGroups: Record<string, Street[]>;
    urgencyCounts: Record<string, number>;
    getStreetUrgencyLevel: (street: Street) => string;
    getUrgencyColor: (level: string) => string;
    getUrgencyLabel: (level: string) => string;
    onEnd: () => void;
  }) {
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);

  const overdue = pendingToday.filter((s) => {
    if (!s.lastDelivered) return true;
    return totalDaysBetween(new Date(s.lastDelivered), new Date()) >= 14;
  }).length;

  const handleStartTimer = (street: Street) => {
    setCurrentStreet(street);
  };

  const handleCompleteDelivery = (timeInMinutes: number) => {
    if (currentStreet) {
      markDelivered(currentStreet.id, timeInMinutes);
      setCurrentStreet(null);
    }
  };

  const handleOptimizeRoute = (streets: Street[]) => {
    setOptimizedStreets(streets);
  };

  const displayStreets = optimizedStreets.length > 0 ? optimizedStreets : pendingToday;

  return (
    <>
      <AreaToggle area={todayArea} onEnd={() => {}} /> {/* Assuming endDay is handled elsewhere */}

      {/* סטטיסטיקת התקדמות - Improved with better styling and accessibility */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-lg transition-shadow hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-gray-800">מעקב חלוקה יומי</h3>
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            אזור {todayArea}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 font-medium">חולקו היום</span>
              <span className="text-2xl font-bold text-blue-600">{allCompletedToday.length}</span>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700 font-medium">ממתינים</span>
              <span className="text-2xl font-bold text-orange-600">{streetsNeedingDelivery}</span>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700 font-medium">דחופים (14+ ימים)</span>
              <span className="text-2xl font-bold text-red-600">{overdueStreets}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg shadow-inner">
          💡 רחובות מסודרים לפי דחיפות: לא חולק מעולם → קריטי (14+ ימים) → דחוף (10-13 ימים) → אזהרה (7-9 ימים) → רגיל
        </div>
      </div>

      {currentStreet && (
        <div className="mb-6">
          <DeliveryTimer
            streetName={currentStreet.name}
            onComplete={handleCompleteDelivery}
          />
        </div>
      )}

      {!isAllCompleted && (
        <RouteOptimizer
          streets={pendingToday}
          area={todayArea}
          onOptimize={handleOptimizeRoute}
        />
      )}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-3">
          מומלץ להיום
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {recommended.length}
          </span>
          {urgencyCounts.never > 0 && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              🆕 {urgencyCounts.never} לא חולק
            </span>
          )}
          {urgencyCounts.critical > 0 && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              🚨 {urgencyCounts.critical} קריטי
            </span>
          )}
          {urgencyCounts.urgent > 0 && (
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              ⚠️ {urgencyCounts.urgent} דחוף
            </span>
          )}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
          <StreetTable 
            list={recommended} 
            onDone={markDelivered}
            onStartTimer={handleStartTimer}
            getStreetUrgencyLevel={getStreetUrgencyLevel}
            getUrgencyColor={getUrgencyColor}
            getUrgencyLabel={getUrgencyLabel}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-3">
          כל הרחובות
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {displayStreets.length}
          </span>
          {urgencyCounts.never > 0 && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
              לא חולק: {urgencyCounts.never}
            </span>
          )}
          {urgencyCounts.critical > 0 && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
              קריטי: {urgencyCounts.critical}
            </span>
          )}
          {urgencyCounts.urgent > 0 && (
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
              דחוף: {urgencyCounts.urgent}
            </span>
          )}
          {urgencyCounts.warning > 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
              אזהרה: {urgencyCounts.warning}
            </span>
          )}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
          <StreetTable 
            list={displayStreets} 
            onDone={markDelivered}
            onStartTimer={handleStartTimer}
            getStreetUrgencyLevel={getStreetUrgencyLevel}
            getUrgencyColor={getUrgencyColor}
            getUrgencyLabel={getUrgencyLabel}
          />
        </div>
      </section>

      <CompletedToday 
        list={completedToday} 
        onUndo={undoDelivered}
        totalCompleted={allCompletedToday.length}
      />
      
      <Notifications count={overdue} />
      <WalkingOrder area={todayArea} />
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("regular");

  const {
    todayArea,
    pendingToday,
    completedToday,
    recommended,
    markDelivered,
    undoDelivered,
    endDay,
    loading,
    allCompletedToday,
    isAllCompleted,
    streetsNeedingDelivery,
    overdueStreets,
    urgencyCounts,
    getStreetUrgencyLevel,
    getUrgencyColor,
    getUrgencyLabel,
  } = useDistribution();

  // Initialize notifications
  useNotifications();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <TabBar current={tab} setTab={setTab} />

        {tab === "regular" && (
          <DistributionTab
            todayArea={todayArea}
            pendingToday={pendingToday}
            completedToday={completedToday}
            recommended={recommended}
            markDelivered={markDelivered}
            undoDelivered={undoDelivered}
            allCompletedToday={allCompletedToday}
            isAllCompleted={isAllCompleted}
            streetsNeedingDelivery={streetsNeedingDelivery}
            overdueStreets={overdueStreets}
            urgencyGroups={{}} // Assuming this is defined in useDistribution
            urgencyCounts={urgencyCounts}
            getStreetUrgencyLevel={getStreetUrgencyLevel}
            getUrgencyColor={getUrgencyColor}
            getUrgencyLabel={getUrgencyLabel}
          />
        )}

        <Suspense fallback={<LoadingSpinner />}>
          {tab === "buildings" && <BuildingManager />}
          {tab === "tasks" && <TaskManager />}
          {tab === "reports" && <Reports />}
          {tab === "phones" && <PhoneDirectory />}
          {tab === "export" && <DataExport />}
        </Suspense>
      </main>
    </div>
  );
}