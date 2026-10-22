import { useRef, type Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { damp } from '../../lib/easing'
import { UNIT_PLANE } from '../materials'

/** A value that eases toward a target each frame. */
export class Damped {
  v: number
  constructor(v = 0) {
    this.v = v
  }
  to(target: number, lambda: number, dt: number, snap = false) {
    this.v = snap ? target : damp(this.v, target, lambda, dt)
    return this.v
  }
}

export class DampedVec3 {
  v = new THREE.Vector3()
  to(t: readonly [number, number, number], lambda: number, dt: number, snap = false) {
    if (snap) this.v.set(t[0], t[1], t[2])
    else
      this.v.set(damp(this.v.x, t[0], lambda, dt), damp(this.v.y, t[1], lambda, dt), damp(this.v.z, t[2], lambda, dt))
    return this.v
  }
}

/** Camera-facing quad: used for glows, rings and points of light. */
export function Sprite({
  material,
  scale = 1,
  position,
  ref,
  renderOrder,
}: {
  material: THREE.Material
  scale?: number
  position?: [number, number, number]
  ref?: Ref<THREE.Mesh>
  renderOrder?: number
}) {
  const local = useRef<THREE.Mesh>(null)
  useFrame(({ camera }) => {
    const m = local.current
    if (m) m.quaternion.copy(camera.quaternion)
  })
  return (
    <mesh
      ref={(m) => {
        local.current = m
        if (typeof ref === 'function') ref(m)
        else if (ref) (ref as React.MutableRefObject<THREE.Mesh | null>).current = m
      }}
      geometry={UNIT_PLANE}
      material={material}
      scale={scale}
      position={position}
      renderOrder={renderOrder}
      frustumCulled={false}
    />
  )
}

/** Visibility helper: skip drawing objects that are fully faded out. */
export function setVisible(obj: THREE.Object3D | null, opacity: number) {
  if (obj) obj.visible = opacity > 0.002
}
