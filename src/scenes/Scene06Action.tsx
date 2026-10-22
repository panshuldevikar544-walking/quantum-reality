import { Cpu, KeyRound, Network } from 'lucide-react'
import { BellEquation } from '../ui/MathText'
import { PairDemo } from '../ui/PairDemo'
import { Reveal, Swap } from '../ui/Reveal'

const USES = [
  { icon: KeyRound, title: 'Communication and cryptography', text: 'Basis of some quantum key distribution schemes' },
  { icon: Cpu, title: 'Quantum computing', text: 'Created by the entangling gates inside algorithms' },
  { icon: Network, title: 'Quantum information science', text: 'Teleportation, error correction, Bell tests' },
]

/** Scene 6 overlay: the hands-on Bell-pair demonstration. */
export function Scene06Action({ step }: { step: number }) {
  return (
    <div className="ov">
      <div className="top-left">
        <Reveal show className="headline headline-inline" delay={0.3}>
          <h2>Entanglement in action</h2>
        </Reveal>
        <Swap k={step} className="top-statement">
          {step === 0 && <p className="statement statement-sm">Prepare a pair, measure both qubits, repeat.</p>}
          {step === 1 && (
            <>
              <p className="statement statement-sm">
                Entanglement produces correlations that classical independent systems cannot reproduce in every
                measurement basis.
              </p>
              <p className="aside">
                Matching results in this one basis could be faked by a pre-agreed rule. Comparing several bases (a Bell
                test) is what rules that out.
              </p>
            </>
          )}
          {step >= 2 && null}
        </Swap>
      </div>

      <Reveal show className="model-badge" delay={0.9}>
        <span className="tag tag-quiet">Educational model, not a hardware simulation</span>
      </Reveal>

      <Reveal show={step >= 2} className="uses" delay={0.2}>
        <p className="uses-head">Why these correlations matter</p>
        <ul>
          {USES.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={22} aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <em>{text}</em>
              </span>
            </li>
          ))}
        </ul>
        <p className="uses-foot">Active research; only some uses are deployed today.</p>
      </Reveal>

      <Reveal show className="pair-console" delay={0.6}>
        <div className="pair-state">
          <BellEquation compact />
          <span className="pair-state-note">measured in the computational basis</span>
        </div>
        <PairDemo />
      </Reveal>
    </div>
  )
}
