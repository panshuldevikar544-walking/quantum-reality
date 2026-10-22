import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { PRESET_STATES, probabilities } from '../lib/quantum'
import { measure, PACING, resetMeasurement, setQubit, useStore } from '../state/store'
import { MEASURE_TRAVEL } from '../three/choreography'
import { Ket } from './MathText'
import { ThetaSlider } from './StateControls'

/** Counts shown only once the measurement animation has landed. */
function useLandedCounts(): [number, number] {
  const counts = useStore((s) => s.measure.counts)
  const nonce = useStore((s) => s.measure.nonce)
  const speed = useStore((s) => PACING[s.pacing].speed)
  const [shown, setShown] = useState(counts)
  useEffect(() => {
    if (counts[0] + counts[1] === 0) {
      setShown(counts)
      return
    }
    const id = window.setTimeout(() => setShown(counts), (MEASURE_TRAVEL / speed) * 1000)
    return () => window.clearTimeout(id)
  }, [counts, nonce, speed])
  return shown
}

/**
 * Scene 4 demo: choose a state, measure it once or 100 times, and compare the
 * observed frequencies with the predicted |α|² and |β|².
 */
export function MeasurementDemo() {
  const theta = useStore((s) => s.qubit.theta)
  const { p0 } = probabilities({ theta, phi: 0 })
  const counts = useLandedCounts()
  const total = counts[0] + counts[1]

  const choose = (t: number) => {
    setQubit({ theta: t })
    resetMeasurement()
  }

  return (
    <div className="demo measure-demo">
      <div className="demo-row presets" role="group" aria-label="Choose a state">
        {PRESET_STATES.map((p) => {
          const active = Math.abs(p.state.theta - theta) < 0.01
          return (
            <button
              key={p.id}
              type="button"
              className={`chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              onClick={() => choose(p.state.theta)}
            >
              {p.id === 'zero' ? <Ket>0</Ket> : p.label}
            </button>
          )
        })}
      </div>
      {/* changing the state starts a fresh experiment */}
      <ThetaSlider onChanged={resetMeasurement} />

      <div className="demo-row actions">
        <button type="button" className="btn btn-primary" onClick={() => measure(1)}>
          Measure once
        </button>
        <button type="button" className="btn" onClick={() => measure(100)}>
          Measure 100×
        </button>
        <button type="button" className="btn btn-icon" onClick={resetMeasurement} aria-label="Reset counts" title="Reset counts">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="histogram" aria-live="polite">
        {[0, 1].map((k) => {
          const observed = total ? counts[k] / total : 0
          const predicted = k === 0 ? p0 : 1 - p0
          return (
            <div key={k} className="hist-col">
              <div className="hist-bar">
                <span className={`hist-fill hist-fill-${k}`} style={{ transform: `scaleY(${observed.toFixed(4)})` }} />
                <span className="hist-pred" style={{ bottom: `${(predicted * 100).toFixed(2)}%` }} title="Predicted" />
              </div>
              <div className="hist-label">
                <span className="hist-outcome">{k}</span>
                <span className="hist-count">{counts[k]}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p className="demo-note">
        {total === 0
          ? 'Lines mark the prediction. Each shot prepares the state again, then measures it.'
          : `${total} shot${total === 1 ? '' : 's'}. Lines mark the predicted ${Math.round(p0 * 100)}% / ${Math.round((1 - p0) * 100)}%.`}
      </p>
    </div>
  )
}
