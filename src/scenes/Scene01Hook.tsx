import { motion } from 'motion/react'
import { UI_EASE } from '../lib/easing'
import { Reveal, useUiMotion } from '../ui/Reveal'

const TITLE = 'QUANTUM REALITY'

function Title() {
  const { lowMotion, speed } = useUiMotion()
  return (
    <h1 className="hook-title" aria-label="Quantum Reality">
      {TITLE.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="hook-letter"
          initial={{ opacity: 0, filter: lowMotion ? 'blur(0px)' : 'blur(14px)', y: lowMotion ? 0 : 28 }}
          animate={{
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
              duration: (lowMotion ? 0.4 : 1.6) / speed,
              delay: (lowMotion ? 0 : 0.25 + Math.abs(i - (TITLE.length - 1) / 2) * 0.07) / speed,
              ease: UI_EASE,
            },
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </h1>
  )
}

/** Scene 1 overlay: the title reveal and the hook question. */
export function Scene01Hook({ step }: { step: number }) {
  return (
    <div className="ov ov-center">
      <Reveal show={step === 1} className="hook-block" duration={0.6} rise={0}>
        <Title />
        <Reveal show className="hook-sub" delay={1.9} duration={1.4}>
          Beyond the limits of classical computing.
        </Reveal>
      </Reveal>
      <Reveal show={step === 2} className="hook-question" delay={0.6} duration={1.6}>
        What if computers could think differently?
      </Reveal>
    </div>
  )
}
