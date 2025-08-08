// src/domain.ts
import { nanoid } from 'nanoid'

export type AreaId = 'A' | 'B' // הרחב לפי הצורך

export enum DeliveryStatus {
  Pending = 'PENDING',        // לא נמסר עדיין
  Delivered = 'DELIVERED',    // נמסר
  NotHome = 'NOT_HOME',       // לא בבית
  Refused = 'REFUSED',        // סירב לקבל
  WrongAddress = 'WRONG_ADDRESS', // כתובת שגויה / לא מוכר
  ReturnToSender = 'RTS'      // החזרה לשולח (דואר רשום שלא נאסף/הוראה)
}

export type RegisteredMeta = {
  trackingId?: string           // מזהה רשום/ברקוד
  due?: string                  // תאריך יעד לאיסוף/מסירה (ISO YYYY-MM-DD)
  attemptsAllowed?: number      // ניסיונות מותרים (ברירת מחדל: 2)
}

export type Attempt = {
  id: string
  at: number
  reason?: string               // למשל: "לא בבית", "סירב"
}

export type Apartment = {
  id: string
  label: string                 // "דירה 3", "קומה 2 דלת 5"
  status: DeliveryStatus
  attempts: Attempt[]
  note?: string
  registered?: RegisteredMeta   // רק אם רלוונטי לדואר רשום
}

export type Building = {
  id: string
  name: string
  address: string
  area: AreaId
  apartments: Apartment[]
  updatedAt: number
  coords?: { lat: number; lng: number } // אופציונלי לאופטימיזציית מסלול
  priority?: number                      // 1–5 עדיפות (אופציונלי)
}

export type AppStateV2 = {
  version: 2
  buildings: Building[]
}

/* ---------- עזרי סטטיסטיקה/תצוגה (לוגיקה בלבד; בלי UI) ---------- */

export function buildingStats(b: Building) {
  const totals = {
    [DeliveryStatus.Pending]: 0,
    [DeliveryStatus.Delivered]: 0,
    [DeliveryStatus.NotHome]: 0,
    [DeliveryStatus.Refused]: 0,
    [DeliveryStatus.WrongAddress]: 0,
    [DeliveryStatus.ReturnToSender]: 0
  }
  for (const a of b.apartments) totals[a.status]++
  const total = b.apartments.length || 1
  const done = totals[DeliveryStatus.Delivered]
  const pct = Math.round((done / total) * 100)
  return { totals, total, done, pct }
}

/* ---------- פעולות על דירות/בניין (אימוטביליות, מחזירות אובייקט חדש) ---------- */

export function setApartmentStatus(
  b: Building,
  aptId: string,
  status: DeliveryStatus,
  note?: string
): Building {
  const idx = b.apartments.findIndex(a => a.id === aptId)
  if (idx === -1) return b
  const next = { ...b, apartments: [...b.apartments], updatedAt: Date.now() }
  const a = { ...next.apartments[idx] }
  a.status = status
  if (note !== undefined) a.note = note
  next.apartments[idx] = a
  return next
}

export function addAttempt(b: Building, aptId: string, reason?: string): Building {
  const idx = b.apartments.findIndex(a => a.id === aptId)
  if (idx === -1) return b
  const next = { ...b, apartments: [...b.apartments], updatedAt: Date.now() }
  const a = { ...next.apartments[idx] }
  a.attempts = [...a.attempts, { id: nanoid(), at: Date.now(), reason }]
  next.apartments[idx] = a
  return next
}

export function markAll(b: Building, status: DeliveryStatus): Building {
  const next = { ...b, apartments: b.apartments.map(a => ({ ...a, status })), updatedAt: Date.now() }
  return next
}

/* ---------- SLA לדואר רשום ---------- */

export function registeredSla(ap: Apartment) {
  if (!ap.registered?.due) return null
  const today = new Date()
  const due = new Date(ap.registered.due + 'T00:00:00')
  const msDay = 24 * 60 * 60 * 1000
  const daysLeft = Math.ceil((due.getTime() - stripTime(today).getTime()) / msDay)
  return { due: ap.registered.due, daysLeft, overdue: daysLeft < 0 }
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
