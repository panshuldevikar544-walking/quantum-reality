import { useEffect, useState } from 'react'
import { PACING, useStore } from '../state/store'
import { signals } from '../three/world'
import { Ket } from '../ui/MathText'
import { Reveal, Swap } from '../ui/Reveal'

/** Flips the classical bit while step 1 is on screen (paused when the deck is). */
function useBitFlipper(active: boolean) {
  const paused = useStore((s) => s.paused)
  const speed = useStore((s) => PACING[s.pacing].speed)
  const [bit, setBit] = useState<0 | 1>(0)
  useEffect(() => {
    if (!active) {
      signals.bitLit = 0
      setBit(0)
      return
    }
    if (paused) return
    const id = window.setInterval(() => {
      setBit((b) => {
        const n: 0 | 1 = b === 0 ? 1 : 0
        signals.bitLit = n
        return n
      })
    }, 1800 / speed)
    return () => window.clearInterval(id)
  }, [active, paused, speed])
  return bit
}

/** Scene 2 overlay: classical bit on the left, qubit on the right. */
export function Scene02Bits({ step }: { step: number }) {
  const bit = useBitFlipper(step === 1)

  return (
    <div className="ov">
      <Reveal show className="headline" delay={0.3}>
        <h2>Bits vs. qubits</h2>
      </Reveal>

      <Reveal show={step <= 1} className="bits-label" delay={0.6}>
        <span className="tag">Classical bit</span>
        {step === 1 && (
          <span className="bits-read" aria-live="polite">
            read <strong>{bit}</strong>
          </span>
        )}
      </Reveal>

      <Reveal show className="qubit-label" delay={0.8}>
        <span className="tag tag-quantum">Qubit</span>
      </Reveal>

      <Swap k={step} className="lower">
        {step === 0 && null}
        {step === 1 && <p className="statement">A classical bit is either 0 or 1 whenever it is read.</p>}
        {step === 2 && (
          <>
            <p className="statement">
              A qubit is a quantum state that can be a superposition of the basis states <Ket>0</Ket> and <Ket>1</Ket>.
            </p>
            <p className="aside">Not two classical values at once: one state, described differently.</p>
          </>
        )}
        {step === 3 && (
          <p className="statement">
            That state is described by probability amplitudes, <i className="m-var">α</i> and <i className="m-var">β</i>.
          </p>
        )}
      </Swap>
    </div>
  )
}
