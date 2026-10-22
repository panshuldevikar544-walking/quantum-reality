import { audio } from '../audio/AudioEngine'
import { getState, setMuted, setOverlay, setState } from '../state/store'

/**
 * Turn sound on or off. Must be called directly from a click or key handler:
 * the audio context is created inside that user gesture, which is what
 * browsers require before any sound can play.
 */
export function toggleSound() {
  const muted = getState().muted
  if (muted) {
    if (!audio.supported) return
    void audio.enable(getState().scene)
    setMuted(false)
  } else {
    audio.disable()
    setMuted(true)
  }
}

export function isFullscreen() {
  return !!document.fullscreenElement
}

export async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
  } catch {
    /* fullscreen can be refused (iframe, unsupported); the deck still works */
  }
}

/** Escape closes the top-most layer: help/navigator first, then notes. */
export function closeTopLayer(): boolean {
  const s = getState()
  if (s.overlay) {
    setOverlay(null)
    return true
  }
  if (s.notesOpen) {
    setState({ notesOpen: false })
    return true
  }
  return false
}
