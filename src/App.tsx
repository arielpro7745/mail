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
  Building, MapPin, Eye, Zap, Layers, Package, Clock, StickyNote, Edit3, Save, Calculator
} from "lucide-react";
import AIPredictions from "./components/AIPredictions";
import WeatherAlerts from "./components/WeatherAlerts";
import Gamification from "./components/Gamification";
import PersonalJournal from "./components/PersonalJournal";
import ResidentComplaints from "./components/ResidentComplaints";
import UnknownResidents from "./components/UnknownResidents";
import DailyTaskGenerator from "./components/DailyTaskGenerator";
import GeographicAreaAnalysis from "./components/GeographicAreaAnalysis";

// === נתונים ולו"ז מעודכנים עם מספרי בניינים מדויקים לחישוב ===

const SCHEDULE_15_DAYS = [
  { day: 1, area: 45, title: "היבנר סולו", color: "blue", bldgCount: 35, streets: ["היבנר"], relays: ["היבנר 25"], tips: "יום עמוס! 35 בניינים סה\"כ. שק מחכה בהיבנר 25." },
  { day: 2, area: 14, title: "רוטשילד זוגי", color: "red", bldgCount: 25, streets: ["הדף היומי", "רוטשילד", "גד מכנס"], relays: ["רוטשילד 132"], tips: "רק צד זוגי (110-182). שק ברוטשילד 132." },
  { day: 3, area: 12, title: "הרב קוק והכרם", color: "green", bldgCount: 38, streets: ["הרב קוק", "הכרם"], relays: ["התשעים ושלוש 19", "התשעים ושלוש 11"], tips: "הרב קוק: 30 בניינים! קח סחורה מה-93 לפני הכניסה." },
  { day: 4, area: 45, title: "דגל ומירקין", color: "blue", bldgCount: 25, streets: ["דגל ראובן", "מירקין"], relays: ["דגל ראובן 22"], tips: "דגל ראובן 22 - נקודת מילוי באמצע הרחוב." },
  { day: 5, area: 12, title: "חיים כהן ושבדיה", color: "green", bldgCount: 36, streets: ["חיים כהן", "שבדיה"], relays: ["התשעים ושלוש 11"], tips: "חיים כהן צפוף מאוד." },
  { day: 6, area: 45, title: "ויצמן וליסין", color: "blue", bldgCount: 18, streets: ["ויצמן", "ליסין", "מרטין בובר"], relays: ["ויצמן 12", "ויצמן 33"], tips: "ויצמן: שקים ב-12 (התחלה) או ב-33 (מול הבניינים)." },
  { day: 7, area: 14, title: "רוטשילד אי-זוגי + קק\"ל", color: "red", bldgCount: 20, streets: ["רוטשילד", "קק\"ל", "קרן קיימת"], relays: ["רוטשילד 132"], tips: "מסלול: רוטשילד 179-143 -> קק\"ל -> רוטשילד 141-109." },
  { day: 8, area: 12, title: "התשעים ושלוש וראב", color: "green", bldgCount: 37, streets: ["התשעים ושלוש", "האחים ראב"], relays: ["התשעים ושלוש 19", "התשעים ושלוש 11"], tips: "השקים מחכים ב-19 או 11, אתה כבר שם." },
  { day: 9, area: 45, title: "יטקובסקי וברטונוב", color: "blue", bldgCount: 24, streets: ["יטקובסקי", "ברטונוב", "סנדרוב"], relays: ["ויצמן 33"], tips: "יטקובסקי (דרום): קח שק מויצמן 33 לפני שאתה יורד למטה." },
  { day: 10, area: 12, title: "פנקס ומנדלסון", color: "green", bldgCount: 35, streets: ["דוד צבי פנקס", "מנדלסון"], relays: ["התשעים ושלוש 11"], tips: "פנקס: 12 זוגי, 11 אי-זוגי." },
  { day: 11, area: 45, title: "הפרטיזנים ושטרן (קל)", color: "blue", bldgCount: 0, streets: ["הפרטיזנים", "שטרן"], relays: ["ויצמן 33"], tips: "יום הליכה קליל." },
  { day: 12, area: 14, title: "רוטשילד מלא (מרתון)", color: "red", bldgCount: 45, streets: ["רוטשילד", "קק\"ל", "גד מכנס", "הדף היומי"], relays: ["רוטשילד 132"], tips: "🚨 תמלא שקים ב-132 לפני שאתה מתחיל את המרתון." },
  { day: 13, area: 12, title: "זכרון משה ואנה פרנק", color: "green", bldgCount: 37, streets: ["זכרון משה", "אנה פרנק"], relays: ["התשעים ושלוש 19"], tips: "זכרון משה: 20 בניינים." },
  { day: 14, area: 12, title: "חפץ מרדכי (סגירה)", color: "green", bldgCount: 19, streets: ["חפץ מרדכי"], relays: ["התשעים ושלוש 11"], tips: "סוגרים את איזור 12." },
  { day: 15, area: 45, title: "היבנר (סיבוב שני)", color: "blue", bldgCount: 35, streets: ["היבנר"], relays: ["היבנר 25"], tips: "חוזרים לרחוב הכי קשה." }
];

const BUILDING_ALERTS: Record<string, string> = {
  "היבנר": "⚠️ 35 בניינים! (20 זוגי, 15 אי-זוגי).",
  "ויצמן": "בניינים: 33 (עמוס), 35, 34, 32, 9, 7. היתר פרטיים.",
  "יטקובסקי": "11 בניינים. בניין 37 עמוס מאוד.",
  "אחים יטקובסקי": "11 בניינים. בניין 37 עמוס מאוד.",
  "דגל ראובן": "16 בניינים בזוגי, 8 באי-זוגי.",
  "מירקין": "11 בתים פרטיים ובניין אחד.",
  "הרב קוק": "🏢 30 בניינים!",
  "חיים כהן": "🏢 29 בניינים.",
  "התשעים ושלוש": "🏢 29 בניינים (18 זוגי).",
  "דוד צבי פנקס": "23 בניינים (12 זוגי).",
  "זכרון משה": "20 בניינים.",
  "חפץ מרדכי": "19 בניינים.",
  "אנה פרנק": "17 בניינים.",
  "מנדלסון": "12 בניינים.",
  "רוטשילד": "כניסות מרובות ב-140-144. בית אבות ב-182.",
  "קק\"ל": "לא לשכוח: 28-34 וגם 25-21."
};

const AREA_THEMES: Record<number, any> = {
  45: { gradient: "from-blue-50 via-indigo-50 to-slate-50", primary: "bg-blue-600", secondary: "bg-blue-100", textMain: "text-blue-900", textSub: "text-blue-700", border: "border-blue-200", accent: "text-blue-600", cardBg: "bg-white", iconColor: "text-blue-500", buttonHover: "hover:bg-blue-700" },
  14: { gradient: "from-red-50 via-rose-50 to-slate-50", primary: "bg-red-600", secondary: "bg-red-100", textMain: "text-red-900", textSub: "text-red-700", border: "border-red-200", accent: "text-red-600", cardBg: "bg-white", iconColor: "text-red-500", buttonHover: "hover:bg-red-700" },
  12: { gradient: "from-emerald-50 via-teal-50 to-slate-50", primary: "bg-emerald-600", secondary: "bg-emerald-100", textMain: "text-emerald-900", textSub: "text-emerald-700", border: "border-emerald-200", accent: "text-emerald-600", cardBg: "bg-white", iconColor: "text-emerald-500", buttonHover: "hover:bg-emerald-700" }
};

const calculateAutoCycleDay = () => {
  try {
    const anchorDate = new Date('2025-12-25T00:00:00'); 
    const anchorCycleDay = 5; 
    const today = new Date();
    today.setHours(0,0,0,0);
    if (today < anchorDate) return 5;
    let workDays = 0;
    let curr = new Date(anchorDate);
    while (curr < today) {
      curr.setDate(curr.getDate() + 1);
      if (curr.getDay() !== 5 && curr.getDay() !== 6) workDays++;
    }
    let cycle = (anchorCycleDay + workDays) % 15;
    return cycle === 0 ? 15 : cycle;
  } catch(e) { return 5; }
};

// === רכיב: כרטיס רחוב עם פתקים ===
function StreetCard({ street, theme, onDone, onStartTimer, notes, onSaveNote }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes[street.name] || "");
  const hasNote = !!notes[street.name];

  const handleSave = () => {
    onSaveNote(street.name, noteText);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${theme.primary}`}>
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{street.name}</h3>
            <div className="flex items-center gap-2 mt-1">
               {hasNote && !isEditing && (
                 <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md flex items-center gap-1 border border-yellow-200">
                   <StickyNote size={10} /> {notes[street.name]}
                 </span>
               )}
            </div>
          </div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${hasNote ? 'text-yellow-500' : 'text-gray-300'}`}>
          <Edit3 size={20} />
        </button>
      </div>

      {isEditing && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-3 animate-fade-in">
          <label className="text-xs font-bold text-yellow-800 block mb-1">הערות (קוד, כלב, מיקום):</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={noteText} 
              onChange={(e) => setNoteText(e.target.value)} 
              placeholder="לדוגמה: קוד 2580..." 
              className="flex-1 border border-yellow-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button onClick={handleSave} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-bold"><Save size={16}/></button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button onClick={() => onStartTimer(street)} className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-100 border border-gray-200 transition-colors">
          התחל מדידה
        </button>
        <button onClick={() => onDone(street.id)} className={`flex-1 ${theme.primary} text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2`}>
          <CheckCircle2 size={18} /> סמן כבוצע
        </button>
      </div>
    </div>
  );
}

// === רכיב: וידג'ט צפי סיום מדויק (7 דקות לבניין) ===
function EstimatedFinishWidget({ pendingCount, totalStreets, kmWalked, schedule }: any) {
  let minutesLeft = 0;
  let details = "";

  if (typeof schedule.bldgCount === 'number' && schedule.bldgCount > 0 && totalStreets > 0) {
    // חישוב יחסי: סך בניינים / סך רחובות = ממוצע בניינים לרחוב
    const avgBuildingsPerStreet = schedule.bldgCount / totalStreets;
    const estimatedBuildingsLeft = Math.ceil(pendingCount * avgBuildingsPerStreet);
    minutesLeft = estimatedBuildingsLeft * 7; 
    details = `נותרו כ-${estimatedBuildingsLeft} בניינים (7 דק'/בניין)`;
  } else {
    // יום של בתים פרטיים: 15 דקות לרחוב
    minutesLeft = pendingCount * 15;
    details = "חישוב לפי 15 דק' לרחוב";
  }

  const finishTime = new Date();
  finishTime.setMinutes(finishTime.getMinutes() + minutesLeft);
  const timeString = finishTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  if (pendingCount === 0) return null;

  return (
    <div className="bg-gray-900 text-white rounded-xl p-4 shadow-lg mb-4 flex items-center justify-between border border-gray-700">
      <div className="flex items-center gap-3">
        <div className="bg-gray-800 p-2 rounded-full"><Calculator className="text-yellow-400" size={20} /></div>
        <div>
          <p className="text-xs text-gray-400 font-medium">צפי סיום (מדויק)</p>
          <p className="text-xl font-bold font-mono tracking-wider">{timeString}</p>
          <p className="text-[10px] text-gray-500">{details}</p>
        </div>
      </div>
      <div className="text-right border-r border-gray-700 pr-4">
        <p className="text-xs text-gray-400">הלכת היום</p>
        <p className="font-bold text-green-400">{kmWalked} ק"מ</p>
      </div>
    </div>
  );
}

function RelayBoxWidget({ relays }: { relays: string[] }) {
  const [collected, setCollected] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("collectedRelays");
    return saved ? JSON.parse(saved) : {};
  });
  if (!relays || relays.length === 0) return null;
  const toggleCollected = (relay: string) => {
    const newCollected = { ...collected, [relay]: !collected[relay] };
    setCollected(newCollected);
    localStorage.setItem("collectedRelays", JSON.stringify(newCollected));
  };

  return (
    <div className="mb-4 p-4 rounded-xl border-l-4 border-purple-500 bg-white shadow-sm animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-purple-100 p-2 rounded-full shrink-0"><Package className="text-purple-600" size={20} /></div>
        <div><h3 className="font-bold text-gray-800 text-lg">נקודות איסוף שקים</h3><p className="text-xs text-gray-500">נווט לתיבה לאיסוף סחורה</p></div>
      </div>
      <div className="space-y-2">
        {relays.map((relay, idx) => (
          <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${collected[relay] ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-100 hover:bg-purple-100'}`}>
             <a href={`https://waze.com/ul?q=${encodeURIComponent(relay + ' פתח תקווה')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 group">
               <Navigation2 size={18} className={`${collected[relay] ? 'text-green-500' : 'text-purple-500 group-hover:scale-110 transition-transform'}`} />
               <span className={`font-bold text-base ${collected[relay] ? 'text-green-800 line-through opacity-70' : 'text-purple-900'}`}>{relay}</span>
             </a>
             <button onClick={() => toggleCollected(relay)} className={`text-xs px-3 py-1 rounded-full font-bold border ${collected[relay] ? 'bg-white text-green-600 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:text-purple-600'}`}>{collected[relay] ? 'נאסף' : 'סמן'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StickyNextStreet({ streets, theme }: { streets: Street[], theme: any }) {
  if (streets.length === 0) return null;
  const nextStreet = streets[0];
  const alertInfo = Object.entries(BUILDING_ALERTS).find(([key]) => nextStreet.name.includes(key));
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t ${theme.border} shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transform transition-transform duration-300 animate-slide-up`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${theme.primary} flex items-center justify-center text-white shadow-md animate-pulse`}><Navigation2 size={20} /></div>
          <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wider">היעד הבא</p><p className={`font-bold text-lg ${theme.textMain}`}>{nextStreet.name}</p>{alertInfo && <p className="text-xs text-orange-600 font-medium truncate max-w-[200px]">{alertInfo[1]}</p>}</div>
        </div>
        <div className="flex gap-2"><a href={`https://waze.com/ul?q=${encodeURIComponent(nextStreet.name + ' פתח תקווה')}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${theme.secondary} ${theme.accent}`}><Zap size={20} /></a></div>
      </div>
    </div>
  );
}

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
      <p className="text-indigo-100 text-lg">ביום ראשון חוזרים ל: {SCHEDULE_15_DAYS.find(s => s.day === (cycleDay === 15 ? 1 : cycleDay + 1))?.title}</p>
    </div>
  );

  return (
    <div className={`rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden transition-all duration-500 bg-white ${theme.border}`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
               <span className={`${theme.primary} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide`}>יום {cycleDay} / 15</span>
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
               <p className="font-bold text-red-800 text-lg">אזור לא תואם</p>
               <p className="text-red-700">היום <strong>אזור {currentSchedule.area}</strong>. אתה ב-<strong>{currentArea}</strong>.<br/><button onClick={() => document.getElementById('area-toggle-btn')?.click()} className="underline font-bold hover:text-red-900 mt-1">לחץ להחלפה</button></p>
             </div>
          </div>
        )}

        <RelayBoxWidget relays={currentSchedule.relays || []} />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <div className="text-3xl font-black text-gray-800">{currentSchedule.bldgCount}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">בניינים</div>
          </div>
          <div className={`${theme.secondary} rounded-2xl p-4 text-center border ${theme.border}`}>
            <div className={`text-3xl font-black ${theme.textMain}`}>{pendingCount}</div>
            <div className={`text-xs ${theme.textSub} font-bold uppercase tracking-wider`}>רחובות</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 relative overflow-hidden">
            <div className="text-3xl font-black text-gray-800">{progress}%</div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100"><div className={`h-full ${theme.primary} transition-all duration-1000`} style={{ width: `${progress}%` }}></div></div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">התקדמות</div>
          </div>
        </div>

        <div className={`${theme.cardBg} rounded-xl p-4 flex gap-3 items-start border ${theme.border}`}>
          <Info className={`${theme.iconColor} shrink-0 mt-1`} size={18} />
          <p className={`text-sm leading-relaxed ${theme.textMain} font-medium`}>{currentSchedule.tips}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<string>("regular");
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [cycleDay, setCycleDay] = useState<number>(() => calculateAutoCycleDay());
  const [isWeekend, setIsWeekend] = useState(false);
  const [sunMode, setSunMode] = useState(false);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);
  
  // ניהול פתקים לרחובות
  const [streetNotes, setStreetNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("streetNotes");
    return saved ? JSON.parse(saved) : {};
  });

  const saveNote = (streetName: string, note: string) => {
    const updated = { ...streetNotes, [streetName]: note };
    setStreetNotes(updated);
    localStorage.setItem("streetNotes", JSON.stringify(updated));
  };

  useEffect(() => {
    const day = new Date().getDay();
    setIsWeekend(day === 5 || day === 6);
    localStorage.setItem("currentCycleDay", cycleDay.toString());
  }, [cycleDay]);

  const { isHolidayMode } = useHolidayMode();
  const { todayArea, pendingToday, completedToday, markDelivered, undoDelivered, endDay, loading, allCompletedToday, streetsNeedingDelivery, overdueStreets, getStreetUrgencyLevel, getUrgencyColor, getUrgencyLabel } = useDistribution();

  useNotifications();

  const currentDaySchedule = useMemo(() => SCHEDULE_15_DAYS.find(s => s.day === cycleDay) || SCHEDULE_15_DAYS[0], [cycleDay]);
  const theme = AREA_THEMES[currentDaySchedule.area] || AREA_THEMES[45];

  // חישוב ק"מ (0.5 ק"מ בממוצע לרחוב)
  const kmWalked = (completedToday.length * 0.5).toFixed(1);

  const streetsToShow = useMemo(() => {
    const list = optimizedStreets.length > 0 ? optimizedStreets : pendingToday;
    if (todayArea !== currentDaySchedule.area) return [];
    
    if (cycleDay === 12 && currentDaySchedule.area === 14) {
       return list.filter(street => street.name.includes("רוטשילד") || street.name.includes("קק") || street.name.includes("קרן קיימת") || street.name.includes("הדף היומי") || street.name.includes("גד מכנס"));
    }
    
    if (cycleDay === 7 && currentDaySchedule.area === 14) {
       return list.filter(street => {
         const name = street.name;
         if (name.includes("קק") || name.includes("קרן קיימת")) return true;
         if (name.includes("רוטשילד")) {
           const match = name.match(/(\d+)/);
           if (match) {
             const num = parseInt(match[0]);
             if (num % 2 === 0) return false;
             return (num >= 143 && num <= 179) || (num >= 109 && num <= 141);
           }
         }
         return false;
       });
    }

    return list.filter(street => {
      const isScheduled = currentDaySchedule.streets.some(scheduledName => 
        street.name.includes(scheduledName) || scheduledName.includes(street.name)
      );
      if (!isScheduled) return false;
      
      if (cycleDay === 2 && street.name.includes("רוטשילד")) {
         const match = street.name.match(/(\d+)/);
         return match && parseInt(match[0]) % 2 === 0;
      }
      return true;
    });
  }, [pendingToday, currentDaySchedule, todayArea, optimizedStreets, cycleDay]);

  const completedCycleToday = useMemo(() => {
    return allCompletedToday.filter(street => 
      street.area === currentDaySchedule.area &&
      currentDaySchedule.streets.some(scheduledName => street.name.includes(scheduledName))
    );
  }, [allCompletedToday, currentDaySchedule]);

  const handleCompleteDelivery = (time: number) => {
    if (currentStreet) { markDelivered(currentStreet.id, time); setCurrentStreet(null); }
  };
  const handleStartTimer = (street: Street) => { setCurrentStreet(street); };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-gradient-to-br ${sunMode ? 'from-white to-gray-100' : theme.gradient}`}>
      
      <button onClick={() => setSunMode(!sunMode)} className={`fixed bottom-4 left-4 z-50 px-4 py-3 rounded-full shadow-xl border-2 flex items-center gap-2 font-bold transition-all transform hover:scale-105 ${sunMode ? 'bg-yellow-400 text-black border-black ring-4 ring-yellow-200' : 'bg-gray-800 text-white border-gray-600'}`}>
        <Sun size={20}/> {sunMode ? 'רגיל' : 'מצב שמש'}
      </button>

      {!isWeekend && streetsToShow.length > 0 && !currentStreet && <StickyNextStreet streets={streetsToShow} theme={theme} />}

      <div className={sunMode ? 'grayscale contrast-125' : ''}>
        {showFirebaseGuide && <FirebaseSetupGuide />}
        <MailSortingReminder currentArea={currentDaySchedule.area} />
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
          <TabBar current={tab} setTab={setTab} />

          {tab === "regular" && (
            <>
              <CycleDashboard cycleDay={cycleDay} setCycleDay={setCycleDay} completedCount={completedCycleToday.length} pendingCount={streetsToShow.length} currentArea={todayArea} theme={theme} />

              {!isWeekend && (
                <div className="animate-fade-in-up">
                  {currentStreet && (() => {
                    const alertKey = Object.keys(BUILDING_ALERTS).find(key => currentStreet.name.includes(key));
                    if (alertKey) return (<div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-xl shadow-sm flex gap-3 animate-bounce-in"><Building className="text-orange-600 shrink-0" /><div><h4 className="font-bold text-orange-900">מודיעין בניין:</h4><p className="text-orange-800">{BUILDING_ALERTS[alertKey]}</p></div></div>);
                    return null;
                  })()}
                  
                  {/* ווידג'ט חדש ומתוקן: צפי סיום מדויק (7 דקות לבניין) */}
                  <EstimatedFinishWidget 
                     pendingCount={streetsToShow.length} 
                     totalStreets={streetsToShow.length + completedCycleToday.length}
                     kmWalked={kmWalked} 
                     schedule={currentDaySchedule} 
                  />

                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-gray-800">המשימות להיום</h2>
                     <button onClick={() => setCycleDay(calculateAutoCycleDay())} className={`text-xs ${theme.textMain} underline`}>סנכרן לתאריך</button>
                  </div>

                  {todayArea !== currentDaySchedule.area ? (
                     <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center shadow-sm">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><Layers className="text-red-500" size={32} /></div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">אזור לא תואם</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">היום עובדים ב<strong>אזור {currentDaySchedule.area}</strong>. אנא החלף אזור.</p>
                        <div className="inline-block" id="area-toggle-btn"><AreaToggle area={todayArea} onEnd={endDay} /></div>
                     </div>
                  ) : (
                     <div className="space-y-2">
                        {isHolidayMode ? (
                          <HolidayAdjustedStreetTable list={streetsToShow} onDone={markDelivered} onStartTimer={handleStartTimer} getStreetUrgencyLevel={getStreetUrgencyLevel} getUrgencyColor={getUrgencyColor} getUrgencyLabel={getUrgencyLabel} />
                        ) : (streetsToShow.length > 0 ? (
                            // רינדור הכרטיסיות עם פתקים
                            streetsToShow.map(street => (
                              <StreetCard 
                                key={street.id} 
                                street={street} 
                                theme={theme} 
                                onDone={markDelivered} 
                                onStartTimer={handleStartTimer} 
                                notes={streetNotes} 
                                onSaveNote={saveNote}
                              />
                            ))
                          ) : (
                            <div className="text-center p-12"><CheckCircle2 size={48} className={`mx-auto mb-3 ${theme.iconColor}`} /><h3 className="text-2xl font-bold text-gray-800">הכל הושלם!</h3><p className="text-gray-500 text-sm mb-4">כל הכבוד, סיימת את המכסה להיום.</p><div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4"><div className="bg-green-500 h-full w-full animate-pulse"></div></div><button onClick={() => setCycleDay(cycleDay === 15 ? 1 : cycleDay + 1)} className={`mt-2 ${theme.primary} text-white px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition-all`}>עבור ליום הבא</button></div>
                          )
                        )}
                     </div>
                  )}

                  <div className="my-6 opacity-70 hover:opacity-100 transition-opacity"><AreaToggle area={todayArea} onEnd={endDay} /></div>
                  {currentStreet && <DeliveryTimer streetName={currentStreet.name} onComplete={handleCompleteDelivery} />}
                  <WalkingOrder area={todayArea} />
                  <CompletedToday list={completedCycleToday} onUndo={undoDelivered} totalCompleted={completedCycleToday.length} />
                  <Notifications count={overdueStreets} />
                  
                  <div className="mt-8 text-center">
                    <button onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)} className="text-sm text-gray-400 hover:text-gray-600 underline">כלים מתקדמים</button>
                    {showAdvancedFeatures && <div className="mt-4 space-y-4"><InteractiveMap buildings={[]} currentArea={todayArea} completedToday={completedToday} /><VoiceNotifications onStreetCompleted={(s) => console.log(s)} /><AdvancedStats /><AutoBackup /><NightModeScheduler /><GPSExporter buildings={[]} currentArea={todayArea} optimizedRoute={optimizedStreets} /></div>}
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