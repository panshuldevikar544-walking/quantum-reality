import { useEffect, useRef } from 'react'
import { audio } from '../audio/AudioEngine'
import { SCENE } from '../content/scenes'
import { getState, PACING, subscribe } from '../state/store'
import { MEASURE_TRAVEL, PAIR_SEQUENCE } from '../three/choreography'

/**
 * Listens to presentation events and plays the matching sounds. Nothing here
 * creates the audio context; that only happens when the user turns sound on.
 */
export function AudioController({ visible }: { visible: boolean }) {
  const prev = useRef(getState())
  const timers = useRef<number[]>([])

  useEffect(() => {
    audio.setHidden(!visible)
  }, [visible])

  useEffect(() => {
    const later = (fn: () => void, sec: number) => {
      timers.current.push(window.setTimeout(fn, sec * 1000))
    }
    const unsub = subscribe(() => {
      const s = getState()
      const p = prev.current
      prev.current = s
      if (s.muted) return
      const speed = PACING[s.pacing].speed

      if (s.sceneNonce !== p.sceneNonce) {
        audio.setScene(s.scene)
        audio.whoosh(s.scene === SCENE.BITS && p.scene === SCENE.HOOK ? 1.6 : 1.2)
        if (s.scene === SCENE.HOOK && s.step === 0) {
          later(() => audio.pulse(0.75), 2.2 / speed)
        }
        if (s.scene === SCENE.FINALE && s.step === 0) later(() => audio.impact(), 6.5 / speed)
      } else if (s.step !== p.step && s.dir === 1) {
        if (s.scene === SCENE.HOOK && s.step === 1) audio.impact()
        else if (s.scene === SCENE.ENTANGLEMENT && s.step === 1) audio.shimmer()
        else if (s.scene === SCENE.FINALE && s.step === 2) audio.impact()
        else audio.pulse()
      }

      if (s.measure.nonce !== p.measure.nonce && s.measure.outcome !== null) {
        audio.pulse(0.6)
        const outcome = s.measure.outcome
        later(() => audio.chime(outcome), MEASURE_TRAVEL / speed)
      }
      if (s.pair.nonce !== p.pair.nonce && s.pair.a !== null) {
        const a = s.pair.a
        const b = s.pair.b ?? a
        later(() => {
          audio.chime(a, 0, 0.8)
          audio.chime(b, 0, 0.8)
        }, PAIR_SEQUENCE / speed)
      }
    })
    const list = timers.current
    return () => {
      unsub()
      list.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  useEffect(() => () => audio.destroy(), [])

  return null
}
