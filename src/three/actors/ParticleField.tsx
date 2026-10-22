import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE, particleFragment, particleVertex } from '../shaders'
import { ADDITIVE, color } from '../materials'
import { world } from '../world'
import { Damped } from './primitives'

const MAX_RADIUS = 36

/**
 * Thousands of luminous particles in a single draw call. Drift, twinkle,
 * reveal radius, colour mood, depth-of-field blur and bursts all happen on
 * the GPU.
 */
export function ParticleField({ count = 5200 }: { count?: number }) {
  const gl = useThree((s) => s.gl)
  const points = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const rnd = new Float32Array(count * 4)
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1
      const th = Math.random() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const r = 3.2 + 32 * Math.pow(Math.random(), 1.5)
      pos[i * 3] = s * Math.cos(th) * r
      pos[i * 3 + 1] = u * r * 0.65
      pos[i * 3 + 2] = s * Math.sin(th) * r
      for (let k = 0; k < 4; k++) rnd[i * 4 + k] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 30 },
          uPixelRatio: { value: 1 },
          uReveal: { value: 0 },
          uMaxRadius: { value: MAX_RADIUS },
          uFocus: { value: 12 },
          uDrift: { value: 1 },
          uBurstAge: { value: 99 },
          uBurstOrigin: { value: new THREE.Vector3() },
          uOpacity: { value: 0 },
          uMix: { value: 0 },
          uCyan: { value: color(PALETTE.cyan) },
          uBlue: { value: color(PALETTE.blue) },
          uViolet: { value: color(PALETTE.violet) },
          uMagenta: { value: color(PALETTE.magenta) },
          uOrange: { value: color(PALETTE.orange) },
        },
        ...ADDITIVE,
      }),
    [],
  )

  const state = useRef({
    opacity: new Damped(0),
    reveal: new Damped(0),
    mix: new Damped(0),
    focus: new Damped(12),
    drift: new Damped(1),
    t: 0,
  })

  useFrame(() => {
    const tg = world.targets.particles
    const s = state.current
    const dt = world.dt
    const u = material.uniforms
    s.t += dt * s.drift.to(tg.drift, 1, dt)
    u.uTime.value = s.t
    u.uOpacity.value = s.opacity.to(tg.opacity, 1.4, dt)
    u.uReveal.value = s.reveal.to(tg.reveal, 1.2, dt, world.snap && tg.reveal >= 1)
    u.uMix.value = s.mix.to(tg.mix, 0.8, dt, world.snap)
    u.uFocus.value = s.focus.to(tg.focus, 1.5, dt, world.snap)
    u.uPixelRatio.value = gl.getPixelRatio()
    const b = world.targets.burst
    u.uBurstAge.value = b.age
    u.uBurstOrigin.value.set(b.origin[0], b.origin[1], b.origin[2])
    if (points.current && !world.lowMotion) points.current.rotation.y += dt * 0.008
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
}
