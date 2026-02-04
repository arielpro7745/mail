import { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import TabBar from "./components/TabBar";
import { useDistribution } from "./hooks/useDistribution";
import { useNotifications } from "./hooks/useNotifications";
import { AreaToggle } from "./components/AreaToggle";
import LoadingSpinner from "./components/LoadingSpinner";
import DeliveryTimer from "./components/DeliveryTimer";
import TaskManager from "./components/TaskManager";
import Reports from "./components/Reports";
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
import MailSortingReminder from "./components/MailSortingReminder";
import BuildingManager from "./components/BuildingManager";
import { useHolidayMode } from "./hooks/useHolidayMode";
import { Street } from "./types";
import { totalDaysBetween } from "./utils/dates";
import { 
  AlertTriangle, Sun, Coffee, Calendar, ArrowRight, ArrowLeft, Info, 
  CalendarClock, Cloud, CheckCircle2, Navigation2, ChevronUp, ChevronDown,
  Building, MapPin, Layers, Package, Mail, Box, Lightbulb, Bike, CloudRain, History, Undo2, Clock, 
  Umbrella, StickyNote, Edit3, Save, X, Zap
} from "lucide-react";
import AIPredictions from "./components/AIPredictions";
import WeatherAlerts from "./components/WeatherAlerts";
import Gamification from "./components/Gamification";
import PersonalJournal from "./components/PersonalJournal";
import ResidentComplaints from "./components/ResidentComplaints";
import UnknownResidents from "./components/UnknownResidents";
import GeographicAreaAnalysis from "./components/GeographicAreaAnalysis";

// === לו"ז 16 ימים - חלוקה חכמה ללא חזרות (מלבד 14) ===
const SCHEDULE_16_DAYS = [
  // --- יום 1: אזור 14 (ירוק) ---
  { day: 1, area: 14, title: "14 - הדף היומי וגד מכנס 4", streets: ["הדף היומי", "גד מכנס 4", "רוטשילד זוגי"], subType: "14_even", tips: "הדף היומי, גד מכנס 4, רוטשילד זוגי.", bldgCount: 20 },

  // --- יום 2: אזור 12 (אדום) - חלק 1 ---
  { day: 2, area: 12, title: "12 - חיים כהן ושבדיה", streets: ["חיים כהן", "שבדיה", "דוד צבי פנקס", "הכרם"], subType: "12_A", tips: "חיים כהן, שבדיה, דוד צבי פנקס, הכרם.", bldgCount: 36 },

  // --- יום 3: אזור 7 (כחול) - חלק 1 ---
  { day: 3, area: 7, title: "7 - פינסקר זוגי", streets: ["פינסקר זוגי"], subType: "7_even", tips: "פינסקר זוגי (2-42).", bldgCount: 30 },

  // --- יום 4: אזור 14 (ירוק) ---
  { day: 4, area: 14, title: "14 - רוטשילד אי-זוגי וקק\"ל", streets: ["רוטשילד אי-זוגי", "קק\"ל"], subType: "14_odd", tips: "רוטשילד אי-זוגי וקק\"ל.", bldgCount: 25 },

  // --- יום 5: אזור 12 (אדום) - חלק 2 ---
  { day: 5, area: 12, title: "12 - ה-93 והרב קוק", streets: ["התשעים ושלוש", "הרב קוק"], subType: "12_B", tips: "התשעים ושלוש, הרב קוק.", bldgCount: 40 },

  // --- יום 6: אזור 7 (כחול) - חלק 2 ---
  { day: 6, area: 7, title: "7 - פינסקר אי-זוגי", streets: ["פינסקר אי-זוגי"], subType: "7_odd", tips: "פינסקר אי-זוגי (1-63).", bldgCount: 30 },

  // --- יום 7: אזור 14 (ירוק) - סבב חוזר ---
  { day: 7, area: 14, title: "14 - הדף היומי וגד מכנס 4", streets: ["הדף היומי", "גד מכנס 4", "רוטשילד זוגי"], subType: "14_even", tips: "סבב חוזר: הדף היומי, גד מכנס 4.", bldgCount: 20 },

  // --- יום 8: אזור 12 (אדום) - חלק 3 ---
  { day: 8, area: 12, title: "12 - ראב אחים וחפץ מרדכי", streets: ["האחים ראב", "חפץ מרדכי"], subType: "12_C", tips: "ראב אחים, חפץ מרדכי.", bldgCount: 35 },

  // --- יום 9: אזור 7 (כחול) - חלק 3 ---
  { day: 9, area: 7, title: "7 - מרקוס, ברוד, ברוידה", streets: ["משה מרקוס", "מקס ברוד", "ברוידה"], subType: "7_small_1", tips: "מרקוס, ברוד, ברוידה.", bldgCount: 15 },

  // --- יום 10: אזור 14 (ירוק) - סבב חוזר ---
  { day: 10, area: 14, title: "14 - רוטשילד אי-זוגי וקק\"ל", streets: ["רוטשילד אי-זוגי", "קק\"ל"], subType: "14_odd", tips: "סבב חוזר.", bldgCount: 25 },

  // --- יום 11: אזור 12 (אדום) - חלק 4 (מילוי יום ריק) ---
  { day: 11, area: 12, title: "12 - אנה פרנק ומנדלסון", streets: ["אנה פרנק", "מנדלסון"], subType: "12_D", tips: "אנה פרנק, מנדלסון.", bldgCount: 30 },

  // --- יום 12: אזור 7 (כחול) - חלק 4 (מילוי יום ריק) ---
  { day: 12, area: 7, title: "7 - יוסף חיים, רוזוב, בורלא", streets: ["חכם יוסף חיים", "האחים רוזוב", "בורלא"], subType: "7_small_2", tips: "יוסף חיים, רוזוב, בורלא.", bldgCount: 15 },

  // --- יום 13: אזור 14 (ירוק) - סבב חוזר ---
  { day: 13, area: 14, title: "14 - הדף היומי וגד מכנס 4", streets: ["הדף היומי", "גד מכנס 4", "רוטשילד זוגי"], subType: "14_even", tips: "סבב חוזר.", bldgCount: 20 },

  // --- יום 14: אזור 12 (אדום) - חלק 5 (סיום האזור) ---
  { day: 14, area: 12, title: "12 - רוטשילד 100 וזכרון משה", streets: ["רוטשילד 100", "זכרון משה"], subType: "12_E", tips: "רוטשילד 100 (בניין אחד), זכרון משה.", bldgCount: 25 },

  // --- יום 15: אזור 7 (כחול) - חלק 5 (סיום האזור) ---
  { day: 15, area: 7, title: "7 - ליברמן, שטרייט, תל חי", streets: ["ליברמן", "האחים שטרייט", "תל חי"], subType: "7_small_3", tips: "ליברמן, האחים שטרייט, תל חי.", bldgCount: 20 },

  // --- יום 16: אזור 14 (ירוק) - סבב חוזר ---
  { day: 16, area: 14, title: "14 - רוטשילד אי-זוגי וקק\"ל", streets: ["רוטשילד אי-זוגי", "קק\"ל"], subType: "14_odd", tips: "סבב חוזר אחרון.", bldgCount: 25 }
];

const AREA_THEMES: Record<number, any> = {
  7: { gradient: "from-blue-50 via-indigo-50 to-slate-50", primary: "bg-blue-600", secondary: "bg-blue-100", textMain: "text-blue-900", textSub: "text-blue-700", border: "border-blue-200", accent: "text-blue-600", cardBg: "bg-white", iconColor: "text-blue-500", buttonHover: "hover:bg-blue-700" },
  14: { gradient: "from-emerald-50 via-green-50 to-slate-50", primary: "bg-emerald-600", secondary: "bg-emerald-100", textMain: "text-emerald-900", textSub: "text-emerald-700", border: "border-emerald-200", accent: "text-emerald-600", cardBg: "bg-white", iconColor: "text-emerald-500", buttonHover: "hover:bg-emerald-700" },
  12: { gradient: "from-red-50 via-rose-50 to-slate-50", primary: "bg-red-600", secondary: "bg-red-100", textMain: "text-red-900", textSub: "text-red-700", border: "border-red-200", accent: "text-red-600", cardBg: "bg-white", iconColor: "text-red-500", buttonHover: "hover:bg-red-700" },
  45: { gradient: "from-gray-50 via-slate-50 to-zinc-50", primary: "bg-gray-600", secondary: "bg-gray-100", textMain: "text-gray-900", textSub: "text-gray-700", border: "border-gray-200", accent: "text-gray-600", cardBg: "bg-white", iconColor: "text-gray-500", buttonHover: "hover:bg-gray-700" }
};

const calculateAutoCycleDay = () => {
  try {
    const anchorDate = new Date('2026-02-02T00:00:00'); 
    const today = new Date();
    today.setHours(0,0,0,0);
    if (today < anchorDate) return 1;
    let workDays = 0;
    let curr = new Date(anchorDate);
    while (curr < today) {
      curr.setDate(curr.getDate() + 1);
      if (curr.getDay() !== 5 && curr.getDay() !== 6) workDays++;
    }
    let cycle = (1 + workDays) % 16;
    return cycle === 0 ? 16 : cycle;
  } catch(e) { return 1; }
};

function StreetCard({ street, theme, onDone, onUndo, onStartTimer, isCompleted, isRecentlyDone, daysSinceLastDelivery, notes, onSaveNote }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes && street?.name ? notes[street.name] || "" : "");
  if (!street || !street.name) return null;
  const hasNote = notes && !!notes[street.name];
  const handleSave = () => { onSaveNote(street.name, noteText); setIsEditing(false); };

  if (isCompleted) {
    return (
      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm mb-3 flex items-center justify-between opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold"><CheckCircle2 size={20} /></div>
          <div><h3 className="font-bold text-emerald-900 text-lg leading-tight line-through opacity-70">{street.name}</h3></div>
        </div>
        <button onClick={() => onUndo(street.id)} className="p-2 text-emerald-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm border border-emerald-100"><Undo2 size={20} /></button>
      </div>
    );
  }
  return (
    <div className={`rounded-xl p-4 border border-gray-100 mb-3 transition-all ${isRecentlyDone ? "border-l-4 border-l-green-500 bg-green-50/60" : "bg-white"}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${isRecentlyDone ? 'bg-green-600' : theme.primary}`}>{isRecentlyDone ? <History size={18} /> : <MapPin size={18} />}</div>
          <div><h3 className="font-bold text-lg leading-tight text-gray-800">{street.name}</h3>{hasNote && <div onClick={() => setIsEditing(true)} className="mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded cursor-pointer"><StickyNote size={10} /> {notes[street.name]}</div>}</div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-gray-300"><Edit3 size={20} /></button>
      </div>
      {isEditing && <div className="bg-yellow-50 p-3 rounded-lg mb-3"><input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} className="w-full border p-1 rounded mb-2" /><button onClick={handleSave} className="bg-yellow-500 text-white px-3 py-1 rounded w-full">שמור</button></div>}
      <div className="flex gap-2 mt-2"><button onClick={() => onStartTimer(street)} className="flex-1 bg-white text-gray-700 py-2 rounded border">מדוד</button><button onClick={() => onDone(street.id)} className={`flex-1 text-white py-2 rounded ${theme.primary}`}>סמן כבוצע</button></div>
    </div>
  );
}

function CycleDashboard({ cycleDay, setCycleDay, completedCount, pendingCount, currentArea, theme }: any) {
  const currentSchedule = SCHEDULE_16_DAYS.find(s => s.day === cycleDay) || SCHEDULE_16_DAYS[0];
  const isWeekend = new Date().getDay() === 5 || new Date().getDay() === 6;
  if (isWeekend) return <div className="bg-purple-600 rounded-3xl p-8 mb-6 text-white">סופ"ש נעים!</div>;

  return (
    <div className={`rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden bg-white ${theme.border}`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>
      <div className="flex justify-between items-start mb-6">
        <div><span className={`${theme.primary} text-white text-xs font-bold px-3 py-1 rounded-full`}>יום {cycleDay} / 16</span><h2 className={`text-2xl font-bold mt-2 ${theme.textMain}`}>{currentSchedule.title}</h2></div>
        <div className="flex bg-gray-50 rounded-xl p-1"><button onClick={()=>setCycleDay(cycleDay===1?16:cycleDay-1)} className="p-2"><ArrowRight/></button><div className="px-4 self-center font-bold">יום {cycleDay}</div><button onClick={()=>setCycleDay(cycleDay===16?1:cycleDay+1)} className="p-2"><ArrowLeft/></button></div>
      </div>
      {currentArea !== currentSchedule.area && currentArea !== 45 && <div className="bg-red-50 text-red-800 p-4 mb-4 rounded-lg font-bold">שים לב: האזור באפליקציה ({currentArea}) לא תואם ללו"ז ({currentSchedule.area})</div>}
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded border"><Info size={16} className="inline ml-1"/>{currentSchedule.tips}</div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<string>("regular");
  const [currentStreet, setCurrentStreet] = useState<Street | null>(null);
  const [cycleDay, setCycleDay] = useState<number>(() => calculateAutoCycleDay());
  const [isWeekend, setIsWeekend] = useState(false);
  const [sunMode, setSunMode] = useState(false);
  const [isRainMode, setIsRainMode] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [streetNotes, setStreetNotes] = useState<Record<string, string>>(() => { try { return JSON.parse(localStorage.getItem("streetNotes") || "{}"); } catch { return {}; } });

  const saveNote = (streetName: string, note: string) => { const u = { ...streetNotes, [streetName]: note }; setStreetNotes(u); localStorage.setItem("streetNotes", JSON.stringify(u)); };
  
  useEffect(() => { const day = new Date().getDay(); setIsWeekend(day === 5 || day === 6); }, [cycleDay]);

  const { isHolidayMode } = useHolidayMode();
  const distHook = useDistribution();
  const { todayArea = 7, pendingToday = [], completedToday = [], markDelivered = ()=>{}, undoDelivered = ()=>{}, endDay = ()=>{}, loading = true, allCompletedToday = [], setManualArea = ()=>{} } = distHook || {};

  useNotifications();

  const currentDaySchedule = useMemo(() => SCHEDULE_16_DAYS.find(s => s.day === cycleDay) || SCHEDULE_16_DAYS[0], [cycleDay]);
  const theme = useMemo(() => AREA_THEMES[todayArea] || AREA_THEMES[7], [todayArea]);

  // === מנוע סינון חכם ומדויק ===
  const streetsToShow = useMemo(() => {
    if (todayArea !== currentDaySchedule.area && todayArea !== 45) return []; 
    
    // מניעת כפילויות תצוגה (גד מכנס, דף יומי)
    const uniqueMap = new Map();
    const filtered = pendingToday.filter(street => {
       if (!street || !street.name) return false;
       const num = parseInt(street.name.match(/(\d+)/)?.[0] || "0");

       // 1. טיפול בגד מכנס (רק 4)
       if (street.name.includes("גד מכנס")) {
           return num === 4 || street.name.trim() === "גד מכנס 4";
       }

       return currentDaySchedule.streets.some(def => {
           // 2. טיפול ברוטשילד
           if (def.includes("רוטשילד")) {
                if (!street.name.includes("רוטשילד")) return false;
                if (def.includes("100")) return num === 100;
                if (def.includes("זוגי") && !def.includes("אי")) return num > 0 && num % 2 === 0;
                if (def.includes("אי-זוגי")) return num > 0 && num % 2 !== 0;
                return true; 
           }
           // 3. טיפול בפינסקר
           if (def.includes("פינסקר")) {
                if (!street.name.includes("פינסקר")) return false;
                if (def.includes("זוגי") && !def.includes("אי")) return num > 0 && num % 2 === 0;
                if (def.includes("אי-זוגי")) return num > 0 && num % 2 !== 0;
                return true;
           }
           
           return street.name.includes(def) || def.includes(street.name);
       });
    });

    // הסרת כפילויות הדף היומי
    filtered.forEach(s => {
        if (s.name.includes("הדף היומי")) {
            if (!uniqueMap.has("daf")) uniqueMap.set("daf", s);
        } else {
            uniqueMap.set(s.id, s);
        }
    });

    // מיון
    return Array.from(uniqueMap.values()).sort((a, b) => {
      const idxA = currentDaySchedule.streets.findIndex(s => a.name.includes(s) || s.includes(a.name));
      const idxB = currentDaySchedule.streets.findIndex(s => b.name.includes(s) || s.includes(b.name));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return 0;
    }).map(s => ({...s, isCompleted: allCompletedToday.some(d => d.id === s.id)}));

  }, [pendingToday, allCompletedToday, currentDaySchedule, todayArea]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`min-h-screen ${sunMode ? 'grayscale' : theme.gradient}`}>
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
         <button onClick={() => setIsRainMode(!isRainMode)} className="w-12 h-12 bg-blue-500 rounded-full text-white flex items-center justify-center shadow"><Umbrella/></button>
         <button onClick={() => setSunMode(!sunMode)} className="w-12 h-12 bg-yellow-500 rounded-full text-white flex items-center justify-center shadow"><Sun/></button>
      </div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
        <TabBar current={tab} setTab={setTab} />
        {tab === "regular" && (
          <>
            <CycleDashboard cycleDay={cycleDay} setCycleDay={setCycleDay} completedCount={completedToday.length} pendingCount={streetsToShow.filter((s:any)=>!s.isCompleted).length} currentArea={todayArea} theme={theme} />
            {!isWeekend && (
              <>
                 <div className="flex justify-between items-center mb-4"><h2 className="font-bold">המשימות להיום</h2><button onClick={() => setCycleDay(calculateAutoCycleDay())} className="text-xs underline">סנכרן</button></div>
                 
                 {todayArea !== currentDaySchedule.area && todayArea !== 45 ? 
                    <div className="bg-white p-6 rounded text-center border-dashed border-2">
                       <h3 className="font-bold text-red-600">אזור לא תואם</h3>
                       <p>נא לעבור לאזור {currentDaySchedule.area}</p>
                       <div className="mt-4"><AreaToggle area={todayArea} onEnd={endDay} onChange={setManualArea} /></div>
                    </div> 
                 : 
                 (streetsToShow.length > 0 ? streetsToShow.map((s: any) => <StreetCard key={s.id} street={s} theme={theme} onDone={(id:string)=>markDelivered(id,0)} onUndo={undoDelivered} onStartTimer={setCurrentStreet} isCompleted={s.isCompleted} notes={streetNotes} onSaveNote={saveNote}/>) : <div className="text-center mt-10 text-gray-500">אין רחובות להצגה או סיימת הכל!</div>)}
                 
                 <div className="mt-8 opacity-70"><AreaToggle area={todayArea} onEnd={endDay} onChange={setManualArea} /></div>
                 
                 {currentStreet && <DeliveryTimer streetName={currentStreet.name} onComplete={(t) => {markDelivered(currentStreet.id, t); setCurrentStreet(null);}} />}
                 
                 <div className="mt-10 text-center"><button onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)} className="underline text-gray-400">כלים מתקדמים</button>{showAdvancedFeatures && <div className="mt-4"><AutoBackup/><NightModeScheduler/></div>}</div>
              </>
            )}
          </>
        )}
        
        {tab === "tasks" && <TaskManager />}
        {tab === "reports" && <Reports />}
        {tab === "export" && <DataExport />}
      </main>
    </div>
  );
}