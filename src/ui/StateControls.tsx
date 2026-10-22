import type { KeyboardEvent } from 'react'
import { amplitudes } from '../lib/quantum'
import { setQubit, useStore } from '../state/store'
import { V } from './MathText'

const DEG = 180 / Math.PI

/**
 * Left/right arrows keep driving the slides even while a slider has focus;
 * up/down still adjust the slider.
 */
function keepArrowsForSlides(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') e.preventDefault()
}

export function ThetaSlider({ onChanged }: { onChanged?: () => void }) {
  const theta = useStore((s) => s.qubit.theta)
  return (
    <label className="slider">
      <span className="slider-head">
        <span>
          Tilt <V>θ</V>
        </span>
        <output>{Math.round(theta * DEG)}°</output>
      </span>
      <input
        type="range"
        min={0}
        max={180}
        step={1}
        value={Math.round(theta * DEG)}
        onChange={(e) => {
          setQubit({ theta: Number(e.target.value) / DEG })
          onChanged?.()
        }}
        onKeyDown={keepArrowsForSlides}
        aria-label="State tilt theta in degrees"
      />
    </label>
  )
}

export function PhiSlider() {
  const phi = useStore((s) => s.qubit.phi)
  const deg = ((Math.round(phi * DEG) % 360) + 360) % 360
  return (
    <label className="slider slider-phase">
      <span className="slider-head">
        <span>
          Phase <V>φ</V>
        </span>
        <output>{deg}°</output>
      </span>
      <input
        type="range"
        min={0}
        max={359}
        step={1}
        value={deg}
        onChange={(e) => setQubit({ phi: Number(e.target.value) / DEG })}
        onKeyDown={keepArrowsForSlides}
        aria-label="Relative phase phi in degrees"
      />
    </label>
  )
}

/** α = cos(θ/2), β = e^{iφ} sin(θ/2), shown with two decimals. */
export function AmplitudeReadout() {
  const theta = useStore((s) => s.qubit.theta)
  const phi = useStore((s) => s.qubit.phi)
  const a = amplitudes({ theta, phi })
  const deg = ((Math.round(phi * DEG) % 360) + 360) % 360
  return (
    <div className="amp-readout">
      <span>
        <V>α</V> = {a.alpha.toFixed(2)}
      </span>
      <span>
        <V>β</V> = {a.betaMag.toFixed(2)} <span className="amp-phase">e</span>
        <sup>
          <i>i</i>
          {deg}°
        </sup>
      </span>
    </div>
  )
}
