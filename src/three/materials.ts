import * as THREE from 'three'
import {
  glowFragment,
  glowVertex,
  PALETTE,
  ringFragment,
  shellFragment,
  shellVertex,
} from './shaders'

export const color = (hex: string) => new THREE.Color(hex)

const additive = {
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
} as const

export function makeGlowMaterial(hex: string, core = 1) {
  return new THREE.ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    uniforms: {
      uColor: { value: color(hex) },
      uOpacity: { value: 0 },
      uCore: { value: core },
    },
    ...additive,
  })
}

export function makeRingMaterial(hex: string, width = 0.04) {
  return new THREE.ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: ringFragment,
    uniforms: {
      uColor: { value: color(hex) },
      uOpacity: { value: 0 },
      uRadius: { value: 0 },
      uWidth: { value: width },
    },
    ...additive,
  })
}

export function makeShellMaterial(a: string, b: string, opts: { bands?: number; veins?: number } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: shellVertex,
    fragmentShader: shellFragment,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uIntensity: { value: 1 },
      uBands: { value: opts.bands ?? 0.6 },
      uVeins: { value: opts.veins ?? 0.4 },
      uColorA: { value: color(a) },
      uColorB: { value: color(b) },
    },
    side: THREE.DoubleSide,
    ...additive,
  })
}

export function makeBasicAdditive(hex: string) {
  return new THREE.MeshBasicMaterial({ color: hex, opacity: 0, ...additive })
}

export const ADDITIVE = additive

/** Cyclic phase palette: cyan → violet → magenta → blue → cyan. */
const PHASE_STOPS = [PALETTE.cyan, PALETTE.violet, PALETTE.magenta, PALETTE.blue].map(color)
export function phaseColor(phi: number, out: THREE.Color) {
  const x = ((((phi / (Math.PI * 2)) % 1) + 1) % 1) * PHASE_STOPS.length
  const i = Math.floor(x)
  const f = x - i
  return out.copy(PHASE_STOPS[i % PHASE_STOPS.length]).lerp(PHASE_STOPS[(i + 1) % PHASE_STOPS.length], f)
}

/** Shared unit plane for billboarded sprites. */
export const UNIT_PLANE = new THREE.PlaneGeometry(1, 1)
