import { Reveal } from '../ui/Reveal'

/** Scene 8 overlay: the closing statement, then thanks. Stays until the presenter moves. */
export function Scene08Finale({ step }: { step: number }) {
  return (
    <div className="ov ov-center">
      <Reveal show={step === 1} className="finale-statement" delay={0.4} duration={1.6}>
        <p>The future is not just faster computing.</p>
        <Reveal show className="finale-second" delay={1.8} duration={1.6}>
          <p>It is a different way of computing.</p>
        </Reveal>
      </Reveal>
      <Reveal show={step === 2} className="finale-thanks" delay={0.5} duration={1.8}>
        <h2>THANK YOU</h2>
        <Reveal show className="finale-q" delay={1.8} duration={1.4}>
          <p>Any questions?</p>
        </Reveal>
      </Reveal>
    </div>
  )
}
