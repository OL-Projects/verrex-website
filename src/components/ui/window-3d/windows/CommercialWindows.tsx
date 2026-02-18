"use client"
import { WindowFrame, LeverHandle } from "../WindowParts"
import { GlassPane } from "../GlassPane"

type SP = { width: number; height: number; frameColor: string; glassType: string }

// ── CURTAIN WALL: Structural glass facade with mullion grid ──
export function CurtainWallWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.04, d = 0.1, cols = 3, rows = 4
  const pw = (width - t * 2) / cols, ph = (height - t * 2) / rows
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Vertical mullions */}
      {Array.from({ length: cols - 1 }).map((_, i) => {
        const x = -width / 2 + t + pw * (i + 1)
        return (
          <mesh key={`mv${i}`} position={[x, 0, 0]}>
            <boxGeometry args={[0.022, height - t * 2, d]} />
            <meshStandardMaterial color={frameColor} roughness={0.2} metalness={0.8} envMapIntensity={1.0} />
          </mesh>
        )
      })}
      {/* Horizontal transoms */}
      {Array.from({ length: rows - 1 }).map((_, i) => {
        const y = -height / 2 + t + ph * (i + 1)
        return (
          <mesh key={`mh${i}`} position={[0, y, 0]}>
            <boxGeometry args={[width - t * 2, 0.022, d]} />
            <meshStandardMaterial color={frameColor} roughness={0.2} metalness={0.8} envMapIntensity={1.0} />
          </mesh>
        )
      })}
      {/* Glass panels in each cell */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const x = -width / 2 + t + pw * (c + 0.5)
          const y = -height / 2 + t + ph * (r + 0.5)
          return <GlassPane key={`${r}-${c}`} width={pw - 0.028} height={ph - 0.028} position={[x, y, 0]} glassType={glassType} />
        })
      )}
      {/* Structural pressure plates (exterior caps) */}
      {Array.from({ length: cols - 1 }).map((_, i) => {
        const x = -width / 2 + t + pw * (i + 1)
        return (
          <mesh key={`pp${i}`} position={[x, 0, d * 0.55]}>
            <boxGeometry args={[0.016, height - t * 2, 0.012]} />
            <meshStandardMaterial color={frameColor} roughness={0.15} metalness={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── STOREFRONT: Commercial ground-floor with door opening ──
export function StorefrontWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.05, d = 0.1, doorW = width * 0.35
  const sideW = (width - doorW - t * 2) / 2
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Left fixed panel */}
      <GlassPane width={sideW - 0.02} height={height - t * 2 - 0.02} position={[-width / 2 + t + sideW / 2, 0, 0]} glassType={glassType} />
      {/* Center door frame + glass */}
      <WindowFrame width={doorW} height={height - t * 1.5} depth={d * 0.7} thickness={t * 0.7} color={frameColor} />
      <GlassPane width={doorW - t * 1.5} height={height - t * 3} glassType={glassType} />
      <LeverHandle position={[doorW / 2 - 0.05, -0.05, d * 0.35]} />
      {/* Right fixed panel */}
      <GlassPane width={sideW - 0.02} height={height - t * 2 - 0.02} position={[width / 2 - t - sideW / 2, 0, 0]} glassType={glassType} />
      {/* Transom bar */}
      <mesh position={[0, height * 0.3, 0]}>
        <boxGeometry args={[width - t * 2, 0.022, d]} />
        <meshStandardMaterial color={frameColor} roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Threshold */}
      <mesh position={[0, -height / 2 + t * 0.3, d * 0.2]}>
        <boxGeometry args={[doorW + 0.02, 0.015, d * 0.8]} />
        <meshStandardMaterial color="#666" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

// ── GENERIC FALLBACK (for unrecognized types) ──
export function GenericWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.06, d = 0.08
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      <LeverHandle position={[0, -height / 4, d * 0.3]} />
    </group>
  )
}
