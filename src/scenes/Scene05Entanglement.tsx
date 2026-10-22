import { RotateCw } from 'lucide-react'
import { measurePair } from '../state/store'
import { BellEquation } from '../ui/MathText'
import { Reveal, Swap } from '../ui/Reveal'

/** Scene 5 overlay: the emotional centrepiece. Two qubits, one shared state. */
export function Scene05Entanglement({ step }: { step: number }) {
  return (
    <div className="ov">
      <Reveal show className="headline" delay={0.4}>
        <h2>Entanglement</h2>
      </Reveal>

      <Reveal show={step >= 2} className="bell-top" delay={0.3} duration={1.3}>
        <BellEquation />
        <p className="bell-sub">Measured: 00 or 11, each with probability ½. Never 01 or 10.</p>
      </Reveal>

      <Reveal show={step >= 1} className="concept-tag" delay={1.6}>
        <span className="tag tag-quiet">Conceptual picture: the glow represents a shared state, not a physical wire</span>
      </Reveal>

      <Swap k={step} className="lower lower-center">
        {step === 0 && <p className="statement statement-dim">Two qubits, far apart, each with its own independent state.</p>}
        {(step === 1 || step === 2) && (
          <p className="statement">
            Entangled qubits share a joint quantum state that cannot be described as independent states of each qubit.
          </p>
        )}
        {step === 3 && (
          <>
            <p className="statement">Correlation, not communication.</p>
            <p className="aside">
              Each result on its own is a fair coin flip, so no message or signal passes between A and B. The match only
              appears when the two records are compared.
            </p>
          </>
        )}
      </Swap>

      <Reveal show={step === 3} className="again" delay={2}>
        <button type="button" className="btn btn-quiet" onClick={() => measurePair()}>
          <RotateCw size={16} aria-hidden="true" /> Measure a fresh pair
        </button>
      </Reveal>
    </div>
  )
}
