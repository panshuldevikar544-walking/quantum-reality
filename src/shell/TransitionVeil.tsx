import { AnimatePresence, motion } from 'motion/react'
import { SCENE } from '../content/scenes'
import { PACING, useStore } from '../state/store'

/**
 * The bright bloom that hides the camera's jump as it flies through the
 * opening sphere into scene 2. Times match the Director's warp (0.85 s).
 */
export function TransitionVeil() {
  const t = useStore((s) => s.transition)
  const dir = useStore((s) => s.dir)
  const lowMotion = useStore((s) => s.lowMotion)
  const speed = useStore((s) => PACING[s.pacing].speed)
  const warp = !lowMotion && dir === 1 && t.from === SCENE.HOOK && t.to === SCENE.BITS
  const total = 1.8 / speed
  return (
    <AnimatePresence>
      {warp && (
        <motion.div
          key={t.nonce}
          className="veil"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{ duration: total, times: [0, 0.25, 0.47, 1], ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  )
}
