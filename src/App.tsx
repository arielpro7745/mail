import { useState, useEffect } from "react";
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
import { FirebaseSetupGuide } from "./components/FirebaseSetupGuide";
import { Street } from "./types";
import { totalDaysBetween } from "./utils/dates";
import { AlertTriangle } from "lucide-react";

export default function App() {
  const [tab, setTab] = useState<"regular" | "buildings" | "tasks" | "reports" | "phones" | "export">("regular");
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

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
    urgencyGroups,
    urgencyCounts,
    getStreetUrgencyLevel,
    getUrgencyColor,
    getUrgencyLabel,
  } = useDistribution();

  // Initialize notifications
  useNotifications();

  // Check for Firebase permission errors
  useEffect(() => {
    const checkFirebaseErrors = () => {
      // Listen for console errors related to Firebase permissions
      const originalError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) {
          setShowFirebaseGuide(true);
        }
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    };

    const cleanup = checkFirebaseErrors();
    return cleanup;
  }, []);

  const overdue = pendingToday.filter((s) => {
    if (!s.lastDelivered) return true;
    return totalDaysBetween(new Date(s.lastDelivered), new Date()) >= 14;
  }).length;

  // מציאת הרחוב שהכי הרבה זמן לא חולק (מכל האזורים)
  const getOldestUndeliveredStreet = () => {
    const today = new Date();
    let oldestStreet: Street | null = null;
    let maxDays = 0;
    
    // בדיקה של כל הרחובות מכל האזורים
    allCompletedToday.concat(pendingToday).forEach(street => {
      if (!street.lastDelivered) {
        // רחוב שלא חולק מעולם - עדיפות עליונה
        if (!oldestStreet || !oldestStreet.lastDelivered) {
          oldestStreet = street;
          maxDays = 999; // ערך גבוה לרחובות שלא חולקו מעולם
        }
      } else {
        const days = totalDaysBetween(new Date(street.lastDelivered), today);
        if (days > maxDays || (days === maxDays && !oldestStreet?.lastDelivered)) {
          oldestStreet = street;
          maxDays = days;
        }
      }
    });
    
    return { street: oldestStreet, days: maxDays };
  };
  
  const { street: oldestStreet, days: oldestDays } = getOldestUndeliveredStreet();
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
      {showFirebaseGuide && <FirebaseSetupGuide />}
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <TabBar current={tab} setTab={setTab} />

        {tab === "regular" && (
          <>
            <AreaToggle area={todayArea} onEnd={endDay} />

            {/* התראה על הרחוב הוותיק ביותר */}
            {oldestStreet && oldestDays >= 7 && (
              <div className={`border rounded-xl p-4 mb-6 shadow-sm ${
                oldestDays === 999 ? 'bg-purple-50 border-purple-300' :
                oldestDays >= 21 ? 'bg-red-50 border-red-300' :
                oldestDays >= 14 ? 'bg-orange-50 border-orange-300' :
                'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} className={
                    oldestDays === 999 ? 'text-purple-600 animate-pulse' :
                    oldestDays >= 21 ? 'text-red-600 animate-pulse' :
                    oldestDays >= 14 ? 'text-orange-600' :
                    'text-yellow-600'
                  } />
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${
                      oldestDays === 999 ? 'text-purple-800' :
                      oldestDays >= 21 ? 'text-red-800' :
                      oldestDays >= 14 ? 'text-orange-800' :
                      'text-yellow-800'
                    }`}>
                      {oldestDays === 999 ? '🆕 רחוב שלא חולק מעולם!' : 
                       oldestDays >= 21 ? '🚨 רחוב קריטי!' :
                       oldestDays >= 14 ? '⚠️ רחוב דחוף!' :
                       '📅 רחוב זקוק לתשומת לב'}
                    </h3>
                    <p className={`text-sm font-medium ${
                      oldestDays === 999 ? 'text-purple-700' :
                      oldestDays >= 21 ? 'text-red-700' :
                      oldestDays >= 14 ? 'text-orange-700' :
                      'text-yellow-700'
                    }`}>
                      <span className="font-bold">{oldestStreet.name}</span> (אזור {oldestStreet.area}) - 
                      {oldestDays === 999 ? ' לא חולק מעולם' : ` ${oldestDays} ימים ללא חלוקה`}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        oldestStreet.area === 12 ? 'bg-purple-100 text-purple-700' :
                        oldestStreet.area === 14 ? 'bg-blue-100 text-blue-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        אזור {oldestStreet.area}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        oldestStreet.isBig ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {oldestStreet.isBig ? 'רחוב גדול' : 'רחוב קטן'}
                      </span>
                      {oldestStreet.lastDelivered && (
                        <span className="text-xs text-gray-600">
                          חולק לאחרונה: {new Date(oldestStreet.lastDelivered).toLocaleDateString('he-IL')}
                        </span>
                      )}
                    </div>
                  </div>
                  {oldestStreet.area === todayArea && (
                    <button
                      onClick={() => markDelivered(oldestStreet.id)}
                      className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                        oldestDays === 999 ? 'bg-purple-500 hover:bg-purple-600' :
                        oldestDays >= 21 ? 'bg-red-500 hover:bg-red-600' :
                        oldestDays >= 14 ? 'bg-orange-500 hover:bg-orange-600' :
                        'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      סמן כחולק עכשיו
                    </button>
                  )}
                </div>
              </div>
            )}
            {/* סטטיסטיקת התקדמות */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">מעקב חלוקה יומי</h3>
                <span className="text-sm text-gray-600">
                  אזור {todayArea}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <span className="text-sm text-red-700 font-medium">דחופים (14+ ימים)</span>
                    <span className="text-xl font-bold text-red-600">{overdueStreets}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
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
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                מומלץ להיום
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {recommended.length}
                </span>
                {urgencyCounts.never > 0 && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    🆕 {urgencyCounts.never} לא חולק
                  </span>
                )}
                {urgencyCounts.critical > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    🚨 {urgencyCounts.critical} קריטי
                  </span>
                )}
                {urgencyCounts.urgent > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    ⚠️ {urgencyCounts.urgent} דחוף
                  </span>
                )}
              </h2>
              <div className="text-xs text-gray-600 bg-green-50 px-3 py-2 rounded mb-3 flex items-center justify-between">
                📅 <strong>מיון לפי דחיפות:</strong> לא חולק מעולם → הכי הרבה ימים → פחות ימים (רחובות גדולים מקבלים עדיפות)
                <span className="text-blue-600 font-medium">אזור נוכחי: {todayArea}</span>
              </div>
              <div className="overflow-x-auto">
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
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                כל הרחובות
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                  {displayStreets.length}
                </span>
                {urgencyCounts.never > 0 && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                    לא חולק: {urgencyCounts.never}
                  </span>
                )}
                {urgencyCounts.critical > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    קריטי: {urgencyCounts.critical}
                  </span>
                )}
                {urgencyCounts.urgent > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                    דחוף: {urgencyCounts.urgent}
                  </span>
                )}
                {urgencyCounts.warning > 0 && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    אזהרה: {urgencyCounts.warning}
                  </span>
                )}
              </h2>
              <div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded mb-3">
                📅 <strong>מיון לפי דחיפות:</strong> לא חולק מעולם → הכי הרבה ימים → פחות ימים (רחובות גדולים מקבלים עדיפות)
              </div>
              <div className="overflow-x-auto">
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