// src/domain.ts
import { nanoid } from 'nanoid'

export type AreaId = 'A' | 'B' // הרחב כרצונך

export enum AptStatus {
  Pending = 'PENDING',   // לא חולק עדיין
  Delivered = 'DELIVERED',// חולק
  Skip = 'SKIP',         // דילוג (לדוגמה: אין דואר/תיבה חסומה)
  Vacant = 'VACANT'      // דירה ריקה/סגורה לטווח ארוך
}

export type Apartment = {
  id: string
  label: string         // "דירה 1", "קומה 2 דלת 5" וכו'
  status: AptStatus
  note?: string
}

export type Building = {
  id: string
  name: string
  address: string
  area: AreaId
  order?: number        // סדר ידני (אם תרצה)
  coords?: { lat: number; lng: number } // אופציונלי למסלול
  apartments: Apartment[]
  updatedAt: number
}

export type AppState = {
  version: 2
  buildings: Building[]
}

/* ---------- סטטיסטיקה ---------- */
export function progress(b: Building) {
  const total = b.apartments.length || 1
  const done = b.apartments.filter(a => a.status === AptStatus.Delivered).length
  const pct = Math.round((done / total) * 100)
  return { total, done, pct }
}

/* ---------- פעולות דירות/בניין (בלתי־הרסניות) ---------- */
export function setAptStatus(b: Building, aptId: string, status: AptStatus, note?: string): Building {
  const idx = b.apartments.findIndex(a => a.id === aptId)
  if (idx === -1) return b
  const next = { ...b, apartments: [...b.apartments], updatedAt: Date.now() }
  const a = { ...next.apartments[idx], status }
  if (note !== undefined) a.note = note
  next.apartments[idx] = a
  return next
}

export function toggleDelivered(b: Building, aptId: string): Building {
  const idx = b.apartments.findIndex(a => a.id === aptId)
  if (idx === -1) return b
  const cur = b.apartments[idx].status
  const nextStatus = cur === AptStatus.Delivered ? AptStatus.Pending : AptStatus.Delivered
  return setAptStatus(b, aptId, nextStatus)
}

export function markAll(b: Building, status: AptStatus): Building {
  return {
    ...b,
    apartments: b.apartments.map(a => ({ ...a, status })),
    updatedAt: Date.now()
  }
}

/* ---------- כלי טווחים (לסימון 1,3-7,12) ---------- */
export function parseRange(expr: string): number[] {
  // קלט כמו: "1,3-5,10" -> [1,3,4,5,10]
  const out = new Set<number>()
  for (const part of expr.split(',').map(s => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)-(\d+)$/)
    if (m) {
      const a = Number(m[1]), b = Number(m[2])
      const [lo, hi] = a <= b ? [a, b] : [b, a]
      for (let i = lo; i <= hi; i++) out.add(i)
    } else {
      const n = Number(part)
      if (!Number.isNaN(n)) out.add(n)
    }
  }
  return Array.from(out).sort((a, b) => a - b)
}

/** מסמן טווח דירות לפי אינדקס 1..N (לא לפי id) */
export function markRange(b: Building, rangeExpr: string, status: AptStatus): Building {
  const idxs = new Set(parseRange(rangeExpr).map(n => n - 1)) // make 0-based
  const next = { ...b, apartments: [...b.apartments], updatedAt: Date.now() }
  next.apartments = next.apartments.map((a, i) => idxs.has(i) ? { ...a, status } : a)
  return next
}

/* ---------- תבנית שמות לדירות ---------- */
export function renameAptsByPattern(b: Building, pattern = 'דירה {n}', startFrom = 1): Building {
  const next = { ...b, apartments: [...b.apartments], updatedAt: Date.now() }
  next.apartments = next.apartments.map((a, i) => ({
    ...a,
    label: pattern.replace('{n}', String(i + startFrom))
  }))
  return next
}

/* ---------- יצירת בניין מהרשאה בסיסית ---------- */
export function createBuilding(area: AreaId, name: string, address: string, apartmentsCount: number): Building {
  return {
    id: nanoid(),
    name, address, area,
    apartments: Array.from({ length: apartmentsCount }, (_, i) => ({
      id: nanoid(),
      label: `דירה ${i + 1}`,
      status: AptStatus.Pending
    })),
    updatedAt: Date.now()
  }
}
