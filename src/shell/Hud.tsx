import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  LayoutGrid,
  Maximize,
  Minimize,
  NotebookPen,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { globalStepIndex, SCENES, SCENE_COUNT, TOTAL_STEPS } from '../content/scenes'
import { next, prev, toggleNotes, toggleOverlay, togglePaused, useStore } from '../state/store'
import { toggleFullscreen, toggleSound } from './actions'
import { useFullscreenState } from './hooks'

const pad = (n: number) => String(n).padStart(2, '0')

/** The minimal on-stage interface: counter, progress line and a few controls. */
export function Hud() {
  const scene = useStore((s) => s.scene)
  const step = useStore((s) => s.step)
  const muted = useStore((s) => s.muted)
  const notesOpen = useStore((s) => s.notesOpen)
  const overlay = useStore((s) => s.overlay)
  const paused = useStore((s) => s.paused)
  const autoplay = useStore((s) => s.autoplay)
  const fs = useFullscreenState()

  const steps = SCENES[scene].steps.length
  const progress = (globalStepIndex(scene, step) + 1) / TOTAL_STEPS

  return (
    <>
      <div className="progress" aria-hidden="true">
        <span className="progress-fill" style={{ transform: `scaleX(${progress.toFixed(4)})` }} />
        <span className="progress-ticks">
          {SCENES.map((s, i) => (
            <i key={s.id} style={{ left: `${(globalStepIndex(i, 0) / TOTAL_STEPS) * 100}%` }} />
          ))}
        </span>
      </div>

      <div className="hud" role="toolbar" aria-label="Presentation controls">
        <div className="hud-left">
          <span className="hud-count" aria-label={`Scene ${scene + 1} of ${SCENE_COUNT}`}>
            {pad(scene + 1)} <span className="hud-slash">/</span> {pad(SCENE_COUNT)}
          </span>
          <span className="hud-title">{SCENES[scene].short}</span>
          {steps > 1 && (
            <span className="hud-steps" aria-label={`Reveal ${step + 1} of ${steps}`}>
              {Array.from({ length: steps }, (_, i) => (
                <i key={i} className={i <= step ? 'on' : ''} />
              ))}
            </span>
          )}
          {paused && <span className="hud-chip">Paused</span>}
          {autoplay && !paused && <span className="hud-chip">Autoplay</span>}
        </div>

        <div className="hud-right">
          <button type="button" className="hud-btn" onClick={() => prev()} aria-label="Previous" title="Previous (←)">
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="hud-btn" onClick={() => next()} aria-label="Next" title="Next (→ or Space)">
            <ChevronRight size={20} />
          </button>
          <span className="hud-sep" />
          <button
            type="button"
            className="hud-btn"
            onClick={togglePaused}
            aria-label={paused ? 'Resume animation' : 'Pause animation'}
            title={paused ? 'Resume (P)' : 'Pause (P)'}
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button
            type="button"
            className={`hud-btn${overlay === 'navigator' ? ' is-on' : ''}`}
            onClick={() => toggleOverlay('navigator')}
            aria-label="Scene navigator"
            aria-pressed={overlay === 'navigator'}
            title="Scenes (G)"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            className={`hud-btn${notesOpen ? ' is-on' : ''}`}
            onClick={toggleNotes}
            aria-label="Presenter notes"
            aria-pressed={notesOpen}
            title="Presenter notes (N)"
          >
            <NotebookPen size={18} />
          </button>
          <button
            type="button"
            className={`hud-btn${!muted ? ' is-on' : ''}`}
            onClick={toggleSound}
            aria-label={muted ? 'Turn sound on' : 'Mute sound'}
            aria-pressed={!muted}
            title={muted ? 'Sound off (M)' : 'Sound on (M)'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            type="button"
            className="hud-btn"
            onClick={() => void toggleFullscreen()}
            aria-label={fs ? 'Exit fullscreen' : 'Enter fullscreen'}
            title="Fullscreen (F)"
          >
            {fs ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button
            type="button"
            className={`hud-btn${overlay === 'help' ? ' is-on' : ''}`}
            onClick={() => toggleOverlay('help')}
            aria-label="Keyboard shortcuts"
            aria-pressed={overlay === 'help'}
            title="Shortcuts (?)"
          >
            <Keyboard size={18} />
          </button>
        </div>
      </div>
    </>
  )
}
