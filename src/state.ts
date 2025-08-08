// src/state.ts
import { nanoid } from 'nanoid'
import { AppState, Building, Apartment, AptStatus, AreaId, createBuilding } from './domain'

const KEY = 'dw:state' // מפתח אחיד

/* מצב ישן (למיגרציה בלבד) */
type V1Apartment = { id: string; label: string; delivered: boolean; note?: string }
type V1Building = { id: string; name: string; address: string; area: AreaId; apartments: V1Apartment[]; updatedAt: number }
type AppStateV1 = { version: 1; buildings: V1Building[] }
type AnyState = AppState | AppStateV1 | undefined | null

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as AnyState
    if (!parsed) return seed()
    if ((parsed as AppState).version === 2) return parsed as AppState
    if ((parsed as AppStateV1).version === 1) return migrateV1toV2(parsed as AppStateV1)
    return seed()
  } catch {
    return seed()
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function seed(): AppState {
  return {
    version: 2,
    buildings: [
      createBuilding('A', 'הרצל 12', 'הרצל 12, פ"ת', 10),
      createBuilding('A', 'ביאליק 3', 'ביאליק 3, פ"ת', 8),
      createBuilding('B', 'דגניה 5', 'דגניה 5, פ"ת', 6)
    ]
  }
}

/* מיגרציה: delivered:boolean -> AptStatus */
export function migrateV1toV2(v1: AppStateV1): AppState {
  function toApt(a: V1Apartment): Apartment {
    return {
      id: a.id || nanoid(),
      label: a.label ?? '',
      note: a.note,
      status: a.delivered ? AptStatus.Delivered : AptStatus.Pending
    }
  }
  const buildings: Building[] = v1.buildings.map(b => ({
    id: b.id || nanoid(),
    name: b.name,
    address: b.address,
    area: b.area,
    apartments: (b.apartments ?? []).map(toApt),
    updatedAt: b.updatedAt || Date.now()
  }))
  const v2: AppState = { version: 2, buildings }
  saveState(v2)
  return v2
}
