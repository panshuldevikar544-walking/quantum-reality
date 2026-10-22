import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { UI_EASE } from '../lib/easing'
import { PACING, useStore } from '../state/store'

/** Current motion settings for interface transitions. */
export function useUiMotion() {
  const lowMotion = useStore((s) => s.lowMotion)
  const pacing = useStore((s) => s.pacing)
  const speed = PACING[pacing].speed
  return { lowMotion, speed }
}

/**
 * The single text-reveal primitive used by every scene: a soft rise out of a
 * blur. Elements also leave gracefully when the presenter steps backwards.
 */
export function Reveal({
  show,
  delay = 0,
  className,
  style,
  children,
  rise = 22,
  duration = 1.1,
  id,
}: {
  show: boolean
  delay?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
  rise?: number
  duration?: number
  id?: string
}) {
  const { lowMotion, speed } = useUiMotion()
  const y = lowMotion ? 0 : rise
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={id ?? 'reveal'}
          className={className}
          style={style}
          initial={{ opacity: 0, y, filter: lowMotion ? 'blur(0px)' : 'blur(10px)' }}
          animate={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: (lowMotion ? 0.4 : duration) / speed, delay: delay / speed, ease: UI_EASE },
          }}
          exit={{ opacity: 0, filter: lowMotion ? 'blur(0px)' : 'blur(6px)', transition: { duration: 0.4 / speed } }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Swaps between statements in one slot (cross-fade), so each reveal shows a
 * single concise sentence instead of stacking paragraphs.
 */
export function Swap({ k, className, children, delay = 0 }: { k: string | number; className?: string; children: ReactNode; delay?: number }) {
  const { lowMotion, speed } = useUiMotion()
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={k}
          initial={{ opacity: 0, y: lowMotion ? 0 : 16, filter: lowMotion ? 'blur(0px)' : 'blur(8px)' }}
          animate={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: (lowMotion ? 0.35 : 0.9) / speed, delay: delay / speed, ease: UI_EASE },
          }}
          exit={{ opacity: 0, y: lowMotion ? 0 : -8, transition: { duration: 0.3 / speed } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
