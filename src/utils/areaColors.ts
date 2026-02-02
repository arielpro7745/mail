import { Area } from "../types";

export const getAreaColor = (area: Area) => {
  // הגנה: אם מגיע 45, נתייחס אליו כ-7
  const safeArea = area === 45 ? 7 : area;

  switch (safeArea) {
    case 7: // האזור החדש - כחול
      return {
        bg: "from-blue-500 to-indigo-600",
        bgSolid: "bg-blue-600",
        text: "text-blue-900",
        border: "border-blue-200"
      };
    case 14: // אדום
      return {
        bg: "from-red-500 to-rose-600",
        bgSolid: "bg-red-600",
        text: "text-red-900",
        border: "border-red-200"
      };
    case 12: // ירוק
      return {
        bg: "from-emerald-500 to-teal-600",
        bgSolid: "bg-emerald-600",
        text: "text-emerald-900",
        border: "border-emerald-200"
      };
    default:
      return {
        bg: "from-gray-500 to-gray-600",
        bgSolid: "bg-gray-600",
        text: "text-gray-900",
        border: "border-gray-200"
      };
  }
};

export const getAreaName = (area: Area) => {
  const safeArea = area === 45 ? 7 : area;
  switch (safeArea) {
    case 7: return "מרכז העיר צפון (7)";
    case 14: return "מרכז העיר (14)";
    case 12: return "שכונת מפ''ם (12)";
    default: return `אזור ${area}`;
  }
};

// הגדרת האזור הבא בלופ: 12 -> 7 -> 14
export const getNextArea = (current: Area): Area => {
  if (current === 12) return 7;
  if (current === 7) return 14;
  return 12; 
};

// חישוב אוטומטי לפי תאריך (אם צריך)
export const calculateTodayArea = (): Area => {
    // לוגיקה פשוטה לגיבוי
    return 12;
};