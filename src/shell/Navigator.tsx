import { AnimatePresence, motion } from 'motion/react'
import { SCENES } from '../content/scenes'
import { UI_EASE } from '../lib/easing'
import { goToScene, setOverlay, useStore } from '../state/store'

/** A slim strip of all eight scenes. Jumping restarts that scene's reveals. */
export function Navigator() {
  const open = useStore((s) => s.overlay === 'navigator')
  const scene = useStore((s) => s.scene)
  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          className="navigator"
          aria-label="Scenes"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: UI_EASE } }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.25 } }}
        >
          <ol>
            {SCENES.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={i === scene ? 'is-current' : ''}
                  aria-current={i === scene ? 'step' : undefined}
                  onClick={() => goToScene(i)}
                  autoFocus={i === scene}
                >
                  <span className="nav-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nav-title">{s.short}</span>
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="navigator-close" onClick={() => setOverlay(null)}>
            Close
          </button>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
