import { useEffect } from 'react'
import { NotesContent } from './NotesContent'
import { presenterWindowSupported, sendCommand, usePresenterSync } from './presenterSync'

/** The separate presenter window (open with #presenter). Mirrors the stage. */
export function PresenterWindow() {
  usePresenterSync()

  useEffect(() => {
    document.title = 'Quantum Reality: presenter notes'
    document.getElementById('boot')?.remove()
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        sendCommand({ cmd: 'next' })
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        sendCommand({ cmd: 'prev' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="presenter-window">
      {presenterWindowSupported ? (
        <NotesContent run={sendCommand} />
      ) : (
        <p>This browser can't sync a second window. Use the notes panel (N) on the main screen instead.</p>
      )}
    </div>
  )
}
