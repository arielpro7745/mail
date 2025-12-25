// src/data/scheduleData.ts

// הגדרת סבב 15 הימים
export const SCHEDULE_15_DAYS = [
  // שבוע 1
  { day: 1, area: 45, title: "ויצמן והצפון", color: "blue", streets: ["ויצמן", "ליסין", "מרטין בובר"], tips: "שים לב: ויצמן 33 (עמוס), 9 ו-7." },
  { day: 2, area: 14, title: "רוטשילד זוגי (הכבד)", color: "red", streets: ["הדף היומי", "רוטשילד", "גד מכנס"], tips: "רוטשילד צד זוגי בלבד! (110-182). זהירות בכניסות." },
  { day: 3, area: 12, title: "צפון 12 (ה-93)", color: "green", streets: ["רוטשילד 100", "דוד צבי פנקס", "התשעים ושלוש"], tips: "המוקד היום: התשעים ושלוש." },
  { day: 4, area: 45, title: "היבנר סולו", color: "blue", streets: ["היבנר"], tips: "יום פיזי קשה. כל הרחוב: זוגי יורד, אי-זוגי עולה." },
  
  // === יום חמישי 25.12 ===
  { day: 5, area: 12, title: "אמצע 12", color: "green", streets: ["הרב קוק", "הכרם", "זכרון משה", "אנה פרנק"], tips: "יום רגוע יחסית. להכין את הגוף לסופ\"ש." },
  
  // === יום ראשון ===
  { day: 6, area: 45, title: "דגל ראובן סולו", color: "blue", streets: ["דגל ראובן"], tips: "פותחים שבוע בכחול: הליכה ישרה בדגל ראובן." },
  { day: 7, area: 14, title: "רוטשילד אי-זוגי (הקל)", color: "red", streets: ["רוטשילד", "קק\"ל", "קרן קיימת"], tips: "יום שני אדום: רוטשילד אי-זוגי בלבד!" },
  { day: 8, area: 12, title: "דרום 12 (הגשר)", color: "green", streets: ["חיים כהן", "מנדלסון", "האחים ראב", "שבדיה"], tips: "זהירות בחיים כהן." },
  { day: 9, area: 45, title: "דרום 45 (יטקובסקי)", color: "blue", streets: ["מירקין", "ברטונוב", "הפרטיזנים", "סנדרוב", "שטרן", "אחים יטקובסקי"], tips: "יטקובסקי: לשים לב ל-37 ו-36." },
  
  // שבוע 2 (חזרות)
  { day: 10, area: 45, title: "ויצמן (חזרה)", color: "blue", streets: ["ויצמן", "ליסין", "מרטין בובר"], tips: "סיבוב שני. לוודא שאין שאריות." },
  { day: 11, area: 14, title: "רוטשילד זוגי (חזרה)", color: "red", streets: ["הדף היומי", "רוטשילד", "גד מכנס"], tips: "סיבוב שני. לבדוק את בתי האבות." },
  { day: 12, area: 12, title: "ה-93 (חזרה)", color: "green", streets: ["רוטשילד 100", "דוד צבי פנקס", "התשעים ושלוש"], tips: "סיבוב שני." },
  { day: 13, area: 45, title: "היבנר (חזרה)", color: "blue", streets: ["היבנר"], tips: "סיבוב שני. כוח!" },
  { day: 14, area: 12, title: "הרב קוק (חזרה)", color: "green", streets: ["הרב קוק", "הכרם", "זכרון משה", "אנה פרנק"], tips: "סיבוב שני." },
  { day: 15, area: 45, title: "דגל ראובן (חזרה)", color: "blue", streets: ["דגל ראובן"], tips: "סיבוב שני וסיום הסבב." }
];

// חישוב יום אוטומטי (מדלג על שישי-שבת)
export const calculateAutoCycleDay = () => {
  const anchorDate = new Date('2025-12-25T00:00:00'); // עוגן: יום חמישי, ה-25.12
  const anchorCycleDay = 5;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (today < anchorDate) return 5;
  
  let workDaysPassed = 0;
  let currentDate = new Date(anchorDate);
  
  // סופרים ימים קדימה, מדלגים על סופ"ש
  while (currentDate < today) {
    currentDate.setDate(currentDate.getDate() + 1);
    const day = currentDate.getDay();
    if (day !== 5 && day !== 6) { // 5=שישי, 6=שבת
      workDaysPassed++;
    }
  }
  
  let currentCycle = (anchorCycleDay + workDaysPassed) % 15;
  if (currentCycle === 0) currentCycle = 15;
  return currentCycle;
};