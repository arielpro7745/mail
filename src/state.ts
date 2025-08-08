// src/state.ts
import { nanoid } from 'nanoid'
import {
  AppStateV2, Building, Apartment, DeliveryStatus, AreaId
} from './domain'

const KEY = 'dw:state' // מפתח יחיד; נחסוך גרסאות במפתח

/* אם יש לך State ישן (V1) עם delivered:boolean – נגדיר טיפוס מינימלי רק למיגרציה */
type V1Apartment = { id: string; label: string; delivered: boolean; note?: string }
type V1Building = {
  id: string; name: string; address: string; area: AreaId;
  apartments: V1Apartment[]; updatedAt: number
}
type AppStateV1 = { version: 1; buildings: V1Building[] }

type AnyState = AppStateV1 | AppStateV2 | undefined | null

export function loadState(): AppStateV2 {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as AnyState
    if (!parsed) return seed()
    if ((parsed as AppStateV2).version === 2) return parsed as AppStateV2
    if ((parsed as AppStateV1).version === 1) return migrateV1toV2(parsed as AppStateV1)
    return seed()
  } catch {
    return seed()
  }
}

export function saveState(state: AppStateV2) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

/* זרעים ראשוניים (אם אין כלום) */
export function seed(): AppStateV2 {
  const mk = (area: AreaId, name: string, address: string, n: number): Building => ({
    id: nanoid(),
    name, address, area, updatedAt: Date.now(),
    apartments: Array.from({ length: n }, (_, i) => ({
      id: nanoid(),
      label: `דירה ${i + 1}`,
      status: DeliveryStatus.Pending,
      attempts: []
    }))
  })
  return {
    version: 2,
    buildings: [
      mk('A', 'בניין הרצל 12', 'הרצל 12, פ"ת', 10),
      mk('A', 'בניין ביאליק 3', 'ביאליק 3, פ"ת', 8),
      mk('B', 'בניין דגניה 5', 'דגניה 5, פ"ת', 6)
    ]
  }
}

/* מיגרציה מ־V1 (delivered:boolean) ל־V2 (status enum + attempts ריק) */
export function migrateV1toV2(v1: AppStateV1): AppStateV2 {
  function toV2Apartment(a: V1Apartment): Apartment {
    return {
      id: a.id,
      label: a.label,
      note: a.note,
      status: a.delivered ? DeliveryStatus.Delivered : DeliveryStatus.Pending,
      attempts: []
    }
  }
  const buildings: Building[] = v1.buildings.map(b => ({
    id: b.id,
    name: b.name,
    address: b.address,
    area: b.area,
    updatedAt: b.updatedAt || Date.now(),
    apartments: b.apartments.map(toV2Apartment)
  }))
  const v2: AppStateV2 = { version: 2, buildings }
  saveState(v2)
  return v2
}
