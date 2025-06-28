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
import { Street } from "./types";

export default function App() {
  const [tab, setTab] = useState<"regular" | "buildings">("regular");
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
    <>
      <Header />
      <main className="max-w-5xl mx-auto p-4">
        <TabBar current={tab} setTab={setTab} />

        {tab === "regular" && (
          <>
            <AreaToggle area={todayArea} onEnd={endDay} />

            {currentStreet && (
              <div className="mb-6">
                <DeliveryTimer
                  streetName={currentStreet.name}
                  onComplete={handleCompleteDelivery}
                />
              </div>
            )}

            <RouteOptimizer
              streets={pendingToday}
              area={todayArea}
              onOptimize={handleOptimizeRoute}
            />

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-2">מומלץ להיום</h2>
              <div className="overflow-x-auto">
                <StreetTable 
                  list={recommended} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">רחובות נותרים</h2>
              <div className="overflow-x-auto">
                <StreetTable 
                  list={displayStreets} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                />
              </div>
            </section>

            <CompletedToday list={completedToday} onUndo={undoDelivered} />
            <Notifications count={overdue} />
            <WalkingOrder area={todayArea} />
          </>
        )}

        {tab === "buildings" && <BuildingManager />}
      </main>
    </>
  );
}