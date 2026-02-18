"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, TiltTurnHandle, Hinge, LockPoint, Weatherstrip, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Tilt & Turn Window
// European-style dual-mode: handle UP = tilt inward from bottom,
// handle horizontal = swing open like a door.
// Spring-based tilt animation. Hardware: espagnolette handle, hinges, multi-point locks.
export function TiltTurnWindow({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.08
  const glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const tiltRef = useRef<THREE.Group>(null)
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })

  // Tilt inward from bottom — heavier panel, slower spring
  useFrame((_, dt) => {
    const v = springStep(spring.current, isOpen ? Math.PI / 8 : 0, dt, 110, 20)
    if (tiltRef.current) tiltRef.current.rotation.x = v
  })

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Weatherstrip perimeter */}
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, height / 2 - t * 0.5, d * 0.12]} />
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, -height / 2 + t * 0.5, d * 0.12]} />

      {/* Tilt pivot at bottom edge */}
      <group position={[0, -height / 2 + t, 0]}>
        <group ref={tiltRef} position={[0, height / 2 - t, 0]}>
          <group position={[0, -(height / 2 - t), 0]}>
            {/* Inner sash frame */}
            <WindowFrame width={width - t * 1.6} height={height - t * 1.6} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />
            <GlassPane width={glassW} height={glassH} glassType={glassType} />
          </group>
        </group>
      </group>

      {/* Espagnolette tilt-turn handle (right side) */}
      <TiltTurnHandle position={[width / 2 - t * 1.2, 0, d * 0.3]} rotation={isOpen ? -Math.PI / 2 : 0} />

      {/* Side hinges (left jamb) */}
      {[-height / 3, height / 3].map((y, i) => (
        <Hinge key={i} position={[-width / 2 + t * 0.4, y, d * 0.2]} />
      ))}

      {/* Multi-point locks (right side, top & bottom) */}
      <LockPoint position={[width / 2 - t * 0.8, height / 3, d * 0.25]} />
      <LockPoint position={[width / 2 - t * 0.8, -height / 3, d * 0.25]} />
      <LockPoint position={[0, height / 2 - t * 0.8, d * 0.25]} />
    </group>
  )
}
