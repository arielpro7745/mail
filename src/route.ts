// src/route.ts
import type { Building } from './domain'

type Point = { lat: number; lng: number }

export function orderByNearestNeighbor(
  buildings: Building[],
  start?: Point
): Building[] {
  const hasCoords = (b: Building) => !!b.coords
  const nodes = buildings.filter(hasCoords)
  const rest = buildings.filter(b => !hasCoords(b))

  if (nodes.length <= 2) return buildings // מעט מדי נתונים – השאר סדר קיים

  const used = new Set<string>()
  const path: Building[] = []

  let cur: Point
  if (start) {
    // בחר את הבניין הכי קרוב לנקודת ההתחלה
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < nodes.length; i++) {
      const d = dist(start, nodes[i].coords!)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    }
    path.push(nodes[bestIdx]); used.add(nodes[bestIdx].id)
    cur = nodes[bestIdx].coords!
  } else {
    path.push(nodes[0]); used.add(nodes[0].id); cur = nodes[0].coords!
  }

  while (path.length < nodes.length) {
    let best = -1
    let bestD = Infinity
    for (let i = 0; i < nodes.length; i++) {
      if (used.has(nodes[i].id)) continue
      const d = dist(cur, nodes[i].coords!)
      if (d < bestD) { bestD = d; best = i }
    }
    path.push(nodes[best]); used.add(nodes[best].id)
    cur = nodes[best].coords!
  }

  // צירוף הבניינים ללא קואורדינטות לסוף (סדר קיים)
  return path.concat(rest)
}

function dist(a: Point, b: Point) {
  // מרחק Haversine בק״מ
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const la1 = toRad(a.lat), la2 = toRad(b.lat)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
function toRad(d: number) { return (d * Math.PI) / 180 }
