import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ease, lerp } from '../../lib/easing'
import { PALETTE } from '../shaders'
import { makeGlowMaterial } from '../materials'
import { world } from '../world'
import { Sprite } from './primitives'

const TRAIL = 7

/** Scene 4: a luminous probe travelling in to measure the qubit. */
export function MeasurementPulse() {
  const head = useMemo(() => makeGlowMaterial(PALETTE.orange, 1.8), [])
  const trailMats = useMemo(() => Array.from({ length: TRAIL }, () => makeGlowMaterial(PALETTE.orange, 0.3)), [])
  const headRef = useRef<THREE.Mesh>(null)
  const trailRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(() => {
    const p = world.targets.pulse
    const show = p.progress >= 0 && p.progress <= 1
    const at = (k: number, out: THREE.Vector3) => {
      const e = ease.in(Math.max(0, Math.min(1, k)))
      return out.set(lerp(p.from[0], p.to[0], e), lerp(p.from[1], p.to[1], e), lerp(p.from[2], p.to[2], e))
    }
    if (headRef.current) {
      headRef.current.visible = show
      if (show) at(p.progress, headRef.current.position)
    }
    head.uniforms.uOpacity.value = show ? Math.min(1, p.progress * 4) : 0
    trailRefs.current.forEach((m, i) => {
      if (!m) return
      m.visible = show
      if (!show) return
      at(p.progress - (i + 1) * 0.035, m.position)
      trailMats[i].uniforms.uOpacity.value = (1 - i / TRAIL) * 0.5 * Math.min(1, p.progress * 4)
    })
  })

  return (
    <group>
      <Sprite ref={headRef} material={head} scale={1.1} />
      {trailMats.map((m, i) => (
        <Sprite
          key={i}
          ref={(r) => {
            trailRefs.current[i] = r
          }}
          material={m}
          scale={0.9 - i * 0.08}
        />
      ))}
    </group>
  )
}
