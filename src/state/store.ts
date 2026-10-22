import { useSyncExternalStore } from 'react'
import { SCENES, SCENE_COUNT, SCENE } from '../content/scenes'
import {
  DEFAULT_STATE,
  measureBellPhiPlus,
  measureQubit,
  type QubitState,
} from '../lib/quantum'

/* ------------------------------------------------------------------------- */
/* Types                                                                      */
/* ------------------------------------------------------------------------- */

export type Pacing = 'relaxed' | 'normal' | 'brisk'
export type Overlay = null | 'help' | 'navigator'
export type PairKey = '00' | '01' | '10' | '11'

export const PACING: Record<Pacing, { speed: number; dwell: number; label: string }> = {
  relaxed: { speed: 0.8, dwell: 1.3, label: 'Relaxed' },
  normal: { speed: 1, dwell: 1, label: 'Normal' },
  brisk: { speed: 1.25, dwell: 0.75, label: 'Brisk' },
}

export interface MeasureState {
  /** Most recent outcome, or null when the state is un-measured. */
  outcome: 0 | 1 | null
  /** Increments for every measurement; drives the pulse animation. */
  nonce: number
  counts: [number, number]
  /** Size of the last batch (1 for a single shot). */
  lastBatch: number
}

export interface PairState {
  a: 0 | 1 | null
  b: 0 | 1 | null
  nonce: number
  counts: Record<PairKey, number>
  /** False after measurement: the pair is no longer entangled until re-prepared. */
  entangled: boolean
}

export interface PresentationState {
  scene: number
  step: number
  /** Direction of the last navigation (1 forward, -1 back). */
  dir: 1 | -1
  /** Bumps on every scene change or scene restart. */
  sceneNonce: number
  transition: { from: number; to: number; nonce: number }

  qubit: QubitState
  measure: MeasureState
  pair: PairState

  overlay: Overlay
  notesOpen: boolean

  muted: boolean
  autoplay: boolean
  paused: boolean
  pacing: Pacing
  lowMotion: boolean
  /** Timestamp (ms) when the talk timer started, or null. */
  talkStartedAt: number | null
}

const emptyPairCounts = (): Record<PairKey, number> => ({ '00': 0, '01': 0, '10': 0, '11': 0 })

const initialState: PresentationState = {
  scene: 0,
  step: 0,
  dir: 1,
  sceneNonce: 0,
  transition: { from: 0, to: 0, nonce: 0 },
  qubit: { ...DEFAULT_STATE },
  measure: { outcome: null, nonce: 0, counts: [0, 0], lastBatch: 0 },
  pair: { a: null, b: null, nonce: 0, counts: emptyPairCounts(), entangled: true },
  overlay: null,
  notesOpen: false,
  muted: true,
  autoplay: false,
  paused: false,
  pacing: 'normal',
  lowMotion: typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  talkStartedAt: null,
}

/* ------------------------------------------------------------------------- */
/* Tiny external store                                                        */
/* ------------------------------------------------------------------------- */

let state: PresentationState = initialState
const listeners = new Set<() => void>()

export function getState(): PresentationState {
  return state
}

export function setState(patch: Partial<PresentationState> | ((s: PresentationState) => Partial<PresentationState>)) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Subscribe a component to a slice of state. Selectors must return stable values. */
export function useStore<T>(selector: (s: PresentationState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  )
}

/* ------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* ------------------------------------------------------------------------- */

const NAV_COOLDOWN_MS = 260
let lastNavAt = 0

function cooled(): boolean {
  const now = performance.now()
  if (now - lastNavAt < NAV_COOLDOWN_MS) return false
  lastNavAt = now
  return true
}

function enterScene(scene: number, step: number, dir: 1 | -1): Partial<PresentationState> {
  const s = state
  const patch: Partial<PresentationState> = {
    scene,
    step,
    dir,
    sceneNonce: s.sceneNonce + 1,
    transition: { from: s.scene, to: scene, nonce: s.transition.nonce + 1 },
  }
  // Fresh demos when a demo scene is entered.
  if (scene === SCENE.MEASUREMENT && s.scene !== SCENE.MEASUREMENT) {
    patch.measure = { outcome: null, nonce: s.measure.nonce, counts: [0, 0], lastBatch: 0 }
  }
  if (scene === SCENE.ENTANGLEMENT && s.scene !== SCENE.ENTANGLEMENT && s.scene !== SCENE.ENTANGLEMENT_ACTION) {
    patch.pair = { a: null, b: null, nonce: s.pair.nonce, counts: emptyPairCounts(), entangled: true }
  }
  if (scene === SCENE.ENTANGLEMENT_ACTION && s.scene !== SCENE.ENTANGLEMENT_ACTION) {
    patch.pair = { a: null, b: null, nonce: s.pair.nonce, counts: emptyPairCounts(), entangled: true }
  }
  return patch
}

function startTimer(): Partial<PresentationState> {
  return state.talkStartedAt == null ? { talkStartedAt: Date.now() } : {}
}

export function next(force = false) {
  if (!force && !cooled()) return
  const { scene, step } = state
  if (step < SCENES[scene].steps.length - 1) {
    setState({ step: step + 1, dir: 1, ...startTimer() })
  } else if (scene < SCENE_COUNT - 1) {
    setState({ ...enterScene(scene + 1, 0, 1), ...startTimer() })
  }
}

export function prev(force = false) {
  if (!force && !cooled()) return
  const { scene, step } = state
  if (step > 0) {
    setState({ step: step - 1, dir: -1 })
  } else if (scene > 0) {
    const target = scene - 1
    setState(enterScene(target, SCENES[target].steps.length - 1, -1))
  }
}

/** Jump to a scene. Lands on step 0 so its reveals play again. */
export function goToScene(scene: number, step = 0) {
  if (scene < 0 || scene >= SCENE_COUNT) return
  lastNavAt = performance.now()
  const dir: 1 | -1 = scene >= state.scene ? 1 : -1
  setState({ ...enterScene(scene, Math.min(step, SCENES[scene].steps.length - 1), dir), overlay: null })
}

export function restartScene() {
  goToScene(state.scene, 0)
}

export function restartDeck() {
  goToScene(0, 0)
  setState({ talkStartedAt: null, autoplay: false })
}

export function isLastStep(s: PresentationState = state): boolean {
  return s.scene === SCENE_COUNT - 1 && s.step === SCENES[s.scene].steps.length - 1
}

/* ------------------------------------------------------------------------- */
/* Quantum demos                                                              */
/* ------------------------------------------------------------------------- */

export function setQubit(q: Partial<QubitState>) {
  setState((s) => ({ qubit: { ...s.qubit, ...q } }))
}

/** Prepare the current qubit state and measure it `shots` times. */
export function measure(shots = 1) {
  setState((s) => {
    const counts: [number, number] = [...s.measure.counts]
    let outcome: 0 | 1 = 0
    for (let i = 0; i < shots; i++) {
      outcome = measureQubit(s.qubit)
      counts[outcome]++
    }
    return { measure: { outcome, nonce: s.measure.nonce + 1, counts, lastBatch: shots } }
  })
}

export function resetMeasurement() {
  setState((s) => ({ measure: { outcome: null, nonce: s.measure.nonce, counts: [0, 0], lastBatch: 0 } }))
}

/** Prepare a fresh |Φ⁺⟩ pair and measure both qubits in the computational basis. */
export function measurePair() {
  setState((s) => {
    const { a, b } = measureBellPhiPlus()
    const key = `${a}${b}` as PairKey
    return {
      pair: {
        a,
        b,
        nonce: s.pair.nonce + 1,
        counts: { ...s.pair.counts, [key]: s.pair.counts[key] + 1 },
        entangled: false,
      },
    }
  })
}

export function resetPair() {
  setState((s) => ({ pair: { a: null, b: null, nonce: s.pair.nonce, counts: emptyPairCounts(), entangled: true } }))
}

/* ------------------------------------------------------------------------- */
/* UI and settings                                                            */
/* ------------------------------------------------------------------------- */

export function setOverlay(overlay: Overlay) {
  setState({ overlay })
}

export function toggleOverlay(overlay: Exclude<Overlay, null>) {
  setState((s) => ({ overlay: s.overlay === overlay ? null : overlay }))
}

export function toggleNotes() {
  setState((s) => ({ notesOpen: !s.notesOpen }))
}

export function toggleAutoplay() {
  setState((s) => ({ autoplay: !s.autoplay, paused: false, ...startTimer() }))
}

export function togglePaused() {
  setState((s) => ({ paused: !s.paused }))
}

export function setPacing(pacing: Pacing) {
  setState({ pacing })
}

export function toggleLowMotion() {
  setState((s) => ({ lowMotion: !s.lowMotion }))
}

export function setMuted(muted: boolean) {
  setState({ muted })
}

export function resetTalkTimer() {
  setState({ talkStartedAt: Date.now() })
}
