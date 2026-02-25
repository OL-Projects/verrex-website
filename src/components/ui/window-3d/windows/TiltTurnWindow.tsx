"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, Hinge, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Tilt & Turn Window (European-style)
// ONE sash with a DUAL-FUNCTION 3-position handle:
//   Handle DOWN  → LOCKED
//   Handle HORIZONTAL → TURN mode (sash swings fully INWARD, like an inward casement)
//   Handle UP → TILT mode (top tilts INWARD ~15°, bottom stays fixed)
//
// Key hardware:
//   - Espagnolette lock bars: long rods along right stile + bottom rail
//   - T-bar tilt-turn handle on right stile center
//   - Bottom pivot points for tilt mode
//   - Left side hinges for turn mode
//   - Top friction stays (prevent sash slamming in tilt)
//
// When "Open" is pressed → shows TILT mode (most recognizable):
//   Sash rotates ~15° around bottom X-axis, top comes toward viewer.

export function TiltTurnWindow({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.08
  const sashW = width - t * 2
  const sashH = height - t * 2
  const glassW = sashW - t * 1.4
  const glassH = sashH - t * 1.4
  const sashRef = useRef<THREE.Group>(null)

  // Spring: TILT mode — rotate around bottom X-axis, top comes toward viewer
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const target = isOpen ? 0.28 : 0  // ~16° tilt inward from top
    const angle = springStep(spring.current, target, dt, 100, 14)
    if (sashRef.current) sashRef.current.rotation.x = angle
  })

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Weatherstrip gaskets */}
      <Weatherstrip width={sashW - 0.01} height={0.005} position={[0, height / 2 - t * 0.6, d * 0.15]} />
      <Weatherstrip width={sashW - 0.01} height={0.005} position={[0, -height / 2 + t * 0.6, d * 0.15]} />
      <Weatherstrip width={0.005} height={sashH - 0.01} position={[-width / 2 + t * 0.6, 0, d * 0.15]} />
      <Weatherstrip width={0.005} height={sashH - 0.01} position={[width / 2 - t * 0.6, 0, d * 0.15]} />

      {/* Bottom pivot points for tilt mode (left and right) */}
      <mesh position={[-sashW / 2 + 0.03, -height / 2 + t * 0.5, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.018, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[sashW / 2 - 0.03, -height / 2 + t * 0.5, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.018, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Left side hinges for turn mode (3 hinges) */}
      <Hinge position={[-width / 2 + t * 0.35, sashH / 3, d * 0.25]} />
      <Hinge position={[-width / 2 + t * 0.35, 0, d * 0.25]} />
      <Hinge position={[-width / 2 + t * 0.35, -sashH / 3, d * 0.25]} />

      {/* Top friction stays (both sides — prevent slam in tilt) */}
      <mesh position={[-sashW / 3, height / 2 - t * 0.5, d * 0.2]}>
        <boxGeometry args={[0.05, 0.008, 0.01]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[sashW / 3, height / 2 - t * 0.5, d * 0.2]}>
        <boxGeometry args={[0.05, 0.008, 0.01]} />
        <meshStandardMaterial color="#999" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Sash — pivots around BOTTOM edge (tilt mode: X-axis rotation) */}
      <group position={[0, -height / 2 + t, 0]}>
        <group ref={sashRef}>
          <group position={[0, sashH / 2, 0]}>
            {/* Sash frame */}
            <WindowFrame width={sashW} height={sashH} depth={d * 0.5} thickness={t * 0.65} color={frameColor} />

            {/* Glass pane */}
            <GlassPane width={glassW} height={glassH} glassType={glassType} />

            {/* Espagnolette lock bar — RIGHT stile (long vertical rod) */}
            <mesh position={[sashW / 2 - t * 0.35, 0, d * 0.15]}>
              <boxGeometry args={[0.008, sashH * 0.7, 0.008]} />
              <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.6} />
            </mesh>

            {/* Espagnolette lock bar — BOTTOM rail (horizontal rod) */}
            <mesh position={[0, -sashH / 2 + t * 0.35, d * 0.15]}>
              <boxGeometry args={[sashW * 0.6, 0.008, 0.008]} />
              <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.6} />
            </mesh>

            {/* T-BAR TILT-TURN HANDLE on right stile center */}
            {/* Handle base plate */}
            <mesh position={[sashW / 2 - t * 0.3, 0, d * 0.27]}>
              <boxGeometry args={[0.018, 0.04, 0.008]} />
              <meshStandardMaterial color="#999" roughness={0.25} metalness={0.5} />
            </mesh>
            {/* Handle lever (T-bar) — points DOWN when locked, horizontal when tilt */}
            <mesh position={[sashW / 2 - t * 0.3, isOpen ? 0.04 : -0.04, d * 0.3]}>
              <boxGeometry args={[0.012, 0.06, 0.012]} />
              <meshStandardMaterial color="#bbb" roughness={0.2} metalness={0.55} />
            </mesh>
            {/* Handle T-bar cross piece */}
            <mesh position={[sashW / 2 - t * 0.3, isOpen ? 0.068 : -0.068, d * 0.3]}>
              <boxGeometry args={[0.035, 0.008, 0.008]} />
              <meshStandardMaterial color="#bbb" roughness={0.2} metalness={0.55} />
            </mesh>

            {/* Multi-point lock cams (visible on right stile) */}
            <mesh position={[sashW / 2 - t * 0.35, sashH / 4, d * 0.2]}>
              <cylinderGeometry args={[0.006, 0.006, 0.012, 6]} />
              <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
            </mesh>
            <mesh position={[sashW / 2 - t * 0.35, -sashH / 4, d * 0.2]}>
              <cylinderGeometry args={[0.006, 0.006, 0.012, 6]} />
              <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Exterior screen */}
      <WindowScreen width={sashW - t} height={sashH - t} position={[0, 0, -d * 0.6]} />
    </group>
  )
}
