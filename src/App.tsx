import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { hasWebGL } from './lib/webgl'
import { useStore } from './state/store'
import { SceneOverlay } from './scenes/SceneOverlay'
import { FallbackStage } from './ui/FallbackStage'
import { AudioController } from './shell/AudioController'
import { Hud } from './shell/Hud'
import { HelpOverlay } from './shell/HelpOverlay'
import { Navigator } from './shell/Navigator'
import { PresenterPanel } from './shell/PresenterPanel'
import { TransitionVeil } from './shell/TransitionVeil'
import { useAutoplay, useIdle, useKeyboard, usePageVisible, useSceneTriggers, useSwipe } from './shell/hooks'
import { AnchoredLabels } from './ui/AnchoredLabels'
import { useStageSync } from './shell/presenterSync'

// The 3D stage is split into its own chunk so the shell paints immediately.
const Stage = lazy(() => import('./three/Stage').then((m) => ({ default: m.Stage })))

function hideBootScreen() {
  const boot = document.getElementById('boot')
  if (!boot || boot.classList.contains('done')) return
  boot.classList.add('done')
  window.setTimeout(() => boot.remove(), 900)
}

/** The audience-facing presentation: one 3D stage plus the text overlay. */
export default function App() {
  const [webgl] = useState(hasWebGL)
  const [lost, setLost] = useState(false)
  const lowMotion = useStore((s) => s.lowMotion)
  const visible = usePageVisible()
  const idle = useIdle()
  const root = useRef<HTMLDivElement>(null)

  useKeyboard()
  useAutoplay()
  useSwipe(root)
  useStageSync()
  useSceneTriggers()

  const onReady = useCallback(() => hideBootScreen(), [])
  const onLost = useCallback(() => setLost(true), [])

  useEffect(() => {
    if (!webgl) hideBootScreen()
    // never leave the audience on the boot screen
    const id = window.setTimeout(hideBootScreen, 6000)
    return () => window.clearTimeout(id)
  }, [webgl])

  useEffect(() => {
    document.documentElement.classList.toggle('low-motion', lowMotion)
  }, [lowMotion])

  const use3D = webgl && !lost

  return (
    <MotionConfig reducedMotion={lowMotion ? 'always' : 'never'}>
      <div ref={root} className={`app${idle ? ' is-idle' : ''}`}>
        {use3D ? (
          <Suspense fallback={null}>
            <Stage visible={visible} onReady={onReady} onContextLost={onLost} />
          </Suspense>
        ) : (
          <FallbackStage />
        )}
        <div className="vignette" aria-hidden="true" />
        {use3D && <AnchoredLabels />}
        <main className="stage-safe">
          <SceneOverlay />
        </main>
        <TransitionVeil />
        <Hud />
        <Navigator />
        <PresenterPanel />
        <HelpOverlay />
        {!use3D && (
          <p className="fallback-note" role="status">
            3D graphics are unavailable in this browser, so a simplified 2D stage is shown.
          </p>
        )}
        <AudioController visible={visible} />
      </div>
    </MotionConfig>
  )
}
