import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { damp } from '../lib/easing'
import { world } from './world'

const DESIGN_ASPECT = 16 / 9

/**
 * Smoothly follows the choreography's camera target. On screens narrower than
 * 16:9 it pulls back so the composition still fits, and it adds a very small
 * pointer parallax (off in low-motion mode).
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const pos = useRef(new THREE.Vector3(0, 0.4, 16))
  const look = useRef(new THREE.Vector3())
  const parallax = useRef(new THREE.Vector2())
  const tmp = useRef(new THREE.Vector3())

  useFrame(() => {
    const t = world.targets
    const dt = world.dt
    const aspect = size.width / Math.max(size.height, 1)
    const fit = THREE.MathUtils.clamp(DESIGN_ASPECT / aspect, 1, 2.2)

    const target = tmp.current
      .set(t.camPos[0] - t.camLook[0], t.camPos[1] - t.camLook[1], t.camPos[2] - t.camLook[2])
      .multiplyScalar(fit)
      .add(new THREE.Vector3(t.camLook[0], t.camLook[1], t.camLook[2]))

    const lambda = t.camLambda
    if (world.snap) {
      pos.current.copy(target)
      look.current.set(...t.camLook)
    } else {
      pos.current.set(
        damp(pos.current.x, target.x, lambda, dt),
        damp(pos.current.y, target.y, lambda, dt),
        damp(pos.current.z, target.z, lambda, dt),
      )
      look.current.set(
        damp(look.current.x, t.camLook[0], lambda, dt),
        damp(look.current.y, t.camLook[1], lambda, dt),
        damp(look.current.z, t.camLook[2], lambda, dt),
      )
    }

    const px = world.lowMotion ? 0 : world.pointer.x * 0.35
    const py = world.lowMotion ? 0 : world.pointer.y * 0.2
    parallax.current.set(damp(parallax.current.x, px, 1.5, dt), damp(parallax.current.y, py, 1.5, dt))

    camera.position.set(pos.current.x + parallax.current.x, pos.current.y + parallax.current.y, pos.current.z)
    camera.lookAt(look.current)
  })

  return null
}
