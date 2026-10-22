import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { measurePair, PACING, resetPair, useStore, type PairKey } from '../state/store'
import { PAIR_SEQUENCE } from '../three/choreography'

const KEYS: PairKey[] = ['00', '01', '10', '11']

interface Landed {
  a: 0 | 1 | null
  b: 0 | 1 | null
  counts: Record<PairKey, number>
}

/** Outcomes and tally, revealed only when the measurement animation lands. */
function useLanded(): Landed {
  const pair = useStore((s) => s.pair)
  const speed = useStore((s) => PACING[s.pacing].speed)
  const [shown, setShown] = useState<Landed>({ a: pair.a, b: pair.b, counts: pair.counts })
  useEffect(() => {
    const next = { a: pair.a, b: pair.b, counts: pair.counts }
    if (pair.a === null) {
      setShown(next)
      return
    }
    setShown((prev) => ({ ...prev, a: null, b: null }))
    const id = window.setTimeout(() => setShown(next), (PAIR_SEQUENCE / speed) * 1000)
    return () => window.clearTimeout(id)
  }, [pair, speed])
  return shown
}

function OutcomeBox({ name, value }: { name: string; value: 0 | 1 | null }) {
  return (
    <div className={`qbox${value !== null ? ' has-value' : ''}`} aria-live="polite">
      <span className="qbox-name">{name}</span>
      <span className="qbox-value" aria-label={value === null ? `${name}: not measured` : `${name}: ${value}`}>
        {value === null ? '–' : value}
      </span>
    </div>
  )
}

/**
 * Scene 6 demo: prepare |Φ⁺⟩, measure both qubits, and tally the joint
 * outcomes. 01 and 10 stay at zero because the state has no such terms.
 */
export function PairDemo() {
  const speed = useStore((s) => PACING[s.pacing].speed)
  const shown = useLanded()
  const [busy, setBusy] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onMeasure = () => {
    if (busy) return
    measurePair()
    setBusy(true)
    timer.current = window.setTimeout(() => setBusy(false), ((PAIR_SEQUENCE + 0.3) / speed) * 1000)
  }

  const total = KEYS.reduce((n, k) => n + shown.counts[k], 0)
  const max = Math.max(1, ...KEYS.map((k) => shown.counts[k]))

  return (
    <div className="demo pair-demo">
      <div className="pair-row">
        <OutcomeBox name="Qubit A" value={shown.a} />
        <div className="pair-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onMeasure} aria-disabled={busy}>
            Measure pair
          </button>
          <button type="button" className="btn btn-icon" onClick={resetPair} aria-label="Reset tally" title="Reset tally">
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>
        <OutcomeBox name="Qubit B" value={shown.b} />
      </div>
      <div className="tally" aria-label="Joint outcome tally">
        {KEYS.map((k) => {
          const forbidden = k === '01' || k === '10'
          return (
            <div key={k} className={`tally-row${forbidden ? ' is-forbidden' : ''}`}>
              <span className="tally-key">{k}</span>
              <span className="tally-count">{shown.counts[k]}</span>
              <span className="tally-track">
                <span className="tally-fill" style={{ transform: `scaleX(${(shown.counts[k] / max).toFixed(4)})` }} />
              </span>
            </div>
          )
        })}
      </div>
      <p className="demo-note">
        {total === 0
          ? 'Each press prepares a fresh pair and measures both qubits.'
          : `${total} pair${total === 1 ? '' : 's'} measured. 01 and 10 never occur for this state.`}
      </p>
    </div>
  )
}
