export default function ProgressBar({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(100, Math.round(pct)))
  return (
    <div className="u-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}>
      <span style={{ width: `${p}%` }} />
    </div>
  )
}
