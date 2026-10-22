import * as THREE from 'three'
import { getAnchor } from './anchorRegistry'

export { anchorRef, getAnchor } from './anchorRegistry'

/**
 * 3D-anchored HTML labels without extra React roots.
 *
 * Labels are ordinary DOM elements rendered by the main React tree (see
 * AnchoredLabels). They register here by name; 3D actors then project a
 * point every frame and move the element there.
 */

const v = new THREE.Vector3()

/**
 * Position the named label at `local` (in `obj`'s space) and fade it.
 * Coordinates are CSS pixels of the canvas, which fills the viewport.
 */
export function placeAnchor(
  name: string,
  obj: THREE.Object3D,
  local: readonly [number, number, number],
  camera: THREE.Camera,
  size: { width: number; height: number },
  opacity: number,
) {
  const el = getAnchor(name)
  if (!el) return
  obj.updateWorldMatrix(true, false)
  v.set(local[0], local[1], local[2])
  obj.localToWorld(v)
  v.project(camera)
  const visible = opacity > 0.004 && v.z < 1
  el.style.visibility = visible ? 'visible' : 'hidden'
  el.style.opacity = visible ? opacity.toFixed(3) : '0'
  if (!visible) return
  const x = ((v.x + 1) / 2) * size.width
  const y = ((1 - v.y) / 2) * size.height
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
}

export function hideAnchor(name: string) {
  const el = getAnchor(name)
  if (!el) return
  el.style.visibility = 'hidden'
  el.style.opacity = '0'
}
