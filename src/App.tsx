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
import { getAreaColor } from "./utils/areaColors";
import { 
  AlertTriangle, Sun, Coffee, Calendar, ArrowRight, ArrowLeft, Info, 
  CalendarClock, Cloud, CheckCircle2, Navigation2, ChevronUp, ChevronDown,
  Building, MapPin, Eye, Zap
} from "lucide-react";
import AIPredictions from "./components/AIPredictions";
import WeatherAlerts from "./components/WeatherAlerts";
import Gamification from "./components/Gamification";
import PersonalJournal from "./components/PersonalJournal";
import ResidentComplaints from "./components/ResidentComplaints";
import UnknownResidents from "./components/UnknownResidents";
import DailyTaskGenerator from "./components/DailyTaskGenerator";
import GeographicAreaAnalysis from "./components/GeographicAreaAnalysis";

// === נתונים ו"מודיעין" ===

// 1. הגדרת סבב 15 הימים
const SCHEDULE_15_DAYS = [
  { day: 1, area: 45, title: "ויצמן והצפון", color: "blue", streets: ["ויצמן", "ליסין", "מרטין בובר"], tips: "שים לב: ויצמן 33 (עמוס), 9 ו-7." },
  { day: 2, area: 14, title: "רוטשילד זוגי (הכבד)", color: "red", streets: ["הדף היומי", "רוטשילד", "גד מכנס"], tips: "רוטשילד צד זוגי בלבד! (110-182). זהירות בכניסות." },
  { day: 3, area: 12, title: "צפון 12 (ה-93)", color: "green", streets: ["רוטשילד 100", "דוד צבי פנקס", "התשעים ושלוש"], tips: "המוקד היום: התשעים ושלוש." },
  { day: 4, area: 45, title: "היבנר סולו", color: "blue", streets: ["היבנר"], tips: "יום פיזי קשה. כל הרחוב: זוגי יורד, אי-זוגי עולה." },
  { day: 5, area: 12, title: "אמצע 12", color: "green", streets: ["הרב קוק", "הכרם", "זכרון משה", "אנה פרנק"], tips: "יום רגוע יחסית. להכין את הגוף לסופ\"ש." },
  { day: 6, area: 45, title: "דגל ראובן סולו", color: "blue", streets: ["דגל ראובן"], tips: "פותחים שבוע בכחול: הליכה ישרה בדגל ראובן." },
  { day: 7, area: 14, title: "רוטשילד אי-זוגי (הקל)", color: "red", streets: ["רוטשילד", "קק\"ל", "קרן קיימת"], tips: "יום שני אדום: רוטשילד אי-זוגי בלבד!" },
  { day: 8, area: 12, title: "דרום 12 (הגשר)", color: "green", streets: ["חיים כהן", "מנדלסון", "האחים ראב", "שבדיה"], tips: "זהירות בחיים כהן." },
  { day: 9, area: 45, title: "דרום 45 (יטקובסקי)", color: "blue", streets: ["מירקין", "ברטונוב", "הפרטיזנים", "סנדרוב", "שטרן", "אחים יטקובסקי"], tips: "יטקובסקי: לשים לב ל-37 ו-36." },
  { day: 10, area: 45, title: "ויצמן (חזרה)", color: "blue", streets: ["ויצמן", "ליסין", "מרטין בובר"], tips: "סיבוב שני. לוודא שאין שאריות." },
  { day: 11, area: 14, title: "רוטשילד זוגי (חזרה)", color: "red", streets: ["הדף היומי", "רוטשילד", "גד מכנס"], tips: "סיבוב שני. לבדוק את בתי האבות." },
  { day: 12, area: 12, title: "ה-93 (חזרה)", color: "green", streets: ["רוטשילד 100", "דוד צבי פנקס", "התשעים ושלוש"], tips: "סיבוב שני." },
  { day: 13, area: 45, title: "היבנר (חזרה)", color: "blue", streets: ["היבנר"], tips: "סיבוב שני. כוח!" },
  { day: 14, area: 12, title: "הרב קוק (חזרה)", color: "green", streets: ["הרב קוק", "הכרם", "זכרון משה", "אנה פרנק"], tips: "סיבוב שני." },
  { day: 15, area: 45, title: "דגל ראובן (חזרה)", color: "blue", streets: ["דגל ראובן"], tips: "סיבוב שני וסיום הסבב." }
];

// 2. מודיעין בניינים - התראות ספציפיות
const BUILDING_ALERTS: Record<string, string> = {
  "ויצמן": "שים לב: בניין 33 עמוס מאוד! גם 9, 7, 32, 34 ו-35 דורשים תשומת לב.",
  "אחים יטקובסקי": "זהירות: בניין 37 הכי עמוס ברחוב. גם 36 כבד.",
  "רוטשילד": "בצד הזוגי: 140, 142, 144 - המון כניסות. 182 - בית אבות.",
  "התשעים ושלוש": "רחוב עמוס מאוד היום.",
  "חיים כהן": "עומס בינוני/כבד.",
  "גד מכנס": "בית אבות במספר 4 - לפרוק הכל בסוף."
};

// 3. מערכת הצבעים החדשה
const AREA_THEMES: Record<number, any> = {
  45: { // כחול - כפר גנים
    gradient: "from-blue-50 via-indigo-50 to-slate-50",
    primary: "bg-blue-600",
    secondary: "bg-blue-100",
    textMain: "text-blue-900",
    textSub: "text-blue-700",
    border: "border-blue-200",
    accent: "text-blue-600",
    cardBg: "bg-white",
    iconColor: "text-blue-500",
    buttonHover: "hover:bg-blue-700"
  },
  14: { // אדום - רוטשילד
    gradient: "from-red-50 via-orange-50 to-slate-50",
    primary: "bg-red-600",
    secondary: "bg-red-100",
    textMain: "text-red-900",
    textSub: "text-red-700",
    border: "border-red-200",
    accent: "text-red-600",
    cardBg: "bg-white",
    iconColor: "text-red-500",
    buttonHover: "hover:bg-red-700"
  },
  12: { // ירוק - אזור 12
    gradient: "from-emerald-50 via-teal-50 to-slate-50",
    primary: "bg-emerald-600",
    secondary: "bg-emerald-100",
    textMain: "text-emerald-900",
    textSub: "text-emerald-700",
    border: "border-emerald-200",
    accent: "text-emerald-600",
    cardBg: "bg-white",
    iconColor: "text-emerald-500",
    buttonHover: "hover:bg-emerald-700"
  }
};

// חישוב יום אוטומטי
const calculateAutoCycleDay = () => {
  try {
    const anchorDate = new Date('2025-12-25T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    if (today < anchorDate) return 5;
    let workDays = 0;
    let curr = new Date(anchorDate);
    while (curr < today) {
      curr.setDate(curr.getDate() + 1);
      if (curr.getDay() !== 5 && curr.getDay() !== 6) workDays++;
    }
    let cycle = (5 + workDays) % 15;
    return cycle === 0 ? 15 : cycle;
  } catch(e) { return 5; }
};

// === רכיבים ===

// פס ניווט דביק - מראה את הרחוב הבא
function StickyNextStreet({ streets, theme }: { streets: Street[], theme: any }) {
  if (streets.length === 0) return null;
  const nextStreet = streets[0];

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t ${theme.border} shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transform transition-transform duration-300 animate-slide-up`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${theme.primary} flex items-center justify-center text-white shadow-md animate-pulse`}>
            <Navigation2 size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">היעד הבא</p>
            <p className={`font-bold text-lg ${theme.textMain}`}>{nextStreet.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`https://waze.com/ul?q=${encodeURIComponent(nextStreet.name + ' פתח תקווה')}`} target="_blank" rel="noopener noreferrer" 
             className={`p-2 rounded-full ${theme.secondary} ${theme.accent}`}>
            <Zap size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}

// דשבורד חכם
function CycleDashboard({ cycleDay, setCycleDay, completedCount, pendingCount, currentArea, theme }: any) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentSchedule = SCHEDULE_15_DAYS.find(s => s.day === cycleDay) || SCHEDULE_15_DAYS[0];
  const isWeekend = currentTime.getDay() === 5 || currentTime.getDay() === 6;
  const isAreaMismatch = currentArea !== currentSchedule.area;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const nextDay = () => setCycleDay(cycleDay === 15 ? 1 : cycleDay + 1);
  const prevDay = () => setCycleDay(cycleDay === 1 ? 15 : cycleDay - 1);
  const total = pendingCount + completedCount;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (isWeekend) return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-6 text-white shadow-2xl relative overflow-hidden">
      <h2 className="text-4xl font-bold mb-2">סופ"ש נעים! ☕</h2>
      <p className="text-indigo-100 text-lg">הסוללה שלך בטעינה. נתראה בראשון.</p>
    </div>
  );

  return (
    <div className={`rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden transition-all duration-500 bg-white ${theme.border}`}>
      {/* רקע צבעוני עליון */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
               <span className={`${theme.primary} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide`}>
                 יום {cycleDay} / 15
               </span>
               <span className={`${theme.secondary} ${theme.textSub} text-xs font-bold px-3 py-1 rounded-full border ${theme.border} flex items-center gap-1`}>
                 <CalendarClock size={12} /> {currentTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
               </span>
            </div>
            <h2 className={`text-3xl font-extrabold ${theme.textMain} tracking-tight`}>{currentSchedule.title}</h2>
          </div>
          
          <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
            <button onClick={prevDay} className="p-2 hover:bg-white rounded-lg text-gray-500 transition shadow-sm"><ArrowRight size={20}/></button>
            <div className={`px-4 font-bold ${theme.textMain} self-center`}>יום {cycleDay}</div>
            <button onClick={nextDay} className="p-2 hover:bg-white rounded-lg text-gray-500 transition shadow-sm"><ArrowLeft size={20}/></button>
          </div>
        </div>

        {isAreaMismatch && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-5 rounded-lg flex items-start gap-4 shadow-sm animate-pulse">
             <div className="bg-red-100 p-2 rounded-full"><AlertTriangle className="text-red-600" size={24} /></div>
             <div>
               <p className="font-bold text-red-800 text-lg">טעות באזור!</p>
               <p className="text-red-700">
                 התוכנית להיום היא <strong>אזור {currentSchedule.area}</strong>, אבל אתה נמצא ב-<strong>אזור {currentArea}</strong>.
                 <br/>
                 <button onClick={() => document.getElementById('area-toggle-btn')?.click()} className="underline font-bold hover:text-red-900 mt-1">לחץ להחלפה</button>
               </p>
             </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <div className="text-3xl font-black text-gray-800">{pendingCount}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">נותרו</div>
          </div>
          <div className={`${theme.secondary} rounded-2xl p-4 text-center border ${theme.border}`}>
            <div className={`text-3xl font-black ${theme.textMain}`}>{completedCount}</div>
            <div className={`text-xs ${theme.textSub} font-bold uppercase tracking-wider`}>הושלמו</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 relative overflow-hidden">
            <div className="text-3xl font-black text-gray-800">{progress}%</div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
               <div className={`h-full ${theme.primary} transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">התקדמות</div>
          </div>
        </div>

        {/* טיפ יומי מעוצב */}
        <div className={`${theme.cardBg} rounded-xl p-4 flex gap-3 items-start border ${theme.border}`}>
          <Info className={`${theme.iconColor} shrink-0 mt-1`} size={18} />
          <p className={`text-sm leading-relaxed ${theme.textMain} font-medium`}>{currentSchedule.tips}</p>
        </div>
      </div>
    </div>
  );
}

// === האפליקציה הראשית ===
export default function App() {
  const [tab, setTab] = useState<string>("regular");
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [cycleDay, setCycleDay] = useState<number>(() => calculateAutoCycleDay());
  const [isWeekend, setIsWeekend] = useState(false);
  const [sunMode, setSunMode] = useState(false);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);

  useEffect(() => {
    const day = new Date().getDay();
    setIsWeekend(day === 5 || day === 6);
    localStorage.setItem("currentCycleDay", cycleDay.toString());
  }, [cycleDay]);

  const { isHolidayMode } = useHolidayMode();
  const { todayArea, pendingToday, completedToday, markDelivered, undoDelivered, endDay, loading, allCompletedToday, streetsNeedingDelivery, overdueStreets, getStreetUrgencyLevel, getUrgencyColor, getUrgencyLabel } = useDistribution();

  useNotifications();

  // בחירת ערכת הנושא לפי האזור של היום בסבב
  const currentDaySchedule = useMemo(() => SCHEDULE_15_DAYS.find(s => s.day === cycleDay) || SCHEDULE_15_DAYS[0], [cycleDay]);
  const theme = AREA_THEMES[currentDaySchedule.area] || AREA_THEMES[45];

  const streetsToShow = useMemo(() => {
    const list = optimizedStreets.length > 0 ? optimizedStreets : pendingToday;
    if (todayArea !== currentDaySchedule.area) return [];
    return list.filter(street => 
       currentDaySchedule.streets.some(scheduledName => street.name.includes(scheduledName) || scheduledName.includes(street.name))
    );
  }, [pendingToday, currentDaySchedule, todayArea, optimizedStreets]);

  const completedCycleToday = useMemo(() => {
    return allCompletedToday.filter(street => 
      street.area === currentDaySchedule.area &&
      currentDaySchedule.streets.some(scheduledName => street.name.includes(scheduledName))
    );
  }, [allCompletedToday, currentDaySchedule]);

  const handleCompleteDelivery = (time: number) => {
    if (currentStreet) { markDelivered(currentStreet.id, time); setCurrentStreet(null); }
  };

  const handleStartTimer = (street: Street) => {
    setCurrentStreet(street);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-gradient-to-br ${sunMode ? 'from-white to-gray-100' : theme.gradient}`}>
      
      {/* כפתור מצב שמש */}
      <button 
        onClick={() => setSunMode(!sunMode)}
        className={`fixed bottom-4 left-4 z-50 px-4 py-3 rounded-full shadow-xl border-2 flex items-center gap-2 font-bold transition-all transform hover:scale-105 ${sunMode ? 'bg-yellow-400 text-black border-black ring-4 ring-yellow-200' : 'bg-gray-800 text-white border-gray-600'}`}
      >
        <Sun size={20}/> {sunMode ? 'רגיל' : 'מצב שמש'}
      </button>

      {/* פס ניווט תחתון - מופיע רק כשיש רחובות */}
      {!isWeekend && streetsToShow.length > 0 && !currentStreet && (
        <StickyNextStreet streets={streetsToShow} theme={theme} />
      )}

      <div className={sunMode ? 'grayscale contrast-125' : ''}>
        {showFirebaseGuide && <FirebaseSetupGuide />}
        <MailSortingReminder currentArea={currentDaySchedule.area} />
        
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className={`w-3 h-8 rounded-full ${theme.primary}`}></div>
             <h1 className="font-black text-xl tracking-tight text-gray-800">Mail<span className={theme.textMain}>Master</span></h1>
           </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
          <TabBar current={tab} setTab={setTab} />

          {tab === "regular" && (
            <>
              <CycleDashboard 
                cycleDay={cycleDay} setCycleDay={setCycleDay}
                completedCount={completedCycleToday.length} pendingCount={streetsToShow.length}
                currentArea={todayArea} theme={theme}
              />

              {!isWeekend && (
                <div className="animate-fade-in-up">
                  
                  {/* בועת התראה לבניין ספציפי (מודיעין בניינים) */}
                  {currentStreet && (() => {
                    const alertKey = Object.keys(BUILDING_ALERTS).find(key => currentStreet.name.includes(key));
                    if (alertKey) return (
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-xl shadow-sm flex gap-3 animate-bounce-in">
                        <Building className="text-orange-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-orange-900">מודיעין בניין:</h4>
                          <p className="text-orange-800">{BUILDING_ALERTS[alertKey]}</p>
                        </div>
                      </div>
                    );
                    return null;
                  })()}

                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-gray-800">המשימות להיום</h2>
                     <button onClick={syncToDate} className={`text-xs ${theme.textMain} underline`}>סנכרן לתאריך</button>
                  </div>

                  {todayArea !== currentDaySchedule.area ? (
                     <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">אזור לא תואם</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          היום עובדים ב<strong>אזור {currentDaySchedule.area}</strong>. אנא החלף אזור.
                        </p>
                        <div className="inline-block" id="area-toggle-btn"><AreaToggle area={todayArea} onEnd={endDay} /></div>
                     </div>
                  ) : (
                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {isHolidayMode ? (
                          <HolidayAdjustedStreetTable list={streetsToShow} onDone={markDelivered} onStartTimer={handleStartTimer} getStreetUrgencyLevel={getStreetUrgencyLevel} getUrgencyColor={getUrgencyColor} getUrgencyLabel={getUrgencyLabel} />
                        ) : (streetsToShow.length > 0 ? (
                            <StreetTable list={streetsToShow} onDone={markDelivered} onStartTimer={handleStartTimer} getStreetUrgencyLevel={getStreetUrgencyLevel} getUrgencyColor={getUrgencyColor} getUrgencyLabel={getUrgencyLabel} />
                          ) : (
                            <div className="text-center p-12">
                              <CheckCircle2 size={48} className={`mx-auto mb-3 ${theme.iconColor}`} />
                              <h3 className="text-2xl font-bold text-gray-800">הכל הושלם!</h3>
                              <button onClick={() => setCycleDay(cycleDay === 15 ? 1 : cycleDay + 1)} className={`mt-4 ${theme.primary} text-white px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition-all`}>עבור ליום הבא</button>
                            </div>
                          )
                        )}
                     </div>
                  )}

                  <div className="my-6 opacity-70 hover:opacity-100 transition-opacity"><AreaToggle area={todayArea} onEnd={endDay} /></div>
                  {currentStreet && <DeliveryTimer streetName={currentStreet.name} onComplete={handleCompleteDelivery} />}
                  
                  <WalkingOrder area={todayArea} />
                  <CompletedToday list={completedCycleToday} onUndo={undoDelivered} totalCompleted={completedCycleToday.length} />
                  
                  {/* הצצה למחר */}
                  {(() => {
                    const nextDayNum = cycleDay === 15 ? 1 : cycleDay + 1;
                    const nextSchedule = SCHEDULE_15_DAYS.find(s => s.day === nextDayNum);
                    if (!nextSchedule) return null;
                    return (
                      <div className="mt-8 p-4 rounded-xl border border-dashed border-gray-300 opacity-60 hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-wider text-gray-500"><Eye size={14} /> מתכוננים למחר</div>
                         <div className="flex justify-between items-center">
                            <div><span className="font-bold text-lg text-gray-800">{nextSchedule.title}</span><p className="text-sm">אזור {nextSchedule.area} • יום {nextDayNum}</p></div>
                            <Calendar size={24} className="text-gray-300"/>
                         </div>
                      </div>
                    );
                  })()}

                  <Notifications count={overdueStreets} />
                  
                  <div className="mt-8 text-center">
                    <button onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)} className="text-sm text-gray-400 hover:text-gray-600 underline">כלים מתקדמים</button>
                    {showAdvancedFeatures && (
                      <div className="mt-4 space-y-4">
                        <InteractiveMap buildings={[]} currentArea={todayArea} completedToday={completedToday} />
                        <VoiceNotifications onStreetCompleted={(s) => console.log(s)} />
                        <AdvancedStats />
                        <AutoBackup />
                        <NightModeScheduler />
                        <GPSExporter buildings={[]} currentArea={todayArea} optimizedRoute={optimizedStreets} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          {tab === "buildings" && <BuildingManager />}
          {tab === "holidays" && <HolidayManager />}
          {tab === "tasks" && <TaskManager />}
          {tab === "reports" && <Reports />}
          {tab === "whatsapp" && <WhatsAppManager />}
          {tab === "export" && <DataExport />}
          {tab === "ai" && <div className="space-y-6"><WeatherAlerts /><AIPredictions /></div>}
          {tab === "sorting" && <div className="space-y-6"><GeographicAreaAnalysis /></div>}
          {tab === "gamification" && <Gamification />}
          {tab === "journal" && <PersonalJournal />}
          {tab === "complaints" && <ResidentComplaints />}
          {tab === "unknowns" && <UnknownResidents />}
          {tab === "advanced" && <div className="space-y-6"><AdvancedStats /></div>}
        </main>
      </div>
    </div>
  );
}