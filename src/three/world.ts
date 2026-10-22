/**
 * The shared, mutable "world" read by every 3D actor each frame.
 *
 * The Director writes clock values and per-frame targets here; actors damp
 * their own visual state toward those targets. Keeping this outside React
 * means the 3D scene animates without causing React re-renders.
 */

export type Vec3 = [number, number, number]

export interface WorldTargets {
  camPos: Vec3
  camLook: Vec3
  camLambda: number

  particles: { opacity: number; reveal: number; mix: number; drift: number; focus: number }
  burst: { age: number; origin: Vec3; warm: boolean }

  seed: { opacity: number; scale: number }
  /** Ripple ring progress 0..1, or -1 when hidden. */
  ripple: number

  streams: { opacity: number }

  hero: { pos: Vec3; scale: number; opacity: number; intensity: number }

  bloch: {
    pos: Vec3
    scale: number
    opacity: number
    shell: number
    vector: number
    theta: number
    phi: number
    labels: number
    amps: number
    latitude: number
    projection: number
    /** 0 = showing the state, 1 = collapsed onto `collapseTo`. */
    collapse: number
    collapseTo: 0 | 1
  }

  /** Measurement pulse travelling toward the qubit: progress 0..1, or -1. */
  pulse: { progress: number; from: Vec3; to: Vec3 }

  bits: { opacity: number; p0: Vec3; p1: Vec3; lit: -1 | 0 | 1 }

  waves: { opacity: number; amp: number; y: number; phase: number }

  pair: {
    opacity: number
    a: Vec3
    b: Vec3
    link: number
    sync: number
    labels: number
    /** Seconds since the last pair measurement flash (large = none). */
    flashAge: number
    measured: number
    /** Progress 0..1 of the synchronized measurement pulse, or -1. */
    measuring: number
    /** Show the 3D outcome digits above the qubits. */
    outcomes: number
  }

  network: { opacity: number; count: number; converge: number; pos: Vec3; focusCluster: number; spin: number }
}

export interface WorldClock {
  /** Timeline seconds: frozen while paused, scaled by pacing. */
  time: number
  /** Frame delta in timeline seconds (0 while paused). */
  dt: number
  sceneTime: number
  stepTime: number
  transitionTime: number
  transitionFrom: number
  measureAge: number
  pairAge: number
  /** True for exactly one frame when actors should jump to their targets. */
  snap: boolean
  /** Pointer position in normalised device coordinates for parallax. */
  pointer: { x: number; y: number }
  lowMotion: boolean
  targets: WorldTargets
}

const v = (x = 0, y = 0, z = 0): Vec3 => [x, y, z]

export function createTargets(): WorldTargets {
  return {
    camPos: v(0, 0.4, 16),
    camLook: v(),
    camLambda: 1.6,
    particles: { opacity: 0.8, reveal: 0, mix: 0, drift: 1, focus: 12 },
    burst: { age: 99, origin: v(), warm: false },
    seed: { opacity: 0, scale: 1 },
    ripple: -1,
    streams: { opacity: 0 },
    hero: { pos: v(), scale: 1, opacity: 0, intensity: 1 },
    bloch: {
      pos: v(),
      scale: 2,
      opacity: 0,
      shell: 1,
      vector: 0,
      theta: 1,
      phi: 0,
      labels: 0,
      amps: 0,
      latitude: 0,
      projection: 0,
      collapse: 0,
      collapseTo: 0,
    },
    pulse: { progress: -1, from: v(-11, 0, 0), to: v() },
    bits: { opacity: 0, p0: v(-4.9, 0.3, 0), p1: v(-2.9, 0.3, 0), lit: -1 },
    waves: { opacity: 0, amp: 1, y: -3.4, phase: 0 },
    pair: { opacity: 0, a: v(), b: v(), link: 0, sync: 0, labels: 0, flashAge: 99, measured: 0, measuring: -1, outcomes: 0 },
    network: { opacity: 0, count: 0, converge: 0, pos: v(3.4, 0, 0), focusCluster: -1, spin: 0 },
  }
}

export const world: WorldClock = {
  time: 0,
  dt: 0,
  sceneTime: 0,
  stepTime: 0,
  transitionTime: 99,
  transitionFrom: 0,
  measureAge: 99,
  pairAge: 99,
  snap: false,
  pointer: { x: 0, y: 0 },
  lowMotion: false,
  targets: createTargets(),
}

/**
 * Values the DOM overlay drives and the 3D world reads (for example which
 * classical bit is currently lit), so both layers always agree.
 */
export const signals = {
  bitLit: 0 as 0 | 1,
}
