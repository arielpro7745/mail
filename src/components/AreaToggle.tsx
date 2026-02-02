import { Area } from "../types";

// הגדרת הצבעים לכל אזור
export const getAreaColor = (area: Area) => {
  switch (area) {
    case 7: // האזור החדש (במקום 45)
      return {
        bg: "from-blue-500 to-indigo-600",
        bgSolid: "bg-blue-600",
        text: "text-blue-900",
        border: "border-blue-200"
      };
    case 14:
      return {
        bg: "from-red-500 to-rose-600",
        bgSolid: "bg-red-600",
        text: "text-red-900",
        border: "border-red-200"
      };
    case 12:
      return {
        bg: "from-emerald-500 to-teal-600",
        bgSolid: "bg-emerald-600",
        text: "text-emerald-900",
        border: "border-emerald-200"
      };
    default: // ברירת מחדל אם משהו משתבש
      return {
        bg: "from-gray-500 to-gray-600",
        bgSolid: "bg-gray-600",
        text: "text-gray-900",
        border: "border-gray-200"
      };
  }
};

// הגדרת השמות
export const getAreaName = (area: Area) => {
  switch (area) {
    case 7: return "מרכז העיר צפון (7)";
    case 14: return "מרכז העיר (14)";
    case 12: return "שכונת מפ''ם (12)";
    default: return `אזור ${area}`;
  }
};

// הגדרת האזור הבא בלופ
export const getNextArea = (current: Area): Area => {
  if (current === 12) return 7;
  if (current === 7) return 14;
  return 12; // מ-14 חוזרים ל-12
};