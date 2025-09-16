// src/csv.ts
import type { Building, AreaId } from './domain'
import type { Resident } from './types'
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

/* ייבוא דיירים מ־CSV
   פורמט נתמך:
   fullName,streetName,buildingNumber,apartment,phone,allowMailbox,allowDoor,isPrimary,relationship
   "דוד כהן","הרצל","12","1","0501234567","כן","לא","כן","אב"
   "שרה לוי","ביאליק","3","2","0529876543","לא","כן","לא","אם"
*/
export function parseResidentsCsv(csv: string, buildings: Building[]): Array<{resident: Resident, buildingId: string}> {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length)
  if (!lines.length) return []
  const [header, ...rows] = lines
  const cols = header.split(',').map(h => h.trim().toLowerCase())
  
  const nameIdx = cols.indexOf('fullname') !== -1 ? cols.indexOf('fullname') : cols.indexOf('שם מלא')
  const streetIdx = cols.indexOf('streetname') !== -1 ? cols.indexOf('streetname') : cols.indexOf('רחוב')
  const buildingIdx = cols.indexOf('buildingnumber') !== -1 ? cols.indexOf('buildingnumber') : cols.indexOf('מספר בניין')
  const apartmentIdx = cols.indexOf('apartment') !== -1 ? cols.indexOf('apartment') : cols.indexOf('דירה')
  const phoneIdx = cols.indexOf('phone') !== -1 ? cols.indexOf('phone') : cols.indexOf('טלפון')
  const mailboxIdx = cols.indexOf('allowmailbox') !== -1 ? cols.indexOf('allowmailbox') : cols.indexOf('מאשר תיבה')
  const doorIdx = cols.indexOf('allowdoor') !== -1 ? cols.indexOf('allowdoor') : cols.indexOf('מאשר דלת')
  const primaryIdx = cols.indexOf('isprimary') !== -1 ? cols.indexOf('isprimary') : cols.indexOf('דייר ראשי')
  const relationshipIdx = cols.indexOf('relationship') !== -1 ? cols.indexOf('relationship') : cols.indexOf('קשר משפחתי')

  function splitCsvLine(line: string): string[] {
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

  const results: Array<{resident: Resident, buildingId: string}> = []

  rows.forEach(row => {
    const cells = splitCsvLine(row)
    
    const fullName = cells[nameIdx]?.trim()
    const streetName = cells[streetIdx]?.trim()
    const buildingNumber = cells[buildingIdx]?.trim()
    const apartment = cells[apartmentIdx]?.trim()
    const phone = cells[phoneIdx]?.trim()
    const allowMailbox = cells[mailboxIdx]?.trim().toLowerCase() === 'כן' || cells[mailboxIdx]?.trim().toLowerCase() === 'true'
    const allowDoor = cells[doorIdx]?.trim().toLowerCase() === 'כן' || cells[doorIdx]?.trim().toLowerCase() === 'true'
    const isPrimary = cells[primaryIdx]?.trim().toLowerCase() === 'כן' || cells[primaryIdx]?.trim().toLowerCase() === 'true'
    const relationship = cells[relationshipIdx]?.trim()

    if (!fullName || !apartment) return // שדות חובה

    // חיפוש בניין מתאים
    let targetBuilding: Building | undefined

    if (streetName && buildingNumber) {
      // חיפוש לפי שם רחוב ומספר בניין
      targetBuilding = buildings.find(b => {
        const street = require('../data/streets').streets.find((s: any) => s.id === b.streetId)
        return street?.name.includes(streetName) && b.number.toString() === buildingNumber
      })
    }

    if (!targetBuilding && buildings.length > 0) {
      // אם לא נמצא, השתמש בבניין הראשון (fallback)
      targetBuilding = buildings[0]
    }

    if (targetBuilding) {
      const resident: Resident = {
        id: nanoid(),
        fullName,
        apartment,
        phone: phone || undefined,
        allowMailbox,
        allowDoor,
        isPrimary,
        relationship: relationship || undefined,
        contacts: []
      }

      results.push({ resident, buildingId: targetBuilding.id })
    }
  })

  return results
}