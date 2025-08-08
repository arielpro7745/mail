export type AreaId = 'A' | 'B'

export type Apartment = {
  id: string
  label: string // לדוגמה: "דירה 3", "קומה 2 דלת 5"
  delivered: boolean
  note?: string
}

export type Building = {
  id: string
  name: string
  address: string
  area: AreaId
  apartments: Apartment[]
  updatedAt: number
}

export type AppStateV1 = {
  version: 1
  buildings: Building[]
}
