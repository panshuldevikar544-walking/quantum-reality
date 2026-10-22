import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { edgeFragment, edgeVertex, nodeFragment, nodeVertex, PALETTE } from '../shaders'
import { ADDITIVE, color } from '../materials'
import { world } from '../world'
import { Damped, DampedVec3, setVisible } from './primitives'

/** Deterministic pseudo-random so the network looks the same every time. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface NetworkData {
  nodes: THREE.Vector3[]
  clusters: number[]
  edges: [number, number][]
}

/**
 * Node 0 is the seed particle. Clusters 1–3 are computing, communication and
 * sensing; cluster 4 joins everything into one network.
 */
function buildNetwork(): NetworkData {
  const rnd = mulberry32(7)
  const nodes: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]
  const clusters: number[] = [0]
  const edges: [number, number][] = []
  const hubs: number[] = []
  const centers = [
    new THREE.Vector3(-2.1, 1.55, 0.4),
    new THREE.Vector3(2.0, 1.6, -0.4),
    new THREE.Vector3(-1.8, -1.65, 0.3),
    new THREE.Vector3(2.1, -1.7, 0.1),
  ]
  const jitter = (r: number) =>
    new THREE.Vector3((rnd() - 0.5) * 2 * r, (rnd() - 0.5) * 2 * r, (rnd() - 0.5) * 2 * r * 0.7)

  for (let c = 0; c < 3; c++) {
    const start = nodes.length
    hubs.push(start)
    nodes.push(centers[c].clone())
    clusters.push(c + 1)
    edges.push([0, start])
    for (let k = 1; k < 12; k++) {
      nodes.push(centers[c].clone().add(jitter(1.05)))
      clusters.push(c + 1)
    }
    // connect each new node to its nearest earlier node in the cluster
    for (let k = start + 1; k < start + 12; k++) {
      let best = start
      let bd = Infinity
      for (let j = start; j < k; j++) {
        const d = nodes[k].distanceTo(nodes[j])
        if (d < bd) {
          bd = d
          best = j
        }
      }
      edges.push([best, k])
      if (k % 3 === 0) edges.push([start, k])
    }
  }

  // Cluster 4: a fourth hub plus bridges linking all hubs into one network.
  const hub4 = nodes.length
  nodes.push(centers[3].clone())
  clusters.push(4)
  edges.push([0, hub4])
  for (let k = 0; k < 8; k++) {
    const i = nodes.length
    nodes.push(centers[3].clone().add(jitter(0.95)))
    clusters.push(4)
    edges.push([k < 4 ? hub4 : i - 1, i])
  }
  const allHubs = [...hubs, hub4]
  const ring: [number, number][] = [
    [allHubs[0], allHubs[1]],
    [allHubs[1], allHubs[3]],
    [allHubs[3], allHubs[2]],
    [allHubs[2], allHubs[0]],
  ]
  for (const [h1, h2] of ring) {
    let prev = h1
    for (let k = 1; k <= 3; k++) {
      const f = k / 4
      const p = nodes[h1].clone().lerp(nodes[h2], f).add(jitter(0.35))
      p.multiplyScalar(1.12)
      const i = nodes.length
      nodes.push(p)
      clusters.push(4)
      edges.push([prev, i])
      prev = i
    }
    edges.push([prev, h2])
  }
  return { nodes, clusters, edges }
}

function fibonacciSphere(n: number, r: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const th = golden * i
    out.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r))
  }
  return out
}

/** Scene 7 and the finale: a network that grows node by node, then becomes a lattice. */
export function QuantumNetwork() {
  const gl = useThree((s) => s.gl)
  const group = useRef<THREE.Group>(null)

  const { nodeGeo, edgeGeo } = useMemo(() => {
    const { nodes, clusters, edges } = buildNetwork()
    const lattice = fibonacciSphere(nodes.length, 4.7)
    // node 0 sits at the very centre of the finale structure
    lattice[0] = new THREE.Vector3(0, 0, 0)

    const np = new Float32Array(nodes.length * 3)
    const nl = new Float32Array(nodes.length * 3)
    const ni = new Float32Array(nodes.length)
    const nc = new Float32Array(nodes.length)
    nodes.forEach((p, i) => {
      p.toArray(np, i * 3)
      lattice[i].toArray(nl, i * 3)
      ni[i] = i
      nc[i] = clusters[i]
    })
    const ng = new THREE.BufferGeometry()
    ng.setAttribute('position', new THREE.BufferAttribute(np, 3))
    ng.setAttribute('aLattice', new THREE.BufferAttribute(nl, 3))
    ng.setAttribute('aIndex', new THREE.BufferAttribute(ni, 1))
    ng.setAttribute('aCluster', new THREE.BufferAttribute(nc, 1))

    const ep = new Float32Array(edges.length * 6)
    const el = new Float32Array(edges.length * 6)
    const ei = new Float32Array(edges.length * 2)
    const et = new Float32Array(edges.length * 2)
    const es = new Float32Array(edges.length * 2)
    edges.forEach(([a, b], k) => {
      // draw from the older node toward the newer one
      const [from, to] = a < b ? [a, b] : [b, a]
      nodes[from].toArray(ep, k * 6)
      nodes[to].toArray(ep, k * 6 + 3)
      lattice[from].toArray(el, k * 6)
      lattice[to].toArray(el, k * 6 + 3)
      ei[k * 2] = ei[k * 2 + 1] = to
      et[k * 2] = 0
      et[k * 2 + 1] = 1
      es[k * 2] = es[k * 2 + 1] = (k * 0.618) % 1
    })
    const eg = new THREE.BufferGeometry()
    eg.setAttribute('position', new THREE.BufferAttribute(ep, 3))
    eg.setAttribute('aLattice', new THREE.BufferAttribute(el, 3))
    eg.setAttribute('aIndex', new THREE.BufferAttribute(ei, 1))
    eg.setAttribute('aT', new THREE.BufferAttribute(et, 1))
    eg.setAttribute('aSeed', new THREE.BufferAttribute(es, 1))
    return { nodeGeo: ng, edgeGeo: eg }
  }, [])

  const nodeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: nodeVertex,
        fragmentShader: nodeFragment,
        uniforms: {
          uCount: { value: 0 },
          uConverge: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 360 },
          uFocusCluster: { value: -1 },
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uColor: { value: color(PALETTE.cyan) },
        },
        ...ADDITIVE,
      }),
    [],
  )
  const edgeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: edgeVertex,
        fragmentShader: edgeFragment,
        uniforms: {
          uCount: { value: 0 },
          uConverge: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: color('#3d8bff') },
          uPulse: { value: color(PALETTE.cyan) },
        },
        ...ADDITIVE,
      }),
    [],
  )

  const s = useRef({
    op: new Damped(0),
    count: new Damped(0),
    conv: new Damped(0),
    focus: new Damped(-1),
    pos: new DampedVec3(),
  })

  useFrame(() => {
    const t = world.targets.network
    const dt = world.dt
    const st = s.current
    const op = st.op.to(t.opacity, 1.4, dt, world.snap && t.opacity === 0)
    // Grows quickly at first, then each node settles in: a natural cascade.
    const count = st.count.to(t.count, t.count > st.count.v ? 0.9 : 3, dt, world.snap)
    const conv = st.conv.to(t.converge, 1.6, dt, world.snap)
    setVisible(group.current, op)
    if (group.current) {
      group.current.position.copy(st.pos.to(t.pos, 1.3, dt, world.snap || op < 0.01))
      group.current.rotation.y = t.spin
    }
    for (const m of [nodeMat, edgeMat]) {
      m.uniforms.uCount.value = count
      m.uniforms.uConverge.value = conv
      m.uniforms.uOpacity.value = op
      m.uniforms.uTime.value = world.time
    }
    nodeMat.uniforms.uPixelRatio.value = gl.getPixelRatio()
    nodeMat.uniforms.uFocusCluster.value = t.focusCluster
  })

  return (
    <group ref={group}>
      <lineSegments geometry={edgeGeo} material={edgeMat} frustumCulled={false} />
      <points geometry={nodeGeo} material={nodeMat} frustumCulled={false} />
    </group>
  )
}
