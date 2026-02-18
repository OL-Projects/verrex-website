"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, LeverHandle, LockPoint, Weatherstrip } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Double-Hung: Bottom sash slides UP, top sash fixed
// Standard proportions: 2 equal sashes divided by meeting rail
export function DoubleHungWindow({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.08
  const sashH = (height - t) / 2
  const glassW = width - t * 2 - 0.02
  const glassH = sashH - t - 0.01
  const slideRef = useRef<THREE.Group>(null)
  const openAmount = useRef(0)

  // Animate bottom sash sliding up
  useFrame(() => {
    const target = isOpen ? sashH * 0.85 : 0
    openAmount.current += (target - openAmount.current) * 0.06
    if (slideRef.current) slideRef.current.position.y = openAmount.current
  })

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Weatherstrip around inner edge */}
      <Weatherstrip width={width - t * 1.8} height={0.004} position={[0, 0, d * 0.15]} />

      {/* Top sash (fixed) */}
      <group position={[0, sashH / 2 + t * 0.15, 0]}>
        <WindowFrame width={width - t * 1.8} height={sashH} depth={d * 0.55} thickness={t * 0.65} color={frameColor} />
        <GlassPane width={glassW} height={glassH} glassType={glassType} />
      </group>

      {/* Bottom sash (slides up) */}
      <group ref={slideRef}>
        <group position={[0, -sashH / 2 + t * 0.05, 0.012]}>
          <WindowFrame width={width - t * 1.8} height={sashH} depth={d * 0.55} thickness={t * 0.65} color={frameColor} />
          <GlassPane width={glassW} height={glassH} glassType={glassType} />
          {/* Meeting rail (attached to bottom sash top) */}
          <mesh position={[0, sashH / 2, 0]}>
            <boxGeometry args={[width - t * 1.5, 0.025, d * 0.45]} />
            <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.15} />
          </mesh>
          {/* Handle on bottom sash */}
          <LeverHandle position={[0, 0, d * 0.3]} />
          {/* Lock points */}
          <LockPoint position={[width / 4, sashH / 2 - 0.01, d * 0.25]} />
          <LockPoint position={[-width / 4, sashH / 2 - 0.01, d * 0.25]} />
        </group>
      </group>

      {/* Sash balances (hidden weight channels) */}
      <mesh position={[-width / 2 + t * 0.3, 0, 0]}>
        <boxGeometry args={[0.01, height - t * 2, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[width / 2 - t * 0.3, 0, 0]}>
        <boxGeometry args={[0.01, height - t * 2, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.1} />
      </mesh>
    </group>
  )
}
