/**
 * Minimal, correct single-qubit and Bell-pair math used by the demos.
 *
 * Pure state on the Bloch sphere:
 *   |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩
 * Computational-basis measurement:
 *   P(0) = |α|² = cos²(θ/2),  P(1) = |β|² = sin²(θ/2)
 */

export interface QubitState {
  /** Polar angle θ in radians, 0 (|0⟩) … π (|1⟩). */
  theta: number
  /** Azimuthal (relative phase) angle φ in radians. */
  phi: number
}

export interface Amplitudes {
  alpha: number // real, ≥ 0 (global phase chosen so α is real)
  betaRe: number
  betaIm: number
  betaMag: number
}

export function amplitudes({ theta, phi }: QubitState): Amplitudes {
  const alpha = Math.cos(theta / 2)
  const betaMag = Math.sin(theta / 2)
  return {
    alpha,
    betaMag,
    betaRe: betaMag * Math.cos(phi),
    betaIm: betaMag * Math.sin(phi),
  }
}

export function probabilities(state: QubitState): { p0: number; p1: number } {
  const c = Math.cos(state.theta / 2)
  const p0 = c * c
  return { p0, p1: 1 - p0 }
}

/** θ that gives a requested P(0). */
export function thetaForP0(p0: number): number {
  return 2 * Math.acos(Math.sqrt(Math.min(1, Math.max(0, p0))))
}

/** Uniform random number in [0, 1) from the platform CSPRNG when available. */
export function random01(): number {
  const c = globalThis.crypto
  if (c?.getRandomValues) {
    const buf = new Uint32Array(1)
    c.getRandomValues(buf)
    return buf[0] / 4294967296
  }
  return Math.random()
}

/** Sample one computational-basis measurement outcome. */
export function measureQubit(state: QubitState): 0 | 1 {
  return random01() < probabilities(state).p0 ? 0 : 1
}

/**
 * Measure both qubits of |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 in the computational basis.
 * Joint distribution: P(00) = P(11) = 1/2, P(01) = P(10) = 0.
 * One random draw decides the shared outcome; neither qubit "sends" anything.
 */
export function measureBellPhiPlus(): { a: 0 | 1; b: 0 | 1 } {
  const r: 0 | 1 = random01() < 0.5 ? 0 : 1
  return { a: r, b: r }
}

export const PRESET_STATES: { id: string; label: string; state: QubitState }[] = [
  { id: 'zero', label: '|0⟩', state: { theta: 0, phi: 0 } },
  { id: 'equal', label: '50 / 50', state: { theta: Math.PI / 2, phi: 0 } },
  { id: 'quarter', label: '25 / 75', state: { theta: thetaForP0(0.25), phi: 0 } },
  { id: 'ninety', label: '90 / 10', state: { theta: thetaForP0(0.9), phi: 0 } },
]

export const DEFAULT_STATE: QubitState = { theta: thetaForP0(0.25), phi: Math.PI / 4 }

export function formatPct(p: number): string {
  return `${Math.round(p * 100)}%`
}
