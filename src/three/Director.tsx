import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getState, PACING } from '../state/store'
import { SCENE } from '../content/scenes'
import { choreograph } from './choreography'
import { world } from './world'

const WARP_SNAP_AT = 0.85

/**
 * Runs before every actor each frame: advances the timeline clock (respecting
 * pause and pacing), notices navigation and demo events, and asks the
 * choreography table for this frame's targets.
 */
export function Director() {
  const seen = useRef<{
    sceneNonce: number
    step: number
    transition: number
    measure: number
    pair: number
  } | null>(null)

  useFrame((_, delta) => {
    const s = getState()
    const speed = PACING[s.pacing].speed
    // Large steps are clamped so a stalled tab doesn't jump the timeline, but
    // loosely enough that slow machines stay in sync with the DOM veil.
    const dt = s.paused ? 0 : Math.min(delta, 0.25) * speed
    world.dt = dt
    world.lowMotion = s.lowMotion
    world.snap = false

    const l = seen.current
    if (!l) {
      seen.current = {
        sceneNonce: s.sceneNonce,
        step: s.step,
        transition: s.transition.nonce,
        measure: s.measure.nonce,
        pair: s.pair.nonce,
      }
      world.snap = true
    } else {
      if (s.sceneNonce !== l.sceneNonce) {
        l.sceneNonce = s.sceneNonce
        world.sceneTime = 0
        world.stepTime = 0
      }
      if (s.step !== l.step) {
        l.step = s.step
        world.stepTime = 0
      }
      if (s.transition.nonce !== l.transition) {
        l.transition = s.transition.nonce
        world.transitionTime = 0
        world.transitionFrom = s.transition.from
      }
      if (s.measure.nonce !== l.measure) {
        l.measure = s.measure.nonce
        world.measureAge = 0
      }
      if (s.pair.nonce !== l.pair) {
        l.pair = s.pair.nonce
        world.pairAge = 0
      }
    }

    const prevTransition = world.transitionTime
    world.time += dt
    world.sceneTime += dt
    world.stepTime += dt
    world.transitionTime = Math.min(world.transitionTime + dt, 99)
    world.measureAge = Math.min(world.measureAge + dt, 99)
    world.pairAge = Math.min(world.pairAge + dt, 99)

    // Hidden behind the bright veil, the camera jumps out of the sphere.
    const warp =
      !s.lowMotion && s.scene === SCENE.BITS && world.transitionFrom === SCENE.HOOK && s.dir === 1
    if (warp && prevTransition < WARP_SNAP_AT && world.transitionTime >= WARP_SNAP_AT) world.snap = true

    choreograph(s, world)
  }, -1)

  return null
}
