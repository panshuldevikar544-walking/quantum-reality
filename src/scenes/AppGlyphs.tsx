/**
 * Animated line-art metaphors for the four application areas. Each draws
 * itself with light (stroke-dashoffset) and then keeps a small purposeful loop.
 */

export function CircuitGlyph() {
  return (
    <svg className="glyph glyph-circuit" viewBox="0 0 120 80" aria-hidden="true">
      <path className="draw" d="M4 22 H116" />
      <path className="draw d2" d="M4 58 H116" />
      <rect className="draw d3 gate" x="26" y="12" width="20" height="20" rx="3" />
      <path className="draw d4" d="M72 22 V58" />
      <circle className="draw d4" cx="72" cy="22" r="4" />
      <circle className="draw d5" cx="72" cy="58" r="8" />
      <path className="draw d5" d="M72 50 V66 M64 58 H80" />
      <circle className="flow" r="2.5">
        <animateMotion dur="2.8s" repeatCount="indefinite" path="M4 22 H116" />
      </circle>
    </svg>
  )
}

export function ChannelGlyph() {
  return (
    <svg className="glyph glyph-channel" viewBox="0 0 120 80" aria-hidden="true">
      <circle className="draw" cx="14" cy="40" r="9" />
      <circle className="draw d2" cx="106" cy="40" r="9" />
      <path className="draw d3" d="M23 34 H97 M23 46 H97" />
      <path className="draw d4 alert" d="M60 8 V26" />
      <circle className="draw d4 alert" cx="60" cy="6" r="3" />
      <circle className="flow" r="2.5">
        <animateMotion dur="2.2s" repeatCount="indefinite" path="M23 40 H97" />
      </circle>
    </svg>
  )
}

export function SensorGlyph() {
  return (
    <svg className="glyph glyph-sensor" viewBox="0 0 120 80" aria-hidden="true">
      <path
        className="draw"
        d="M4 44 L14 40 L20 46 L28 38 L36 45 L44 41 L52 44 L58 42 L62 20 L66 60 L70 42 L78 45 L86 39 L94 46 L102 41 L116 44"
      />
      <circle className="draw d3 alert" cx="64" cy="40" r="14" />
    </svg>
  )
}

export function NetworkGlyph() {
  const pts: [number, number][] = [
    [16, 40],
    [44, 14],
    [44, 66],
    [76, 26],
    [76, 56],
    [104, 40],
  ]
  return (
    <svg className="glyph glyph-network" viewBox="0 0 120 80" aria-hidden="true">
      <path className="draw" d="M16 40 L44 14 L76 26 L104 40 L76 56 L44 66 Z M44 14 L44 66 M76 26 L76 56 M44 14 L76 56" />
      {pts.map(([x, y], i) => (
        <circle key={i} className={`draw d${2 + (i % 4)} node`} cx={x} cy={y} r="4" />
      ))}
    </svg>
  )
}
