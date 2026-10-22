import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE, waveFragment, waveVertex } from '../shaders'
import { ADDITIVE, color } from '../materials'
import { world } from '../world'
import { Damped, setVisible } from './primitives'

/**
 * A floor of light showing two coherent wave sources interfering: bright
 * where crests reinforce, dark where they cancel. The relative phase follows
 * the qubit's phase, so turning φ visibly shifts the fringes.
 */
export function WaveField() {
  const mesh = useRef<THREE.Mesh>(null)
  const s = useRef({ op: new Damped(0), amp: new Damped(1), y: new Damped(-3.4) })
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: waveVertex,
        fragmentShader: waveFragment,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uAmp: { value: 1 },
          uSep: { value: 2.4 },
          uPhase: { value: 0 },
          uCyan: { value: color(PALETTE.cyan) },
          uViolet: { value: color(PALETTE.violet) },
          uMagenta: { value: color(PALETTE.magenta) },
        },
        side: THREE.DoubleSide,
        ...ADDITIVE,
      }),
    [],
  )

  useFrame(() => {
    const t = world.targets.waves
    const dt = world.dt
    const st = s.current
    const op = st.op.to(t.opacity, 1.2, dt)
    material.uniforms.uOpacity.value = op
    material.uniforms.uAmp.value = st.amp.to(t.amp, 1, dt)
    material.uniforms.uTime.value = world.time * (world.lowMotion ? 0.4 : 1)
    material.uniforms.uPhase.value = t.phase
    setVisible(mesh.current, op)
    if (mesh.current) mesh.current.position.y = st.y.to(t.y, 1.2, dt, world.snap)
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} material={material} frustumCulled={false}>
      <planeGeometry args={[56, 56, 1, 1]} />
    </mesh>
  )
}
