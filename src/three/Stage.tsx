import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Director } from './Director'
import { CameraRig } from './CameraRig'
import { Backdrop } from './actors/Backdrop'
import { ParticleField } from './actors/ParticleField'
import { BurstRing, OpeningSeed } from './actors/OpeningSeed'
import { QuantumSphere } from './actors/QuantumSphere'
import { EnergyStreams } from './actors/EnergyStreams'
import { WaveField } from './actors/WaveField'
import { BlochSphere } from './actors/BlochSphere'
import { ClassicalBits } from './actors/ClassicalBits'
import { MeasurementPulse } from './actors/MeasurementPulse'
import { EntangledPair } from './actors/EntangledPair'
import { QuantumNetwork } from './actors/QuantumNetwork'
import { world } from './world'

/**
 * The single persistent WebGL canvas. Every actor stays mounted for the whole
 * talk and is driven by the Director, which is what makes transitions seamless.
 */
export function Stage({
  visible,
  onReady,
  onContextLost,
}: {
  visible: boolean
  onReady: () => void
  onContextLost: () => void
}) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.75))
  const [particleCount] = useState(() => {
    const cores = navigator.hardwareConcurrency ?? 4
    return cores <= 4 ? 3600 : 5200
  })

  // Pointer position for subtle parallax.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      world.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <Canvas
      className="stage-canvas"
      dpr={dpr}
      frameloop={visible ? 'always' : 'never'}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false }}
      camera={{ fov: 40, near: 0.1, far: 300, position: [0, 0.4, 16] }}
      onCreated={({ gl }) => {
        gl.setClearColor('#02030a')
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onContextLost()
        })
        requestAnimationFrame(() => onReady())
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.35))}
        onIncline={() => setDpr((d) => Math.min(Math.min(window.devicePixelRatio || 1, 1.75), d + 0.25))}
        flipflops={3}
      />
      <Director />
      <CameraRig />
      <Backdrop />
      <WaveField />
      <ParticleField count={particleCount} />
      <EnergyStreams />
      <OpeningSeed />
      <QuantumSphere />
      <QuantumNetwork />
      <EntangledPair />
      <BlochSphere />
      <MeasurementPulse />
      <BurstRing />
      <ClassicalBits />
    </Canvas>
  )
}
