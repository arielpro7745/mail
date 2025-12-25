import { useState, useEffect, useMemo } from "react";
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
import TaskManager from "./components/TaskManager";
import Reports from "./components/Reports";
import PhoneDirectory from "./components/PhoneDirectory";
import DataExport from "./components/DataExport";
import { FirebaseSetupGuide } from "./components/FirebaseSetupGuide";
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
// התיקון: הוספנו את כל האייקונים החסרים כדי למנוע קריסה
import { 
  AlertTriangle, 
  Sun, 
  Coffee, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Info, 
  CalendarClock, 
  Cloud, 
  CheckCircle2, 
  Navigation2, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import AIPredictions from "./components/AIPredictions";
import WeatherAlerts from "./components/WeatherAlerts";
import Gamification from "./components/Gamification";
import PersonalJournal from "./components/PersonalJournal";
import ResidentComplaints from "./components/ResidentComplaints";
import UnknownResidents from "./components/UnknownResidents";
import DailyTaskGenerator from "./components/DailyTaskGenerator";
import GeographicAreaAnalysis from "./components/GeographicAreaAnalysis";
import { getAreaColor } from "./utils/areaColors";

// === הגדרת סבב 15 הימים (המוח החדש של האפליקציה) ===
// הסדר: ירוק (חמישי) -> חופש (שישי/שבת) -> כחול (ראשון) -> אדום (שני)
const SCHEDULE_15_DAYS = [
  // שבוע 1
  { day: 1, area: 45, title: "ויצמן והצפון", color: "blue", streets: ["ויצמן", "ליסין", "מרטין בובר"], tips: "שים לב: ויצמן 33 (עמוס), 9 ו-7." },
  { day: 2, area: 14, title: "רוטשילד זוגי (הכבד)", color: "red", streets: ["הדף היומי", "רוטשילד", "גד מכנס"], tips: "רוטשילד צד זוגי בלבד! (110-182). זהירות בכניסות." },
  { day: 3, area: 12, title: "צפון 12 (ה-93)", color: "green", streets: ["רוטשילד 100", "דוד צבי פנקס", "התשעים ושלוש"], tips: "המוקד היום: התשעים ושלוש." },
  { day: 4, area: 45, title: "היבנר סולו", color: "blue", streets: ["היבנר"], tips: "יום פיזי קשה. כל הרחוב: זוגי יורד, אי-זוגי עולה." },
  
  // === יום חמישי 25.12 (היום) ===
  { day: 5, area: 12, title: "אמצע 12 (היום)", color: "green", streets: ["הרב קוק", "הכרם", "זכרון משה", "אנה פרנק"], tips: "יום רגוע יחסית. להכין את הגוף לסופ\"ש." },
  
  // === יום ראשון 28.12 ===
  { day: 6, area: 45, title: "דגל ראובן סולו", color: "blue", streets: ["דגל ראובן"], tips: "פותחים שבוע בכחול: הליכה ישרה בדגל ראובן." },
  
  // === יום שני 29.12 ===
  { day: 7, area: 14, title: "רוטשילד אי-זוגי (הקל)", color: "red", streets: ["רוטשילד", "קק\"ל", "קרן קיימת"], tips: "יום שני אדום: רוטשילד אי-זוגי בלבד! לא לשכוח להיכנס לקק\"ל." },
  
  { day: 8, area: 12, title: "דרום 12 (הגשר)", color: "green", streets: ["חיים כהן", "מנדלסון", "האחים ראב", "שבדיה"], tips: "זהירות בחיים כהן." },
  { day: 9, area: 45, title: "דרום 45 (יטקובסקי)", color: "blue", streets: ["מירקין", "ברטונוב", "הפרטיזנים", "סנדרוב", "שטרן", "אחים יטקובסקי"], tips: "יטקובסקי: לשים לב ל-37 ו-36." },
  
  // סיבוב שני - חזרות על העמוסים (ימים 10-15)
  { day: 10, area: 45, title: "ויצמן (חזרה)", color: "blue", streets: ["ויצמן", "ליסין", "מרטין בובר"], tips: "סיבוב שני. לוודא שאין שאריות." },
  { day: 11, area: 14, title: "רוטשילד זוגי (חזרה)", color: "red", streets: ["הדף היומי", "רוטשילד", "גד מכנס"], tips: "סיבוב שני. לבדוק את בתי האבות." },
  { day: 12, area: 12, title: "ה-93 (חזרה)", color: "green", streets: ["רוטשילד 100", "דוד צבי פנקס", "התשעים ושלוש"], tips: "סיבוב שני." },
  { day: 13, area: 45, title: "היבנר (חזרה)", color: "blue", streets: ["היבנר"], tips: "סיבוב שני. כוח!" },
  { day: 14, area: 12, title: "הרב קוק (חזרה)", color: "green", streets: ["הרב קוק", "הכרם", "זכרון משה", "אנה פרנק"], tips: "סיבוב שני." },
  { day: 15, area: 45, title: "דגל ראובן (חזרה)", color: "blue", streets: ["דגל ראובן"], tips: "סיבוב שני וסיום הסבב." }
];

// === פונקציית עזר לחישוב אוטומטי של היום בסבב ===
const calculateAutoCycleDay = () => {
  try {
    const anchorDate = new Date('2025-12-25T00:00:00'); // יום חמישי - יום 5 בסבב
    const anchorCycleDay = 5;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // אם התאריך הוא לפני העוגן, נחזיר 5 (ברירת מחדל להתחלה)
    if (today < anchorDate) return 5;
    
    let workDaysPassed = 0;
    let currentDate = new Date(anchorDate);
    
    // מנגנון הגנה: לא לרוץ יותר מדי שנים קדימה כדי למנוע תקיעה
    let safetyCounter = 0;
    while (currentDate < today && safetyCounter < 1000) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      // סופרים רק אם זה לא שישי (5) ולא שבת (6)
      if (dayOfWeek !== 5 && dayOfWeek !== 6) {
        workDaysPassed++;
      }
      safetyCounter++;
    }
    
    let currentCycle = (anchorCycleDay + workDaysPassed) % 15;
    if (currentCycle === 0) currentCycle = 15;
    
    return currentCycle;
  } catch (e) {
    console.error("Error calculating cycle day", e);
    return 5; // ברירת מחדל במקרה שגיאה
  }
};

// === דשבורד חכם ===
function CycleDashboard({ 
  cycleDay, 
  setCycleDay, 
  completedCount, 
  pendingCount,
  currentArea
}: { 
  cycleDay: number; 
  setCycleDay: (day: number) => void;
  completedCount: number; 
  pendingCount: number;
  currentArea: number;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // מנגנון הגנה: אם הלו"ז לא נמצא, משתמשים ביום הראשון
  const currentSchedule = SCHEDULE_15_DAYS.find(s => s.day === cycleDay) || SCHEDULE_15_DAYS[0];
  const areaColor = getAreaColor(currentSchedule.area);
  const isAreaMismatch = currentArea !== currentSchedule.area;

  const isWeekend = currentTime.getDay() === 5 || currentTime.getDay() === 6;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const nextDay = () => setCycleDay(cycleDay === 15 ? 1 : cycleDay + 1);
  const prevDay = () => setCycleDay(cycleDay === 1 ? 15 : cycleDay - 1);
  const progress = pendingCount + completedCount > 0 ? Math.round((completedCount / (pendingCount + completedCount)) * 100) : 0;

  if (isWeekend) {
    const nextDayNum = cycleDay === 15 ? 1 : cycleDay + 1;
    const nextSchedule = SCHEDULE_15_DAYS.find(s => s.day === nextDayNum);
    const nextAreaColor = getAreaColor(nextSchedule?.area || 45);

    return (
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">סוף שבוע נעים! ☕</h2>
            <p className="opacity-90">זמן לנוח ולצבור כוחות.</p>
          </div>
          <Coffee size={48} className="opacity-80" />
        </div>
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <h3 className="font-bold mb-2 text-sm opacity-90">התוכנית ליום ראשון (יום {nextDayNum}):</h3>
          <div className="flex items-center gap-3">
             <span className={`${nextAreaColor.bgSolid} px-2 py-1 rounded text-sm font-bold shadow-sm`}>
               אזור {nextSchedule?.area}
             </span>
             <span className="font-medium text-lg">{nextSchedule?.title}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${areaColor.bgLight} rounded-2xl p-5 mb-6 border-2 ${areaColor.border} shadow-sm transition-all duration-300 relative overflow-hidden`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className={`${areaColor.bgSolid} text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
               יום {cycleDay} / 15
             </span>
             <span className="text-gray-500 text-xs font-medium bg-white/60 px-2 py-1 rounded-full border border-gray-100 flex items-center gap-1">
               <CalendarClock size={12} />
               {currentTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
             </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{currentSchedule.title}</h2>
        </div>
        
        <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1 self-start md:self-auto">
          <button onClick={prevDay} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
            <ArrowRight size={20} />
          </button>
          <div className="px-4 font-bold text-gray-700 border-x border-gray-100 min-w-[80px] text-center">
            יום {cycleDay}
          </div>
          <button onClick={nextDay} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      {isAreaMismatch && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg flex items-start gap-3 animate-pulse shadow-sm">
           <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
           <div>
             <p className="font-bold text-red-800 text-sm">שים לב! אזור לא תואם</p>
             <p className="text-red-700 text-sm">
               התוכנית להיום היא ב<strong>אזור {currentSchedule.area}</strong>, אך האפליקציה באזור {currentArea}.
               <br/>
               <button 
                 onClick={() => document.getElementById('area-toggle-btn')?.click()}
                 className="underline font-bold hover:text-red-900 mt-1"
               >
                 לחץ כאן להחלפת אזור
               </button>
             </p>
           </div>
        </div>
      )}

      <div className="bg-white/80 border border-yellow-200 rounded-xl p-3 mb-4 flex items-start gap-3 shadow-sm">
        <div className="bg-yellow-100 p-2 rounded-full shrink-0">
           <Info className="text-yellow-700" size={18} />
        </div>
        <div>
          <span className="font-bold text-gray-800 block text-sm">💡 טיפ מקצועי להיום:</span>
          <span className="text-gray-700 text-sm">{currentSchedule.tips}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/60 rounded-xl p-3 text-center border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{pendingCount}</div>
          <div className="text-xs text-gray-500 font-medium">נותרו</div>
        </div>
        <div className="bg-green-100/50 rounded-xl p-3 text-center border border-green-100">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-xs text-green-600 font-medium">הושלמו</div>
        </div>
        <div className="bg-blue-100/50 rounded-xl p-3 text-center border border-blue-100">
          <div className="text-2xl font-bold text-blue-600">{progress}%</div>
          <div className="text-xs text-blue-600 font-medium">התקדמות</div>
        </div>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${areaColor.bgSolid} transition-all duration-500`} 
          style={{ width: `${progress}%` }} 
        />
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
    notifications.push({ id: 'morning', type: 'info', message: `בוקר טוב! יום מוצלח ושמור על עצמך בדרכים`, icon: Sun });
  }
  notifications.push({ id: 'weather', type: 'info', message: `תחזית להיום: נעים לחלוקה. שמים בהירים.`, icon: Cloud });
  
  if (overdueCount > 0) {
    notifications.push({ id: 'overdue', type: 'warning', message: `${overdueCount} רחובות באיחור - מעל 14 ימים`, icon: AlertTriangle });
  }

  const visibleNotifications = notifications.filter(n => !dismissed.includes(n.id));
  if (visibleNotifications.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleNotifications.map(notif => (
        <div key={notif.id} className={`flex items-center gap-3 p-3 rounded-xl shadow-sm ${notif.type === 'warning' ? 'bg-orange-50 border border-orange-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'}`}>
          <notif.icon size={20} className={notif.type === 'warning' ? 'text-orange-500' : 'text-blue-500'} />
          <span className="flex-1 text-sm font-medium text-gray-800">{notif.message}</span>
          <button onClick={() => setDismissed([...dismissed, notif.id])} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
        </div>
      ))}
    </div>
  );
}

// סדר הליכה
function OptimalWalkingOrderInline({ streets }: { streets: string[] }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={`rounded-2xl overflow-hidden mb-6 border-2 border-indigo-100 shadow-sm bg-white`}>
      <button onClick={() => setExpanded(!expanded)} className={`w-full bg-indigo-50 px-5 py-4 text-indigo-900 flex items-center justify-between hover:bg-indigo-100 transition-colors`}>
        <div className="flex items-center gap-3">
          <Navigation2 size={22} className="text-indigo-600" />
          <div className="text-right">
            <h3 className="font-bold text-lg">מסלול הליכה להיום</h3>
            <p className="text-sm opacity-70">{streets.length} רחובות מתוכננים</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expanded && (
        <div className="bg-white p-4">
          <div className="space-y-2">
            {streets.map((street, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                <span className={`w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm`}>{idx + 1}</span>
                <span className="flex-1 font-bold text-gray-800">{street}</span>
                <a href={`https://waze.com/ul?q=${encodeURIComponent(street + ' פתח תקווה')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-full border border-blue-100"><Navigation2 size={16} /></a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// === MAIN APP COMPONENT ===

export default function App() {
  const [tab, setTab] = useState<"regular" | "buildings" | "holidays" | "tasks" | "reports" | "phones" | "export" | "whatsapp" | "advanced" | "ai" | "gamification" | "journal" | "complaints" | "unknowns" | "sorting">("regular");
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  
  // === ניהול מחזור 15 הימים עם סנכרון אוטומטי ===
  const [cycleDay, setCycleDay] = useState<number>(() => calculateAutoCycleDay());
  const [isWeekend, setIsWeekend] = useState(false);

  // אופציה לאפס ידנית את הסנכרון
  const syncToDate = () => {
    setCycleDay(calculateAutoCycleDay());
  };
  
  // בדיקת יום בשבוע בכל טעינה
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    setIsWeekend(day === 5 || day === 6);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("currentCycleDay", cycleDay.toString());
  }, [cycleDay]);
  
  const { isHolidayMode } = useHolidayMode();
  const { todayArea, pendingToday, completedToday, markDelivered, undoDelivered, endDay, loading, allCompletedToday, streetsNeedingDelivery, overdueStreets, getStreetUrgencyLevel, getUrgencyColor, getUrgencyLabel } = useDistribution();

  useNotifications();

  // === לוגיקה קריטית: סינון רחובות לפי הסבב ===
  const currentDaySchedule = useMemo(() => {
    return SCHEDULE_15_DAYS.find(s => s.day === cycleDay) || SCHEDULE_15_DAYS[0];
  }, [cycleDay]);

  const cycleDisplayStreets = useMemo(() => {
    if (todayArea !== currentDaySchedule.area) return [];
    return pendingToday.filter(street => {
       return currentDaySchedule.streets.some(scheduledName => 
         street.name.includes(scheduledName) || scheduledName.includes(street.name)
       );
    });
  }, [pendingToday, currentDaySchedule, todayArea]);

  const completedCycleToday = useMemo(() => {
    return allCompletedToday.filter(street => 
      street.area === currentDaySchedule.area &&
      currentDaySchedule.streets.some(scheduledName => street.name.includes(scheduledName))
    );
  }, [allCompletedToday, currentDaySchedule]);

  const handleStartTimer = (street: Street) => { setCurrentStreet(street); };
  const handleCompleteDelivery = (timeInMinutes: number) => {
    if (currentStreet) { markDelivered(currentStreet.id, timeInMinutes); setCurrentStreet(null); }
  };

  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => { if (e.detail === 'unknowns') setTab('unknowns'); };
    window.addEventListener('navigate-to-tab', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-to-tab', handleNavigate as EventListener);
  }, []);

  useEffect(() => {
    const checkFirebaseErrors = () => {
      const originalError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('permission-denied') || message.includes('Missing or insufficient permissions')) { setShowFirebaseGuide(true); }
        originalError.apply(console, args);
      };
      return () => { console.error = originalError; };
    };
    return checkFirebaseErrors();
  }, []);

  const overdue = pendingToday.filter((s) => {
    if (!s.lastDelivered) return true;
    return totalDaysBetween(new Date(s.lastDelivered), new Date()) >= 14;
  }).length;

  if (loading) { return <LoadingSpinner />; }
  const streetsToShow = optimizedStreets.length > 0 ? optimizedStreets : cycleDisplayStreets;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      {showFirebaseGuide && <FirebaseSetupGuide />}
      <DailyTaskGenerator />
      <MailSortingReminder currentArea={currentDaySchedule.area} />
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <TabBar current={tab} setTab={setTab} />

        {tab === "regular" && (
          <>
            <CycleDashboard 
              cycleDay={cycleDay} 
              setCycleDay={setCycleDay}
              completedCount={completedCycleToday.length}
              pendingCount={streetsToShow.length}
              currentArea={todayArea}
            />

            {!isWeekend && (
              <>
                <div className="flex justify-end mb-2">
                  <button onClick={syncToDate} className="text-xs text-blue-600 underline flex items-center gap-1 hover:text-blue-800 transition-colors">
                    <Calendar size={12} /> סנכרן מחדש לתאריך של היום
                  </button>
                </div>

                <SmartNotificationsInline pendingCount={streetsToShow.length} overdueCount={overdueStreets} />

                <section className="mb-8">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    רשימת חלוקה להיום
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">{streetsToShow.length}</span>
                  </h2>
                  
                  <div className="text-xs text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg mb-3 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <strong>מצב מיקוד 15 יום:</strong> מוצגים רק הרחובות המתוכננים להיום.
                  </div>

                  {isHolidayMode ? (
                    <HolidayAdjustedStreetTable
                      list={streetsToShow} onDone={markDelivered} onStartTimer={handleStartTimer}
                      getStreetUrgencyLevel={getStreetUrgencyLevel} getUrgencyColor={getUrgencyColor} getUrgencyLabel={getUrgencyLabel}
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      {streetsToShow.length > 0 ? (
                        <StreetTable 
                          list={streetsToShow} onDone={markDelivered} onStartTimer={handleStartTimer}
                          getStreetUrgencyLevel={getStreetUrgencyLevel} getUrgencyColor={getUrgencyColor} getUrgencyLabel={getUrgencyLabel}
                        />
                      ) : (
                        <div className="text-center p-10 bg-white rounded-xl border border-dashed border-gray-300">
                          {todayArea !== currentDaySchedule.area ? (
                            <div className="text-orange-500">
                              <AlertTriangle className="mx-auto mb-2" size={32} />
                              <h3 className="text-lg font-bold">אזור לא תואם</h3>
                              <p>היום עובדים באזור {currentDaySchedule.area} (יום {cycleDay}).<br/>אבל האפליקציה כרגע באזור {todayArea}.</p>
                              {/* הסרתי את forceArea כדי למנוע את המסך הלבן */}
                              <div className="mt-4" id="area-toggle-btn">
                                <AreaToggle area={todayArea} onEnd={endDay} />
                              </div>
                            </div>
                          ) : (
                            <div className="text-green-500">
                              <CheckCircle2 className="mx-auto mb-2" size={32} />
                              <h3 className="text-lg font-bold">הכל הושלם להיום!</h3>
                              <p>אין רחובות ממתינים בתוכנית היומית.</p>
                              <button onClick={() => setCycleDay(cycleDay === 15 ? 1 : cycleDay + 1)} className="mt-2 text-blue-600 underline">עבור ידנית ליום הבא</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <div className="mb-6">
                   <AreaToggle area={todayArea} onEnd={endDay} />
                </div>

                {currentStreet && (
                  <div className="mb-6">
                    <DeliveryTimer streetName={currentStreet.name} onComplete={handleCompleteDelivery} />
                  </div>
                )}
                
                <OptimalWalkingOrderInline streets={currentDaySchedule.streets} />
                <HolidayModeIndicator />
                <CompletedToday list={completedCycleToday} onUndo={undoDelivered} totalCompleted={completedCycleToday.length} />
                
                <div className="mt-8">
                  <button onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 shadow-lg mb-4">
                    <span className="text-lg">🚀</span> {showAdvancedFeatures ? 'הסתר תכונות מתקדמות' : 'הצג תכונות מתקדמות'}
                  </button>

                  {showAdvancedFeatures && (
                    <div className="space-y-6">
                      <InteractiveMap buildings={[]} currentArea={todayArea} completedToday={completedToday} />
                      <VoiceNotifications onStreetCompleted={(streetName) => console.log(`Street completed: ${streetName}`)} />
                      <AdvancedStats />
                      <AutoBackup />
                      <NightModeScheduler />
                      <GPSExporter buildings={[]} currentArea={todayArea} optimizedRoute={optimizedStreets} />
                    </div>
                  )}
                </div>
                
                <Notifications count={overdue} />
              </>
            )}
          </>
        )}

        {/* שאר הטאבים */}
        {tab === "buildings" && <BuildingManager />}
        {tab === "holidays" && <HolidayManager />}
        {tab === "tasks" && <TaskManager />}
        {tab === "reports" && <Reports />}
        {tab === "phones" && <PhoneDirectory />}
        {tab === "export" && <DataExport />}
        {tab === "whatsapp" && <WhatsAppManager />}
        {tab === "ai" && <div className="space-y-6"><WeatherAlerts /><AIPredictions /></div>}
        {tab === "sorting" && <div className="space-y-6"><GeographicAreaAnalysis /></div>}
        {tab === "gamification" && <Gamification />}
        {tab === "journal" && <PersonalJournal />}
        {tab === "complaints" && <ResidentComplaints />}
        {tab === "unknowns" && <UnknownResidents />}
        {tab === "advanced" && <div className="space-y-6"><AdvancedStats /></div>}
      </main>
    </div>
  );
}