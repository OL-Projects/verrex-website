"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// ═══════════════════════════════════════════════════════
// TILT & TURN WINDOW — European-style (CAD-accurate)
// ═══════════════════════════════════════════════════════
//
// Inward-opening casement system, single active sash.
// Thick European profile frame (~80mm depth).
// Perimeter compression seal. Multi-point locking hardware.
//
// Single lever handle on RIGHT stile controls 3 positions:
//   Handle DOWN (6 o'clock) → LOCKED, compression sealed
//   Handle HORIZONTAL (3 o'clock) → TURN mode, swings inward ~90°
//   Handle UP (12 o'clock) → TILT mode, top tilts inward 10-15cm
//
// When "Open" → shows TILT mode:
//   Bottom stays anchored at bottom corners (pivot mechanism)
//   Top tilts INWARD toward viewer, creating triangular gap
//
// Hinges: CONCEALED — not visible from front when closed
//   Metallic pivot arms at corners visible only when open
//
// Frame: Chunkier than North American, clean minimal interior
// Glass: Triple-pane IGU with visible warm-edge spacer
// Seals: Dark grey/black compression gaskets around perimeter

export type TiltTurnMode = "closed" | "tilt" | "turn"

export function TiltTurnWindow({ width, height, frameColor, glassType, openMode = "closed" }: {
  width: number; height: number; frameColor: string; glassType: string; openMode?: TiltTurnMode
}) {
  // European proportions: thicker frame depth, wider profile
  const t = 0.062       // frame thickness — slim European profile (visible handle)
  const d = 0.10        // frame depth — ~70mm European style
  const sashW = width - t * 2
  const sashH = height - t * 2
  const glassW = sashW - t * 1.2
  const glassH = sashH - t * 1.2
  const turnRef = useRef<THREE.Group>(null)  // Y-axis: left-edge hinge
  const tiltRef = useRef<THREE.Group>(null)  // X-axis: bottom-edge hinge
  const leverRef = useRef<THREE.Group>(null) // Z-axis: handle rotation (clock positions)

  // Three independent spring states
  const tiltSpring = useRef<SpringState>({ pos: 0, vel: 0 })
  const turnSpring = useRef<SpringState>({ pos: 0, vel: 0 })
  const leverSpring = useRef<SpringState>({ pos: 0, vel: 0 })

  useFrame((_, dt) => {
    // TILT: pivot at bottom edge, top comes toward viewer (positive X rotation ~12°)
    const tiltTarget = openMode === "tilt" ? 0.22 : 0
    const tiltAngle = springStep(tiltSpring.current, tiltTarget, dt, 100, 14)

    // TURN: pivot at LEFT edge, swings INWARD toward viewer (negative Y rotation ~85°)
    const turnTarget = openMode === "turn" ? -Math.PI * 0.47 : 0
    const turnAngle = springStep(turnSpring.current, turnTarget, dt, 70, 14)

    // LEVER: 6:00=0, 9:00=-π/2, 12:00=-π
    const leverTarget = openMode === "closed" ? 0 : openMode === "turn" ? -Math.PI / 2 : -Math.PI
    const leverAngle = springStep(leverSpring.current, leverTarget, dt, 180, 16)

    if (turnRef.current) turnRef.current.rotation.y = turnAngle
    if (tiltRef.current) tiltRef.current.rotation.x = tiltAngle
    if (leverRef.current) leverRef.current.rotation.z = leverAngle
  })

  return (
    <group>
      {/* ── OUTER FRAME — thick European profile ── */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Drainage slots on exterior bottom frame (2 notches) */}
      {[-width / 5, width / 5].map((x, i) => (
        <mesh key={`drain${i}`} position={[x, -height / 2 + t * 0.2, -d * 0.45]}>
          <boxGeometry args={[0.025, 0.006, 0.015]} />
          <meshStandardMaterial color="#555" roughness={0.5} />
        </mesh>
      ))}

      {/* ── COMPRESSION GASKETS — dark grey/black around inner frame perimeter ── */}
      {/* Top gasket */}
      <mesh position={[0, height / 2 - t * 0.55, d * 0.08]}>
        <boxGeometry args={[sashW + 0.01, 0.006, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {/* Bottom gasket */}
      <mesh position={[0, -height / 2 + t * 0.55, d * 0.08]}>
        <boxGeometry args={[sashW + 0.01, 0.006, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {/* Left gasket */}
      <mesh position={[-width / 2 + t * 0.55, 0, d * 0.08]}>
        <boxGeometry args={[0.006, sashH + 0.01, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      {/* Right gasket */}
      <mesh position={[width / 2 - t * 0.55, 0, d * 0.08]}>
        <boxGeometry args={[0.006, sashH + 0.01, 0.012]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>

      {/* ── MULTI-POINT LOCK CAMS — around frame perimeter (visible keeps) ── */}
      {/* Top keeps */}
      {[-sashW / 4, sashW / 4].map((x, i) => (
        <mesh key={`tl${i}`} position={[x, height / 2 - t * 0.4, d * 0.15]}>
          <boxGeometry args={[0.012, 0.008, 0.008]} />
          <meshStandardMaterial color="#999" roughness={0.25} metalness={0.6} />
        </mesh>
      ))}
      {/* Bottom keeps */}
      {[-sashW / 4, sashW / 4].map((x, i) => (
        <mesh key={`bl${i}`} position={[x, -height / 2 + t * 0.4, d * 0.15]}>
          <boxGeometry args={[0.012, 0.008, 0.008]} />
          <meshStandardMaterial color="#999" roughness={0.25} metalness={0.6} />
        </mesh>
      ))}
      {/* Left keeps */}
      {[-sashH / 4, sashH / 4].map((y, i) => (
        <mesh key={`ll${i}`} position={[-width / 2 + t * 0.4, y, d * 0.15]}>
          <boxGeometry args={[0.008, 0.012, 0.008]} />
          <meshStandardMaterial color="#999" roughness={0.25} metalness={0.6} />
        </mesh>
      ))}
      {/* Right keeps */}
      {[-sashH / 4, sashH / 4].map((y, i) => (
        <mesh key={`rl${i}`} position={[width / 2 - t * 0.4, y, d * 0.15]}>
          <boxGeometry args={[0.008, 0.012, 0.008]} />
          <meshStandardMaterial color="#999" roughness={0.25} metalness={0.6} />
        </mesh>
      ))}

      {/* ── CONCEALED PIVOT ARMS at bottom corners — visible only when tilted ── */}
      {[-sashW / 2 + 0.02, sashW / 2 - 0.02].map((x, i) => (
        <mesh key={`piv${i}`} position={[x, -height / 2 + t * 0.5, d * 0.1]}>
          <boxGeometry args={[0.025, 0.012, 0.02]} />
          <meshStandardMaterial color="#888" roughness={0.25} metalness={0.55} />
        </mesh>
      ))}

      {/* ── SASH — dual pivot: TURN at left edge, TILT at bottom edge ── */}
      {/* TURN pivot: left edge of sash area, center height */}
      <group position={[-sashW / 2, 0, 0]}>
        <group ref={turnRef}>
          {/* TILT pivot: bottom edge of sash (relative to turn origin) */}
          <group position={[sashW / 2, -sashH / 2, 0]}>
            <group ref={tiltRef}>
              <group position={[0, sashH / 2, 0]}>
            {/* Sash frame (inset from outer frame) */}
            <WindowFrame width={sashW} height={sashH} depth={d * 0.55} thickness={t * 0.65} color={frameColor} />

            {/* ── SASH GASKETS — 2 compression seals around sash perimeter ── */}
            {/* Outer gasket ring */}
            <mesh position={[0, sashH / 2 - t * 0.3, d * 0.12]}>
              <boxGeometry args={[sashW - t * 0.5, 0.005, 0.008]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
            </mesh>
            <mesh position={[0, -sashH / 2 + t * 0.3, d * 0.12]}>
              <boxGeometry args={[sashW - t * 0.5, 0.005, 0.008]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
            </mesh>
            <mesh position={[-sashW / 2 + t * 0.3, 0, d * 0.12]}>
              <boxGeometry args={[0.005, sashH - t * 0.5, 0.008]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
            </mesh>
            <mesh position={[sashW / 2 - t * 0.3, 0, d * 0.12]}>
              <boxGeometry args={[0.005, sashH - t * 0.5, 0.008]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
            </mesh>

            {/* ── TRIPLE-PANE IGU with warm-edge spacer ── */}
            <GlassPane width={glassW} height={glassH} glassType={glassType} />
            {/* Warm-edge spacer visible at glass perimeter (dark grey bar) */}
            {/* Top spacer */}
            <mesh position={[0, glassH / 2 - 0.003, 0]}>
              <boxGeometry args={[glassW - 0.01, 0.006, d * 0.15]} />
              <meshStandardMaterial color="#444" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Bottom spacer */}
            <mesh position={[0, -glassH / 2 + 0.003, 0]}>
              <boxGeometry args={[glassW - 0.01, 0.006, d * 0.15]} />
              <meshStandardMaterial color="#444" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Left spacer */}
            <mesh position={[-glassW / 2 + 0.003, 0, 0]}>
              <boxGeometry args={[0.006, glassH - 0.01, d * 0.15]} />
              <meshStandardMaterial color="#444" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Right spacer */}
            <mesh position={[glassW / 2 - 0.003, 0, 0]}>
              <boxGeometry args={[0.006, glassH - 0.01, d * 0.15]} />
              <meshStandardMaterial color="#444" roughness={0.4} metalness={0.2} />
            </mesh>

            {/* ── LEVER HANDLE — RIGHT stile, 3-position clock rotation ── */}
            {/* 6:00↓ = locked, 9:00← = turn, 12:00↑ = tilt */}
            {/* Warm satin nickel finish — distinguishable from white frame */}
            <group position={[sashW / 2 - t * 0.2, 0, d * 0.35]}>
              {/* Escutcheon plate (fixed on stile face — larger) */}
              <mesh>
                <boxGeometry args={[0.024, 0.09, 0.009]} />
                <meshStandardMaterial color="#c0b89a" roughness={0.18} metalness={0.5} />
              </mesh>
              {/* Lock cylinder center (fixed pivot point) */}
              <mesh position={[0, 0, 0.006]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.006, 12]} />
                <meshStandardMaterial color="#a09880" roughness={0.25} metalness={0.55} />
              </mesh>
              {/* LEVER — rotates around Z. Default: pointing DOWN (6:00) */}
              <group ref={leverRef} position={[0, 0, 0.010]}>
                {/* Lever arm — extends downward from center (longer + thicker) */}
                <mesh position={[0, -0.055, 0]}>
                  <boxGeometry args={[0.015, 0.09, 0.014]} />
                  <meshStandardMaterial color="#d0c8ad" roughness={0.12} metalness={0.55} />
                </mesh>
                {/* Grip tip (wider ergonomic end) */}
                <mesh position={[0, -0.10, 0]}>
                  <boxGeometry args={[0.020, 0.018, 0.016]} />
                  <meshStandardMaterial color="#e0d8c0" roughness={0.10} metalness={0.5} />
                </mesh>
              </group>
            </group>

            {/* ── MULTI-POINT LOCK CAMS on sash (mushroom cams) ── */}
            {/* Right stile cams */}
            {[-sashH / 4, sashH / 4].map((y, i) => (
              <mesh key={`rc${i}`} position={[sashW / 2 - t * 0.25, y, d * 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.01, 6]} />
                <meshStandardMaterial color="#999" roughness={0.25} metalness={0.6} />
              </mesh>
            ))}
            {/* Top rail cam */}
            <mesh position={[0, sashH / 2 - t * 0.25, d * 0.15]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.01, 6]} />
              <meshStandardMaterial color="#999" roughness={0.25} metalness={0.6} />
            </mesh>
            {/* Bottom rail cams */}
            {[-sashW / 4, sashW / 4].map((x, i) => (
              <mesh key={`bc${i}`} position={[x, -sashH / 2 + t * 0.25, d * 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.01, 6]} />
                <meshStandardMaterial color="#999" roughness={0.25} metalness={0.6} />
              </mesh>
            ))}
              </group>{/* close content position */}
            </group>{/* close tiltRef */}
          </group>{/* close tilt position */}
        </group>{/* close turnRef */}
      </group>{/* close turn position */}

      {/* ── SHADOW LINE — subtle reveal gap between sash and frame (3-5mm) ── */}
      {/* This is achieved by the slight inset of the sash from the outer frame */}
      {/* Visible as a thin dark line around the sash perimeter */}
      <mesh position={[0, 0, d * 0.03]}>
        <boxGeometry args={[sashW + 0.003, sashH + 0.003, 0.002]} />
        <meshStandardMaterial color="#222" roughness={0.9} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
