"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, CrankHandle, Hinge, LockPoint, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Casement Window
// Two panels hinged on opposite sides, both swing outward via crank mechanism.
// Left panel hinges left, right panel hinges right.
// Spring-based animation for realistic swing with inertia.
// Hardware: crank handles, 3-point hinges per side, lock points.
export function CasementWindow({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.08
  const halfW = (width - t) / 2
  const glassW = halfW - t * 1.2
  const glassH = height - t * 2 - 0.02
  const leftRef = useRef<THREE.Group>(null)
  const rightRef = useRef<THREE.Group>(null)

  // Spring physics — casement panels are lighter, snappier spring
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const target = isOpen ? Math.PI / 5 : 0
    const angle = springStep(spring.current, target, dt, 140, 16)
    if (leftRef.current) leftRef.current.rotation.y = angle
    if (rightRef.current) rightRef.current.rotation.y = -angle
  })

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Center mullion */}
      <mesh>
        <boxGeometry args={[0.03, height - t * 2, d]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>

      {/* Weatherstrip gaskets */}
      <Weatherstrip width={0.005} height={height - t * 2} position={[-width / 2 + t * 0.5, 0, d * 0.15]} />
      <Weatherstrip width={0.005} height={height - t * 2} position={[width / 2 - t * 0.5, 0, d * 0.15]} />

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

      {/* Hinges — left side (3-point) */}
      {[-height / 3, 0, height / 3].map((y, i) => (
        <Hinge key={`lh${i}`} position={[-width / 2 + t * 0.4, y, d * 0.2]} />
      ))}
      {/* Hinges — right side (3-point) */}
      {[-height / 3, 0, height / 3].map((y, i) => (
        <Hinge key={`rh${i}`} position={[width / 2 - t * 0.4, y, d * 0.2]} />
      ))}

      {/* Crank handles (interior side) */}
      <CrankHandle position={[-0.06, -height / 4, d * 0.3]} />
      <CrankHandle position={[0.06, -height / 4, d * 0.3]} />

      {/* Lock points at center mullion */}
      <LockPoint position={[-0.015, height / 4, d * 0.25]} />
      <LockPoint position={[0.015, height / 4, d * 0.25]} />
      <LockPoint position={[-0.015, -height / 6, d * 0.25]} />
      <LockPoint position={[0.015, -height / 6, d * 0.25]} />

      {/* Exterior screen */}
      <WindowScreen width={width - t * 2.5} height={height - t * 2.5} position={[0, 0, -d * 0.6]} />
    </group>
  )
}
