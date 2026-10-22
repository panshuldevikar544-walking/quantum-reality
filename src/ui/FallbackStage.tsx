import { SCENE } from '../content/scenes'
import { useStore } from '../state/store'
import { PALETTE } from '../three/shaders'

/**
 * Shown when WebGL is unavailable. A lightweight SVG stage that keeps every
 * scene meaningful: the Bloch vector, measurement outcomes and the entangled
 * pair still respond to the demos, so the talk can go ahead on any machine.
 */
export function FallbackStage() {
  const scene = useStore((s) => s.scene)
  const step = useStore((s) => s.step)
  const theta = useStore((s) => s.qubit.theta)
  const phi = useStore((s) => s.qubit.phi)
  const outcome = useStore((s) => s.measure.outcome)
  const pairA = useStore((s) => s.pair.a)
  const pairB = useStore((s) => s.pair.b)

  const showBloch = scene === SCENE.BITS || scene === SCENE.SUPERPOSITION || scene === SCENE.MEASUREMENT
  const collapsed = scene === SCENE.MEASUREMENT && step >= 1 && outcome !== null
  const th = collapsed ? (outcome === 0 ? 0 : Math.PI) : theta
  const R = 230
  const cx = scene === SCENE.BITS ? 1340 : scene === SCENE.MEASUREMENT ? 820 : 960
  const cy = 540
  const vx = cx + Math.sin(th) * Math.sin(phi + 0.6) * R
  const vy = cy - Math.cos(th) * R
  const showPair = scene === SCENE.ENTANGLEMENT || scene === SCENE.ENTANGLEMENT_ACTION
  const linked = scene === SCENE.ENTANGLEMENT_ACTION || step >= 1
  const showOutcomes = showPair && pairA !== null && (scene === SCENE.ENTANGLEMENT_ACTION || step >= 3)
  // scene 6 lifts the pair above its demo console
  const py = scene === SCENE.ENTANGLEMENT_ACTION ? 430 : 560

  return (
    <div className="fallback-stage" aria-hidden="true">
      <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="fb-glow">
            <stop offset="0" stopColor={PALETTE.cyan} stopOpacity="0.55" />
            <stop offset="1" stopColor={PALETTE.cyan} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fb-violet">
            <stop offset="0" stopColor={PALETTE.violet} stopOpacity="0.45" />
            <stop offset="1" stopColor={PALETTE.magenta} stopOpacity="0" />
          </radialGradient>
        </defs>

        {(scene === SCENE.HOOK || scene === SCENE.FINALE) && (
          <g>
            <circle cx="960" cy="520" r="320" fill="url(#fb-glow)" />
            <circle cx="960" cy="520" r="200" fill="none" stroke={PALETTE.cyan} strokeOpacity="0.6" />
            <ellipse cx="960" cy="520" rx="200" ry="60" fill="none" stroke={PALETTE.violet} strokeOpacity="0.5" />
          </g>
        )}

        {scene === SCENE.BITS && step <= 1 && (
          <g fontFamily="Unbounded Variable, sans-serif" fontSize="150" fill={PALETTE.white} textAnchor="middle">
            <text x="430" y="590">0</text>
            <text x="640" y="590">1</text>
          </g>
        )}

        {showBloch && (
          <g opacity={scene === SCENE.BITS && step < 2 ? 0.35 : 1}>
            <circle cx={cx} cy={cy} r={R * 1.3} fill="url(#fb-glow)" opacity="0.5" />
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={PALETTE.cyan} strokeOpacity="0.55" strokeWidth="2" />
            <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.28} fill="none" stroke={PALETTE.blue} strokeOpacity="0.5" />
            <line x1={cx} y1={cy - R - 30} x2={cx} y2={cy + R + 30} stroke={PALETTE.cyan} strokeOpacity="0.6" />
            <text x={cx + 20} y={cy - R - 30} fill={PALETTE.white} fontSize="40" fontFamily="STIX Two Text, serif">
              |0⟩
            </text>
            <text x={cx + 20} y={cy + R + 60} fill={PALETTE.white} fontSize="40" fontFamily="STIX Two Text, serif">
              |1⟩
            </text>
            {(scene !== SCENE.BITS || step >= 2) && (
              <g>
                <line
                  x1={cx}
                  y1={cy}
                  x2={vx}
                  y2={vy}
                  stroke={collapsed ? PALETTE.orange : PALETTE.magenta}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <circle cx={vx} cy={vy} r="14" fill={collapsed ? PALETTE.orange : PALETTE.magenta} />
              </g>
            )}
          </g>
        )}

        {showPair && (
          <g>
            {linked && <ellipse cx="960" cy={py} rx="560" ry="150" fill="url(#fb-violet)" opacity={showOutcomes ? 0.25 : 0.9} />}
            {[560, 1360].map((x, i) => (
              <g key={x}>
                <circle cx={x} cy={py} r="150" fill="url(#fb-glow)" />
                <circle cx={x} cy={py} r="60" fill="none" stroke={PALETTE.cyan} strokeWidth="2" />
                {scene === SCENE.ENTANGLEMENT && (
                  <text x={x} y={py + 200} textAnchor="middle" fill={PALETTE.white} fontSize="30" letterSpacing="6">
                    QUBIT {i === 0 ? 'A' : 'B'}
                  </text>
                )}
                {showOutcomes && scene === SCENE.ENTANGLEMENT && (
                  <text x={x} y={py - 140} textAnchor="middle" fill={PALETTE.orange} fontSize="110" fontFamily="Unbounded Variable, sans-serif">
                    {i === 0 ? pairA : pairB}
                  </text>
                )}
              </g>
            ))}
          </g>
        )}

        {scene === SCENE.WHY &&
          Array.from({ length: 1 + Math.min(step, 4) * 7 }, (_, i) => {
            const a = i * 2.39996
            const r = i === 0 ? 0 : 60 + Math.sqrt(i) * 55
            return <circle key={i} cx={1300 + Math.cos(a) * r} cy={540 + Math.sin(a) * r} r={i === 0 ? 14 : 8} fill={PALETTE.cyan} opacity="0.85" />
          })}
      </svg>
    </div>
  )
}
