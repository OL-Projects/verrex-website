"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, LeverHandle, CrankHandle, TiltTurnHandle, Hinge, TrackRail, LockPoint } from "../WindowParts"
import { GlassPane } from "../GlassPane"

type WP = { width: number; height: number; frameColor: string; glassType: string; isOpen: boolean }

// ── SLIDING: Right panel glides left on track ──
export function SlidingWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, panelW = (width - t) / 2
  const glassW = panelW - t, glassH = height - t * 2 - 0.02
  const slideRef = useRef<THREE.Group>(null)
  const pos = useRef(0)
  useFrame(() => { const tgt = isOpen ? -panelW * 0.85 : 0; pos.current += (tgt - pos.current) * 0.06; if (slideRef.current) slideRef.current.position.x = pos.current })
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <TrackRail width={width - t * 2} position={[0, height / 2 - t * 0.8, 0]} color={frameColor} />
      <TrackRail width={width - t * 2} position={[0, -height / 2 + t * 0.8, 0]} color={frameColor} />
      <GlassPane width={glassW} height={glassH} position={[-panelW / 2, 0, -0.01]} glassType={glassType} />
      <group ref={slideRef}>
        <group position={[panelW / 2, 0, 0.01]}>
          <WindowFrame width={panelW} height={height - t * 1.5} depth={d * 0.4} thickness={t * 0.5} color={frameColor} />
          <GlassPane width={glassW} height={glassH} glassType={glassType} />
          <LeverHandle position={[-panelW * 0.3, 0, d * 0.25]} />
        </group>
      </group>
    </group>
  )
}

// ── AWNING: Hinges outward from top ──
export function AwningWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const pivotRef = useRef<THREE.Group>(null)
  const ang = useRef(0)
  useFrame(() => { const tgt = isOpen ? -Math.PI / 6 : 0; ang.current += (tgt - ang.current) * 0.05; if (pivotRef.current) pivotRef.current.rotation.x = ang.current })
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <group position={[0, height / 2 - t, 0]}>
        <group ref={pivotRef} position={[0, -(height / 2 - t), 0]}>
          <group position={[0, (height / 2 - t), 0]}>
            <GlassPane width={glassW} height={glassH} position={[0, -(height / 2 - t), 0]} glassType={glassType} />
          </group>
        </group>
      </group>
      {/* Top hinge bar */}
      <mesh position={[0, height / 2 - t, d * 0.2]}><boxGeometry args={[width - t * 3, 0.012, 0.025]} /><meshStandardMaterial color="#777" roughness={0.3} metalness={0.7} /></mesh>
      <CrankHandle position={[0, -height / 3, d * 0.3]} />
    </group>
  )
}

// ── TILT & TURN: Handle up=tilt, handle horizontal=turn ──
export function TiltTurnWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const tiltRef = useRef<THREE.Group>(null)
  const ang = useRef(0)
  // Tilt inward from bottom
  useFrame(() => { const tgt = isOpen ? Math.PI / 8 : 0; ang.current += (tgt - ang.current) * 0.05; if (tiltRef.current) tiltRef.current.rotation.x = ang.current })
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <group position={[0, -height / 2 + t, 0]}>
        <group ref={tiltRef} position={[0, height / 2 - t, 0]}>
          <group position={[0, -(height / 2 - t), 0]}>
            <WindowFrame width={width - t * 1.6} height={height - t * 1.6} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />
            <GlassPane width={glassW} height={glassH} glassType={glassType} />
          </group>
        </group>
      </group>
      <TiltTurnHandle position={[width / 2 - t * 1.2, 0, d * 0.3]} rotation={isOpen ? -Math.PI / 2 : 0} />
      {[-height / 3, height / 3].map((y, i) => <Hinge key={i} position={[-width / 2 + t * 0.4, y, d * 0.2]} />)}
      <LockPoint position={[width / 2 - t * 0.8, 0, d * 0.25]} />
    </group>
  )
}

// ── HOPPER: Hinges inward from bottom ──
export function HopperWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const pivotRef = useRef<THREE.Group>(null)
  const ang = useRef(0)
  useFrame(() => { const tgt = isOpen ? Math.PI / 7 : 0; ang.current += (tgt - ang.current) * 0.05; if (pivotRef.current) pivotRef.current.rotation.x = ang.current })
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <group position={[0, -height / 2 + t, 0]}>
        <group ref={pivotRef}>
          <GlassPane width={glassW} height={glassH} position={[0, height / 2 - t, 0]} glassType={glassType} />
        </group>
      </group>
      <LeverHandle position={[0, height / 4, d * 0.3]} />
    </group>
  )
}

// ── BAY & BOW: Multi-panel angled (static) ──
export function BayBowWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.06, d = 0.08, centerW = width * 0.5, sideW = width * 0.28, angle = Math.PI / 7
  return (
    <group>
      <group position={[0, 0, 0.1]}>
        <WindowFrame width={centerW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={centerW - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      </group>
      <group position={[-centerW / 2 - sideW * 0.35, 0, 0.03]} rotation={[0, angle, 0]}>
        <WindowFrame width={sideW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={sideW - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      </group>
      <group position={[centerW / 2 + sideW * 0.35, 0, 0.03]} rotation={[0, -angle, 0]}>
        <WindowFrame width={sideW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={sideW - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      </group>
    </group>
  )
}

// ── PICTURE / FIXED: No operation ──
export function PictureWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.07, d = 0.08
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.01} height={height - t * 2 - 0.01} glassType={glassType} />
    </group>
  )
}

// ── GARDEN: Box projection outward ──
export function GardenWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.06, d = 0.08, projD = 0.3
  const glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Front face */}
      <GlassPane width={glassW} height={glassH} position={[0, 0, projD]} glassType={glassType} />
      {/* Top angled glass */}
      <GlassPane width={glassW} height={projD} position={[0, glassH / 2, projD / 2]} rotation={[Math.PI / 4, 0, 0]} glassType={glassType} />
      {/* Side panels */}
      <GlassPane width={projD} height={glassH * 0.7} position={[-glassW / 2, 0, projD / 2]} rotation={[0, Math.PI / 2, 0]} glassType={glassType} />
      <GlassPane width={projD} height={glassH * 0.7} position={[glassW / 2, 0, projD / 2]} rotation={[0, Math.PI / 2, 0]} glassType={glassType} />
      {/* Shelf */}
      <mesh position={[0, -glassH / 2 + 0.02, projD / 2]}><boxGeometry args={[glassW, 0.02, projD]} /><meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.1} /></mesh>
    </group>
  )
}

// ── SKYLIGHT: Top-hinged, opens outward ──
export function SkylightWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.06, glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const pivotRef = useRef<THREE.Group>(null)
  const ang = useRef(0)
  useFrame(() => { const tgt = isOpen ? -Math.PI / 6 : 0; ang.current += (tgt - ang.current) * 0.05; if (pivotRef.current) pivotRef.current.rotation.x = ang.current })
  return (
    <group rotation={[Math.PI / 6, 0, 0]}>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <group position={[0, height / 2 - t, 0]}>
        <group ref={pivotRef} position={[0, -(height / 2 - t), 0]}>
          <GlassPane width={glassW} height={glassH} position={[0, height / 2 - t, 0]} glassType={glassType} />
        </group>
      </group>
    </group>
  )
}

// ── TRANSOM: Decorative fixed panel above door/window ──
export function TransomWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.06, d = 0.08
  // Semi-circular top with rectangular base
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      {/* Decorative muntin bars */}
      <mesh><boxGeometry args={[0.008, height - t * 2, d * 0.3]} /><meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.15} /></mesh>
      <mesh><boxGeometry args={[width - t * 2, 0.008, d * 0.3]} /><meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.15} /></mesh>
    </group>
  )
}

// ── JALOUSIE / LOUVRE: Horizontal slats rotate ──
export function JalousieWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, slatCount = 8
  const slatH = (height - t * 2) / slatCount
  const slatRefs = useRef<(THREE.Group | null)[]>([])
  const ang = useRef(0)
  useFrame(() => { const tgt = isOpen ? Math.PI / 4 : 0; ang.current += (tgt - ang.current) * 0.05; slatRefs.current.forEach(r => { if (r) r.rotation.x = ang.current }) })
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {Array.from({ length: slatCount }).map((_, i) => {
        const y = -height / 2 + t + slatH * (i + 0.5)
        return (
          <group key={i} ref={el => { slatRefs.current[i] = el }} position={[0, y, 0]}>
            <GlassPane width={width - t * 2 - 0.02} height={slatH * 0.85} glassType={glassType} />
          </group>
        )
      })}
      <CrankHandle position={[width / 2 - t * 1.5, -height / 4, d * 0.3]} />
    </group>
  )
}

// ── GLASS BLOCK: Grid of glass blocks (fixed) ──
export function GlassBlockWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.06, d = 0.08
  const cols = Math.max(2, Math.round(width / 0.2))
  const rows = Math.max(2, Math.round(height / 0.2))
  const bw = (width - t * 2) / cols, bh = (height - t * 2) / rows
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const x = -width / 2 + t + bw * (c + 0.5)
          const y = -height / 2 + t + bh * (r + 0.5)
          return <GlassPane key={`${r}-${c}`} width={bw * 0.88} height={bh * 0.88} position={[x, y, 0]} glassType={glassType} />
        })
      )}
    </group>
  )
}

// ── CURTAIN WALL: Large structural glass grid ──
export function CurtainWallWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.04, d = 0.1, cols = 3, rows = 4
  const pw = (width - t * 2) / cols, ph = (height - t * 2) / rows
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Mullions */}
      {Array.from({ length: cols - 1 }).map((_, i) => {
        const x = -width / 2 + t + pw * (i + 1)
        return <mesh key={`mv${i}`} position={[x, 0, 0]}><boxGeometry args={[0.02, height - t * 2, d]} /><meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.2} /></mesh>
      })}
      {Array.from({ length: rows - 1 }).map((_, i) => {
        const y = -height / 2 + t + ph * (i + 1)
        return <mesh key={`mh${i}`} position={[0, y, 0]}><boxGeometry args={[width - t * 2, 0.02, d]} /><meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.2} /></mesh>
      })}
      {/* Glass panels */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const x = -width / 2 + t + pw * (c + 0.5), y = -height / 2 + t + ph * (r + 0.5)
          return <GlassPane key={`${r}-${c}`} width={pw - 0.025} height={ph - 0.025} position={[x, y, 0]} glassType={glassType} />
        })
      )}
    </group>
  )
}

// ── STOREFRONT: Commercial fixed glass with door opening ──
export function StorefrontWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.05, d = 0.1, doorW = width * 0.35
  const sideW = (width - doorW - t * 2) / 2
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Left panel */}
      <GlassPane width={sideW - 0.02} height={height - t * 2 - 0.02} position={[-width / 2 + t + sideW / 2, 0, 0]} glassType={glassType} />
      {/* Center door opening */}
      <WindowFrame width={doorW} height={height - t * 1.5} depth={d * 0.7} thickness={t * 0.7} color={frameColor} />
      <GlassPane width={doorW - t * 1.5} height={height - t * 3} glassType={glassType} />
      <LeverHandle position={[doorW / 2 - 0.05, -0.05, d * 0.35]} />
      {/* Right panel */}
      <GlassPane width={sideW - 0.02} height={height - t * 2 - 0.02} position={[width / 2 - t - sideW / 2, 0, 0]} glassType={glassType} />
      {/* Transom bar */}
      <mesh position={[0, height * 0.3, 0]}><boxGeometry args={[width - t * 2, 0.02, d]} /><meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.2} /></mesh>
    </group>
  )
}

// ── GENERIC FALLBACK ──
export function GenericWindow({ width, height, frameColor, glassType }: Omit<WP, "isOpen">) {
  const t = 0.06, d = 0.08
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      <LeverHandle position={[0, -height / 4, d * 0.3]} />
    </group>
  )
}
