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
  } = useDistribution();

  // Initialize notifications
  useNotifications();

  const overdue = pendingToday.filter((s) => {
    if (!s.lastDelivered) return true;
    return (
      (Date.now() - new Date(s.lastDelivered).getTime()) / 86_400_000 >= 14
    );
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
                <h3 className="font-semibold text-gray-800">התקדמות יומית</h3>
                <span className="text-sm text-gray-600">
                  אזור {todayArea}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(allCompletedToday.length / totalStreetsInArea) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {allCompletedToday.length} / {totalStreetsInArea}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {isAllCompleted ? "כל הרחובות חולקו!" : `נותרו ${totalStreetsInArea - allCompletedToday.length} רחובות`}
                </span>
                <span>
                  {Math.round((allCompletedToday.length / totalStreetsInArea) * 100)}%
                </span>
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
                {isAllCompleted ? "כל הרחובות (לפי סדר חלוקה)" : "מומלץ להיום"}
                {!isAllCompleted && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {recommended.length}
                  </span>
                )}
              </h2>
              <div className="overflow-x-auto">
                <StreetTable 
                  list={isAllCompleted ? displayStreets : recommended} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                  showCompletionStatus={isAllCompleted}
                />
              </div>
            </section>

            {!isAllCompleted && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  רחובות נותרים
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {displayStreets.length}
                  </span>
                </h2>
                <div className="overflow-x-auto">
                  <StreetTable 
                    list={displayStreets} 
                    onDone={markDelivered}
                    onStartTimer={handleStartTimer}
                  />
                </div>
              </section>
            )}

            <CompletedToday 
              list={completedToday} 
              onUndo={undoDelivered}
              isAllCompleted={isAllCompleted}
              totalCompleted={allCompletedToday.length}
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