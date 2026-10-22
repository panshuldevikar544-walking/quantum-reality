import { useEffect } from 'react'
import {
  getState,
  goToScene,
  next,
  prev,
  restartScene,
  setPacing,
  setState,
  subscribe,
  toggleAutoplay,
  togglePaused,
  resetTalkTimer,
  type Pacing,
  type PresentationState,
} from '../state/store'

/**
 * Keeps an optional second "presenter" window in sync with the stage window
 * (same browser, same origin) using BroadcastChannel. The stage window stays
 * the single source of truth.
 */

const CHANNEL = 'quantum-reality-presenter'

type Synced = Pick<PresentationState, 'scene' | 'step' | 'autoplay' | 'paused' | 'pacing' | 'talkStartedAt' | 'muted'>

export type PresenterCommand =
  | { cmd: 'next' }
  | { cmd: 'prev' }
  | { cmd: 'goto'; scene: number; step?: number }
  | { cmd: 'restartScene' }
  | { cmd: 'togglePaused' }
  | { cmd: 'toggleAutoplay' }
  | { cmd: 'pacing'; pacing: Pacing }
  | { cmd: 'resetTimer' }

type Message = { type: 'state'; state: Synced } | { type: 'hello' } | ({ type: 'cmd' } & PresenterCommand)

const supported = typeof BroadcastChannel !== 'undefined'

function snapshot(s: PresentationState): Synced {
  return {
    scene: s.scene,
    step: s.step,
    autoplay: s.autoplay,
    paused: s.paused,
    pacing: s.pacing,
    talkStartedAt: s.talkStartedAt,
    muted: s.muted,
  }
}

/** Stage window: broadcast state, obey commands. */
export function useStageSync() {
  useEffect(() => {
    if (!supported) return
    const ch = new BroadcastChannel(CHANNEL)
    const send = () => ch.postMessage({ type: 'state', state: snapshot(getState()) } satisfies Message)
    const unsub = subscribe(send)
    ch.onmessage = (e: MessageEvent<Message>) => {
      const m = e.data
      if (m.type === 'hello') send()
      if (m.type !== 'cmd') return
      switch (m.cmd) {
        case 'next':
          next()
          break
        case 'prev':
          prev()
          break
        case 'goto':
          goToScene(m.scene, m.step ?? 0)
          break
        case 'restartScene':
          restartScene()
          break
        case 'togglePaused':
          togglePaused()
          break
        case 'toggleAutoplay':
          toggleAutoplay()
          break
        case 'pacing':
          setPacing(m.pacing)
          break
        case 'resetTimer':
          resetTalkTimer()
          break
      }
    }
    return () => {
      unsub()
      ch.close()
    }
  }, [])
}

let presenterChannel: BroadcastChannel | null = null

/** Presenter window: mirror the stage's state and send commands to it. */
export function usePresenterSync() {
  useEffect(() => {
    if (!supported) return
    const ch = new BroadcastChannel(CHANNEL)
    presenterChannel = ch
    ch.onmessage = (e: MessageEvent<Message>) => {
      if (e.data.type === 'state') setState(e.data.state)
    }
    ch.postMessage({ type: 'hello' } satisfies Message)
    return () => {
      ch.close()
      presenterChannel = null
    }
  }, [])
}

export function sendCommand(c: PresenterCommand) {
  presenterChannel?.postMessage({ type: 'cmd', ...c } satisfies Message)
}

export const presenterWindowSupported = supported

export function openPresenterWindow() {
  const url = `${window.location.origin}${window.location.pathname}#presenter`
  window.open(url, 'quantum-reality-presenter', 'width=980,height=720')
}
