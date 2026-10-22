import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, SkipForward, Timer } from 'lucide-react'
import { SCENES, SCENE_COUNT } from '../content/scenes'
import { PACING, useStore, type Pacing } from '../state/store'
import { useTalkClock } from './hooks'
import type { PresenterCommand } from './presenterSync'

/**
 * Speaker notes and presenter controls. Rendered both in the in-window
 * drawer and in the separate presenter window; `run` routes each command to
 * the local store or across to the stage window.
 */
export function NotesContent({ run, extra }: { run: (c: PresenterCommand) => void; extra?: React.ReactNode }) {
  const scene = useStore((s) => s.scene)
  const step = useStore((s) => s.step)
  const paused = useStore((s) => s.paused)
  const autoplay = useStore((s) => s.autoplay)
  const pacing = useStore((s) => s.pacing)
  const clock = useTalkClock()
  const meta = SCENES[scene]
  const nextScene = scene < SCENE_COUNT - 1 ? SCENES[scene + 1] : null

  return (
    <div className="notes">
      <header className="notes-head">
        <div>
          <p className="notes-kicker">
            Scene {scene + 1} of {SCENE_COUNT}, reveal {step + 1} of {meta.steps.length}
          </p>
          <h2>{meta.title}</h2>
        </div>
        <div className="notes-clock" title="Time since you started">
          <Timer size={16} aria-hidden="true" />
          <span>{clock}</span>
          <button type="button" className="link-btn" onClick={() => run({ cmd: 'resetTimer' })}>
            Reset
          </button>
        </div>
      </header>

      <div className="notes-nav">
        <button type="button" className="btn" onClick={() => run({ cmd: 'prev' })}>
          <ChevronLeft size={18} aria-hidden="true" /> Back
        </button>
        <button type="button" className="btn btn-primary" onClick={() => run({ cmd: 'next' })}>
          Next <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <ol className="notes-steps">
        {meta.steps.map((s, i) => (
          <li key={i} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
            <button type="button" onClick={() => run({ cmd: 'goto', scene, step: i })} aria-current={i === step ? 'step' : undefined}>
              <span className="notes-cue">{s.cue}</span>
              <span className="notes-say">{s.say}</span>
            </button>
          </li>
        ))}
      </ol>

      {meta.transition && <p className="notes-transition">{meta.transition}</p>}
      {nextScene && <p className="notes-next">Up next: {nextScene.title}</p>}

      <div className="notes-controls">
        <button type="button" className="btn" onClick={() => run({ cmd: 'togglePaused' })} aria-pressed={paused}>
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="btn" onClick={() => run({ cmd: 'restartScene' })}>
          <RotateCcw size={16} aria-hidden="true" /> Restart scene
        </button>
        <button type="button" className={`btn${autoplay ? ' is-active' : ''}`} onClick={() => run({ cmd: 'toggleAutoplay' })} aria-pressed={autoplay}>
          <SkipForward size={16} aria-hidden="true" /> Autoplay {autoplay ? 'on' : 'off'}
        </button>
      </div>

      <div className="notes-pacing" role="radiogroup" aria-label="Reveal pacing">
        <span>Pacing</span>
        {(Object.keys(PACING) as Pacing[]).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={pacing === p}
            className={`chip${pacing === p ? ' is-active' : ''}`}
            onClick={() => run({ cmd: 'pacing', pacing: p })}
          >
            {PACING[p].label}
          </button>
        ))}
      </div>

      <div className="notes-jump">
        <span>Jump to</span>
        <div>
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`chip${i === scene ? ' is-active' : ''}`}
              onClick={() => run({ cmd: 'goto', scene: i })}
              title={s.title}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      {extra}
    </div>
  )
}
