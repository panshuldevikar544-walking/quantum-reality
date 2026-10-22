/** True when the browser can create a WebGL context. */
export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).has('nogl')) return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    const ok = !!gl
    ;(gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}
