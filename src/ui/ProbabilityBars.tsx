import { formatPct } from '../lib/quantum'

/** Two horizontal probability bars for |0⟩ and |1⟩. Widths animate via CSS. */
export function ProbabilityBars({
  p0,
  highlight,
  caption,
}: {
  p0: number
  /** Outcome to emphasise (after a measurement), if any. */
  highlight?: 0 | 1 | null
  caption?: string
}) {
  const rows: [0 | 1, number][] = [
    [0, p0],
    [1, 1 - p0],
  ]
  return (
    <div className="prob" role="group" aria-label="Measurement probabilities">
      {rows.map(([k, p]) => (
        <div key={k} className={`prob-row${highlight === k ? ' is-hit' : ''}`}>
          <span className="prob-key">P({k})</span>
          <span className="prob-track">
            <span className={`prob-fill prob-fill-${k}`} style={{ transform: `scaleX(${p.toFixed(4)})` }} />
          </span>
          <span className="prob-val">{formatPct(p)}</span>
        </div>
      ))}
      {caption && <p className="prob-caption">{caption}</p>}
    </div>
  )
}
