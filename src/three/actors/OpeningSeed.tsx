import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../shaders'
import { makeGlowMaterial, makeRingMaterial } from '../materials'
import { world } from '../world'
import { Damped, setVisible, Sprite } from './primitives'

/** Scene 1: the first tiny particle, its pulse and the ripple it emits. */
export function OpeningSeed() {
  const glow = useMemo(() => makeGlowMaterial(PALETTE.cyan, 1.4), [])
  const ring = useMemo(() => makeRingMaterial(PALETTE.cyan, 0.025), [])
  const seedRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const op = useRef(new Damped(0))

  useFrame(() => {
    const t = world.targets
    const o = op.current.to(t.seed.opacity, 2, world.dt)
    glow.uniforms.uOpacity.value = o
    if (seedRef.current) {
      seedRef.current.scale.setScalar(0.9 * t.seed.scale)
      setVisible(seedRef.current, o)
    }
    const r = t.ripple
    const show = r >= 0 && r <= 1
    if (ringRef.current) ringRef.current.visible = show
    if (show) {
      ring.uniforms.uRadius.value = r * 0.95
      ring.uniforms.uOpacity.value = (1 - r) * 0.9
    }
  })

  return (
    <group>
      <Sprite ref={seedRef} material={glow} />
      <Sprite ref={ringRef} material={ring} scale={26} />
    </group>
  )
}

/** A colored shock ring at the location of a burst (measurement, finale). */
export function BurstRing() {
  const warm = useMemo(() => makeRingMaterial(PALETTE.orange, 0.03), [])
  const cool = useMemo(() => makeRingMaterial(PALETTE.cyan, 0.03), [])
  const ref = useRef<THREE.Mesh>(null)
  const DURATION = 1.6

  useFrame(() => {
    const b = world.targets.burst
    const m = ref.current
    if (!m) return
    const p = b.age / DURATION
    const show = p >= 0 && p < 1
    m.visible = show
    if (!show) return
    const mat = b.warm ? warm : cool
    m.material = mat
    m.position.set(b.origin[0], b.origin[1], b.origin[2])
    mat.uniforms.uRadius.value = 0.15 + p * 0.85
    mat.uniforms.uOpacity.value = Math.pow(1 - p, 1.6) * 0.9
  })

  return <Sprite ref={ref} material={warm} scale={9} />
}
