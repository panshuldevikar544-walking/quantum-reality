import type { ReactNode } from 'react'

/**
 * Small math typography kit. The ket bracket ⟩ and the radical √ are drawn as
 * inline SVG so they render identically on every machine, whether or not the
 * presentation laptop has a math font installed.
 */

function RAngle() {
  return (
    <svg className="m-rangle" viewBox="0 0 10 40" aria-hidden="true">
      <path d="M2 3 L8.5 20 L2 37" />
    </svg>
  )
}

/** |x⟩ */
export function Ket({ children }: { children: ReactNode }) {
  return (
    <span className="m-ket">
      <span className="m-bar">|</span>
      <span className="m-ket-in">{children}</span>
      <RAngle />
    </span>
  )
}

/** Italic math variable, e.g. α, ψ, θ. */
export function V({ children }: { children: ReactNode }) {
  return <i className="m-var">{children}</i>
}

/** |x|² */
export function AbsSq({ children }: { children: ReactNode }) {
  return (
    <span className="m-abs">
      |{children}|<sup>2</sup>
    </span>
  )
}

/** √x with a drawn radical and vinculum. */
export function Sqrt({ children }: { children: ReactNode }) {
  return (
    <span className="m-sqrt">
      <svg className="m-radical" viewBox="0 0 16 40" aria-hidden="true">
        <path d="M1 24 L5 21 L9 36 L15 2" />
      </svg>
      <span className="m-sqrt-in">{children}</span>
    </span>
  )
}

/** Stacked fraction. */
export function Frac({ num, den }: { num: ReactNode; den: ReactNode }) {
  return (
    <span className="m-frac">
      <span className="m-num">{num}</span>
      <span className="m-den">{den}</span>
    </span>
  )
}

/** |ψ⟩ = α|0⟩ + β|1⟩ */
export function PsiEquation() {
  return (
    <span className="m-eq" aria-label="psi equals alpha times ket zero plus beta times ket one">
      <Ket>
        <V>ψ</V>
      </Ket>
      <span className="m-op">=</span>
      <V>α</V>
      <Ket>0</Ket>
      <span className="m-op">+</span>
      <V>β</V>
      <Ket>1</Ket>
    </span>
  )
}

/** |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 */
export function BellEquation({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`m-eq${compact ? ' m-eq-compact' : ''}`}
      aria-label="phi plus equals the sum of ket zero zero and ket one one, divided by root two"
    >
      <Ket>
        Φ<sup>+</sup>
      </Ket>
      <span className="m-op">=</span>
      <Frac
        num={
          <>
            <Ket>00</Ket>
            <span className="m-op">+</span>
            <Ket>11</Ket>
          </>
        }
        den={<Sqrt>2</Sqrt>}
      />
    </span>
  )
}
