/**
 * Shared easing and timing helpers. Every timed motion in the deck uses these,
 * so the whole presentation moves with one consistent feel.
 */

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const ease = {
  linear: (t: number) => t,
  /** Default cinematic ease: slow start, long soft landing. */
  cinematic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  in: (t: number) => t * t * t,
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
}

/**
 * Progress of a timed segment: 0 before `start`, 1 after `start + dur`,
 * eased in between. All arguments are in seconds of timeline time.
 */
export function seq(t: number, start: number, dur: number, fn: (x: number) => number = ease.cinematic): number {
  return fn(clamp01((t - start) / dur))
}

/** Frame-rate independent exponential approach (critically damped feel). */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}

/** Damp an angle along the shortest path. */
export function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  let d = (target - current) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return current + d * (1 - Math.exp(-lambda * dt))
}

/** Interface (DOM) motion tokens, shared by all overlays. */
export const UI_EASE = [0.22, 1, 0.36, 1] as const
export const UI_EASE_IN = [0.55, 0, 0.75, 0.2] as const
