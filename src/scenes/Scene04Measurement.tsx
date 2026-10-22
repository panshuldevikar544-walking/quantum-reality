import { AnimatePresence, motion } from 'motion/react'
import { UI_EASE } from '../lib/easing'
import { formatPct, probabilities } from '../lib/quantum'
import { useStore } from '../state/store'
import { MEASURE_TRAVEL } from '../three/choreography'
import { AbsSq, Ket, V } from '../ui/MathText'
import { MeasurementDemo } from '../ui/MeasurementDemo'
import { Reveal, Swap, useUiMotion } from '../ui/Reveal'

/** The big orange outcome digit. Appears when the pulse reaches the qubit. */
function Outcome() {
  const outcome = useStore((s) => s.measure.outcome)
  const nonce = useStore((s) => s.measure.nonce)
  const batch = useStore((s) => s.measure.lastBatch)
  const { lowMotion, speed } = useUiMotion()
  return (
    <div className="outcome-slot" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {outcome !== null && (
          <motion.div
            key={nonce}
            className="outcome"
            initial={{ opacity: 0, scale: lowMotion ? 1 : 1.35, filter: lowMotion ? 'blur(0px)' : 'blur(16px)' }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              transition: { duration: 0.9 / speed, delay: MEASURE_TRAVEL / speed, ease: UI_EASE },
            }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <span className="outcome-label">{batch > 1 ? `Last of ${batch} shots` : 'Outcome'}</span>
            <span className="outcome-digit">{outcome}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Scene 4 overlay: a readout console on the right half of the stage. */
export function Scene04Measurement({ step }: { step: number }) {
  const theta = useStore((s) => s.qubit.theta)
  const { p0, p1 } = probabilities({ theta, phi: 0 })

  return (
    <div className="ov">
      <div className="console">
        <Reveal show className="headline headline-inline" delay={0.4}>
          <h2>Measurement</h2>
        </Reveal>
        <Swap k={step >= 1 ? 'a' : 'b'} className="console-statement">
          {step >= 1 ? (
            <p className="statement">Measurement produces a definite outcome.</p>
          ) : (
            <p className="statement statement-dim">Everything so far describes the state before anyone looks.</p>
          )}
        </Swap>

        <div className="console-body">
          <div className="console-left">{step >= 1 && <Outcome />}</div>
          <div className="console-right">
            <Reveal show={step === 2} className="rule" delay={0.3}>
              <p className="rule-line">
                P(0) = <AbsSq><V>α</V></AbsSq> <span className="rule-val">= {formatPct(p0)}</span>
              </p>
              <p className="rule-line">
                P(1) = <AbsSq><V>β</V></AbsSq> <span className="rule-val">= {formatPct(p1)}</span>
              </p>
              <p className="aside">
                For this state, measured in the <Ket>0</Ket>, <Ket>1</Ket> basis. Only an equal superposition gives 50 / 50.
              </p>
            </Reveal>
            <Reveal show={step >= 3} delay={0.2}>
              <MeasurementDemo />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  )
}
