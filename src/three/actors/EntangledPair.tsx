import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getState } from '../../state/store'
import { getAnchor, placeAnchor } from '../anchors'
import { braidFragment, braidVertex, PALETTE } from '../shaders'
import {
  ADDITIVE,
  color,
  makeBasicAdditive,
  makeGlowMaterial,
  makeRingMaterial,
  makeShellMaterial,
} from '../materials'
import { world } from '../world'
import { Damped, DampedVec3, setVisible, Sprite } from './primitives'

const CYAN = color(PALETTE.cyan)
const ORANGE = color(PALETTE.orange)

type Tilt = [number, number, number]
interface OrbConfig {
  id: 'a' | 'b'
  label: string
  tilts: [Tilt, Tilt]
  speed: number
  offset: number
}

const SYNC_TILTS: [Tilt, Tilt] = [
  [1.05, 0, 0.3],
  [0.35, 0, -0.45],
]

const ORBS: OrbConfig[] = [
  {
    id: 'a',
    label: 'Qubit A',
    tilts: [
      [0.5, 0.2, 0.6],
      [1.4, 0.5, -0.2],
    ],
    speed: 0.9,
    offset: 0,
  },
  {
    id: 'b',
    label: 'Qubit B',
    tilts: [
      [-0.7, 0.3, -0.5],
      [0.2, -0.9, 0.4],
    ],
    speed: 1.55,
    offset: 2.4,
  },
]

const wrap = (a: number) => {
  let d = a % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

/** Shared animation state for the two orbs (phases must talk to each other). */
const phases = { a: 0, b: 2.4 }

function QubitOrb({ cfg, groupRef }: { cfg: OrbConfig; groupRef: (g: THREE.Group | null) => void }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const self = useRef<THREE.Group | null>(null)
  const tilt = useRef<THREE.Group[]>([])
  const sats = useRef<(THREE.Mesh | null)[]>([])
  const coreRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const shown = useRef<string>('')

  const mats = useMemo(
    () => ({
      shell: makeShellMaterial(PALETTE.cyan, PALETTE.violet, { bands: 0.35, veins: 0.5 }),
      core: makeGlowMaterial(PALETTE.cyan, 1.5),
      halo: makeGlowMaterial(PALETTE.violet, 0),
      ring: makeBasicAdditive(PALETTE.cyan),
      ring2: makeBasicAdditive(PALETTE.violet),
      sat: makeGlowMaterial(PALETTE.cyan, 1),
      burst: makeRingMaterial(PALETTE.orange, 0.035),
    }),
    [],
  )
  const st = useRef({ measured: new Damped(0), labels: new Damped(0), outcomes: new Damped(0), col: new THREE.Color() })

  useFrame(() => {
    const t = world.targets.pair
    const dt = world.dt
    const s = st.current
    const op = pairOpacity.v
    const sync = pairSync.v

    // Orbit phase: independent speeds, then locked together when entangled.
    const omega = THREE.MathUtils.lerp(cfg.speed, 1.15, sync) * (world.lowMotion ? 0.35 : 1)
    phases[cfg.id] += dt * omega
    if (cfg.id === 'b') phases.b += sync * wrap(phases.a - phases.b) * dt * 1.6

    tilt.current.forEach((g, i) => {
      if (!g) return
      const a = cfg.tilts[i]
      const b = SYNC_TILTS[i]
      g.rotation.set(
        THREE.MathUtils.lerp(a[0], b[0], sync),
        THREE.MathUtils.lerp(a[1], b[1], sync),
        THREE.MathUtils.lerp(a[2], b[2], sync),
      )
    })
    sats.current.forEach((m, i) => {
      if (!m) return
      const r = i === 0 ? 0.95 : 1.22
      const ph = phases[cfg.id] * (i === 0 ? 1 : -0.75) + i * 1.3
      m.position.set(Math.cos(ph) * r, 0, Math.sin(ph) * r)
    })

    const measured = s.measured.to(t.measured, 6, dt)
    const flash = t.flashAge < 8 ? Math.exp(-t.flashAge * 1.3) : 0
    const meas = t.measuring
    const pre = meas >= 0 ? Math.sin(meas * Math.PI) : 0

    s.col.copy(CYAN).lerp(ORANGE, Math.max(measured * 0.85, flash))
    mats.core.uniforms.uColor.value.copy(s.col)
    mats.core.uniforms.uOpacity.value = op * (0.75 + flash * 0.8 + pre * 0.6)
    if (coreRef.current) coreRef.current.scale.setScalar(1.5 * (1 + flash * 0.9 + pre * 0.4))
    mats.halo.uniforms.uOpacity.value = op * 0.28
    mats.shell.uniforms.uOpacity.value = op * 0.9
    mats.shell.uniforms.uTime.value = world.time
    mats.ring.opacity = op * 0.4
    mats.ring2.opacity = op * 0.25
    mats.sat.uniforms.uOpacity.value = op * 0.9

    // Measurement ring: converges on the qubit, then bursts outward.
    if (ringRef.current) {
      const burstP = t.flashAge / 1.3
      if (meas >= 0) {
        ringRef.current.visible = true
        mats.burst.uniforms.uRadius.value = 1 - meas * 0.85
        mats.burst.uniforms.uOpacity.value = op * meas
      } else if (burstP >= 0 && burstP < 1) {
        ringRef.current.visible = true
        mats.burst.uniforms.uRadius.value = 0.15 + burstP * 0.85
        mats.burst.uniforms.uOpacity.value = op * Math.pow(1 - burstP, 1.5)
      } else ringRef.current.visible = false
    }

    // Label and outcome (DOM, projected from 3D). The outcome text only
    // changes at the flash, so a result never shows before its animation.
    const g = self.current
    if (!g) return
    const lab = s.labels.to(t.labels, 2.5, dt)
    const outs = s.outcomes.to(t.outcomes, 3, dt)
    placeAnchor(`pair-${cfg.id}-label`, g, [0, -1.75, 0], camera, size, op * lab)
    const out = getAnchor(`pair-${cfg.id}-out`)
    if (out) {
      const value = getState().pair[cfg.id]
      if (t.measured === 1 && value !== null && shown.current !== String(value)) {
        shown.current = String(value)
        out.textContent = shown.current
      }
      placeAnchor(`pair-${cfg.id}-out`, g, [0, 1.6, 0], camera, size, op * outs * measured)
      out.style.transform += ` scale(${(1 + flash * 0.25).toFixed(3)})`
    }
  })

  return (
    <group
      ref={(g) => {
        self.current = g
        groupRef(g)
      }}
    >
      <mesh material={mats.shell}>
        <sphereGeometry args={[0.55, 48, 32]} />
      </mesh>
      <Sprite ref={coreRef} material={mats.core} scale={1.5} />
      <Sprite material={mats.halo} scale={4.2} />
      {[0, 1].map((i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) tilt.current[i] = g
          }}
        >
          <mesh material={i === 0 ? mats.ring : mats.ring2} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[i === 0 ? 0.95 : 1.22, 0.007, 6, 128]} />
          </mesh>
          <Sprite
            ref={(m) => {
              sats.current[i] = m
            }}
            material={mats.sat}
            scale={0.3}
          />
        </group>
      ))}
      <Sprite ref={ringRef} material={mats.burst} scale={4.5} />
    </group>
  )
}

/* Pair-level damped values shared with the orbs. */
const pairOpacity = new Damped(0)
const pairSync = new Damped(0)

/**
 * Scenes 5, 6 and the finale: two qubits and a conceptual picture of their
 * shared state (a soft envelope and a slowly turning braid). Nothing travels
 * from one qubit to the other.
 */
export function EntangledPair() {
  const gl = useThree((s) => s.gl)
  const root = useRef<THREE.Group>(null)
  const orbs = useRef<(THREE.Group | null)[]>([])
  const field = useRef<THREE.Mesh>(null)
  const braid = useRef<THREE.Points>(null)
  const s = useRef({
    a: new DampedVec3(),
    b: new DampedVec3(),
    link: new Damped(0),
    q: new THREE.Quaternion(),
    dir: new THREE.Vector3(),
  })

  const fieldMat = useMemo(() => makeShellMaterial(PALETTE.violet, PALETTE.magenta, { bands: 0, veins: 0.9 }), [])
  const braidGeo = useMemo(() => {
    const n = 760
    const data = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      data[i * 3] = Math.random()
      data[i * 3 + 1] = Math.random() * Math.PI * 2
      data[i * 3 + 2] = i % 2
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aData', new THREE.BufferAttribute(data, 3))
    return g
  }, [])
  const braidMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: braidVertex,
        fragmentShader: braidFragment,
        uniforms: {
          uTime: { value: 0 },
          uA: { value: new THREE.Vector3() },
          uB: { value: new THREE.Vector3() },
          uPixelRatio: { value: 1 },
          uSize: { value: 22 },
          uOpacity: { value: 0 },
          uViolet: { value: color(PALETTE.violet) },
          uMagenta: { value: color(PALETTE.magenta) },
        },
        ...ADDITIVE,
      }),
    [],
  )

  useFrame(() => {
    const t = world.targets.pair
    const dt = world.dt
    const st = s.current
    const snap = world.snap
    const op = pairOpacity.to(t.opacity, t.opacity > pairOpacity.v ? 1.5 : 2.4, dt, snap && t.opacity === 0)
    pairSync.to(t.sync, 0.9, dt, snap)
    setVisible(root.current, op)
    const fast = op < 0.02
    const A = st.a.to(t.a, 1.4, dt, snap || fast)
    const B = st.b.to(t.b, 1.4, dt, snap || fast)
    orbs.current[0]?.position.copy(A)
    orbs.current[1]?.position.copy(B)

    const link = st.link.to(t.link, 1.1, dt, snap)
    const dist = A.distanceTo(B)
    if (field.current) {
      field.current.position.copy(A).add(B).multiplyScalar(0.5)
      st.dir.copy(B).sub(A).normalize()
      if (dist > 0.001) {
        st.q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), st.dir)
        field.current.quaternion.copy(st.q)
      }
      field.current.scale.set(dist / 2 + 1.0, 1.05, 1.05)
      setVisible(field.current, op * link)
    }
    fieldMat.uniforms.uOpacity.value = op * link * 0.32
    fieldMat.uniforms.uTime.value = world.time
    braidMat.uniforms.uA.value.copy(A)
    braidMat.uniforms.uB.value.copy(B)
    braidMat.uniforms.uTime.value = world.time * (world.lowMotion ? 0.3 : 1)
    braidMat.uniforms.uOpacity.value = op * link
    braidMat.uniforms.uPixelRatio.value = gl.getPixelRatio()
    setVisible(braid.current, op * link)
  })

  return (
    <group ref={root}>
      <mesh ref={field} material={fieldMat}>
        <sphereGeometry args={[1, 64, 32]} />
      </mesh>
      <points ref={braid} geometry={braidGeo} material={braidMat} frustumCulled={false} />
      {ORBS.map((cfg, i) => (
        <QubitOrb
          key={cfg.id}
          cfg={cfg}
          groupRef={(g) => {
            orbs.current[i] = g
          }}
        />
      ))}
    </group>
  )
}
