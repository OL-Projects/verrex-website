"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, Hinge, LockPoint, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// ═══════════════════════════════════════════════════════════════
// SINGLE CASEMENT WINDOW — North American Style
// ═══════════════════════════════════════════════════════════════
//
// ONE sash, hinged on LEFT stile, swings OUTWARD.
//
// TWO VARIANTS:
//   Standard (showCrank=false): lever handle, ~45° open by hand
//   Hand Cranked (showCrank=true): worm gear crank, scissor arm,
//     opens ~85° outward. Full mechanical linkage visible.

export function SingleCasementWindow({ width, height, frameColor, glassType, isOpen, showCrank = false }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean; showCrank?: boolean
}) {
  const t = 0.06, d = 0.08
  const sashW = width - t * 2
  const sashH = height - t * 2
  const glassW = sashW - t * 1.4
  const glassH = sashH - t * 1.4
  const sashRef = useRef<THREE.Group>(null)
  const arm1Ref = useRef<THREE.Group>(null)
  const arm2Ref = useRef<THREE.Group>(null)
  const handleRef = useRef<THREE.Group>(null)

  // Hand-cranked opens wider ~85° vs manual ~45°
  const maxAngle = showCrank ? -Math.PI * 0.47 : -Math.PI / 4
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })

  useFrame((_, dt) => {
    const target = isOpen ? maxAngle : 0
    // Compression effect: stiffer spring at end of travel for seal engagement
    const stiffness = showCrank ? 65 : 120
    const angle = springStep(spring.current, target, dt, stiffness, 14)
    if (sashRef.current) sashRef.current.rotation.y = angle

    if (showCrank) {
      const progress = Math.abs(angle / maxAngle)  // 0 = closed, 1 = fully open

      // Scissor arm 1: pivots outward from gearbox mount
      if (arm1Ref.current) arm1Ref.current.rotation.z = -progress * Math.PI * 0.35
      // Scissor arm 2: counter-rotates at mid-joint
      if (arm2Ref.current) arm2Ref.current.rotation.z = progress * Math.PI * 0.25
      // Crank handle: fold out + spin proportionally
      if (handleRef.current) handleRef.current.rotation.z = -progress * Math.PI * 2
    }
  })

  return (
    <group>
      {/* ── OUTER FRAME ── */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Exterior sloped sill (angled bottom rail for water drainage) */}
      <mesh position={[0, -height / 2 + t * 0.15, -d * 0.35]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[width - t, 0.008, d * 0.4]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>

      {/* Weep holes on exterior bottom frame */}
      {[-width / 5, width / 5].map((x, i) => (
        <mesh key={`weep${i}`} position={[x, -height / 2 + t * 0.15, -d * 0.45]}>
          <boxGeometry args={[0.018, 0.005, 0.012]} />
          <meshStandardMaterial color="#444" roughness={0.6} />
        </mesh>
      ))}

      {/* Bulb-style weatherstrip gaskets (rounded, dark grey) around perimeter */}
      {/* Top */}
      <mesh position={[0, height / 2 - t * 0.55, d * 0.12]}>
        <boxGeometry args={[sashW - 0.01, 0.007, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.85} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 + t * 0.55, d * 0.12]}>
        <boxGeometry args={[sashW - 0.01, 0.007, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.85} />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 + t * 0.55, 0, d * 0.12]}>
        <boxGeometry args={[0.007, sashH - 0.01, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.85} />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 - t * 0.55, 0, d * 0.12]}>
        <boxGeometry args={[0.007, sashH - 0.01, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.85} />
      </mesh>

      {/* 3 brushed steel hinges on LEFT stile */}
      <Hinge position={[-width / 2 + t * 0.35, sashH / 3, d * 0.25]} />
      <Hinge position={[-width / 2 + t * 0.35, 0, d * 0.25]} />
      <Hinge position={[-width / 2 + t * 0.35, -sashH / 3, d * 0.25]} />

      {/* ── SASH — pivots from LEFT edge, swings outward ── */}
      <group position={[-width / 2 + t, 0, 0]}>
        <group ref={sashRef}>
          <group position={[sashW / 2, 0, 0]}>
            <WindowFrame width={sashW} height={sashH} depth={d * 0.5} thickness={t * 0.65} color={frameColor} />
            <GlassPane width={glassW} height={glassH} glassType={glassType} />

            {!showCrank && (
              /* STANDARD: lever handle on right stile */
              <group position={[sashW / 2 - t * 0.35, 0, d * 0.27]}>
                <mesh>
                  <boxGeometry args={[0.02, 0.05, 0.01]} />
                  <meshStandardMaterial color="#999" roughness={0.25} metalness={0.5} />
                </mesh>
                <mesh position={[0, 0, 0.02]}>
                  <boxGeometry args={[0.015, 0.07, 0.015]} />
                  <meshStandardMaterial color="#bbb" roughness={0.2} metalness={0.55} />
                </mesh>
                <mesh position={[0, -0.04, 0.02]}>
                  <boxGeometry args={[0.02, 0.012, 0.02]} />
                  <meshStandardMaterial color="#bbb" roughness={0.2} metalness={0.55} />
                </mesh>
              </group>
            )}

            {/* Multi-point lock on right stile */}
            <LockPoint position={[sashW / 2 - t * 0.3, sashH / 4, d * 0.2]} />
            <LockPoint position={[sashW / 2 - t * 0.3, -sashH / 4, d * 0.2]} />

            {/* Sash bottom rail track (for scissor arm shoe to slide in) */}
            {showCrank && (
              <mesh position={[0, -sashH / 2 + t * 0.25, d * 0.18]}>
                <boxGeometry args={[sashW * 0.6, 0.006, 0.012]} />
                <meshStandardMaterial color="#777" roughness={0.3} metalness={0.5} />
              </mesh>
            )}
          </group>
        </group>
      </group>

      {/* ═══ HAND CRANKED: Full Scissor Arm Operator ═══ */}
      {showCrank && (
        <group>
          {/* ── GEARBOX HOUSING ── bottom center, interior face */}
          <group position={[0, -height / 2 + t * 0.2, d * 0.32]}>
            {/* Gearbox body */}
            <mesh>
              <boxGeometry args={[0.048, 0.028, 0.028]} />
              <meshStandardMaterial color="#777" roughness={0.25} metalness={0.6} />
            </mesh>
            {/* Face plate */}
            <mesh position={[0, 0, 0.015]}>
              <boxGeometry args={[0.042, 0.022, 0.003]} />
              <meshStandardMaterial color="#888" roughness={0.2} metalness={0.65} />
            </mesh>
            {/* Worm gear axle */}
            <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.006, 10]} />
              <meshStandardMaterial color="#555" roughness={0.3} metalness={0.7} />
            </mesh>

            {/* ── FOLD-DOWN CRANK HANDLE — rotates as window opens ── */}
            <group ref={handleRef} position={[0, 0, 0.022]}>
              {/* Handle shaft */}
              <mesh position={[0, 0, 0.015]}>
                <cylinderGeometry args={[0.004, 0.004, 0.028, 8]} />
                <meshStandardMaterial color="#999" roughness={0.2} metalness={0.6} />
              </mesh>
              {/* Crank arm (L-shape offset) */}
              <mesh position={[0, -0.022, 0.028]}>
                <boxGeometry args={[0.008, 0.038, 0.008]} />
                <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.55} />
              </mesh>
              {/* Grip knob */}
              <mesh position={[0, -0.042, 0.028]}>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshStandardMaterial color="#bbb" roughness={0.15} metalness={0.5} />
              </mesh>
            </group>
          </group>

          {/* ── DRIVE SHAFT — from gearbox to scissor arm pivot ── */}
          <mesh position={[0, -height / 2 + t * 0.58, d * 0.26]}>
            <boxGeometry args={[0.006, t * 0.85, 0.006]} />
            <meshStandardMaterial color="#999" roughness={0.2} metalness={0.55} />
          </mesh>

          {/* ── SCISSOR ARM MECHANISM ── 2-segment linkage ── */}
          <group position={[0, -height / 2 + t * 1.0, d * 0.22]}>
            {/* Frame-side pivot bracket (fixed to sill) */}
            <mesh>
              <boxGeometry args={[0.028, 0.02, 0.02]} />
              <meshStandardMaterial color="#888" roughness={0.25} metalness={0.55} />
            </mesh>
            {/* Pivot pin 1 */}
            <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.022, 8]} />
              <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.6} />
            </mesh>

            {/* ARM SEGMENT 1 — pivots from frame bracket outward */}
            <group ref={arm1Ref}>
              <mesh position={[sashW * 0.18, 0, 0]}>
                <boxGeometry args={[sashW * 0.36, 0.013, 0.007]} />
                <meshStandardMaterial color="#999" roughness={0.2} metalness={0.6} />
              </mesh>
              {/* Reinforcement rib */}
              <mesh position={[sashW * 0.18, 0, 0.006]}>
                <boxGeometry args={[sashW * 0.3, 0.006, 0.004]} />
                <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.55} />
              </mesh>

              {/* ── MID-JOINT KNUCKLE (scissor connection) ── */}
              <group position={[sashW * 0.36, 0, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.007, 0.007, 0.018, 8]} />
                  <meshStandardMaterial color="#888" roughness={0.25} metalness={0.6} />
                </mesh>

                {/* ARM SEGMENT 2 — extends from knuckle to sash track */}
                <group ref={arm2Ref}>
                  <mesh position={[sashW * 0.14, 0, 0]}>
                    <boxGeometry args={[sashW * 0.28, 0.011, 0.006]} />
                    <meshStandardMaterial color="#999" roughness={0.2} metalness={0.6} />
                  </mesh>

                  {/* ── SWIVEL SHOE — slides in sash bottom rail track ── */}
                  <group position={[sashW * 0.28, 0, 0]}>
                    <mesh>
                      <boxGeometry args={[0.028, 0.016, 0.016]} />
                      <meshStandardMaterial color="#888" roughness={0.25} metalness={0.55} />
                    </mesh>
                    {/* Swivel pin */}
                    <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                      <cylinderGeometry args={[0.004, 0.004, 0.02, 8]} />
                      <meshStandardMaterial color="#aaa" roughness={0.2} metalness={0.65} />
                    </mesh>
                    {/* Stud into sash rail */}
                    <mesh position={[0, 0.012, 0]}>
                      <cylinderGeometry args={[0.003, 0.003, 0.012, 6]} />
                      <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      )}

      {/* Exterior screen */}
      <WindowScreen width={sashW - t} height={sashH - t} position={[0, 0, -d * 0.6]} />
    </group>
  )
}
