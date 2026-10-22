import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from '../shaders'
import { makeBasicAdditive, makeGlowMaterial, makeShellMaterial } from '../materials'
import { world } from '../world'
import { Damped, DampedVec3, setVisible, Sprite } from './primitives'

const RADIUS = 2.2

/** The hero sphere of the opening and the finale. */
export function QuantumSphere() {
  const group = useRef<THREE.Group>(null)
  const rings = useRef<THREE.Group>(null)
  const shell = useMemo(() => makeShellMaterial(PALETTE.cyan, PALETTE.violet, { bands: 0.7, veins: 0.6 }), [])
  const core = useMemo(() => makeGlowMaterial(PALETTE.cyan, 1.2), [])
  const halo = useMemo(() => makeGlowMaterial(PALETTE.blue, 0), [])
  const ringMats = useMemo(
    () => [makeBasicAdditive(PALETTE.cyan), makeBasicAdditive(PALETTE.violet), makeBasicAdditive(PALETTE.magenta)],
    [],
  )
  const s = useRef({ op: new Damped(0), scale: new Damped(0.55), intensity: new Damped(1), pos: new DampedVec3() })

  useFrame(() => {
    const t = world.targets.hero
    const dt = world.dt
    const st = s.current
    const snap = world.snap
    const op = st.op.to(t.opacity, 1.3, dt, snap && t.opacity === 0)
    const sc = st.scale.to(t.scale, 1.1, dt, snap)
    const it = st.intensity.to(t.intensity, 2, dt, snap)
    const p = st.pos.to(t.pos, 1.5, dt, snap)
    const g = group.current
    if (!g) return
    setVisible(g, op)
    g.position.copy(p)
    g.scale.setScalar(sc * RADIUS)
    shell.uniforms.uOpacity.value = op
    shell.uniforms.uIntensity.value = it
    shell.uniforms.uTime.value = world.time
    core.uniforms.uOpacity.value = op * 0.55 * it
    halo.uniforms.uOpacity.value = op * 0.22 * it
    ringMats.forEach((m, i) => (m.opacity = op * (0.35 - i * 0.07)))
    if (rings.current && !world.lowMotion) {
      rings.current.children.forEach((r, i) => {
        r.rotation.z += dt * (0.05 + i * 0.03) * (i % 2 ? -1 : 1)
      })
    }
    g.rotation.y += dt * 0.05
  })

  return (
    <group ref={group}>
      <mesh material={shell}>
        <sphereGeometry args={[1, 96, 64]} />
      </mesh>
      <Sprite material={core} scale={1.6} />
      <Sprite material={halo} scale={5.5} />
      <group ref={rings}>
        {[
          [1.32, 1.2, 0.2],
          [1.55, -0.4, 0.9],
          [1.8, 0.5, -0.7],
        ].map(([r, rx, ry], i) => (
          <group key={i} rotation={[rx, ry, 0]}>
            <mesh material={ringMats[i]}>
              <torusGeometry args={[r, 0.004, 6, 160]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
