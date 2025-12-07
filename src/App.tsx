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
import QuickActions from "./components/QuickActions";
import InteractiveMap from "./components/InteractiveMap";
import VoiceNotifications from "./components/VoiceNotifications";
import AdvancedStats from "./components/AdvancedStats";
import AutoBackup from "./components/AutoBackup";
import NightModeScheduler from "./components/NightModeScheduler";
import GPSExporter from "./components/GPSExporter";
import WhatsAppManager from "./components/WhatsAppManager";
import HolidayManager from "./components/HolidayManager";
import HolidayModeIndicator from "./components/HolidayModeIndicator";
import HolidayAdjustedStreetTable from "./components/HolidayAdjustedStreetTable";
import MailSortingReminder from "./components/MailSortingReminder";
import { useHolidayMode } from "./hooks/useHolidayMode";
import { Street } from "./types";
import { totalDaysBetween } from "./utils/dates";
import { AlertTriangle, Sun, Cloud, Clock, MapPin, TrendingUp, Navigation2, Bell, CheckCircle2, Calendar, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import AIPredictions from "./components/AIPredictions";
import WeatherAlerts from "./components/WeatherAlerts";
import Gamification from "./components/Gamification";
import PersonalJournal from "./components/PersonalJournal";
import ResidentComplaints from "./components/ResidentComplaints";
import UnknownResidents from "./components/UnknownResidents";
import AreaScheduleIndicator from "./components/AreaScheduleIndicator";
import DailyTaskGenerator from "./components/DailyTaskGenerator";
import AreaSortingManager from "./components/AreaSortingManager";
import SmartAreaReorganizer from "./components/SmartAreaReorganizer";
import IntelligentAreaOptimizer from "./components/IntelligentAreaOptimizer";
import ManualAreaOrganizer from "./components/ManualAreaOrganizer";
import GeographicAreaAnalysis from "./components/GeographicAreaAnalysis";
import DailyWorkTracker from "./components/DailyWorkTracker";
import DailyFlyersDistribution from "./components/DailyFlyersDistribution";
import DailySuccessTasks from "./components/DailySuccessTasks";
import DualAreaWorkflow from "./components/DualAreaWorkflow";
import { getTodayAreaSchedule, getTomorrowAreaSchedule } from "./utils/areaRotation";
import { getAreaColor, getAreaName } from "./utils/areaColors";

// === Inline Smart Components ===

// דשבורד יומי חכם
function SmartDashboard({ todayArea, completedCount, pendingCount }: { todayArea: number; completedCount: number; pendingCount: number }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const areaColor = getAreaColor(todayArea);
  const tomorrowSchedule = getTomorrowAreaSchedule();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';
  const progress = pendingCount + completedCount > 0 ? Math.round((completedCount / (pendingCount + completedCount)) * 100) : 0;

  return (
    <div className={`${areaColor.bgLight} rounded-2xl p-5 mb-6 border-2 ${areaColor.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{greeting}! 👋</h2>
          <p className="text-gray-600">
            {currentTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-gray-600">
            <Sun className="text-yellow-500" size={20} />
            <span>24°C - בהיר</span>
          </div>
          <p className="text-xs text-gray-500">פתח תקווה</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className={`${areaColor.bgSolid} text-white rounded-xl p-3 text-center`}>
          <MapPin size={20} className="mx-auto mb-1" />
          <div className="text-xl font-bold">אזור {todayArea}</div>
          <div className="text-xs opacity-80">{getAreaName(todayArea)}</div>
        </div>
        <div className="bg-green-500 text-white rounded-xl p-3 text-center">
          <CheckCircle2 size={20} className="mx-auto mb-1" />
          <div className="text-xl font-bold">{completedCount}</div>
          <div className="text-xs opacity-80">הושלמו</div>
        </div>
        <div className="bg-orange-500 text-white rounded-xl p-3 text-center">
          <Clock size={20} className="mx-auto mb-1" />
          <div className="text-xl font-bold">{pendingCount}</div>
          <div className="text-xs opacity-80">ממתינים</div>
        </div>
        <div className="bg-blue-500 text-white rounded-xl p-3 text-center">
          <Calendar size={20} className="mx-auto mb-1" />
          <div className="text-xl font-bold">אזור {tomorrowSchedule.area}</div>
          <div className="text-xs opacity-80">מחר</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">התקדמות יומית</span>
          <span className="font-bold text-gray-800">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${areaColor.bgSolid} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// התראות חכמות
function SmartNotificationsInline({ pendingCount, overdueCount }: { pendingCount: number; overdueCount: number }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const hour = new Date().getHours();

  const notifications = [];

  if (hour >= 6 && hour < 10 && pendingCount > 0) {
    notifications.push({ id: 'morning', type: 'info', message: `בוקר טוב! יש לך ${pendingCount} רחובות לחלוקה היום`, icon: Sun });
  }
  if (overdueCount > 0) {
    notifications.push({ id: 'overdue', type: 'warning', message: `${overdueCount} רחובות באיחור - מעל 14 ימים`, icon: AlertTriangle });
  }
  if (hour >= 12 && hour < 14 && pendingCount > 5) {
    notifications.push({ id: 'lunch', type: 'info', message: 'זמן טוב להפסקה קצרה לפני המשך החלוקה', icon: Clock });
  }

  const visibleNotifications = notifications.filter(n => !dismissed.includes(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleNotifications.map(notif => (
        <div
          key={notif.id}
          className={`flex items-center gap-3 p-3 rounded-xl ${
            notif.type === 'warning' ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <notif.icon size={20} className={notif.type === 'warning' ? 'text-orange-500' : 'text-blue-500'} />
          <span className="flex-1 text-sm">{notif.message}</span>
          <button
            onClick={() => setDismissed([...dismissed, notif.id])}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// סדר הליכה אופטימלי
function OptimalWalkingOrderInline({ todayArea }: { todayArea: number }) {
  const [expanded, setExpanded] = useState(false);
  const areaColor = getAreaColor(todayArea);

  const walkOrders: Record<number, string[]> = {
    12: ["דוד צבי פינקס", "התשעים ושלוש", "הכרם", "הרב קוק", "זכרון משה", "אנה פרנק", "חיים כהן", "מנדלסון", "שבדיה"],
    14: ["הדף היומי", "רוטשילד 110-132", "רוטשילד 134-150", "גד מכנס", "רוטשילד 179-143", "קק\"ל"],
    45: ["אחד העם", "הרצל", "ביאליק", "ז'בוטינסקי", "בן יהודה", "אלנבי"]
  };

  const streets = walkOrders[todayArea] || [];

  return (
    <div className={`rounded-2xl overflow-hidden mb-6 border-2 ${areaColor.border}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full ${areaColor.bgSolid} px-5 py-4 text-white flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <Navigation2 size={22} />
          <div className="text-right">
            <h3 className="font-bold">סדר הליכה מומלץ - אזור {todayArea}</h3>
            <p className="text-sm opacity-80">{streets.length} רחובות</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <div className="bg-white p-4">
          <div className="space-y-2">
            {streets.map((street, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className={`w-7 h-7 ${areaColor.bgSolid} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                  {idx + 1}
                </span>
                <span className="flex-1 font-medium">{street}</span>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(street + ' פתח תקווה')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<"regular" | "buildings" | "holidays" | "tasks" | "reports" | "phones" | "export" | "whatsapp" | "advanced" | "ai" | "gamification" | "journal" | "complaints" | "unknowns" | "sorting">("regular");
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  
  // הוק מצב חג
  const { isHolidayMode } = useHolidayMode();

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

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      if (e.detail === 'unknowns') {
        setTab('unknowns');
      }
    };
    window.addEventListener('navigate-to-tab', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate-to-tab', handleNavigate as EventListener);
    };
  }, []);

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
  const getOldestUndeliveredStreets = (count = 3) => {
    const today = new Date();
    const streetsByUrgency: Array<{street: Street, days: number}> = [];
    
    // בדיקה של כל הרחובות מכל האזורים
    const allStreets = [...new Set([...allCompletedToday, ...pendingToday])]; // הסרת כפילויות
    
    allStreets.forEach(street => {
      if (!street.lastDelivered) {
        streetsByUrgency.push({street, days: 999});
      } else {
        const days = totalDaysBetween(new Date(street.lastDelivered), today);
        streetsByUrgency.push({street, days});
      }
    });
    
    // מיון לפי דחיפות: לא חולק מעולם ראשון, אחר כך לפי מספר ימים
    return streetsByUrgency
      .sort((a, b) => {
        if (a.days === 999 && b.days !== 999) return -1;
        if (b.days === 999 && a.days !== 999) return 1;
        if (a.days !== b.days) return b.days - a.days;
        // אם אותו מספר ימים, רחובות גדולים קודם
        if (a.street.isBig !== b.street.isBig) return a.street.isBig ? -1 : 1;
        return a.street.name.localeCompare(b.street.name);
      })
      .slice(0, count)
      .filter(item => item.days >= 7); // רק רחובות שעברו לפחות שבוע
  };
  
  const criticalStreets = getOldestUndeliveredStreets(3);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* תבנית רקע דקורטיבית */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {showFirebaseGuide && <FirebaseSetupGuide />}
      <DailyTaskGenerator />
      <MailSortingReminder currentArea={todayArea} />
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <TabBar current={tab} setTab={setTab} />

        {tab === "regular" && (
          <>
            {/* התראות חכמות */}
            <SmartNotificationsInline pendingCount={streetsNeedingDelivery} overdueCount={overdueStreets} />

            {/* דשבורד יומי חכם */}
            <SmartDashboard todayArea={todayArea} completedCount={allCompletedToday.length} pendingCount={streetsNeedingDelivery} />

            {/* סדר הליכה אופטימלי */}
            <OptimalWalkingOrderInline todayArea={todayArea} />

            {/* אינדיקטור מצב חג */}
            <HolidayModeIndicator />

            {/* אינדיקטור מחזור אזורים */}
            <AreaScheduleIndicator />

            {/* תהליך עבודה יומי - הכנה וחלוקה */}
            <div className="mb-6">
              <DualAreaWorkflow />
            </div>

            <AreaToggle area={todayArea} onEnd={endDay} />

            {/* התראה על הרחובות הוותיקים ביותר */}
            {criticalStreets.length > 0 && (
              <div className="space-y-3 mb-6">
                {criticalStreets.map(({street, days}, index) => {
                  const isFirst = index === 0;
                  const bgColor = days === 999 ? 'bg-purple-50 border-purple-300' :
                                 days >= 21 ? 'bg-red-50 border-red-300' :
                                 days >= 14 ? 'bg-orange-50 border-orange-300' :
                                 'bg-yellow-50 border-yellow-300';
                  
                  const textColor = days === 999 ? 'text-purple-600' :
                                   days >= 21 ? 'text-red-600' :
                                   days >= 14 ? 'text-orange-600' :
                                   'text-yellow-600';
                  
                  const headerColor = days === 999 ? 'text-purple-800' :
                                     days >= 21 ? 'text-red-800' :
                                     days >= 14 ? 'text-orange-800' :
                                     'text-yellow-800';
                  
                  const buttonColor = days === 999 ? 'bg-purple-500 hover:bg-purple-600' :
                                     days >= 21 ? 'bg-red-500 hover:bg-red-600' :
                                     days >= 14 ? 'bg-orange-500 hover:bg-orange-600' :
                                     'bg-yellow-500 hover:bg-yellow-600';

                  return (
                    <div key={street.id} className={`border rounded-xl p-4 shadow-sm ${bgColor} ${isFirst ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className={`${textColor} ${days >= 14 ? 'animate-pulse' : ''}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isFirst && (
                              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                #1 הכי דחוף
                              </span>
                            )}
                            <h3 className={`font-bold text-lg ${headerColor}`}>
                              {days === 999 ? '🆕 רחוב שלא חולק מעולם!' : 
                               days >= 21 ? '🚨 רחוב קריטי!' :
                               days >= 14 ? '⚠️ רחוב דחוף!' :
                               '📅 רחוב זקוק לתשומת לב'}
                            </h3>
                          </div>
                          <p className={`text-sm font-medium ${headerColor.replace('800', '700')}`}>
                            <span className="font-bold">{street.name}</span> (אזור {street.area}) - 
                            {days === 999 ? ' לא חולק מעולם' : ` ${days} ימים ללא חלוקה`}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              street.area === 12 ? 'bg-purple-100 text-purple-700' :
                              street.area === 14 ? 'bg-blue-100 text-blue-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              אזור {street.area}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              street.isBig ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {street.isBig ? 'רחוב גדול' : 'רחוב קטן'}
                            </span>
                            {street.lastDelivered && (
                              <span className="text-xs text-gray-600">
                                חולק לאחרונה: {new Date(street.lastDelivered).toLocaleDateString('he-IL')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {street.area === todayArea && (
                            <button
                              onClick={() => markDelivered(street.id)}
                              className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg ${buttonColor}`}
                            >
                              סמן כחולק עכשיו
                            </button>
                          )}
                          {street.area !== todayArea && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                              יטופל באזור {street.area}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              {/* טבלה מותאמת לחגים או רגילה */}
              {isHolidayMode ? (
                <HolidayAdjustedStreetTable
                  list={recommended} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                  getStreetUrgencyLevel={getStreetUrgencyLevel}
                  getUrgencyColor={getUrgencyColor}
                  getUrgencyLabel={getUrgencyLabel}
                />
              ) : (
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
              )}
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
              {/* טבלה מותאמת לחגים או רגילה */}
              {isHolidayMode ? (
                <HolidayAdjustedStreetTable
                  list={displayStreets} 
                  onDone={markDelivered}
                  onStartTimer={handleStartTimer}
                  getStreetUrgencyLevel={getStreetUrgencyLevel}
                  getUrgencyColor={getUrgencyColor}
                  getUrgencyLabel={getUrgencyLabel}
                />
              ) : (
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
              )}
            </section>

            <CompletedToday 
              list={completedToday} 
              onUndo={undoDelivered}
              totalCompleted={allCompletedToday.length}
            />
            
            {/* תכונות מתקדמות */}
            <div className="mt-8">
              <button
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 shadow-lg mb-4"
              >
                <span className="text-lg">🚀</span>
                {showAdvancedFeatures ? 'הסתר תכונות מתקדמות' : 'הצג תכונות מתקדמות'}
              </button>

              {showAdvancedFeatures && (
                <div className="space-y-6">
                  {/* מפה אינטראקטיבית */}
                  <InteractiveMap 
                    buildings={[]} 
                    currentArea={todayArea}
                    completedToday={completedToday}
                  />
                  
                  {/* התראות קוליות */}
                  <VoiceNotifications 
                    onStreetCompleted={(streetName) => console.log(`Street completed: ${streetName}`)}
                  />
                  
                  {/* סטטיסטיקות מתקדמות */}
                  <AdvancedStats />
                  
                  {/* גיבוי אוטומטי */}
                  <AutoBackup />
                  
                  {/* מצב לילה אוטומטי */}
                  <NightModeScheduler />
                  
                  {/* ייצוא GPS */}
                  <GPSExporter 
                    buildings={[]}
                    currentArea={todayArea}
                    optimizedRoute={optimizedStreets}
                  />
                </div>
              )}
            </div>
            
            <Notifications count={overdue} />
            <WalkingOrder area={todayArea} />
          </>
        )}

        {tab === "buildings" && <BuildingManager />}
        {tab === "holidays" && <HolidayManager />}
        {tab === "tasks" && <TaskManager />}
        {tab === "reports" && <Reports />}
        {tab === "phones" && <PhoneDirectory />}
        {tab === "export" && <DataExport />}
        {tab === "whatsapp" && <WhatsAppManager />}
        {tab === "ai" && (
          <div className="space-y-6">
            <WeatherAlerts />
            <AIPredictions />
          </div>
        )}
        {tab === "sorting" && (
          <div className="space-y-6">
            <GeographicAreaAnalysis />
          </div>
        )}
        {tab === "gamification" && <Gamification />}
        {tab === "journal" && <PersonalJournal />}
        {tab === "complaints" && <ResidentComplaints />}
        {tab === "unknowns" && <UnknownResidents />}
        {tab === "advanced" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🚀 תכונות מתקדמות</h2>
              <p className="text-gray-600">כלים חכמים לניהול מתקדם של חלוקת הדואר</p>
            </div>
            
            {/* מפה אינטראקטיבית */}
            <InteractiveMap 
              buildings={[]} 
              currentArea={todayArea}
              completedToday={completedToday}
            />
            
            {/* התראות קוליות */}
            <VoiceNotifications 
              onStreetCompleted={(streetName) => console.log(`Street completed: ${streetName}`)}
            />
            
            {/* סטטיסטיקות מתקדמות */}
            <AdvancedStats />
            
            {/* גיבוי אוטומטי */}
            <AutoBackup />
            
            {/* מצב לילה אוטומטי */}
            <NightModeScheduler />
            
            {/* ייצוא GPS */}
            <GPSExporter 
              buildings={[]}
              currentArea={todayArea}
              optimizedRoute={optimizedStreets}
            />
          </div>
        )}
      </main>
    </div>
  );
}