"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, LeverHandle, LockPoint, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Double-Hung Window
// Two sashes that slide vertically. Bottom sash slides UP, top sash fixed.
// Standard proportions: 2 equal sashes divided by meeting rail.
// Spring-based animation for realistic sash weight/inertia.
// Hardware: lever handle, dual lock points, sash balance channels.
export function DoubleHungWindow({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.08
  const sashH = (height - t) / 2
  const glassW = width - t * 2 - 0.02
  const glassH = sashH - t - 0.01
  const slideRef = useRef<THREE.Group>(null)

  // Spring physics — heavier sash = lower stiffness, more damping
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const target = isOpen ? sashH * 0.85 : 0
    const pos = springStep(spring.current, target, dt, 120, 18)
    if (slideRef.current) slideRef.current.position.y = pos
  })

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Weatherstrip gaskets around inner perimeter */}
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, height / 2 - t * 0.5, d * 0.15]} />
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, -height / 2 + t * 0.5, d * 0.15]} />

      {/* Top sash (fixed) */}
      <group position={[0, sashH / 2 + t * 0.15, 0]}>
        <WindowFrame width={width - t * 1.8} height={sashH} depth={d * 0.55} thickness={t * 0.65} color={frameColor} />
        <GlassPane width={glassW} height={glassH} glassType={glassType} />
      </group>

      {/* Bottom sash (slides up — spring animated) */}
      <group ref={slideRef}>
        <group position={[0, -sashH / 2 + t * 0.05, 0.012]}>
          <WindowFrame width={width - t * 1.8} height={sashH} depth={d * 0.55} thickness={t * 0.65} color={frameColor} />
          <GlassPane width={glassW} height={glassH} glassType={glassType} />

          {/* Meeting rail (attached to bottom sash top edge) */}
          <mesh position={[0, sashH / 2, 0]}>
            <boxGeometry args={[width - t * 1.5, 0.028, d * 0.45]} />
            <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
          </mesh>

          {/* Lever handle — centered on meeting rail for easy grip */}
          <LeverHandle position={[0, sashH / 2 - 0.04, d * 0.3]} />

          {/* Dual lock points at meeting rail */}
          <LockPoint position={[width / 4, sashH / 2 - 0.01, d * 0.25]} />
          <LockPoint position={[-width / 4, sashH / 2 - 0.01, d * 0.25]} />
        </group>
      </group>

      {/* Sash balance channels (hidden weight system in jambs) */}
      <mesh position={[-width / 2 + t * 0.3, 0, 0]}>
        <boxGeometry args={[0.012, height - t * 2, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.02} />
      </mesh>
      <mesh position={[width / 2 - t * 0.3, 0, 0]}>
        <boxGeometry args={[0.012, height - t * 2, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.02} />
      </mesh>

      {/* Exterior screen (behind the window) */}
      <WindowScreen width={width - t * 2.5} height={sashH - t} position={[0, -sashH / 2, -d * 0.6]} />
    </group>
  )
}
