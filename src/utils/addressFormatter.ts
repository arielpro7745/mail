// src/utils/addressFormatter.ts

/**
 * מעצב כתובת רחוב לתצוגה קצרה או מלאה
 */
export function formatStreetAddress(streetName: string, buildingNumber: number, shortFormat: boolean = false): string {
  if (!shortFormat) {
    return `${streetName} ${buildingNumber}`;
  }

  // הסרת טווחי מספרים מהשם
  const cleanName = streetName
    .replace(/\s+\d+‑\d+.*$/, '') // הסרת "141‑109" וכל מה שאחרי
    .replace(/\s+\(\w+\)$/, '')   // הסרת "(זוגי)" או "(אי‑זוגי)"
    .trim();

  return `${cleanName} ${buildingNumber}`;
}

/**
 * מעצב שם רחוב לתצוגה קצרה
 */
export function formatStreetName(streetName: string, shortFormat: boolean = false): string {
  if (!shortFormat) {
    return streetName;
  }

  return streetName
    .replace(/\s+\d+‑\d+.*$/, '') // הסרת טווחי מספרים
    .replace(/\s+\(\w+\)$/, '')   // הסרת סוגריים
    .trim();
}

/**
 * דוגמאות:
 * "רוטשילד 141‑109" → "רוטשילד"
 * "התשעים ושלוש 42‑2 (זוגי)" → "התשעים ושלוש"
 * "דוד צבי פנקס 1‑21 (אי‑זוגי)" → "דוד צבי פנקס"
 */