import AppShell from '@/ui/AppShell'
import ProgressBar from '@/ui/ProgressBar'
import { progress } from '@/domain' // אם השתמשת בלוגיקה מהסבב קודם; אם לא—השאר את החישוב שלך

export default function BuildingPage({ building /* מגיע אצלך כמו היום */ }) {
  const { pct, done, total } = progress(building) // או השיטה הקיימת אצלך

  return (
    <AppShell title={building.name}>
      <div className="u-card u-card-pad">
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600">{building.address}</div>
          <div className="ml-auto text-sm tabular-nums">{done}/{total} · {pct}%</div>
        </div>
        <div className="mt-2"><ProgressBar pct={pct} /></div>
      </div>

      {/* ↓↓↓ התוכן המקורי של דיירים/טבלאות נשאר ↓↓↓ */}
      <div className="u-card u-card-pad">
        {/* הטבלה/כפתורים/טוגלים שלך — ללא שינוי */}
        {/* ... הקוד הקיים שלך ... */}
      </div>
    </AppShell>
  )
}
