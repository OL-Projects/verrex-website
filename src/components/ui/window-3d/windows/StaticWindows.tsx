"use client"
import { WindowFrame, Weatherstrip } from "../WindowParts"
import { GlassPane } from "../GlassPane"

type SP = { width: number; height: number; frameColor: string; glassType: string }

// ── BAY & BOW: Multi-panel angled projection (3 panels) ──
export function BayBowWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.06, d = 0.08
  const centerW = width * 0.5, sideW = width * 0.28, angle = Math.PI / 7
  const cGlassW = centerW - t * 2 - 0.02, sGlassW = sideW - t * 2 - 0.02
  const glassH = height - t * 2 - 0.02
  return (
    <group>
      {/* Center panel */}
      <group position={[0, 0, 0.1]}>
        <WindowFrame width={centerW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={cGlassW} height={glassH} glassType={glassType} />
      </group>
      {/* Left angled panel */}
      <group position={[-centerW / 2 - sideW * 0.35, 0, 0.03]} rotation={[0, angle, 0]}>
        <WindowFrame width={sideW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={sGlassW} height={glassH} glassType={glassType} />
      </group>
      {/* Right angled panel */}
      <group position={[centerW / 2 + sideW * 0.35, 0, 0.03]} rotation={[0, -angle, 0]}>
        <WindowFrame width={sideW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={sGlassW} height={glassH} glassType={glassType} />
      </group>
      {/* Seat board (interior shelf) */}
      <mesh position={[0, -height / 2 + 0.01, 0.05]}>
        <boxGeometry args={[width * 0.9, 0.015, 0.22]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
    </group>
  )
}

// ── PICTURE / FIXED: Non-operable, maximum light & view ──
export function PictureWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.07, d = 0.08
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.01} height={height - t * 2 - 0.01} glassType={glassType} />
      <Weatherstrip width={width - t * 1.6} height={0.005} position={[0, 0, d * 0.15]} />
    </group>
  )
}

// ── GARDEN: Box projection outward with shelf ──
export function GardenWindow({ width, height, frameColor, glassType }: SP) {
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
      {/* Interior shelf */}
      <mesh position={[0, -glassH / 2 + 0.02, projD / 2]}>
        <boxGeometry args={[glassW, 0.02, projD]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
      {/* Support brackets */}
      <mesh position={[-glassW / 3, -glassH / 2 - 0.01, projD * 0.3]}>
        <boxGeometry args={[0.015, 0.04, 0.06]} />
        <meshStandardMaterial color="#888" roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh position={[glassW / 3, -glassH / 2 - 0.01, projD * 0.3]}>
        <boxGeometry args={[0.015, 0.04, 0.06]} />
        <meshStandardMaterial color="#888" roughness={0.15} metalness={0.9} />
      </mesh>
    </group>
  )
}

// ── TRANSOM: Decorative panel above doors/windows with muntin bars ──
export function TransomWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.06, d = 0.08
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      {/* Vertical muntin */}
      <mesh>
        <boxGeometry args={[0.01, height - t * 2, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
      {/* Horizontal muntin */}
      <mesh>
        <boxGeometry args={[width - t * 2, 0.01, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
    </group>
  )
}

// ── GLASS BLOCK: Grid of individual glass blocks ──
export function GlassBlockWindow({ width, height, frameColor, glassType }: SP) {
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
          return (
            <group key={`${r}-${c}`}>
              <GlassPane width={bw * 0.88} height={bh * 0.88} position={[x, y, 0]} glassType={glassType} />
              {/* Mortar joint lines */}
              {c < cols - 1 && (
                <mesh position={[x + bw / 2, y, 0]}>
                  <boxGeometry args={[0.006, bh, d * 0.2]} />
                  <meshStandardMaterial color="#ccc" roughness={0.8} metalness={0} />
                </mesh>
              )}
            </group>
          )
        })
      )}
    </group>
  )
}
