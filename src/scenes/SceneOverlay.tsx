import type { ComponentType } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SCENES } from '../content/scenes'
import { PACING, useStore } from '../state/store'
import { Scene01Hook } from './Scene01Hook'
import { Scene02Bits } from './Scene02Bits'
import { Scene03Superposition } from './Scene03Superposition'
import { Scene04Measurement } from './Scene04Measurement'
import { Scene05Entanglement } from './Scene05Entanglement'
import { Scene06Action } from './Scene06Action'
import { Scene07Why } from './Scene07Why'
import { Scene08Finale } from './Scene08Finale'

const OVERLAYS: ComponentType<{ step: number }>[] = [
  Scene01Hook,
  Scene02Bits,
  Scene03Superposition,
  Scene04Measurement,
  Scene05Entanglement,
  Scene06Action,
  Scene07Why,
  Scene08Finale,
]

if (OVERLAYS.length !== SCENES.length) throw new Error('Each scene needs exactly one overlay')

/**
 * Text and interface layer for the current scene. The outgoing scene's text
 * fades before the incoming scene's reveals begin.
 */
export function SceneOverlay() {
  const scene = useStore((s) => s.scene)
  const step = useStore((s) => s.step)
  const nonce = useStore((s) => s.sceneNonce)
  const speed = useStore((s) => PACING[s.pacing].speed)
  const Overlay = OVERLAYS[scene]
  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={`${scene}-${nonce}`}
        className="scene-layer"
        data-scene={SCENES[scene].id}
        aria-label={`Scene ${scene + 1}: ${SCENES[scene].title}`}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35 / speed } }}
      >
        <Overlay step={step} />
      </motion.section>
    </AnimatePresence>
  )
}
