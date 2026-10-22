import { useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE } from '../shaders'
import { color } from '../materials'

/**
 * A huge inside-out sphere with a soft navy-to-black gradient: the "room"
 * the whole presentation lives in.
 */
export function Backdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          uTop: { value: color('#050a1c') },
          uMid: { value: color(PALETTE.navy) },
          uBottom: { value: color(PALETTE.void) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uMid;
          uniform vec3 uBottom;
          varying vec3 vDir;
          void main() {
            float y = vDir.y;
            vec3 col = mix(uBottom, uMid, smoothstep(-0.6, 0.05, y));
            col = mix(col, uTop, smoothstep(0.1, 0.9, y) * 0.6);
            // faint glow toward the stage
            col += vec3(0.01, 0.025, 0.06) * pow(max(0.0, -vDir.z), 6.0);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  )
  return (
    <mesh material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[120, 32, 16]} />
    </mesh>
  )
}
