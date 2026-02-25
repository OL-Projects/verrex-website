"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, Hinge, LockPoint, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
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

      {/* === HAND CRANKED: Full Worm Gear Operator Mechanism === */}
      {showCrank && (
        <group>
          {/* ── GEARBOX HOUSING ── rectangular box mounted flush to frame sill */}
          <group position={[0, -height / 2 + t * 0.2, d * 0.3]}>
            {/* Main gearbox body */}
            <mesh>
              <boxGeometry args={[0.045, 0.025, 0.025]} />
              <meshStandardMaterial color="#777" roughness={0.25} metalness={0.6} />
            </mesh>
            {/* Gearbox face plate (front detail) */}
            <mesh position={[0, 0, 0.013]}>
              <boxGeometry args={[0.04, 0.02, 0.002]} />
              <meshStandardMaterial color="#888" roughness={0.2} metalness={0.65} />
            </mesh>
            {/* Worm gear axle hole (visible circle) */}
            <mesh position={[0, 0, 0.015]}>
              <cylinderGeometry args={[0.005, 0.005, 0.004, 12]} />
              <meshStandardMaterial color="#555" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* ── FOLD-DOWN CRANK HANDLE ── L-shaped, extends from gearbox */}
            {/* Handle shaft (extends forward from gearbox) */}
            <mesh position={[0, 0, 0.035]}>
              <cylinderGeometry args={[0.004, 0.004, 0.03, 8]} />
              <meshStandardMaterial color="#999" roughness={0.2} metalness={0.6} />
            </mesh>
            {/* Handle crank arm (extends downward, L-shape) */}
            <mesh position={[0, -0.02, 0.048]}>
              <boxGeometry args={[0.008, 0.035, 0.008]} />
              <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.55} />
            </mesh>
            {/* Handle grip knob (you grab this to turn) */}
            <mesh position={[0, -0.038, 0.048]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshStandardMaterial color="#bbb" roughness={0.15} metalness={0.5} />
            </mesh>
          </group>

          {/* ── DRIVE SHAFT ── from gearbox up to operator arm pivot */}
          <mesh position={[0, -height / 2 + t * 0.55, d * 0.25]}>
            <boxGeometry args={[0.006, t * 0.8, 0.006]} />
            <meshStandardMaterial color="#999" roughness={0.2} metalness={0.55} />
          </mesh>

          {/* ── OPERATOR ARM ASSEMBLY ── the metal arm that pushes the sash */}
          <group position={[0, -height / 2 + t * 0.95, d * 0.22]}>
            {/* Arm pivot bracket on frame sill (fixed mount) */}
            <mesh>
              <boxGeometry args={[0.025, 0.018, 0.018]} />
              <meshStandardMaterial color="#888" roughness={0.25} metalness={0.55} />
            </mesh>
            {/* Pivot pin */}
            <mesh position={[0, 0, 0.01]}>
              <cylinderGeometry args={[0.004, 0.004, 0.02, 8]} />
              <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.6} />
            </mesh>

            {/* MAIN OPERATOR ARM — thick metal bar that extends and pushes sash */}
            <group ref={armRef}>
              {/* Primary arm segment */}
              <mesh position={[sashW * 0.22, 0, 0]}>
                <boxGeometry args={[sashW * 0.44, 0.012, 0.006]} />
                <meshStandardMaterial color="#999" roughness={0.2} metalness={0.6} />
              </mesh>
              {/* Arm reinforcement rib (visible detail along center) */}
              <mesh position={[sashW * 0.22, 0, 0.005]}>
                <boxGeometry args={[sashW * 0.38, 0.005, 0.004]} />
                <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.55} />
              </mesh>

              {/* Mid-joint knuckle (where arm bends/articulates) */}
              <mesh position={[sashW * 0.44, 0, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.016, 8]} />
                <meshStandardMaterial color="#888" roughness={0.25} metalness={0.6} />
              </mesh>

              {/* ── SWIVEL BRACKET ── pivoting shoe at arm end */}
              {/* This is the "swivel" that attaches to the sash bottom rail */}
              <group position={[sashW * 0.44, 0, 0]}>
                {/* Bracket housing (wider piece that slides on sash track) */}
                <mesh position={[0.015, 0, 0]}>
                  <boxGeometry args={[0.025, 0.015, 0.015]} />
                  <meshStandardMaterial color="#888" roughness={0.25} metalness={0.55} />
                </mesh>
                {/* Swivel pin (allows free rotation) */}
                <mesh position={[0.015, 0, 0.009]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.018, 8]} />
                  <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.65} />
                </mesh>
                {/* Sash stud (connects into sash bottom rail slot) */}
                <mesh position={[0.015, 0.012, 0]}>
                  <cylinderGeometry args={[0.003, 0.003, 0.012, 6]} />
                  <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
                </mesh>
              </group>
            </group>
          </group>

          {/* ── SASH TRACK CHANNEL ── slot on sash bottom rail where bracket slides */}
          <mesh position={[0, -sashH / 2 + t * 0.15, d * 0.22]}>
            <boxGeometry args={[sashW * 0.5, 0.005, 0.01]} />
            <meshStandardMaterial color="#777" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      )}

      {/* Exterior screen */}
      <WindowScreen width={sashW - t} height={sashH - t} position={[0, 0, -d * 0.6]} />
    </group>
  )
}
