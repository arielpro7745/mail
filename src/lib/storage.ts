import { nanoid } from 'nanoid'
import type { AppStateV1, Building, Apartment, AreaId } from '@/types'

const KEY = 'dw:state:v1'

export function loadState(): AppStateV1 {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as AppStateV1
    if (parsed?.version !== 1) return seed()
    return parsed
  } catch {
    return seed()
  }
}

export function saveState(state: AppStateV1) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function seed(): AppStateV1 {
  const mk = (area: AreaId, name: string, address: string, n: number): Building => ({
    id: nanoid(),
    name,
    address,
    area,
    apartments: Array.from({ length: n }, (_, i) => ({
      id: nanoid(),
      label: `דירה ${i + 1}`,
      delivered: false
    })),
    updatedAt: Date.now()
  })

  return {
    version: 1,
    buildings: [
      mk('A', 'בניין הרצל 12', 'הרצל 12, פ"ת', 10),
      mk('A', 'בניין ביאליק 3', 'ביאליק 3, פ"ת', 8),
      mk('B', 'בניין דגניה 5', 'דגניה 5, פ"ת', 6)
    ]
  }
}

export function updateBuilding(state: AppStateV1, b: Building): AppStateV1 {
  const idx = state.buildings.findIndex(x => x.id === b.id)
  if (idx === -1) return state
  const draft = { ...state, buildings: [...state.buildings] }
  draft.buildings[idx] = { ...b, updatedAt: Date.now() }
  return draft
}

export function setDeliveredAll(b: Building, delivered: boolean): Building {
  return { ...b, apartments: b.apartments.map(a => ({ ...a, delivered })), updatedAt: Date.now() }
}

export function progress(b: Building): { done: number; total: number; pct: number } {
  const total = b.apartments.length || 1
  const done = b.apartments.filter(a => a.delivered).length
  return { done, total, pct: Math.round((done / total) * 100) }
}
