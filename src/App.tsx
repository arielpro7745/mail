import { useState } from "react";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import { useDistribution } from "./hooks/useDistribution";
import { AreaToggle } from "./components/AreaToggle";
import StreetTable from "./components/StreetTable";
import Notifications from "./components/Notifications";
import BuildingManager from "./components/BuildingManager";
import CompletedToday from "./components/CompletedToday";
import WalkingOrder from "./components/WalkingOrder";

export default function App() {
  const [tab, setTab] = useState<"regular" | "buildings">("regular");

  const {
    todayArea,
    pendingToday,
    completedToday,
    recommended,
    markDelivered,
    endDay,
  } = useDistribution();

  const overdue = pendingToday.filter((s) => {
    if (!s.lastDelivered) return true;
    return (
      (Date.now() - new Date(s.lastDelivered).getTime()) / 86_400_000 >= 14
    );
  }).length;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto p-4">
        <TabBar current={tab} setTab={setTab} />

        {tab === "regular" && (
          <>
            <AreaToggle area={todayArea} onEnd={endDay} />

            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-2">מומלץ להיום</h2>
              <div className="overflow-x-auto">
                <StreetTable list={recommended} onDone={markDelivered} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">רחובות נותרים</h2>
              <div className="overflow-x-auto">
                <StreetTable list={pendingToday} onDone={markDelivered} />
              </div>
            </section>

            <CompletedToday list={completedToday} />
            <Notifications count={overdue} />
            <WalkingOrder area={todayArea} />
          </>
        )}

        {tab === "buildings" && <BuildingManager />}
      </main>
    </>
  );
}
