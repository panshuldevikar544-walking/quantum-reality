import { probabilities } from '../lib/quantum'
import { useStore } from '../state/store'
import { AbsSq, PsiEquation, V } from '../ui/MathText'
import { ProbabilityBars } from '../ui/ProbabilityBars'
import { Reveal, Swap } from '../ui/Reveal'
import { AmplitudeReadout, PhiSlider, ThetaSlider } from '../ui/StateControls'

/** Scene 3 overlay: equation, amplitudes, analogy and the interactive state. */
export function Scene03Superposition({ step }: { step: number }) {
  const theta = useStore((s) => s.qubit.theta)
  const { p0 } = probabilities({ theta, phi: 0 })

  return (
    <div className="ov">
      <Reveal show className="headline" delay={0.3}>
        <h2>Superposition</h2>
      </Reveal>

      <div className="eq-col">
        <Reveal show={step >= 1} className="eq-main" delay={0.2} duration={1.4}>
          <PsiEquation />
        </Reveal>
        <Reveal show={step >= 2} className="eq-notes" delay={0.2}>
          <p>
            <V>α</V>, <V>β</V>: probability amplitudes (complex numbers)
          </p>
          <p className="eq-norm">
            <AbsSq>
              <V>α</V>
            </AbsSq>
            <span className="m-op">+</span>
            <AbsSq>
              <V>β</V>
            </AbsSq>
            <span className="m-op">=</span>1
          </p>
        </Reveal>
      </div>

      <Swap k={step} className="lower lower-narrow">
        {step === 1 && <p className="statement">A qubit can exist in a superposition of basis states until it is measured.</p>}
        {step === 2 && (
          <div className="analogy">
            <span className="tag tag-warn">Analogy only</span>
            <p className="statement statement-sm">
              A classical coin is either heads or tails. A quantum state needs amplitudes, and amplitudes can interfere,
              something a coin's odds never do.
            </p>
          </div>
        )}
        {step === 3 && (
          <p className="statement statement-sm">
            Tilting the state changes the odds. Turning the phase does not, but it changes how states interfere.
          </p>
        )}
      </Swap>

      <div className="side-col">
        <Reveal show={step >= 2} delay={0.4}>
          <ProbabilityBars p0={p0} caption="Probabilities if measured now" />
        </Reveal>
        <Reveal show={step >= 3} className="controls" delay={0.2}>
          <ThetaSlider />
          <PhiSlider />
          <AmplitudeReadout />
        </Reveal>
      </div>
    </div>
  )
}
