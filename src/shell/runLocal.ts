import {
  goToScene,
  next,
  prev,
  resetTalkTimer,
  restartScene,
  setPacing,
  toggleAutoplay,
  togglePaused,
} from '../state/store'
import type { PresenterCommand } from './presenterSync'

/** Apply a presenter command directly to this window's store. */
export function runLocal(c: PresenterCommand) {
  switch (c.cmd) {
    case 'next':
      return next()
    case 'prev':
      return prev()
    case 'goto':
      return goToScene(c.scene, c.step ?? 0)
    case 'restartScene':
      return restartScene()
    case 'togglePaused':
      return togglePaused()
    case 'toggleAutoplay':
      return toggleAutoplay()
    case 'pacing':
      return setPacing(c.pacing)
    case 'resetTimer':
      return resetTalkTimer()
  }
}
