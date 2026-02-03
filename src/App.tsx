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
import MailSortingReminder from "./components/MailSortingReminder";
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

// === מילון בניינים מעודכן ===
const STREET_COUNTS: Record<string, number> = {
  // אזור 12
  "שבדיה": 7, "האחים ראב": 8, "מנדלסון": 12,
  "חפץ מרדכי": 19, "חיים כהן": 29, "אנה פרנק": 17, "זכרון משה": 20, "הרב קוק": 30,
  "הכרם": 8, "התשעים ושלוש": 29, "דוד צבי פנקס": 23,
  
  // אזור 14
  "רוטשילד": 45, "גד מכנס": 15, "קק\"ל": 12, "הדף היומי": 4, "קרן קיימת": 12,
  
  // אזור 7
  "פינסקר": 60, "משה ברקוס": 5, "מקס ברוד": 4, "ברוידה": 6, 
  "חכם יוסף חיים": 3, "האחים רוזוב": 3, "עולי בבל": 4, 
  "אורלוב": 10, "ליברמן": 3, "האחים שטרייט": 5, "תל חי": 8, "משה מרקוס": 5
};

// === לו"ז 16 ימים - ללא כפילויות ===
// סדר האזורים: 14 -> 12 -> 7
const SCHEDULE_16_DAYS = [
  // --- יום 1: אזור 14 (חלק א) ---
  { day: 1, area: 14, title: "14 - גד מכנס והדף היומי", streets: ["גד מכנס", "הדף היומי"], tips: "רק גד מכנס והדף היומי.", bldgCount: 19 },

  // --- יום 2: אזור 12 (חלק א) ---
  { day: 2, area: 12, title: "12 - חיים כהן ושבדיה", streets: ["חיים כהן", "שבדיה"], tips: "חיים כהן ושבדיה בלבד.", bldgCount: 36 },
  
  // --- יום 3: אזור 7 (חלק א) ---
  { day: 3, area: 7, title: "7 - פינסקר אי-זוגי (1-35)", streets: ["פינסקר", "משה ברקוס", "מקס ברוד"], tips: "פינסקר 1 עד 35 (אי-זוגי) ורחובות סמוכים.", subType: "pinsker_1_35", bldgCount: 25 },

  // --- יום 4: אזור 14 (חלק ב) ---
  { day: 4, area: 14, title: "14 - רוטשילד זוגי (110-128)", streets: ["רוטשילד"], tips: "רוטשילד זוגי - מספרים נמוכים (עד 128).", subType: "rothschild_even_low", bldgCount: 15 },

  // --- יום 5: אזור 12 (חלק ב) ---
  { day: 5, area: 12, title: "12 - פנקס והכרם", streets: ["דוד צבי פנקס", "הכרם"], tips: "רחוב פנקס והכרם.", bldgCount: 31 },

  // --- יום 6: אזור 7 (חלק ב) ---
  { day: 6, area: 7, title: "7 - פינסקר אי-זוגי (35-57)", streets: ["פינסקר", "ברוידה", "חכם יוסף חיים", "האחים רוזוב"], tips: "פינסקר 35 עד 57 וכניסה לברוידה.", subType: "pinsker_35_57", bldgCount: 30 },

  // --- יום 7: אזור 14 (חלק ג) ---
  { day: 7, area: 14, title: "14 - קק\"ל וקרן קיימת", streets: ["קק\"ל", "קרן קיימת"], tips: "קק\"ל וקרן קיימת לישראל.", bldgCount: 24 },

  // --- יום 8: אזור 12 (חלק ג) ---
  { day: 8, area: 12, title: "12 - ה-93 והאחים ראב", streets: ["התשעים ושלוש", "האחים ראב"], tips: "ה-93 והאחים ראב.", bldgCount: 37 },

  // --- יום 9: אזור 7 (חלק ג) ---
  { day: 9, area: 7, title: "7 - אורלוב ועולי בבל", streets: ["פינסקר", "עולי בבל", "אורלוב"], tips: "פינסקר 61 (פנייה לעולי בבל) ואורלוב 48-66.", subType: "pinsker_61", bldgCount: 25 },

  // --- יום 10: אזור 14 (חלק ד) ---
  { day: 10, area: 14, title: "14 - רוטשילד אי-זוגי (109-127)", streets: ["רוטשילד"], tips: "רוטשילד אי-זוגי - מספרים נמוכים (עד 127).", subType: "rothschild_odd_low", bldgCount: 15 },

  // --- יום 11: אזור 12 (חלק ד) ---
  { day: 11, area: 12, title: "12 - הרב קוק ואנה פרנק", streets: ["הרב קוק", "אנה פרנק"], tips: "רחוב הרב קוק ואנה פרנק.", bldgCount: 47 },

  // --- יום 12: אזור 7 (חלק ד) ---
  { day: 12, area: 7, title: "7 - ליברמן ופינסקר זוגי (42-36)", streets: ["ליברמן", "פינסקר", "האחים שטרייט"], tips: "ליברמן, פינסקר 42 עד 36 (זוגי) ושטרייט.", subType: "pinsker_42_36", bldgCount: 20 },

  // --- יום 13: אזור 14 (חלק ה) ---
  { day: 13, area: 14, title: "14 - רוטשילד זוגי (130-144)", streets: ["רוטשילד"], tips: "רוטשילד זוגי - השלמת הרחוב (מספרים גבוהים).", subType: "rothschild_even_high", bldgCount: 15 },

  // --- יום 14: אזור 12 (חלק ה) ---
  { day: 14, area: 12, title: "12 - חפץ מרדכי ומנדלסון", streets: ["חפץ מרדכי", "מנדלסון", "זכרון משה"], tips: "חפץ מרדכי, מנדלסון וזכרון משה.", bldgCount: 50 },

  // --- יום 15: אזור 7 (חלק ה) ---
  { day: 15, area: 7, title: "7 - תל חי ופינסקר זוגי (34-2)", streets: ["פינסקר", "תל חי"], tips: "פינסקר 34-30, תל חי, ולסיום פינסקר 28-2.", subType: "pinsker_34_2", bldgCount: 25 },

  // --- יום 16: אזור 14 (חלק ו) ---
  { day: 16, area: 14, title: "14 - רוטשילד אי-זוגי (129-145)", streets: ["רוטשילד"], tips: "רוטשילד אי-זוגי - השלמת הרחוב (מספרים גבוהים).", subType: "rothschild_odd_high", bldgCount: 15 }
];

const BUILDING_ALERTS: Record<string, string> = {
  "הרב קוק": "30 בניינים!", "חיים כהן": "29 בניינים!",
  "התשעים ושלוש": "29 בניינים!", "פינסקר": "שים לב לחלוקה למקטעים בטיפ!",
  "אורלוב": "48 עד 66 בלבד", "רוטשילד": "שים לב למספרים בטיפ"
};

const AREA_THEMES: Record<number, any> = {
  7: { gradient: "from-blue-50 via-indigo-50 to-slate-50", primary: "bg-blue-600", secondary: "bg-blue-100", textMain: "text-blue-900", textSub: "text-blue-700", border: "border-blue-200", accent: "text-blue-600", cardBg: "bg-white", iconColor: "text-blue-500", buttonHover: "hover:bg-blue-700" },
  14: { gradient: "from-emerald-50 via-green-50 to-slate-50", primary: "bg-emerald-600", secondary: "bg-emerald-100", textMain: "text-emerald-900", textSub: "text-emerald-700", border: "border-emerald-200", accent: "text-emerald-600", cardBg: "bg-white", iconColor: "text-emerald-500", buttonHover: "hover:bg-emerald-700" },
  12: { gradient: "from-red-50 via-rose-50 to-slate-50", primary: "bg-red-600", secondary: "bg-red-100", textMain: "text-red-900", textSub: "text-red-700", border: "border-red-200", accent: "text-red-600", cardBg: "bg-white", iconColor: "text-red-500", buttonHover: "hover:bg-red-700" }
};

const calculateAutoCycleDay = () => {
  try {
    const anchorDate = new Date('2026-02-02T00:00:00'); // יום שני 2.2 = יום 1
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (today < anchorDate) return 1;

    let workDays = 0;
    let curr = new Date(anchorDate);
    // סופרים ימי עבודה בלבד
    while (curr < today) {
      curr.setDate(curr.getDate() + 1);
      if (curr.getDay() !== 5 && curr.getDay() !== 6) workDays++;
    }
    
    let cycle = (1 + workDays) % 16;
    return cycle === 0 ? 16 : cycle;
  } catch(e) { return 1; }
};

// === רכיבים ===

function StreetCard({ street, theme, onDone, onUndo, onStartTimer, isCompleted, isRecentlyDone, daysSinceLastDelivery, notes, onSaveNote }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState(notes[street.name] || "");
  const hasNote = !!notes[street.name];

  const handleSave = () => {
    onSaveNote(street.name, noteText);
    setIsEditing(false);
  };

  if (isCompleted) {
    return (
      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm mb-3 flex items-center justify-between animate-fade-in opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold"><CheckCircle2 size={20} /></div>
          <div><h3 className="font-bold text-emerald-900 text-lg leading-tight line-through opacity-70">{street.name}</h3><p className="text-xs text-emerald-700">בוצע היום</p></div>
        </div>
        <button onClick={() => onUndo(street.id)} className="p-2 text-emerald-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm border border-emerald-100"><Undo2 size={20} /></button>
      </div>
    );
  }

  const cardStyle = isRecentlyDone 
    ? "border-l-4 border-l-green-500 bg-green-50/60 shadow-md" 
    : "bg-white hover:shadow-md border-r-4 border-r-transparent hover:border-r-indigo-400";

  return (
    <div className={`rounded-xl p-4 border border-gray-100 mb-3 transition-all ${cardStyle}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${isRecentlyDone ? 'bg-green-600' : theme.primary}`}>
            {isRecentlyDone ? <History size={18} /> : <MapPin size={18} />}
          </div>
          <div>
            <h3 className={`font-bold text-lg leading-tight ${isRecentlyDone ? 'text-green-900' : 'text-gray-800'}`}>{street.name}</h3>
            
            {isRecentlyDone && (
              <span className="text-xs font-bold text-green-700 flex items-center gap-1 mt-1 bg-white/80 px-2 py-0.5 rounded-md w-fit border border-green-200">
                <CheckCircle2 size={10} /> חולק לפני {daysSinceLastDelivery} ימים
              </span>
            )}

            {hasNote && !isEditing && (
               <div onClick={() => setIsEditing(true)} className="mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200 flex items-center gap-1 cursor-pointer max-w-[200px] truncate">
                 <StickyNote size={10} /> {notes[street.name]}
               </div>
            )}
          </div>
        </div>
        
        <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${hasNote ? 'text-yellow-500' : 'text-gray-300'}`}>
          {isEditing ? <X size={20} /> : <Edit3 size={20} />}
        </button>
      </div>

      {isEditing && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-3 animate-fade-in">
          <label className="text-xs font-bold text-yellow-800 block mb-1">הערה לרחוב:</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={noteText} 
              onChange={(e) => setNoteText(e.target.value)} 
              placeholder="קוד כניסה, קומה, כלב..." 
              className="flex-1 border border-yellow-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
            />
            <button onClick={handleSave} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-yellow-600"><Save size={16}/></button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button onClick={() => onStartTimer(street)} className="flex-1 bg-white text-gray-700 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 border border-gray-200 transition-colors flex items-center justify-center gap-2">
          <Clock size={16} /> מדוד
        </button>
        <button onClick={() => onDone(street.id)} className={`flex-1 text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 ${isRecentlyDone ? 'bg-green-600' : theme.primary}`}>
          <CheckCircle2 size={18} /> {isRecentlyDone ? 'בצע שוב' : 'סמן כבוצע'}
        </button>
      </div>
    </div>
  );
}

function EstimatedFinishWidget({ streetsToShow, kmWalked, regLeft, pkgLeft, isRainMode }: any) {
  const [breakMinutes, setBreakMinutes] = useState(0);
  const pendingStreets = streetsToShow.filter((s: any) => !s.isCompleted);
  
  const totalBuildingsLeft = pendingStreets.reduce((acc: number, street: any) => {
    const count = Object.entries(STREET_COUNTS).find(([key]) => street.name.includes(key))?.[1];
    return acc + (count !== undefined ? count : 10);
  }, 0);

  const timePerBldg = isRainMode ? 9 : 5; 
  const timePerStreet = isRainMode ? 3 : 1; 
  
  let minutesLeft = (totalBuildingsLeft * timePerBldg) + (pendingStreets.length * timePerStreet) + (regLeft * 2.5) + (pkgLeft * 3);
  
  const totalMinutes = Math.ceil(minutesLeft + breakMinutes);
  const finishTime = new Date();
  finishTime.setMinutes(finishTime.getMinutes() + totalMinutes);
  const timeString = finishTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  if (pendingStreets.length === 0 && regLeft === 0 && pkgLeft === 0) return null;

  return (
    <div className={`rounded-xl p-4 shadow-lg mb-4 border animate-fade-in transition-colors duration-500 ${isRainMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-900 border-gray-700'} text-white`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isRainMode ? 'bg-blue-500' : 'bg-yellow-500 text-black'}`}>
             {isRainMode ? <CloudRain size={20} /> : <Bike size={20} />}
          </div>
          <div>
            <p className="text-xs text-gray-300 font-medium">צפי סיום ({isRainMode ? 'גשם' : 'אופניים'})</p>
            <p className={`text-2xl font-bold font-mono tracking-wider ${isRainMode ? 'text-blue-300' : 'text-yellow-400'}`}>{timeString}</p>
            <p className="text-[10px] text-gray-400">{totalBuildingsLeft} בניינים | {regLeft} רשומים</p>
          </div>
        </div>
        <div className="text-right"><p className="text-xs text-gray-400">{isRainMode ? 'הלכת' : 'רכבת'} היום</p><p className="font-bold text-green-400">{kmWalked} ק"מ</p></div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setBreakMinutes(prev => prev + 15)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs py-2 rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/10"><Coffee size={14} /> הפסקה (+15)</button>
        {breakMinutes > 0 && <button onClick={() => setBreakMinutes(0)} className="bg-red-900/50 hover:bg-red-900 text-red-200 text-xs px-3 py-2 rounded-lg transition-colors">אפס</button>}
      </div>
    </div>
  );
}

function CargoTracker({ regTotal, setRegTotal, regDone, setRegDone, pkgTotal, setPkgTotal, pkgDone, setPkgDone }: any) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 mb-4 overflow-hidden animate-fade-in">
      <div className="bg-indigo-50 p-3 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2"><Layers size={18} className="text-indigo-600" /><h3 className="font-bold text-indigo-900">ניהול כבודה</h3></div>
        {isOpen ? <ChevronUp size={18} className="text-indigo-400"/> : <ChevronDown size={18} className="text-indigo-400"/>}
      </div>
      {isOpen && (
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-3 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-2 text-red-800 font-bold text-sm"><Mail size={16} /> רשומים (+2.5 דק')</div>
            <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><button onClick={() => regTotal > 0 && setRegTotal(regTotal-1)} className="w-6 h-6 bg-white rounded border border-red-200 text-red-600 flex items-center justify-center">-</button><span className="text-xl font-black text-red-900">{regDone}/{regTotal}</span><button onClick={() => setRegTotal(regTotal+1)} className="w-6 h-6 bg-white rounded border border-red-200 text-red-600 flex items-center justify-center">+</button></div></div>
            <button onClick={() => regDone < regTotal && setRegDone(regDone+1)} className={`w-full py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${regDone >= regTotal && regTotal > 0 ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>{regDone >= regTotal && regTotal > 0 ? 'סיימת!' : 'מסרתי'}</button>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-sm"><Box size={16} /> חבילות (+3 דק')</div>
            <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><button onClick={() => pkgTotal > 0 && setPkgTotal(pkgTotal-1)} className="w-6 h-6 bg-white rounded border border-amber-200 text-amber-600 flex items-center justify-center">-</button><span className="text-xl font-black text-amber-900">{pkgDone}/{pkgTotal}</span><button onClick={() => setPkgTotal(pkgTotal+1)} className="w-6 h-6 bg-white rounded border border-amber-200 text-amber-600 flex items-center justify-center">+</button></div></div>
            <button onClick={() => pkgDone < pkgTotal && setPkgDone(pkgDone+1)} className={`w-full py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${pkgDone >= pkgTotal && pkgTotal > 0 ? 'bg-green-500 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>{pkgDone >= pkgTotal && pkgTotal > 0 ? 'סיימת!' : 'מסרתי'}</button>
          </div>
        </div>
      )}
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
             <a href={`https://waze.com/ul?q=${encodeURIComponent(relay + ' פתח תקווה')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 flex-1 group"><Navigation2 size={18} className={`${collected[relay] ? 'text-green-500' : 'text-purple-500 group-hover:scale-110 transition-transform'}`} /><span className={`font-bold text-base ${collected[relay] ? 'text-green-800 line-through opacity-70' : 'text-purple-900'}`}>{relay}</span></a>
             <button onClick={() => toggleCollected(relay)} className={`text-xs px-3 py-1 rounded-full font-bold border ${collected[relay] ? 'bg-white text-green-600 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:text-purple-600'}`}>{collected[relay] ? 'נאסף' : 'סמן'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StickyNextStreet({ streets, theme }: { streets: Street[], theme: any }) {
  const pendingStreets = streets.filter((s: any) => !s.isCompleted);
  if (pendingStreets.length === 0) return null;
  const nextStreet = pendingStreets[0];
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
  
  const currentSchedule = SCHEDULE_16_DAYS.find(s => s.day === cycleDay) || SCHEDULE_16_DAYS[0];
  const isWeekend = currentTime.getDay() === 5 || currentTime.getDay() === 6;
  const isAreaMismatch = currentArea !== currentSchedule.area;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const nextDay = () => setCycleDay(cycleDay === 16 ? 1 : cycleDay + 1);
  const prevDay = () => setCycleDay(cycleDay === 1 ? 16 : cycleDay - 1);
  const total = pendingCount + completedCount;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (isWeekend) return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-6 text-white shadow-2xl relative overflow-hidden">
      <h2 className="text-4xl font-bold mb-2">סופ"ש נעים! ☕</h2>
      <p className="text-indigo-100 text-lg">ביום ראשון חוזרים ל: {SCHEDULE_16_DAYS.find(s => s.day === (cycleDay === 16 ? 1 : cycleDay + 1))?.title}</p>
    </div>
  );

  return (
    <div className={`rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden transition-all duration-500 bg-white ${theme.border}`}>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
               <span className={`${theme.primary} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wide`}>יום {cycleDay} / 16</span>
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
            <div className={`text-3xl font-black ${theme.textMain}`}>{currentSchedule.bldgCount || "?"}</div>
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

        <div className={`${theme.cardBg} rounded-xl p-4 flex gap-3 items-start border ${theme.border}`}><Info className={`${theme.iconColor} shrink-0 mt-1`} size={18} /><p className={`text-sm leading-relaxed ${theme.textMain} font-medium`}>{currentSchedule.tips}</p></div>
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
  const [flashlight, setFlashlight] = useState(false);
  const [optimizedStreets, setOptimizedStreets] = useState<Street[]>([]);
  const [isRainMode, setIsRainMode] = useState(false);
  
  const [regTotal, setRegTotal] = useState(0);
  const [regDone, setRegDone] = useState(0);
  const [pkgTotal, setPkgTotal] = useState(0);
  const [pkgDone, setPkgDone] = useState(0);

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
  const { todayArea, pendingToday, completedToday, markDelivered, undoDelivered, endDay, loading, allCompletedToday, setManualArea } = useDistribution();

  useNotifications();

  const currentDaySchedule = useMemo(() => {
    const schedule = SCHEDULE_16_DAYS.find(s => s.day === cycleDay);
    return schedule || SCHEDULE_16_DAYS[0];
  }, [cycleDay]);
  
  const theme = useMemo(() => {
    const selectedTheme = AREA_THEMES[todayArea];
    if (selectedTheme) return selectedTheme;
    const scheduleTheme = AREA_THEMES[currentDaySchedule.area];
    if (scheduleTheme) return scheduleTheme;
    return AREA_THEMES[7]; // ברירת מחדל
  }, [todayArea, currentDaySchedule]);
  
  const kmWalked = (completedToday.length * 0.5).toFixed(1);

  const streetsToShow = useMemo(() => {
    if (!currentDaySchedule || !currentDaySchedule.streets) return [];

    const list = optimizedStreets.length > 0 ? optimizedStreets : pendingToday;
    
    // סינון בטיחותי: אם האזור של היום (במציאות) לא תואם ליום בלו"ז (באפליקציה), אל תציג כלום
    if (todayArea !== currentDaySchedule.area) return [];
    
    const filtered = list.filter(street => {
        if (!street || !street.name) return false;

        // לוגיקה חכמה לרוטשילד (זוגי/אי-זוגי ומקטעים)
        if (currentDaySchedule.area === 14 && street.name.includes("רוטשילד")) {
           const match = street.name.match(/(\d+)/);
           const houseNum = match ? parseInt(match[0]) : 0;
           const sub = currentDaySchedule.subType;
           
           if (sub === "rothschild_even_low") return houseNum % 2 === 0 && houseNum < 128;
           if (sub === "rothschild_even_high") return houseNum % 2 === 0 && houseNum >= 128;
           if (sub === "rothschild_odd_low") return houseNum % 2 !== 0 && houseNum < 127;
           if (sub === "rothschild_odd_high") return houseNum % 2 !== 0 && houseNum >= 127;
           
           if (currentDaySchedule.title.includes("זוגי")) return houseNum % 2 === 0;
           if (currentDaySchedule.title.includes("אי-זוגי")) return houseNum % 2 !== 0;
        }

        // לוגיקה חכמה לפינסקר (לפי ימים ומספרים בלו"ז)
        // שים לב: זה מונע כפילויות של "פינסקר" בימים שונים
        if (currentDaySchedule.area === 7 && street.name.includes("פינסקר")) {
             const match = street.name.match(/(\d+)/);
             const houseNum = match ? parseInt(match[0]) : 0;
             const sub = currentDaySchedule.subType;

             // אם השם הוא רק "פינסקר" בלי מספרים, נציג אותו תמיד כשיש פינסקר בלו"ז
             // אבל המשתמש יצטרך להסתכל בטיפ היומי לדעת אילו מספרים לעשות
             if (houseNum === 0) return true;

             if (sub === "pinsker_1_35") return houseNum % 2 !== 0 && houseNum >= 1 && houseNum <= 35;
             if (sub === "pinsker_35_57") return houseNum % 2 !== 0 && houseNum > 35 && houseNum <= 57;
             if (sub === "pinsker_61") return houseNum === 61;
             if (sub === "pinsker_42_36") return houseNum % 2 === 0 && houseNum >= 36 && houseNum <= 42;
             if (sub === "pinsker_34_2") return houseNum % 2 === 0 && ((houseNum >= 30 && houseNum <= 34) || houseNum <= 28);

             // גיבוי לוגיקה ישנה אם אין subType
             if (currentDaySchedule.title.includes("1-35") && houseNum >= 1 && houseNum <= 35) return true;
             if (currentDaySchedule.title.includes("35-57") && houseNum >= 35 && houseNum <= 57) return true;
             if (currentDaySchedule.title.includes("42-36") && houseNum <= 42 && houseNum >= 36) return true;
             if (currentDaySchedule.title.includes("34-30") && houseNum <= 34 && houseNum >= 30) return true;
             if (currentDaySchedule.title.includes("28-2") && houseNum <= 28 && houseNum >= 2) return true;
             if (currentDaySchedule.title.includes("61") && houseNum === 61) return true;
             
             return false; // אם יש מספר אבל הוא לא בטווח של היום - אל תציג
        }

        // ברירת מחדל: סינון לפי שם
        return currentDaySchedule.streets.some(scheduledName => 
             street.name.includes(scheduledName) || scheduledName.includes(street.name)
        );
    });

    const today = new Date();
    const mapped = filtered.map(s => {
      const isDoneToday = allCompletedToday.some(done => done.id === s.id);
      let daysSince = null;
      if (s.lastDelivered && !isDoneToday) {
        daysSince = totalDaysBetween(new Date(s.lastDelivered), today);
      }
      const isRecentlyDone = daysSince !== null && daysSince >= 1 && daysSince <= 16;

      return { 
        ...s, 
        isCompleted: isDoneToday, 
        isRecentlyDone: isRecentlyDone,
        daysSinceLastDelivery: daysSince
      };
    });

    allCompletedToday
      .filter(street => currentDaySchedule.streets.some(scheduledName => street.name.includes(scheduledName) || scheduledName.includes(street.name)))
      .forEach(s => {
          if (!mapped.some(m => m.id === s.id)) mapped.push({...s, isCompleted: true, isRecentlyDone: false});
      });

    return mapped.sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      
      if (Array.isArray(currentDaySchedule.streets)) {
         const idxA = currentDaySchedule.streets.findIndex(name => a.name && a.name.includes(name));
         const idxB = currentDaySchedule.streets.findIndex(name => b.name && b.name.includes(name));
         
         if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      }
      return 0;
    });

  }, [pendingToday, allCompletedToday, currentDaySchedule, todayArea, optimizedStreets, cycleDay]);

  const handleCompleteDelivery = (time: number) => {
    if (currentStreet) { markDelivered(currentStreet.id, time); setCurrentStreet(null); }
  };
  const handleStartTimer = (street: Street) => { setCurrentStreet(street); };

  if (loading) return <LoadingSpinner />;

  if (flashlight) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center" onClick={() => setFlashlight(false)}>
        <Lightbulb size={64} className="text-black opacity-20 animate-pulse" />
        <p className="mt-4 text-black font-bold opacity-50">לחץ כדי לכבות</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-gradient-to-br ${sunMode ? 'from-white to-gray-100' : theme.gradient}`}>
      
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
        <button onClick={() => setIsRainMode(!isRainMode)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-105 ${isRainMode ? 'bg-blue-500 text-white animate-pulse' : 'bg-yellow-500 text-white'}`} title="מצב גשם">
          {isRainMode ? <Umbrella size={22} /> : <Bike size={22} />}
        </button>
        
        <button onClick={() => setFlashlight(true)} className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 transition-transform">
          <Lightbulb size={20} />
        </button>
        <button onClick={() => setSunMode(!sunMode)} className={`px-4 py-3 rounded-full shadow-xl border-2 flex items-center gap-2 font-bold transition-all transform hover:scale-105 ${sunMode ? 'bg-yellow-400 text-black border-black' : 'bg-gray-800 text-white border-gray-600'}`}>
          <Sun size={20}/> {sunMode ? 'רגיל' : 'שמש'}
        </button>
      </div>

      {!isWeekend && streetsToShow.length > 0 && !currentStreet && <StickyNextStreet streets={streetsToShow} theme={theme} />}

      <div className={sunMode ? 'grayscale contrast-125' : ''}>
        {showFirebaseGuide && <FirebaseSetupGuide />}
        <MailSortingReminder currentArea={currentDaySchedule.area} />
        <Header />
        
        <div className={`px-4 py-2 flex justify-between items-center transition-colors ${isRainMode ? 'bg-slate-900 text-white' : 'bg-transparent text-gray-800'}`}>
           <div className="flex items-center gap-2 text-sm font-bold">
             {isRainMode ? <CloudRain size={18} className="text-blue-300"/> : <Bike size={18} className="text-green-600"/>}
             {isRainMode ? "מצב גשם (הליכה)" : "מצב אופניים חשמליים ⚡"}
           </div>
           <button 
             onClick={() => setIsRainMode(!isRainMode)} 
             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRainMode ? 'bg-blue-500' : 'bg-gray-600'}`}
           >
             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRainMode ? 'translate-x-6' : 'translate-x-1'}`} />
           </button>
        </div>
        
        <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
          <TabBar current={tab} setTab={setTab} />

          {tab === "regular" && (
            <>
              <CycleDashboard cycleDay={cycleDay} setCycleDay={setCycleDay} completedCount={completedToday.length} pendingCount={streetsToShow.filter((s:any)=>!s.isCompleted).length} currentArea={todayArea} theme={theme} />

              {!isWeekend && (
                <div className="animate-fade-in-up">
                  {currentStreet && (() => {
                    const alertKey = Object.keys(BUILDING_ALERTS).find(key => currentStreet.name.includes(key));
                    if (alertKey) return (<div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-xl shadow-sm flex gap-3 animate-bounce-in"><Building className="text-orange-600 shrink-0" /><div><h4 className="font-bold text-orange-900">מודיעין בניין:</h4><p className="text-orange-800">{BUILDING_ALERTS[alertKey]}</p></div></div>);
                    return null;
                  })()}
                  
                  <CargoTracker 
                      regTotal={regTotal} setRegTotal={setRegTotal} regDone={regDone} setRegDone={setRegDone}
                      pkgTotal={pkgTotal} setPkgTotal={setPkgTotal} pkgDone={pkgDone} setPkgDone={setPkgDone}
                  />

                  <EstimatedFinishWidget 
                      streetsToShow={streetsToShow} 
                      kmWalked={kmWalked} 
                      regLeft={Math.max(0, regTotal - regDone)}
                      pkgLeft={Math.max(0, pkgTotal - pkgDone)}
                      isRainMode={isRainMode}
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
                        {streetsToShow.length > 0 ? (
                           streetsToShow.map((street: any) => (
                             <StreetCard 
                               key={street.id} 
                               street={street} 
                               theme={theme} 
                               onDone={markDelivered} 
                               onUndo={undoDelivered}
                               onStartTimer={handleStartTimer} 
                               isCompleted={street.isCompleted}
                               isRecentlyDone={street.isRecentlyDone}
                               daysSinceLastDelivery={street.daysSinceLastDelivery}
                               notes={streetNotes}
                               onSaveNote={saveNote}
                             />
                           ))
                        ) : (
                           <div className="text-center p-12"><CheckCircle2 size={48} className={`mx-auto mb-3 ${theme.iconColor}`} /><h3 className="text-2xl font-bold text-gray-800">הכל הושלם!</h3><p className="text-gray-500 text-sm mb-4">כל הכבוד, סיימת את המכסה להיום.</p><div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4"><div className="bg-green-500 h-full w-full animate-pulse"></div></div><button onClick={() => setCycleDay(cycleDay === 16 ? 1 : cycleDay + 1)} className={`mt-2 ${theme.primary} text-white px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition-all`}>עבור ליום הבא</button></div>
                        )}
                      </div>
                  )}

                  <div className="my-6 opacity-70 hover:opacity-100 transition-opacity"><AreaToggle area={todayArea} onEnd={endDay} /></div>
                  {currentStreet && <DeliveryTimer streetName={currentStreet.name} onComplete={handleCompleteDelivery} />}
                  <WalkingOrder area={todayArea} />
                  
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