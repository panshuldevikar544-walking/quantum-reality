import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Line2 } from 'three-stdlib'
import { dampAngle, lerp } from '../../lib/easing'
import { getAnchor, hideAnchor, placeAnchor } from '../anchors'
import { PALETTE } from '../shaders'
import { color, makeGlowMaterial, makeShellMaterial, phaseColor } from '../materials'
import { world } from '../world'
import { Damped, DampedVec3, setVisible, Sprite } from './primitives'

function circle(radius: number, plane: 'xz' | 'xy' | 'zy', y = 0, segments = 128): [number, number, number][] {
  const pts: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const c = Math.cos(a) * radius
    const s = Math.sin(a) * radius
    if (plane === 'xz') pts.push([c, y, s])
    else if (plane === 'xy') pts.push([c, s, 0])
    else pts.push([0, s, c])
  }
  return pts
}

const UP = new THREE.Vector3(0, 1, 0)
const X_AXIS = new THREE.Vector3(1, 0, 0)
const CYAN = color(PALETTE.cyan)
const ORANGE = color(PALETTE.orange)

/**
 * The Bloch sphere: every pure state of one qubit is a point on its surface.
 * Mapping (Bloch → scene): z → up, x → toward camera, y → right.
 *   direction = (sinθ·sinφ, cosθ, sinθ·cosφ)
 */
export function BlochSphere() {
  const group = useRef<THREE.Group>(null)
  const vector = useRef<THREE.Group>(null)
  const tip = useRef<THREE.Mesh>(null)
  const latitude = useRef<THREE.Group>(null)
  const projection = useRef<THREE.Group>(null)
  const marker = useRef<THREE.Mesh>(null)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const frameLines = useRef<(Line2 | null)[]>([])
  const latLine = useRef<Line2 | null>(null)

  const mats = useMemo(
    () => ({
      shell: makeShellMaterial(PALETTE.cyan, PALETTE.blue, { bands: 0, veins: 0.25 }),
      tip: makeGlowMaterial(PALETTE.cyan, 1.6),
      north: makeGlowMaterial(PALETTE.cyan, 0.8),
      south: makeGlowMaterial(PALETTE.cyan, 0.8),
      marker: makeGlowMaterial(PALETTE.violet, 1),
      vector: new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0, depthWrite: false }),
      proj: new THREE.MeshBasicMaterial({
        color: PALETTE.violet,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    }),
    [],
  )

  const geo = useMemo(
    () => ({
      shaft: new THREE.CylinderGeometry(0.018, 0.018, 0.86, 12).translate(0, 0.43, 0),
      head: new THREE.ConeGeometry(0.06, 0.15, 20).translate(0, 0.925, 0),
      proj: new THREE.CylinderGeometry(0.006, 0.006, 1, 6).rotateZ(Math.PI / 2).translate(0.5, 0, 0),
    }),
    [],
  )

  const frame = useMemo(
    () => [
      { pts: circle(1, 'xz'), w: 1.4, c: PALETTE.cyan, o: 0.55 },
      { pts: circle(1, 'xy'), w: 1, c: PALETTE.blue, o: 0.35 },
      { pts: circle(1, 'zy'), w: 1, c: PALETTE.blue, o: 0.35 },
      { pts: circle(Math.sqrt(0.75), 'xz', 0.5), w: 0.8, c: PALETTE.blue, o: 0.18 },
      { pts: circle(Math.sqrt(0.75), 'xz', -0.5), w: 0.8, c: PALETTE.blue, o: 0.18 },
      {
        pts: [
          [0, -1.18, 0],
          [0, 1.18, 0],
        ] as [number, number, number][],
        w: 1.6,
        c: PALETTE.cyan,
        o: 0.7,
      },
      {
        pts: [
          [-1.12, 0, 0],
          [1.12, 0, 0],
        ] as [number, number, number][],
        w: 1,
        c: PALETTE.white,
        o: 0.25,
      },
      {
        pts: [
          [0, 0, -1.12],
          [0, 0, 1.12],
        ] as [number, number, number][],
        w: 1,
        c: PALETTE.white,
        o: 0.25,
      },
    ],
    [],
  )
  const unitCircle = useMemo(() => circle(1, 'xz'), [])

  const s = useRef({
    pos: new DampedVec3(),
    scale: new Damped(2),
    op: new Damped(0),
    shell: new Damped(1),
    vec: new Damped(0),
    labels: new Damped(0),
    amps: new Damped(0),
    lat: new Damped(0),
    proj: new Damped(0),
    collapse: new Damped(0),
    theta: new Damped(1),
    phi: 0,
    dir: new THREE.Vector3(),
    hdir: new THREE.Vector3(),
    q: new THREE.Quaternion(),
    phaseCol: new THREE.Color(),
  })

  useFrame(() => {
    const t = world.targets.bloch
    const dt = world.dt
    const snap = world.snap
    const st = s.current
    const g = group.current
    if (!g) return

    const op = st.op.to(t.opacity, 1.4, dt, snap && t.opacity === 0)
    setVisible(g, op)
    if (!g.visible) {
      hideAnchor('bloch-0')
      hideAnchor('bloch-1')
      return
    }

    g.position.copy(st.pos.to(t.pos, 1.6, dt, snap))
    g.scale.setScalar(st.scale.to(t.scale, 1.6, dt, snap))
    const shell = st.shell.to(t.shell, 2, dt)
    const vec = st.vec.to(t.vector, 2.2, dt)
    const labels = st.labels.to(t.labels, 2.5, dt)
    const amps = st.amps.to(t.amps, 2, dt)
    const collapse = st.collapse.to(t.collapse, 5, dt)
    const lat = st.lat.to(t.latitude, 2, dt) * (1 - collapse)
    const proj = st.proj.to(t.projection, 2, dt) * (1 - collapse)

    // State direction. During collapse the vector swings to the measured pole.
    const thetaTarget = lerp(t.theta, t.collapseTo === 0 ? 0 : Math.PI, collapse)
    const theta = st.theta.to(thetaTarget, 3.2, dt, snap)
    st.phi = snap ? t.phi : dampAngle(st.phi, t.phi, 3, dt)
    const sinT = Math.sin(theta)
    const cosT = Math.cos(theta)
    st.dir.set(sinT * Math.sin(st.phi), cosT, sinT * Math.cos(st.phi))

    // Frame lines dim when the qubit is measured.
    const frameOp = op * (1 - 0.65 * collapse)
    frameLines.current.forEach((l, i) => {
      if (l) l.material.opacity = frame[i].o * frameOp
    })
    mats.shell.uniforms.uOpacity.value = op * shell * 0.55
    mats.shell.uniforms.uTime.value = world.time

    // Vector + tip, coloured by phase; orange once collapsed.
    phaseColor(st.phi, st.phaseCol).lerp(ORANGE, collapse)
    mats.vector.color.copy(st.phaseCol)
    mats.vector.opacity = op * vec
    mats.tip.uniforms.uColor.value.copy(st.phaseCol)
    mats.tip.uniforms.uOpacity.value = op * vec * 0.95
    if (vector.current) {
      st.q.setFromUnitVectors(UP, st.dir)
      vector.current.quaternion.copy(st.q)
      setVisible(vector.current, op * vec)
    }
    if (tip.current) {
      tip.current.position.copy(st.dir)
      tip.current.scale.setScalar(0.42 + 0.06 * Math.sin(world.time * 3))
    }

    // Poles: the measured outcome glows orange.
    const n0 = t.collapseTo === 0 ? collapse : 0
    const n1 = t.collapseTo === 1 ? collapse : 0
    mats.north.uniforms.uColor.value.copy(CYAN).lerp(ORANGE, n0)
    mats.south.uniforms.uColor.value.copy(CYAN).lerp(ORANGE, n1)
    mats.north.uniforms.uOpacity.value = op * (0.25 + 0.9 * n0 - 0.18 * n1)
    mats.south.uniforms.uOpacity.value = op * (0.25 + 0.9 * n1 - 0.18 * n0)

    // Latitude ring through the state: every state on it has the same odds.
    if (latitude.current) {
      latitude.current.position.y = cosT
      const r = Math.max(sinT, 0.001)
      latitude.current.scale.set(r, 1, r)
      setVisible(latitude.current, op * lat)
    }
    if (latLine.current) latLine.current.material.opacity = op * lat * 0.75

    // Projection onto the |0⟩–|1⟩ axis: its height sets P(0) = (1 + cosθ)/2.
    if (projection.current) {
      projection.current.position.set(0, cosT, 0)
      st.hdir.set(Math.sin(st.phi), 0, Math.cos(st.phi))
      st.q.setFromUnitVectors(X_AXIS, st.hdir)
      projection.current.quaternion.copy(st.q)
      projection.current.scale.set(Math.max(sinT, 0.001), 1, 1)
      setVisible(projection.current, op * proj)
    }
    mats.proj.opacity = op * proj * 0.8
    if (marker.current) {
      marker.current.position.set(0, cosT, 0)
      setVisible(marker.current, op * proj)
    }
    mats.marker.uniforms.uOpacity.value = op * proj

    // Pole labels (DOM, projected from 3D)
    const lo = op * labels
    placeAnchor('bloch-0', g, [0, 1.3, 0], camera, size, lo * (1 - 0.5 * n1))
    placeAnchor('bloch-1', g, [0, -1.3, 0], camera, size, lo * (1 - 0.5 * n0))
    const l0 = getAnchor('bloch-0')
    const l1 = getAnchor('bloch-1')
    l0?.classList.toggle('is-outcome', n0 > 0.5)
    l1?.classList.toggle('is-outcome', n1 > 0.5)
    const a0 = l0?.firstElementChild as HTMLElement | null | undefined
    const a1 = l1?.firstElementChild as HTMLElement | null | undefined
    if (a0) a0.style.opacity = amps.toFixed(3)
    if (a1) a1.style.opacity = amps.toFixed(3)
  })

  return (
    <group ref={group}>
      <mesh material={mats.shell}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      {frame.map((f, i) => (
        <Line
          key={i}
          ref={(l) => {
            frameLines.current[i] = l as Line2 | null
          }}
          points={f.pts}
          color={f.c}
          lineWidth={f.w}
          transparent
          opacity={0}
          depthWrite={false}
        />
      ))}
      <group ref={latitude}>
        <Line
          ref={(l) => {
            latLine.current = l as Line2 | null
          }}
          points={unitCircle}
          color={PALETTE.violet}
          lineWidth={1.4}
          dashed
          dashSize={0.06}
          gapSize={0.05}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </group>
      <group ref={projection}>
        <mesh geometry={geo.proj} material={mats.proj} />
      </group>
      <Sprite ref={marker} material={mats.marker} scale={0.28} />
      <group ref={vector}>
        <mesh geometry={geo.shaft} material={mats.vector} />
        <mesh geometry={geo.head} material={mats.vector} />
      </group>
      <Sprite ref={tip} material={mats.tip} />
      <Sprite material={mats.north} scale={0.55} position={[0, 1, 0]} />
      <Sprite material={mats.south} scale={0.55} position={[0, -1, 0]} />

    </group>
  )
}
