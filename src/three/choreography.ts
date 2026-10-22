/**
 * The choreography table: for a given scene, reveal step and timeline time,
 * where should every actor be and how should it look?
 *
 * Actors never decide this themselves. They only damp toward these targets,
 * which keeps transitions continuous: an object that exists in two scenes
 * simply glides from one target to the next.
 */
import { SCENE } from '../content/scenes'
import { clamp01, ease, lerp, seq } from '../lib/easing'
import type { PresentationState } from '../state/store'
import { createTargets, signals, type Vec3, type WorldClock, type WorldTargets } from './world'

const defaults = createTargets()

function set3(out: Vec3, x: number, y: number, z: number) {
  out[0] = x
  out[1] = y
  out[2] = z
}

/** Reset every target to its neutral (hidden) value. */
function reset(t: WorldTargets) {
  set3(t.camPos, 0, 0.4, 12)
  set3(t.camLook, 0, 0, 0)
  t.camLambda = 1.6
  Object.assign(t.particles, defaults.particles, { reveal: 1 })
  t.burst.age = 99
  t.burst.warm = false
  set3(t.burst.origin, 0, 0, 0)
  t.seed.opacity = 0
  t.seed.scale = 1
  t.ripple = -1
  t.streams.opacity = 0
  Object.assign(t.hero, { scale: 1, opacity: 0, intensity: 1 })
  set3(t.hero.pos, 0, 0, 0)
  const b = t.bloch
  Object.assign(b, {
    scale: 2,
    opacity: 0,
    shell: 1,
    vector: 0,
    labels: 0,
    amps: 0,
    latitude: 0,
    projection: 0,
    collapse: 0,
  })
  t.pulse.progress = -1
  t.bits.opacity = 0
  t.bits.lit = -1
  Object.assign(t.waves, { opacity: 0, amp: 1, y: -3.4 })
  Object.assign(t.pair, { opacity: 0, link: 0, sync: 0, labels: 0, flashAge: 99, measured: 0, measuring: -1, outcomes: 0 })
  set3(t.pair.a, 0, 0, 0)
  set3(t.pair.b, 0, 0, 0)
  Object.assign(t.network, { opacity: 0, converge: 0, focusCluster: -1, spin: 0 })
}

/** Network node counts revealed by each step of the "why it matters" scene. */
export const NETWORK_STEP_COUNTS = [1, 13, 25, 37, 60]

/** Duration (timeline seconds) of the measurement pulse before collapse. */
export const MEASURE_TRAVEL = 1.1
/** Duration of the pair re-prepare + measurement sequence before the flash. */
export const PAIR_SEQUENCE = 0.9

export function choreograph(s: PresentationState, w: WorldClock) {
  const t = w.targets
  reset(t)
  const time = w.time
  const st = w.sceneTime
  const lm = w.lowMotion

  // Fly-through-the-sphere transition from the opening into scene 2.
  const warping =
    !lm && s.scene === SCENE.BITS && w.transitionFrom === SCENE.HOOK && s.dir === 1 && w.transitionTime < 0.85

  const scene = warping ? SCENE.HOOK : s.scene
  const step = warping ? 2 : s.step

  switch (scene) {
    /* ------------------------------------------------------------------- */
    case SCENE.HOOK: {
      const intro = step >= 1 ? 1 : 0
      const heroIn = Math.max(intro, seq(st, 7, 5))
      t.seed.opacity = Math.max(seq(st, 0.8, 1.2), intro) * (1 - heroIn * 0.9)
      t.seed.scale = 1 + 0.25 * Math.sin(time * 2.4)
      t.particles.reveal = Math.max(intro, seq(st, 2.6, 6.5, ease.inOutSine))
      t.particles.mix = 0.15
      if (step === 0 && st > 2.2 && st < 4.6) {
        t.ripple = (st - 2.2) / 2.4
        t.burst.age = st - 2.2
      }
      t.streams.opacity = Math.max(intro, seq(st, 5, 4)) * 0.85
      t.hero.opacity = heroIn
      t.hero.scale = 0.55 + 0.45 * heroIn
      if (step === 0) {
        set3(t.camPos, 0, 0.4, 16 - 3 * seq(st, 0, 14, ease.inOutSine))
        t.camLambda = 1.2
      } else if (step === 1) {
        set3(t.camPos, 0, 0.6, 12.5)
      } else {
        set3(t.camPos, 0, 0.15, 8)
        t.camLambda = 0.9
      }
      if (warping) {
        set3(t.camPos, 0, 0, 0.6)
        t.camLambda = 3.2
        t.hero.intensity = 1.8
        t.hero.scale = 1.15
      }
      break
    }

    /* ------------------------------------------------------------------- */
    case SCENE.BITS: {
      set3(t.camPos, 0, 0.3, 11)
      t.particles.opacity = 0.5
      t.particles.mix = 0.3
      const b = t.bloch
      set3(b.pos, 3.6, 0, 0)
      b.scale = 1.9
      b.opacity = step < 2 ? 0.35 : 1
      b.vector = step === 2 ? seq(w.stepTime, 0.9, 0.8) : step > 2 ? 1 : 0
      b.labels = step === 2 ? seq(w.stepTime, 1.1, 0.6) : step > 2 ? 1 : 0
      b.amps = step >= 3 ? 1 : 0
      b.latitude = step >= 2 ? 0.6 : 0
      b.theta = 1.05
      b.phi = time * 0.5

      const morph = step >= 3 ? 1 : step === 2 ? seq(w.stepTime, 0, 1.3) : 0
      const north: Vec3 = [b.pos[0], b.pos[1] + b.scale * 1.18, 0]
      const south: Vec3 = [b.pos[0], b.pos[1] - b.scale * 1.18, 0]
      const c0: Vec3 = [-4.9, 0.3, 0]
      const c1: Vec3 = [-2.9, 0.3, 0]
      // fly along a gentle arc
      const arc = Math.sin(morph * Math.PI) * 1.4
      set3(t.bits.p0, lerp(c0[0], north[0], morph), lerp(c0[1], north[1], morph) + arc, arc * 0.6)
      set3(t.bits.p1, lerp(c1[0], south[0], morph), lerp(c1[1], south[1], morph) - arc, arc * 0.6)
      t.bits.opacity = step <= 1 ? 1 : step === 2 ? 1 - seq(w.stepTime, 0.9, 0.35) : 0
      t.bits.lit = step === 0 ? -1 : step === 1 ? signals.bitLit : -1
      break
    }

    /* ------------------------------------------------------------------- */
    case SCENE.SUPERPOSITION: {
      const sway = lm ? 0 : Math.sin(time * 0.05) * 1.1
      set3(t.camPos, sway, 1.0, 10.5)
      set3(t.camLook, 0, 0.15, 0)
      t.particles.opacity = 0.7
      t.particles.mix = 1
      const b = t.bloch
      set3(b.pos, 0, 0.2, 0)
      b.scale = 2.35
      b.opacity = 1
      b.vector = 1
      b.labels = 1
      b.latitude = 1
      b.projection = step >= 2 ? 1 : 0
      b.theta = s.qubit.theta
      b.phi = step < 3 ? s.qubit.phi + time * 0.35 : s.qubit.phi
      t.waves.opacity = 0.9
      t.waves.amp = 1
      t.waves.y = -2.6
      t.waves.phase = b.phi
      break
    }

    /* ------------------------------------------------------------------- */
    case SCENE.MEASUREMENT: {
      set3(t.camPos, 0, 0.5, 11)
      set3(t.camLook, 0, 0, 0)
      t.camLambda = 1.2
      t.particles.opacity = 0.3
      t.particles.drift = 0.35
      t.particles.mix = 0.6
      t.waves.opacity = 0.35
      t.waves.amp = 0.4
      t.waves.y = -2.6
      const b = t.bloch
      set3(b.pos, -2.7, 0.05, 0)
      b.scale = 2.0
      b.opacity = 1
      b.vector = 1
      b.labels = 1
      b.latitude = 0.5
      b.projection = step >= 2 ? 1 : 0
      b.theta = s.qubit.theta
      b.phi = s.qubit.phi
      t.waves.phase = b.phi

      const outcome = s.measure.outcome
      if (step >= 1 && outcome !== null) {
        const m = w.measureAge
        if (m < MEASURE_TRAVEL) {
          t.pulse.progress = m / MEASURE_TRAVEL
          set3(t.pulse.from, -11, 0.1, 0)
          set3(t.pulse.to, b.pos[0], b.pos[1], b.pos[2])
          // dim the room as the pulse approaches
          t.particles.opacity = 0.3 - 0.15 * (m / MEASURE_TRAVEL)
        } else {
          b.collapse = 1
          b.collapseTo = outcome
          b.shell = 0.3
          b.latitude = 0
          b.projection = 0
          t.burst.age = m - MEASURE_TRAVEL
          t.burst.warm = true
          set3(t.burst.origin, b.pos[0], b.pos[1] + (outcome === 0 ? 1 : -1) * b.scale, 0)
          t.particles.opacity = 0.22
          t.waves.opacity = 0.15
        }
      }
      break
    }

    /* ------------------------------------------------------------------- */
    case SCENE.ENTANGLEMENT:
    case SCENE.ENTANGLEMENT_ACTION: {
      const action = scene === SCENE.ENTANGLEMENT_ACTION
      const sway = lm ? 0 : Math.sin(time * 0.07) * 0.8
      if (action) {
        set3(t.camPos, sway * 0.5, 0.7, 13)
        set3(t.camLook, 0, 0.2, 0)
        set3(t.pair.a, -3.9, 0.85, 0)
        set3(t.pair.b, 3.9, 0.85, 0)
      } else {
        t.pair.outcomes = 1
        set3(t.camPos, sway, 0.5, 13.5)
        set3(t.pair.a, -4.8, 0, 0)
        set3(t.pair.b, 4.8, 0, 0)
      }
      t.particles.opacity = 0.6
      t.particles.mix = 1.6
      t.waves.opacity = 0.2
      t.waves.amp = 0.5
      t.waves.y = -3.8
      const p = t.pair
      p.opacity = 1
      // scene 6 names the qubits in its console instead
      p.labels = action ? 0 : 1
      const entangledVisual = action || step >= 1
      p.link = entangledVisual ? 1 : 0
      p.sync = entangledVisual ? 1 : 0

      const showMeasured = (action || step >= 3) && s.pair.a !== null
      if (showMeasured) {
        const age = w.pairAge
        if (age < PAIR_SEQUENCE) {
          // re-prepare: the shared state re-forms, then both are measured
          p.link = 1
          if (age > 0.45) p.measuring = (age - 0.45) / (PAIR_SEQUENCE - 0.45)
        } else {
          p.measured = 1
          p.flashAge = age - PAIR_SEQUENCE
          p.link = 0.18
          p.sync = 0.4
        }
      }
      break
    }

    /* ------------------------------------------------------------------- */
    case SCENE.WHY: {
      set3(t.camPos, 0.8, 0.3, 13)
      set3(t.camLook, 1.6, 0, 0)
      t.particles.opacity = 0.5
      t.particles.mix = 0.4
      const n = t.network
      n.opacity = 1
      n.count = NETWORK_STEP_COUNTS[Math.min(step, NETWORK_STEP_COUNTS.length - 1)]
      n.focusCluster = step >= 1 && step <= 3 ? step : -1
      set3(n.pos, 3.4, 0, 0)
      n.spin = lm ? 0 : time * 0.04
      // the departing pair merges into the network's seed node
      set3(t.pair.a, 3.4, 0, 0)
      set3(t.pair.b, 3.4, 0, 0)
      break
    }

    /* ------------------------------------------------------------------- */
    case SCENE.FINALE: {
      const conv = step >= 1 ? 1 : seq(st, 0.8, 6)
      if (step === 0) {
        set3(t.camPos, 0, 0.8, 17 - 2 * seq(st, 0, 9, ease.inOutSine))
      } else if (step === 1) {
        set3(t.camPos, 0, 1.0, 16.5)
        set3(t.camLook, 0, -1.6, 0)
      } else {
        // lift the structure into the upper half so the thanks reads cleanly
        set3(t.camPos, 0, -0.4, 19)
        set3(t.camLook, 0, -2.9, 0)
      }
      t.camLambda = 1.1
      t.particles.opacity = 0.75
      t.particles.mix = 0.8
      t.streams.opacity = 0.7 * seq(st, 0.5, 3)

      const absorb = step >= 1 ? 1 : seq(st, 5.2, 1.3, ease.in)
      const flash = st > 6.5 && step === 0 ? Math.exp(-(st - 6.5) * 1.5) : 0
      t.hero.opacity = seq(st, 0, 2.2)
      t.hero.intensity = (step === 2 ? 0.55 : 1) + flash * 1.2
      if (st > 6.5 && step === 0) t.burst.age = st - 6.5

      const b = t.bloch
      b.scale = 1.65
      b.opacity = seq(st, 1.5, 2)
      b.shell = 0
      b.vector = 1
      b.theta = Math.PI / 3
      b.phi = time * 0.4
      b.latitude = 0.5

      t.waves.opacity = 0.65 * seq(st, 2, 3)
      t.waves.amp = 0.8
      t.waves.phase = time * 0.2

      const a = lm ? 0.6 : time * 0.22
      const R = lerp(9, 3.9, conv)
      set3(t.pair.a, R * Math.cos(a), 0.6 * Math.sin(a * 1.3), R * Math.sin(a))
      set3(t.pair.b, -R * Math.cos(a), -0.6 * Math.sin(a * 1.3), -R * Math.sin(a))
      t.pair.opacity = seq(st, 1, 2)
      t.pair.link = 1
      t.pair.sync = 1

      const n = t.network
      n.opacity = seq(st, 1, 2.5)
      n.count = 60
      n.converge = conv
      set3(n.pos, 0, 0, 0)
      n.spin = lm ? 0 : time * 0.05

      // the classical 0 and 1 orbit in, then fall into the sphere
      const orbitR = lerp(7, 2.9, seq(st, 0.5, 4.5)) * (1 - absorb)
      const ba = time * 0.5
      set3(t.bits.p0, orbitR * Math.cos(ba), 0.8 * (1 - absorb), orbitR * Math.sin(ba))
      set3(t.bits.p1, -orbitR * Math.cos(ba), -0.8 * (1 - absorb), -orbitR * Math.sin(ba))
      t.bits.opacity = step === 0 ? seq(st, 0.3, 1.5) * (1 - clamp01(absorb * 1.2)) : 0
      t.bits.lit = -1
      break
    }
  }

  // Shared bookkeeping
  t.particles.focus = Math.hypot(
    t.camPos[0] - t.camLook[0],
    t.camPos[1] - t.camLook[1],
    t.camPos[2] - t.camLook[2],
  )
  if (lm) {
    t.particles.drift *= 0.35
    t.camLambda = Math.max(t.camLambda, 2.6)
  }
}
