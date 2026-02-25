"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, Hinge, LockPoint, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Swing Door (Commercial Glass)
// Single glass leaf in aluminum frame with push bar, kick plate, and 3 hinges.
// Swings outward on Y-axis rotation from left hinge edge.
export function SwingDoor({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.07, d = 0.09
  const glassH = height * 0.68
  const kickH = height * 0.14
  const doorRef = useRef<THREE.Group>(null)

  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const target = isOpen ? Math.PI * 0.35 : 0
    const pos = springStep(spring.current, target, dt, 70, 16)
    if (doorRef.current) doorRef.current.rotation.y = pos
  })

  return (
    <group>
      {/* Outer frame (door jamb + header) */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* 3 Hinges on left jamb */}
      <Hinge position={[-width / 2 + t * 0.3, height / 3, d * 0.45]} />
      <Hinge position={[-width / 2 + t * 0.3, 0, d * 0.45]} />
      <Hinge position={[-width / 2 + t * 0.3, -height / 3, d * 0.45]} />

      {/* Door leaf — pivots from left edge */}
      <group ref={doorRef} position={[-width / 2 + t, 0, 0]}>
        <group position={[width / 2 - t, 0, 0]}>
          {/* Door sash frame */}
          <WindowFrame width={width - t * 2} height={height - t * 2} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />

          {/* Glass vision panel (upper 70%) */}
          <group position={[0, (height - t * 2) * 0.12, 0]}>
            <GlassPane width={width - t * 3.5} height={glassH} glassType={glassType} />
          </group>

          {/* Kick plate (solid bottom panel) */}
          <group position={[0, -(height - t * 2) / 2 + kickH / 2 + t * 0.4, 0]}>
            <mesh>
              <boxGeometry args={[width - t * 3.5, kickH, d * 0.35]} />
              <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.08} />
            </mesh>
          </group>

          {/* Horizontal push bar across the glass */}
          <group position={[0, -0.05, d * 0.28]}>
            {/* Bar */}
            <mesh>
              <boxGeometry args={[width - t * 4, 0.025, 0.025]} />
              <meshStandardMaterial color="#888" roughness={0.25} metalness={0.6} />
            </mesh>
            {/* Left mounting bracket */}
            <mesh position={[-(width - t * 4) / 2 + 0.04, 0, -0.015]}>
              <boxGeometry args={[0.03, 0.05, 0.03]} />
              <meshStandardMaterial color="#777" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Right mounting bracket */}
            <mesh position={[(width - t * 4) / 2 - 0.04, 0, -0.015]}>
              <boxGeometry args={[0.03, 0.05, 0.03]} />
              <meshStandardMaterial color="#777" roughness={0.3} metalness={0.5} />
            </mesh>
          </group>

          {/* Lock point near push bar */}
          <LockPoint position={[width / 2 - t * 2, 0, d * 0.2]} />
        </group>
      </group>

      {/* Floor threshold */}
      <mesh position={[0, -height / 2 - 0.015, 0]}>
        <boxGeometry args={[width, 0.025, d * 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.03} />
      </mesh>
    </group>
  )
}
