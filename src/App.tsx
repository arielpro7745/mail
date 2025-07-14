import { useState } from "react";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import { useDistribution } from "./hooks/useDistribution";
import { useNotifications } from "./hooks/useNotifications";
import { AreaToggle } from "./components/AreaToggle";
import StreetTable from "./components/StreetTable";
import Notifications from "./components/Notifications";
import BuildingManager from "./components/BuildingManager";
import CompletedToday from "./components/CompletedToday";
import WalkingOrder from "./components/WalkingOrder";
import LoadingSpinner from "./components/LoadingSpinner";
import DeliveryTimer from "./components/DeliveryTimer";
import RouteOptimizer from "./components/RouteOptimizer";
import TaskManager from "./components/TaskManager";
import Reports from "./components/Reports";
import PhoneDirectory from "./components/PhoneDirectory";
import DataExport from "./components/DataExport";
import { Street } from "./types";
import { totalDaysBetween } from "./utils/dates";

export default function App() {
  const [tab, setTab] = useState<"regular" | "buildings" | "tasks" | "reports" | "phones" | "export">("regular");
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);

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
    totalStreetsInArea,
    isAllCompleted,
    streetsNeedingDelivery,
    overdueStreets,
    resetCycle,
    getUrgencyLabel,
    groupStreetsByUrgency,
  } = useDistribution();

  // Initialize notifications
  useNotifications();

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

  if (loading) {
    return <LoadingSpinner />;
  }

  const displayStreets = optimizedStreets.length > 0 ? optimizedStreets : pendingToday;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <TabBar current={tab} setTab={setTab} />

        {tab === "regular" && (
          <>
            <AreaToggle area={todayArea} onEnd={endDay} />

            {/* סטטיסטיקת התקדמות */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">מעקב חלוקה יומי</h3>
                <span className="text-sm text-gray-600">
                  אזור {todayArea}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 font-medium">חולקו היום</span>
                    <span className="text-xl font-bold text-blue-600">{allCompletedToday.length}</span>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700 font-medium">ממתינים</span>
                    <span className="text-xl font-bold text-orange-600">{streetsNeedingDelivery}</span>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700 font-medium">דחופים</span>
                    <span className="text-xl font-bold text-red-600">{overdueStreets}</span>
                  </div>
                  <div className="text-xs text-red-600 mt-1">14+ ימים</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700 font-medium">קריטיים</span>
                    <span className="text-xl font-bold text-purple-600">
                      {pendingToday.filter(s => {
                        const days = s.lastDelivered ? totalDaysBetween(new Date(s.lastDelivered), new Date()) : 999;
                        return days >= 20 || days >= 999;
                      }).length}
                    </span>
                  </div>
                  <div className="text-xs text-purple-600 mt-1">20+ ימים או לא חולק</div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 px-3 py-2 rounded-lg border">
                🎯 <strong>מיון חכם לפי דחיפות:</strong> קריטי (20+ ימים/לא חולק) → דחוף (14-19 ימים) → בינוני (10-13 ימים) → נמוך (7-9 ימים) → רגיל (פחות מ-7 ימים)
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
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                מומלץ להיום
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {recommended.length}
                </span>
                {overdueStreets > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    ⚠️ {overdueStreets} דחופים
                  </span>
                )}
              </h2>
              <div className="overflow-x-auto">
                <StreetTable 
                  list={recommended} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                  getUrgencyLabel={getUrgencyLabel}
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                כל הרחובות
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                  {displayStreets.length}
                </span>
              </h2>
              <div className="overflow-x-auto">
                <StreetTable 
                  list={displayStreets} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                  getUrgencyLabel={getUrgencyLabel}
                />
              </div>
            </section>

            <CompletedToday 
              list={completedToday} 
              onUndo={undoDelivered}
              totalCompleted={allCompletedToday.length}
              getUrgencyLabel={getUrgencyLabel}
            />
            
            <Notifications count={overdue} />
            <WalkingOrder area={todayArea} />
          </>
        )}

        {tab === "buildings" && <BuildingManager />}
        {tab === "tasks" && <TaskManager />}
        {tab === "reports" && <Reports />}
        {tab === "phones" && <PhoneDirectory />}
        {tab === "export" && <DataExport />}
      </main>
    </div>
  );
}