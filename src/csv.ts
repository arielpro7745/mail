// src/csv.ts
import type { Building, AreaId } from './domain'
import { nanoid } from 'nanoid'
import { DeliveryStatus } from './domain'

/* ייצוא CSV כללי */
export function exportCsv(
  filename: string,
  rows: Array<Record<string, string | number | boolean | null | undefined>>
) {
  const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))))
  const csv = [headers.join(',')]
    .concat(rows.map(r => headers.map(h => cell(r[h])).join(',')))
    .join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function cell(v: any) {
  if (v == null) return ''
  const s = String(v).replace(/"/g, '""')
  return /[,"\n]/.test(s) ? `"${s}"` : s
}

/* ייבוא בניינים מ־CSV
   פורמט נתמך:
   name,address,apartments
   "הרצל 12","פ"ת","10"
   או:
   name,address,apartment_labels
   "הרצל 12","פ\"ת","דירה 1|דירה 2|דירה 3"

   הערה: לא נוגעים ב־UI — רק פונקציה שתחזיר מערך בניינים שתוכל להוסיף ל־state שלך.
*/
export function parseBuildingsCsv(csv: string, area: AreaId): Building[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const [header, ...rows] = lines
  const cols = header.split(',').map(h => h.trim().toLowerCase())
  const nameIdx = cols.indexOf('name')
  const addrIdx = cols.indexOf('address')
  const countIdx = cols.indexOf('apartments')
  const labelsIdx = cols.indexOf('apartment_labels')

  function splitCsvLine(line: string): string[] {
    // פיצול פשוט עם תמיכה בסיסית במרכאות
    const out: string[] = []
    let cur = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue }
      if (ch === '"') { quoted = !quoted; continue }
      if (ch === ',' && !quoted) { out.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    out.push(cur.trim())
    return out
  }

  return rows.map(r => {
    const cells = splitCsvLine(r)
    const name = cells[nameIdx] || 'ללא שם'
    const address = cells[addrIdx] || ''
    let labels: string[] = []
    if (labelsIdx !== -1 && cells[labelsIdx]) {
      labels = cells[labelsIdx].split('|').map(s => s.trim()).filter(Boolean)
    }
    const apartments =
      labels.length > 0
        ? labels
        : (() => {
            const n = Math.max(0, Number(cells[countIdx] || 0))
            return Array.from({ length: n }, (_, i) => `דירה ${i + 1}`)
          })()

    return {
      id: nanoid(),
      name,
      address,
      area,
      updatedAt: Date.now(),
      apartments: apartments.map(label => ({
        id: nanoid(),
        label,
        status: DeliveryStatus.Pending,
        attempts: []
      }))
    } as Building
  })
}
