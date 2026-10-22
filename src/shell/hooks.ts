import { useEffect, useRef, useState } from 'react'
import { SCENES, SCENE_COUNT } from '../content/scenes'
import { SCENE } from '../content/scenes'
import {
  getState,
  goToScene,
  measure,
  measurePair,
  subscribe,
  isLastStep,
  next,
  PACING,
  prev,
  restartScene,
  setState,
  toggleAutoplay,
  toggleLowMotion,
  toggleNotes,
  toggleOverlay,
  togglePaused,
  useStore,
} from '../state/store'
import { closeTopLayer, toggleFullscreen, toggleSound } from './actions'

/* ------------------------------------------------------------------------- */
/* Keyboard                                                                   */
/* ------------------------------------------------------------------------- */

const NAV_KEYS = new Set(['ArrowRight', 'ArrowLeft', ' ', 'PageDown', 'PageUp', 'Home', 'End'])

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true
  if (el instanceof HTMLInputElement) return el.type !== 'range' && el.type !== 'checkbox' && el.type !== 'radio'
  return false
}

/**
 * Presentation keys. Held-down keys never auto-repeat through slides, browser
 * shortcuts (Ctrl/Cmd combinations) are left alone, and presentation clickers
 * (which send PageUp/PageDown) work out of the box.
 */
export function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      if (NAV_KEYS.has(e.key)) {
        e.preventDefault()
        if (e.repeat) return
      }
      const target = e.target as HTMLElement | null
      const onRange = target instanceof HTMLInputElement && target.type === 'range'

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          next()
          break
        case 'ArrowLeft':
        case 'PageUp':
          prev()
          break
        case 'Home':
          if (!onRange) goToScene(0)
          break
        case 'End':
          if (!onRange) goToScene(SCENE_COUNT - 1)
          break
        case 'Escape':
          closeTopLayer()
          break
        default: {
          if (e.repeat) return
          const k = e.key.toLowerCase()
          if (k === 'f') void toggleFullscreen()
          else if (k === 'm') toggleSound()
          else if (k === 'n') toggleNotes()
          else if (k === 'g') toggleOverlay('navigator')
          else if (k === '?' || k === 'h') toggleOverlay('help')
          else if (k === 'p') togglePaused()
          else if (k === 'a') toggleAutoplay()
          else if (k === 'r') restartScene()
          else if (k === 'l') toggleLowMotion()
          else if (/^[1-8]$/.test(k) && getState().overlay === 'navigator') goToScene(Number(k) - 1)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/* ------------------------------------------------------------------------- */
/* Idle detection: the interface fades away while the presenter talks         */
/* ------------------------------------------------------------------------- */

export function useIdle(timeoutMs = 2800) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let id = window.setTimeout(() => setIdle(true), timeoutMs)
    const wake = () => {
      setIdle(false)
      window.clearTimeout(id)
      id = window.setTimeout(() => setIdle(true), timeoutMs)
    }
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const
    events.forEach((ev) => window.addEventListener(ev, wake, { passive: true }))
    return () => {
      window.clearTimeout(id)
      events.forEach((ev) => window.removeEventListener(ev, wake))
    }
  }, [timeoutMs])
  return idle
}

/* ------------------------------------------------------------------------- */
/* Optional autoplay                                                          */
/* ------------------------------------------------------------------------- */

export function useAutoplay() {
  const autoplay = useStore((s) => s.autoplay)
  const paused = useStore((s) => s.paused)
  const scene = useStore((s) => s.scene)
  const step = useStore((s) => s.step)
  const overlay = useStore((s) => s.overlay)
  const pacing = useStore((s) => s.pacing)

  useEffect(() => {
    if (!autoplay || paused || overlay) return
    if (isLastStep()) {
      setState({ autoplay: false })
      return
    }
    const dwell = SCENES[scene].steps[step].dwell * PACING[pacing].dwell
    const id = window.setTimeout(() => next(true), dwell * 1000)
    return () => window.clearTimeout(id)
  }, [autoplay, paused, scene, step, overlay, pacing])
}

/* ------------------------------------------------------------------------- */
/* Touch swipe                                                                */
/* ------------------------------------------------------------------------- */

export function useSwipe(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let start: { x: number; y: number; id: number } | null = null
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    }
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      start = null
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) next()
        else prev()
      }
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointerup', up)
    }
  }, [ref])
}

/* ------------------------------------------------------------------------- */
/* Page visibility and fullscreen state                                       */
/* ------------------------------------------------------------------------- */

export function usePageVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}

export function useFullscreenState() {
  const [fs, setFs] = useState(() => !!document.fullscreenElement)
  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])
  return fs
}

/** Elapsed talk time as m:ss, ticking once a second. */
export function useTalkClock() {
  const started = useStore((s) => s.talkStartedAt)
  const [, force] = useState(0)
  const ref = useRef<number | undefined>(undefined)
  useEffect(() => {
    ref.current = window.setInterval(() => force((n) => n + 1), 1000)
    return () => window.clearInterval(ref.current)
  }, [])
  if (started == null) return '0:00'
  const sec = Math.max(0, Math.floor((Date.now() - started) / 1000))
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

/* ------------------------------------------------------------------------- */
/* Scene triggers: reveals that include an automatic measurement              */
/* ------------------------------------------------------------------------- */

/**
 * Moving forward onto "measurement" (scene 4, reveal 2) or "correlation"
 * (scene 5, reveal 4) runs one genuine random measurement, so the presenter
 * only has to press Next.
 */
export function useSceneTriggers() {
  useEffect(() => {
    let prev = getState()
    let timer: number | undefined
    const unsub = subscribe(() => {
      const s = getState()
      const moved = s.scene !== prev.scene || s.step !== prev.step || s.sceneNonce !== prev.sceneNonce
      prev = s
      if (!moved || s.dir !== 1) return
      window.clearTimeout(timer)
      const delay = (0.5 / PACING[s.pacing].speed) * 1000
      if (s.scene === SCENE.MEASUREMENT && s.step === 1) timer = window.setTimeout(() => measure(1), delay)
      if (s.scene === SCENE.ENTANGLEMENT && s.step === 3) timer = window.setTimeout(() => measurePair(), delay)
    })
    return () => {
      unsub()
      window.clearTimeout(timer)
    }
  }, [])
}
