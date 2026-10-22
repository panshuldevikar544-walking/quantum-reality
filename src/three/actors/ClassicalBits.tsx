import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { placeAnchor } from '../anchors'
import { world } from '../world'
import { Damped, DampedVec3 } from './primitives'

const ORIGIN = [0, 0, 0] as const

/**
 * The classical 0 and 1. They live in 3D so they can physically fly to the
 * Bloch sphere's poles (scene 2) and orbit into the sphere (finale).
 */
export function ClassicalBits() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const g0 = useRef<THREE.Group>(null)
  const g1 = useRef<THREE.Group>(null)
  const s = useRef({ p0: new DampedVec3(), p1: new DampedVec3(), op: new Damped(0), lit0: new Damped(1), lit1: new Damped(1) })

  useFrame(() => {
    const t = world.targets.bits
    const dt = world.dt
    const st = s.current
    const snap = world.snap
    const op = st.op.to(t.opacity, 6, dt, snap && t.opacity === 0)
    const jump = snap || op < 0.01
    if (!g0.current || !g1.current) return
    g0.current.position.copy(st.p0.to(t.p0, 5, dt, jump))
    g1.current.position.copy(st.p1.to(t.p1, 5, dt, jump))
    const l0 = st.lit0.to(t.lit === 1 ? 0.16 : 1, 7, dt)
    const l1 = st.lit1.to(t.lit === 0 ? 0.16 : 1, 7, dt)
    placeAnchor('bit-0', g0.current, ORIGIN, camera, size, op * l0)
    placeAnchor('bit-1', g1.current, ORIGIN, camera, size, op * l1)
  })

  return (
    <>
      <group ref={g0} />
      <group ref={g1} />
    </>
  )
}
