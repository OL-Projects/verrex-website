"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, Hinge, LockPoint, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Swing Door (Commercial Aluminum Glass Door)
// Single full-height glass leaf in aluminum storefront frame.
// Glass vision panel: top 75% of door (large, floor-to-lintel glass)
// Kick plate: bottom 12% (solid aluminum, protects from foot traffic)
// Push/panic bar: horizontal bar at handle height (~40% from top, roughly 42" from floor)
// 3 heavy-duty hinges on left stile
// Swings outward ~85° on Y-axis from left hinge edge
// Floor threshold visible
export function SwingDoor({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.07, d = 0.09
  const doorW = width - t * 2
  const doorH = height - t * 2
  const glassH = doorH * 0.75      // 75% glass vision panel
  const kickH = doorH * 0.12       // 12% kick plate
  const topRailH = doorH * 0.05    // 5% top rail
  const stileW = t * 0.65          // thin aluminum stile
  const glassW = doorW - stileW * 2
  const doorRef = useRef<THREE.Group>(null)

  // Push bar position: 40% from top = handle height (~42" from floor on 84" door)
  const pushBarY = doorH * 0.1     // slightly above center (40% from top)

  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const target = isOpen ? Math.PI * 0.47 : 0  // ~85° swing
    const pos = springStep(spring.current, target, dt, 65, 15)
    if (doorRef.current) doorRef.current.rotation.y = pos
  })

  return (
    <group>
      {/* Outer frame (door jamb + header) */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* 3 Heavy-duty hinges on left jamb */}
      <Hinge position={[-width / 2 + t * 0.3, doorH / 3, d * 0.45]} />
      <Hinge position={[-width / 2 + t * 0.3, 0, d * 0.45]} />
      <Hinge position={[-width / 2 + t * 0.3, -doorH / 3, d * 0.45]} />

      {/* Door leaf — pivots from left edge */}
      <group position={[-width / 2 + t, 0, 0]}>
        <group ref={doorRef}>
          <group position={[doorW / 2, 0, 0]}>
            {/* Door sash frame (thin aluminum stiles + rails) */}
            <WindowFrame width={doorW} height={doorH} depth={d * 0.45} thickness={stileW} color={frameColor} />

            {/* Glass vision panel (upper 75%) */}
            <group position={[0, doorH * 0.065, 0]}>
              <GlassPane width={glassW} height={glassH} glassType={glassType} />
            </group>

            {/* Kick plate (solid aluminum, bottom 12%) */}
            <group position={[0, -doorH / 2 + kickH / 2 + stileW, 0]}>
              <mesh>
                <boxGeometry args={[glassW, kickH, d * 0.35]} />
                <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.1} />
              </mesh>
              {/* Kick plate brushed texture line */}
              <mesh position={[0, 0, d * 0.18]}>
                <boxGeometry args={[glassW - 0.02, kickH - 0.015, 0.003]} />
                <meshStandardMaterial color={frameColor} roughness={0.2} metalness={0.15} />
              </mesh>
            </group>

            {/* Horizontal push/panic bar across the glass */}
            <group position={[0, pushBarY, d * 0.25]}>
              {/* Main bar tube */}
              <mesh>
                <boxGeometry args={[glassW * 0.85, 0.022, 0.022]} />
                <meshStandardMaterial color="#999" roughness={0.2} metalness={0.65} />
              </mesh>
              {/* Left mounting bracket */}
              <mesh position={[-glassW * 0.85 / 2, 0, -0.014]}>
                <boxGeometry args={[0.035, 0.05, 0.028]} />
                <meshStandardMaterial color="#888" roughness={0.25} metalness={0.55} />
              </mesh>
              {/* Right mounting bracket */}
              <mesh position={[glassW * 0.85 / 2, 0, -0.014]}>
                <boxGeometry args={[0.035, 0.05, 0.028]} />
                <meshStandardMaterial color="#888" roughness={0.25} metalness={0.55} />
              </mesh>
            </group>

            {/* Lock point on right stile (lock side) */}
            <LockPoint position={[doorW / 2 - stileW * 0.8, pushBarY, d * 0.18]} />
          </group>
        </group>
      </group>

      {/* Floor threshold (aluminum saddle) */}
      <mesh position={[0, -height / 2 - 0.012, 0]}>
        <boxGeometry args={[width + 0.02, 0.02, d * 1.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Small floor plane for context */}
      <mesh position={[0, -height / 2 - 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 2, d * 4]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
