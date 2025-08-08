import { useEffect, useMemo, useState } from 'react'
import type { AreaId, Building } from '@/types'
import { loadState, saveState, progress, setDeliveredAll, updateBuilding } from '@/lib/storage'

// אייקונים (אופציונלי – יש לך lucide-react ב-deps)
import { CheckCircle, XCircle, RefreshCw, Search, Home } from 'lucide-react'

type View = { mode: 'list' } | { mode: 'building'; id: string }

export default function App() {
  const [state, setState] = useState(loadState)
  const [area, setArea] = useState<AreaId>('A')
  const [q, setQ] = useState('')
  const [view, setView] = useState<View>({ mode: 'list' })

  useEffect(() => { saveState(state) }, [state])

  const buildings = useMemo(() => {
    const byArea = state.buildings.filter(b => b.area === area)
    const filtered = q.trim()
      ? byArea.filter(b => (b.name + ' ' + b.address).includes(q.trim()))
      : byArea

    // סדר מומלץ: קודם כאלה ש40–90% הושלמו, אחר כך 0–40, בסוף 90–100
    return filtered
      .map(b => ({ b, pr: progress(b) }))
      .sort((a, b) => sortHeuristic(a.pr.pct) - sortHeuristic(b.pr.pct))
      .map(x => x.b)
  }, [state, area, q])

  function sortHeuristic(pct: number) {
    if (pct >= 90) return 3
    if (pct >= 40) return 1
    return 2
  }

  function openBuilding(id: string) { setView({ mode: 'building', id }) }
  function back() { setView({ mode: 'list' }) }

  return (
    <div className="min-h-screen">
      <Header area={area} onAreaChange={setArea} q={q} onQ={setQ} onBack={view.mode === 'building' ? back : undefined} />
      <main className="container max-w-5xl py-4">
        {view.mode === 'list' ? (
          <BuildingList items={buildings} onOpen={openBuilding} onToggleAll={(b, d) => {
            setState(s => updateBuilding(s, setDeliveredAll(b, d)))
          }} />
        ) : (
          <BuildingDetails
            building={state.buildings.find(b => b.id === view.id)!}
            onExit={back}
            onUpdate={b => setState(s => updateBuilding(s, b))}
          />
        )}
      </main>
    </div>
  )
}

function Header({
  area, onAreaChange, q, onQ, onBack
}: { area: AreaId; onAreaChange: (a: AreaId) => void; q: string; onQ: (s: string) => void; onBack?: () => void }) {
  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 border-b">
      <div className="container max-w-5xl py-3 flex items-center gap-3">
        {onBack ? (
          <button className="btn" onClick={onBack} title="חזרה"><Home size={18} /></button>
        ) : null}
        <h1 className="text-xl font-semibold">מעקב חלוקת דואר</h1>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={area}
            onChange={e => onAreaChange(e.target.value as AreaId)}
            className="border rounded-lg px-3 py-2 bg-white"
            aria-label="אזור"
          >
            <option value="A">אזור A</option>
            <option value="B">אזור B</option>
          </select>
          <div className="relative">
            <input
              className="border rounded-lg ps-9 pe-3 py-2 bg-white min-w-[220px]"
              placeholder="חיפוש בניין/כתובת…"
              value={q}
              onChange={e => onQ(e.target.value)}
              aria-label="חיפוש"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70" size={18} />
          </div>
        </div>
      </div>
    </header>
  )
}

function BuildingList({
  items, onOpen, onToggleAll
}: { items: Building[]; onOpen: (id: string) => void; onToggleAll: (b: Building, delivered: boolean) => void }) {
  if (!items.length) return <p className="text-center text-slate-500">אין בניינים באזור הזה עדיין.</p>

  return (
    <div className="grid gap-3">
      {items.map(b => {
        const pr = progress(b)
        const bar = `bg-gradient-to-l from-sky-400 to-sky-500`
        const done = pr.pct >= 100

        return (
          <article key={b.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-medium truncate">{b.name}</h2>
                <p className="text-sm text-slate-500 truncate">{b.address}</p>
              </div>
              <div className="text-sm tabular-nums">{pr.done}/{pr.total} · {pr.pct}%</div>
              <button className="btn" onClick={() => onOpen(b.id)}>פתח</button>
              {done ? (
                <button className="btn btn-ghost text-emerald-600" onClick={() => onToggleAll(b, false)} title="אפס">
                  <RefreshCw size={18} />
                </button>
              ) : (
                <button className="btn btn-ghost text-emerald-600" onClick={() => onToggleAll(b, true)} title="סמן הכל כנמסר">
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
            <div className="h-2 bg-slate-100">
              <div className={`h-full ${bar}`} style={{ width: `${pr.pct}%` }} />
            </div>
          </article>
        )
      })}
    </div>
  )
}

function BuildingDetails({
  building, onExit, onUpdate
}: { building: Building; onExit: () => void; onUpdate: (b: Building) => void }) {
  const pr = progress(building)
  return (
    <section className="grid gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{building.name}</h2>
        <span className="text-sm text-slate-500">{building.address}</span>
        <span className="ml-auto text-sm tabular-nums">{pr.done}/{pr.total} · {pr.pct}%</span>
        <button className="btn" onClick={onExit}>סגור</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-right p-2">דירה</th>
              <th className="text-right p-2">הערה</th>
              <th className="text-right p-2 w-[1%]">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {building.apartments.map((a, i) => (
              <tr key={a.id} className="border-t">
                <td className="p-2">{a.label}</td>
                <td className="p-2">
                  <input
                    value={a.note ?? ''}
                    onChange={e => {
                      const next = { ...building }
                      next.apartments[i] = { ...a, note: e.target.value }
                      onUpdate(next)
                    }}
                    className="border rounded-lg px-2 py-1 w-full"
                    placeholder="לדוגמה: לא בבית / מסירה לשכן"
                  />
                </td>
                <td className="p-2">
                  <button
                    className={`btn ${a.delivered ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => {
                      const next = { ...building }
                      next.apartments[i] = { ...a, delivered: !a.delivered }
                      onUpdate(next)
                    }}
                    title={a.delivered ? 'בוטל – לא נמסר' : 'סומן – נמסר'}
                  >
                    {a.delivered ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* עזרי עיצוב קטנים */
declare module 'react' { interface HTMLAttributes<T> { /* מאפשר className לדאטים מותאמים אם צריך */ } }
