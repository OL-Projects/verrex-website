"use client"
import { useMemo } from "react"
import * as THREE from "three"

// ═══════════════════════════════════════════════════════════════
// Spring Physics Utility
// Damped harmonic oscillator for realistic window animations
// Call inside useFrame: springStep(spring, target, delta)
// ═══════════════════════════════════════════════════════════════

export type SpringState = { pos: number; vel: number }

export function springStep(
  state: SpringState,
  target: number,
  dt: number,
  stiffness = 160,
  damping = 20,
): number {
  const clampedDt = Math.min(dt, 0.033) // cap at ~30fps for numerical stability
  const displacement = target - state.pos
  const springForce = displacement * stiffness
  const dampingForce = state.vel * damping
  state.vel += (springForce - dampingForce) * clampedDt
  state.pos += state.vel * clampedDt
  return state.pos
}

// ═══════════════════════════════════════════════════════════════
// Frame Profiles
// Vinyl (uPVC) default: roughness 0.45, metalness 0.02
// Aluminum option: roughness 0.2, metalness 0.8
// Extruded with realistic bevels for rounded sight lines
// ═══════════════════════════════════════════════════════════════

export function WindowFrame({
  width, height, depth = 0.08, thickness = 0.06, color,
}: {
  width: number; height: number; depth?: number; thickness?: number; color: string
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-width / 2, -height / 2)
    s.lineTo(width / 2, -height / 2)
    s.lineTo(width / 2, height / 2)
    s.lineTo(-width / 2, height / 2)
    s.lineTo(-width / 2, -height / 2)
    const hole = new THREE.Path()
    const iw = width / 2 - thickness, ih = height / 2 - thickness
    hole.moveTo(-iw, -ih); hole.lineTo(iw, -ih)
    hole.lineTo(iw, ih); hole.lineTo(-iw, ih); hole.lineTo(-iw, -ih)
    s.holes.push(hole)
    return s
  }, [width, height, thickness])

  const ext = useMemo(() => ({
    depth,
    bevelEnabled: true,
    bevelThickness: 0.018,  // more pronounced rounded edge
    bevelSize: 0.01,        // wider bevel for smoother profile
    bevelSegments: 5,       // smoother curve (was 3)
  }), [depth])

  return (
    <mesh position={[0, 0, -depth / 2]}>
      <extrudeGeometry args={[shape, ext]} />
      <meshStandardMaterial
        color={color}
        roughness={0.45}    // vinyl/uPVC plastic finish
        metalness={0.02}    // plastic, not metal
        envMapIntensity={0.6}
      />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════
// Hardware Components — Satin Nickel finish
// roughness 0.15, metalness 0.9 for realistic metal hardware
// ═══════════════════════════════════════════════════════════════

const HW_MAT = { roughness: 0.15, metalness: 0.9, envMapIntensity: 1.2 }

// ── Lever handle (for double-hung, sliding, hopper) ──
export function LeverHandle({ position, color = "#999" }: {
  position: [number, number, number]; color?: string
}) {
  return (
    <group position={position}>
      {/* Base plate */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[0.035, 0.016, 0.008]} />
        <meshStandardMaterial color="#777" {...HW_MAT} />
      </mesh>
      {/* Lever rosette */}
      <mesh position={[0, 0, 0.022]}>
        <cylinderGeometry args={[0.012, 0.012, 0.008, 12]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Lever arm */}
      <mesh position={[0, 0.042, 0.022]}>
        <boxGeometry args={[0.016, 0.07, 0.012]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Lever tip (rounded) */}
      <mesh position={[0, 0.08, 0.022]}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
    </group>
  )
}

// ── Crank handle (for casement, awning) ──
export function CrankHandle({ position, color = "#999" }: {
  position: [number, number, number]; color?: string
}) {
  return (
    <group position={position}>
      {/* Base plate */}
      <mesh position={[0, 0, 0.008]}>
        <boxGeometry args={[0.03, 0.02, 0.006]} />
        <meshStandardMaterial color="#777" {...HW_MAT} />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.006, 0.006, 0.025, 10]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Crank arm */}
      <mesh position={[0.028, 0, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.055, 8]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Crank knob */}
      <mesh position={[0.055, 0, 0.02]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
    </group>
  )
}

// ── Tilt-turn handle (espagnolette style, rotatable) ──
export function TiltTurnHandle({ position, rotation = 0, color = "#999" }: {
  position: [number, number, number]; rotation?: number; color?: string
}) {
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Base plate */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.028, 0.015, 0.008]} />
        <meshStandardMaterial color="#777" {...HW_MAT} />
      </mesh>
      {/* Rosette */}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 12]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Handle arm */}
      <mesh position={[0, 0.05, 0.02]}>
        <boxGeometry args={[0.014, 0.085, 0.012]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Handle tip */}
      <mesh position={[0, 0.095, 0.02]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
    </group>
  )
}

// ── Hinge (barrel type with knuckles) ──
export function Hinge({ position, color = "#888" }: {
  position: [number, number, number]; color?: string
}) {
  return (
    <group position={position}>
      {/* Barrel */}
      <mesh>
        <cylinderGeometry args={[0.009, 0.009, 0.055, 10]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Top knuckle */}
      <mesh position={[0, 0.025, 0]}>
        <sphereGeometry args={[0.01, 8, 6]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Bottom knuckle */}
      <mesh position={[0, -0.025, 0]}>
        <sphereGeometry args={[0.01, 8, 6]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      {/* Leaf plates */}
      <mesh position={[0.012, 0, 0]}>
        <boxGeometry args={[0.018, 0.05, 0.003]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
      <mesh position={[-0.012, 0, 0]}>
        <boxGeometry args={[0.018, 0.05, 0.003]} />
        <meshStandardMaterial color={color} {...HW_MAT} />
      </mesh>
    </group>
  )
}

// ── Weatherstrip gasket (EPDM rubber seal) ──
export function Weatherstrip({ width, height, depth = 0.006, position = [0, 0, 0] }: {
  width: number; height: number; depth?: number; position?: [number, number, number]
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.92} metalness={0} />
    </mesh>
  )
}

// ── Multi-point lock indicator ──
export function LockPoint({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.018, 0.01, 0.022]} />
        <meshStandardMaterial color="#aaa" {...HW_MAT} />
      </mesh>
      {/* Lock bolt */}
      <mesh position={[0, 0, 0.013]}>
        <cylinderGeometry args={[0.004, 0.004, 0.008, 8]} />
        <meshStandardMaterial color="#ccc" {...HW_MAT} />
      </mesh>
    </group>
  )
}

// ── Track rail for sliding windows ──
export function TrackRail({ width, position, color }: {
  width: number; position: [number, number, number]; color: string
}) {
  return (
    <group position={position}>
      {/* Rail base */}
      <mesh>
        <boxGeometry args={[width, 0.01, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.02} envMapIntensity={0.6} />
      </mesh>
      {/* Rail ridge */}
      <mesh position={[0, 0.006, 0]}>
        <boxGeometry args={[width, 0.004, 0.012]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
      </mesh>
    </group>
  )
}

// ── Window screen mesh (for operable windows) ──
export function WindowScreen({ width, height, position = [0, 0, 0] }: {
  width: number; height: number; position?: [number, number, number]
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        color="#333333"
        transparent
        opacity={0.15}
        roughness={0.8}
        metalness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
