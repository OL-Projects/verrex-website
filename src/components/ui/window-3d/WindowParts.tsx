"use client"
import { useMemo } from "react"
import * as THREE from "three"

// ── Extruded rectangular frame ──
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
    depth, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.005, bevelSegments: 3,
  }), [depth])

  return (
    <mesh position={[0, 0, -depth / 2]}>
      <extrudeGeometry args={[shape, ext]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
    </mesh>
  )
}

// ── Lever handle (for double-hung, awning, hopper) ──
export function LeverHandle({ position, color = "#888" }: {
  position: [number, number, number]; color?: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.03, 0.012, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.04, 0.02]}>
        <boxGeometry args={[0.018, 0.065, 0.012]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ── Crank handle (for casement, awning) ──
export function CrankHandle({ position, color = "#888" }: {
  position: [number, number, number]; color?: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0, 0.015]}>
        <cylinderGeometry args={[0.01, 0.01, 0.03, 12]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0.025, 0, 0.015]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.05, 8]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ── Tilt-turn handle (rotatable) ──
export function TiltTurnHandle({ position, rotation = 0, color = "#888" }: {
  position: [number, number, number]; rotation?: number; color?: string
}) {
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <mesh position={[0, 0, 0.018]}>
        <boxGeometry args={[0.025, 0.012, 0.035]} />
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, 0.018]}>
        <boxGeometry args={[0.014, 0.085, 0.01]} />
        <meshStandardMaterial color={color} roughness={0.15} metalness={0.85} />
      </mesh>
    </group>
  )
}

// ── Hinge (barrel type) ──
export function Hinge({ position, color = "#777" }: {
  position: [number, number, number]; color?: string
}) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.008, 0.008, 0.05, 8]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
    </mesh>
  )
}

// ── Weatherstrip seal ──
export function Weatherstrip({ width, height, depth = 0.005, position = [0, 0, 0] }: {
  width: number; height: number; depth?: number; position?: [number, number, number]
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#222" roughness={0.95} metalness={0} />
    </mesh>
  )
}

// ── Lock indicator (multi-point) ──
export function LockPoint({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.015, 0.008, 0.02]} />
      <meshStandardMaterial color="#999" roughness={0.2} metalness={0.8} />
    </mesh>
  )
}

// ── Track rail for sliding windows ──
export function TrackRail({ width, position, color }: {
  width: number; position: [number, number, number]; color: string
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, 0.008, 0.06]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}
