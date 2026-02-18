"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, CrankHandle, Hinge, LockPoint } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Casement: Two panels, both swing outward on side hinges (crank operated)
// Left panel hinges on left, right panel hinges on right
export function CasementWindow({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.08
  const halfW = (width - t) / 2
  const glassW = halfW - t * 1.2
  const glassH = height - t * 2 - 0.02
  const leftRef = useRef<THREE.Group>(null)
  const rightRef = useRef<THREE.Group>(null)
  const angle = useRef(0)

  // Animate panels swinging outward
  useFrame(() => {
    const target = isOpen ? Math.PI / 5 : 0
    angle.current += (target - angle.current) * 0.05
    if (leftRef.current) leftRef.current.rotation.y = angle.current
    if (rightRef.current) rightRef.current.rotation.y = -angle.current
  })

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Center mullion */}
      <mesh><boxGeometry args={[0.028, height - t * 2, d]} /><meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.15} /></mesh>

      {/* Left panel — pivot at left edge */}
      <group position={[-halfW / 2 - 0.01, 0, 0]}>
        <group ref={leftRef} position={[-glassW / 2, 0, 0]}>
          <group position={[glassW / 2, 0, 0]}>
            <WindowFrame width={halfW - t * 0.5} height={height - t * 1.6} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />
            <GlassPane width={glassW} height={glassH} glassType={glassType} />
          </group>
        </group>
      </group>

      {/* Right panel — pivot at right edge */}
      <group position={[halfW / 2 + 0.01, 0, 0]}>
        <group ref={rightRef} position={[glassW / 2, 0, 0]}>
          <group position={[-glassW / 2, 0, 0]}>
            <WindowFrame width={halfW - t * 0.5} height={height - t * 1.6} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />
            <GlassPane width={glassW} height={glassH} glassType={glassType} />
          </group>
        </group>
      </group>

      {/* Hinges — left side */}
      {[-height / 3, 0, height / 3].map((y, i) => (
        <Hinge key={`lh${i}`} position={[-width / 2 + t * 0.4, y, d * 0.2]} />
      ))}
      {/* Hinges — right side */}
      {[-height / 3, 0, height / 3].map((y, i) => (
        <Hinge key={`rh${i}`} position={[width / 2 - t * 0.4, y, d * 0.2]} />
      ))}
      {/* Crank handles */}
      <CrankHandle position={[-0.06, -height / 4, d * 0.3]} />
      <CrankHandle position={[0.06, -height / 4, d * 0.3]} />
      {/* Lock points */}
      <LockPoint position={[-0.015, height / 4, d * 0.25]} />
      <LockPoint position={[0.015, height / 4, d * 0.25]} />
    </group>
  )
}
