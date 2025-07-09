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
    resetCycle,
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
                <h3 className="font-semibold text-gray-800">מחזור חלוקה (14 ימים כוללים)</h3>
                <span className="text-sm text-gray-600">
                  אזור {todayArea}
                </span>
              </div>
              
              {!isAllCompleted ? (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${((totalStreetsInArea - streetsNeedingDelivery) / totalStreetsInArea) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {totalStreetsInArea - streetsNeedingDelivery} / {totalStreetsInArea}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>נותרו {streetsNeedingDelivery} רחובות לחלוקה</span>
                    <span>{Math.round(((totalStreetsInArea - streetsNeedingDelivery) / totalStreetsInArea) * 100)}%</span>
                  </div>
                  <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    🔄 איפוס אוטומטי כשכל הרחובות חולקו - מחזור חדש של 14 ימים
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full w-full"></div>
                    </div>
                    <span className="text-sm font-medium text-green-700">
                      {allCompletedToday.length} היום
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600">
                    <span>כל הרחובות במחזור הנוכחי חולקו</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-2">
                    <span>✅ כל הרחובות חולקו</span>
                    <button 
                      onClick={resetCycle}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      🔄
                      איפוס מחזור
                    </button>
                  </div>
                </>
              )}
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