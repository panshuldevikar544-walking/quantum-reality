import { AnimatePresence, motion } from 'motion/react'
import { UI_EASE } from '../lib/easing'
import { setOverlay, useStore } from '../state/store'

const SHORTCUTS: [string[], string][] = [
  [['→', 'Space', 'Page Down'], 'Next reveal or scene'],
  [['←', 'Page Up'], 'Previous reveal or scene'],
  [['Home'], 'Restart at scene 1'],
  [['End'], 'Jump to scene 8'],
  [['F'], 'Fullscreen'],
  [['M'], 'Sound on or off'],
  [['N'], 'Presenter notes'],
  [['G'], 'Scene navigator (then 1–8)'],
  [['P'], 'Pause or resume animation'],
  [['R'], 'Restart current scene'],
  [['A'], 'Autoplay on or off'],
  [['L'], 'Lower-motion mode'],
  [['Esc'], 'Close panel or exit fullscreen'],
]

export function HelpOverlay() {
  const open = useStore((s) => s.overlay === 'help')
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="help-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          onClick={() => setOverlay(null)}
        >
          <motion.div
            className="help"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease: UI_EASE } }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="help-title">Keyboard controls</h2>
            <dl>
              {SHORTCUTS.map(([keys, what]) => (
                <div key={what} className="help-row">
                  <dt>
                    {keys.map((k) => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
            <p className="help-foot">Swipe left or right on touch screens. Presentation clickers work too.</p>
            <button type="button" className="btn" onClick={() => setOverlay(null)} autoFocus>
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
