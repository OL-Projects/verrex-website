"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, TrackRail, LeverHandle, LockPoint, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Sliding Glass Door
// Two tall glass panels on a heavy floor track. Right panel slides left to open.
// Floor-to-ceiling proportions, thick aluminum frame, vertical handle bar.
export function SlidingDoor({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.07, d = 0.10
  const panelW = (width - t * 3) / 2
  const glassW = panelW - t * 1.2
  const glassH = height - t * 2 - 0.02
  const slideRef = useRef<THREE.Group>(null)

  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const target = isOpen ? -panelW * 0.85 : 0
    const pos = springStep(spring.current, target, dt, 80, 16)
    if (slideRef.current) slideRef.current.position.x = pos
  })

  return (
    <group>
      {/* Heavy outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Floor track rail */}
      <TrackRail width={width - t * 2} position={[0, -height / 2 + t * 0.3, 0]} color={frameColor} />
      {/* Header track rail */}
      <TrackRail width={width - t * 2} position={[0, height / 2 - t * 0.3, 0]} color={frameColor} />

      {/* Center meeting stile (fixed divider) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[t * 0.8, height - t * 2, d * 0.6]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* Left panel — FIXED */}
      <group position={[-panelW / 2 - t * 0.2, 0, -0.01]}>
        <WindowFrame width={panelW} height={height - t * 2} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />
        <GlassPane width={glassW} height={glassH} glassType={glassType} />
      </group>

      {/* Right panel — SLIDES (spring animated) */}
      <group ref={slideRef}>
        <group position={[panelW / 2 + t * 0.2, 0, 0.01]}>
          <WindowFrame width={panelW} height={height - t * 2} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />
          <GlassPane width={glassW} height={glassH} glassType={glassType} />

          {/* Vertical handle bar on active panel */}
          <LeverHandle position={[-panelW / 2 + t * 0.8, 0, d * 0.3]} />

          {/* Lock points */}
          <LockPoint position={[-panelW / 2 + t * 0.5, height / 4, d * 0.2]} />
          <LockPoint position={[-panelW / 2 + t * 0.5, -height / 4, d * 0.2]} />
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
