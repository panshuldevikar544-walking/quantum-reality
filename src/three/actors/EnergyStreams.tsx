import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE, streamFragment, streamVertex } from '../shaders'
import { ADDITIVE, color } from '../materials'
import { world } from '../world'
import { Damped, setVisible } from './primitives'

const STREAM_COUNT = 7
const COLORS = [PALETTE.cyan, PALETTE.blue, PALETTE.violet, PALETTE.cyan, PALETTE.magenta, PALETTE.blue, PALETTE.violet]

/** Comet-like energy lines that sweep through space and spiral into the sphere. */
export function EnergyStreams() {
  const group = useRef<THREE.Group>(null)
  const op = useRef(new Damped(0))

  const streams = useMemo(() => {
    return Array.from({ length: STREAM_COUNT }, (_, i) => {
      const a0 = (i / STREAM_COUNT) * Math.PI * 2 + 0.4
      const tilt = (i % 3) - 1
      const pts: THREE.Vector3[] = []
      const steps = 7
      for (let k = 0; k <= steps; k++) {
        const f = k / steps
        const r = THREE.MathUtils.lerp(28, 2.35, Math.pow(f, 0.8))
        const a = a0 + f * 2.6
        pts.push(new THREE.Vector3(Math.cos(a) * r, tilt * (1 - f) * 6 + Math.sin(f * 5 + i) * (1 - f) * 2, Math.sin(a) * r - (1 - f) * 6))
      }
      const curve = new THREE.CatmullRomCurve3(pts)
      const geo = new THREE.TubeGeometry(curve, 220, 0.022, 6, false)
      const mat = new THREE.ShaderMaterial({
        vertexShader: streamVertex,
        fragmentShader: streamFragment,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uSpeed: { value: 0.07 + (i % 4) * 0.018 },
          uOffset: { value: i / STREAM_COUNT },
          uColor: { value: color(COLORS[i]) },
        },
        ...ADDITIVE,
      })
      return { geo, mat }
    })
  }, [])

  useFrame(() => {
    const o = op.current.to(world.targets.streams.opacity, 1.2, world.dt)
    setVisible(group.current, o)
    for (const s of streams) {
      s.mat.uniforms.uOpacity.value = o
      s.mat.uniforms.uTime.value = world.time
    }
  })

  return (
    <group ref={group}>
      {streams.map((s, i) => (
        <mesh key={i} geometry={s.geo} material={s.mat} frustumCulled={false} />
      ))}
    </group>
  )
}
