"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, CrankHandle, Hinge, LockPoint, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Single Casement Window
// ONE sash, hinged on LEFT stile, swings OUTWARD to the right.
//
// TWO VARIANTS:
//   Standard Casement (showCrank=false):
//     - Prominent LEVER HANDLE on right stile (user grabs and pushes)
//     - Opens ~45° by hand
//     - Multi-point lock on right stile
//
//   Hand Cranked (showCrank=true):
//     - NO side handle — just a small sash latch
//     - Prominent WORM GEAR CRANK at bottom of outer frame
//     - VISIBLE OPERATOR ARM (folding extension arm) connecting crank to sash bottom rail
//     - Opens wider ~60° (crank mechanism provides more travel)
//     - Used for hard-to-reach, high-mounted windows

export function SingleCasementWindow({ width, height, frameColor, glassType, isOpen, showCrank = false }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean; showCrank?: boolean
}) {
  const t = 0.06, d = 0.08
  const sashW = width - t * 2
  const sashH = height - t * 2
  const glassW = sashW - t * 1.4
  const glassH = sashH - t * 1.4
  const sashRef = useRef<THREE.Group>(null)
  const armRef = useRef<THREE.Group>(null)

  // Spring physics — hand-cranked opens wider than manual casement
  const maxAngle = showCrank ? -Math.PI / 3 : -Math.PI / 4  // 60° vs 45°
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })

  useFrame((_, dt) => {
    const target = isOpen ? maxAngle : 0
    const angle = springStep(spring.current, target, dt, showCrank ? 80 : 120, 15)
    if (sashRef.current) sashRef.current.rotation.y = angle
    // Operator arm follows sash angle (simplified: rotates proportionally)
    if (armRef.current) {
      const armAngle = (angle / maxAngle) * (Math.PI * 0.4)
      armRef.current.rotation.z = isOpen ? -armAngle : 0
    }
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

      {/* 3 hinges on LEFT stile */}
      <Hinge position={[-width / 2 + t * 0.35, sashH / 3, d * 0.25]} />
      <Hinge position={[-width / 2 + t * 0.35, 0, d * 0.25]} />
      <Hinge position={[-width / 2 + t * 0.35, -sashH / 3, d * 0.25]} />

      {/* Sash panel — pivots from LEFT edge, swings outward to right */}
      <group position={[-width / 2 + t, 0, 0]}>
        <group ref={sashRef}>
          <group position={[sashW / 2, 0, 0]}>
            {/* Sash frame */}
            <WindowFrame width={sashW} height={sashH} depth={d * 0.5} thickness={t * 0.65} color={frameColor} />

            {/* Glass pane */}
            <GlassPane width={glassW} height={glassH} glassType={glassType} />

            {showCrank ? (
              /* HAND CRANKED: just a small latch on right stile (no lever handle) */
              <mesh position={[sashW / 2 - t * 0.45, 0, d * 0.2]}>
                <boxGeometry args={[0.01, 0.025, 0.008]} />
                <meshStandardMaterial color="#999" roughness={0.3} metalness={0.4} />
              </mesh>
            ) : (
              /* STANDARD CASEMENT: prominent LEVER HANDLE on right stile */
              <group position={[sashW / 2 - t * 0.35, 0, d * 0.27]}>
                {/* Handle base plate */}
                <mesh>
                  <boxGeometry args={[0.02, 0.05, 0.01]} />
                  <meshStandardMaterial color="#999" roughness={0.25} metalness={0.5} />
                </mesh>
                {/* Handle lever (grippable, extends outward) */}
                <mesh position={[0, 0, 0.02]}>
                  <boxGeometry args={[0.015, 0.07, 0.015]} />
                  <meshStandardMaterial color="#bbb" roughness={0.2} metalness={0.55} />
                </mesh>
                {/* Handle grip end */}
                <mesh position={[0, -0.04, 0.02]}>
                  <boxGeometry args={[0.02, 0.012, 0.02]} />
                  <meshStandardMaterial color="#bbb" roughness={0.2} metalness={0.55} />
                </mesh>
              </group>
            )}

            {/* Multi-point lock on right stile */}
            <LockPoint position={[sashW / 2 - t * 0.3, sashH / 4, d * 0.2]} />
            <LockPoint position={[sashW / 2 - t * 0.3, -sashH / 4, d * 0.2]} />
          </group>
        </group>
      </group>

      {/* === HAND CRANKED VARIANT: Crank + Operator Arm === */}
      {showCrank && (
        <group>
          {/* Crank handle at bottom center of OUTER frame (not sash) */}
          <CrankHandle position={[0, -height / 2 + t * 0.15, d * 0.35]} />

          {/* Operator arm assembly — visible folding arm from crank to sash bottom */}
          <group position={[0, -height / 2 + t * 0.8, d * 0.2]}>
            {/* Arm pivot mount on frame */}
            <mesh>
              <boxGeometry args={[0.02, 0.02, 0.015]} />
              <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Folding operator arm (extends when sash opens) */}
            <group ref={armRef}>
              <mesh position={[sashW * 0.2, 0, 0]}>
                <boxGeometry args={[sashW * 0.4, 0.008, 0.008]} />
                <meshStandardMaterial color="#999" roughness={0.25} metalness={0.55} />
              </mesh>
              {/* Arm end connector (attaches to sash bottom rail) */}
              <mesh position={[sashW * 0.4, 0, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.015, 6]} />
                <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
              </mesh>
            </group>
          </group>

          {/* Vertical drive rod from crank to operator arm (visible linkage) */}
          <mesh position={[0, -height / 2 + t * 0.5, d * 0.28]}>
            <boxGeometry args={[0.006, t * 0.6, 0.006]} />
            <meshStandardMaterial color="#aaa" roughness={0.25} metalness={0.5} />
          </mesh>
        </group>
      )}

      {/* Exterior screen */}
      <WindowScreen width={sashW - t} height={sashH - t} position={[0, 0, -d * 0.6]} />
    </group>
  )
}
