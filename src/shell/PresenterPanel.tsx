import { AnimatePresence, motion } from 'motion/react'
import { ExternalLink, X } from 'lucide-react'
import { UI_EASE } from '../lib/easing'
import { setState, toggleLowMotion, useStore } from '../state/store'
import { runLocal } from './runLocal'
import { NotesContent } from './NotesContent'
import { openPresenterWindow, presenterWindowSupported } from './presenterSync'

/** Presenter-only drawer with speaker notes. Hidden from the audience by default. */
export function PresenterPanel() {
  const open = useStore((s) => s.notesOpen)
  const lowMotion = useStore((s) => s.lowMotion)
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="presenter-panel"
          aria-label="Presenter notes"
          initial={{ x: '100%', opacity: 0.4 }}
          animate={{ x: 0, opacity: 1, transition: { duration: 0.5, ease: UI_EASE } }}
          exit={{ x: '100%', opacity: 0, transition: { duration: 0.3 } }}
        >
          <button
            type="button"
            className="panel-close"
            onClick={() => setState({ notesOpen: false })}
            aria-label="Close presenter notes"
          >
            <X size={18} />
          </button>
          <NotesContent
            run={runLocal}
            extra={
              <div className="notes-extra">
                <label className="toggle">
                  <input type="checkbox" checked={lowMotion} onChange={toggleLowMotion} />
                  <span>Lower-motion mode</span>
                </label>
                {presenterWindowSupported && (
                  <button type="button" className="btn btn-quiet" onClick={openPresenterWindow}>
                    <ExternalLink size={16} aria-hidden="true" /> Open notes in a separate window
                  </button>
                )}
                <p className="aside">
                  On a projector, extend your display and drag the notes window to your laptop screen. It stays in sync.
                </p>
              </div>
            }
          />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
