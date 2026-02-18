"use client"
import { WindowFrame, Weatherstrip } from "../WindowParts"
import { GlassPane } from "../GlassPane"

type SP = { width: number; height: number; frameColor: string; glassType: string }

// ── BAY & BOW: 3-panel angled bay projection ──
// Real bay window: center panel faces forward, two side panels angle back
// at ~30° to meet the wall plane. All panels share a continuous head/sill.
export function BayBowWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.06, d = 0.08
  const centerW = width * 0.45
  const sideW = width * 0.32
  const bayAngle = Math.PI / 5.5 // ~33° — typical bay angle
  const bayDepth = Math.sin(bayAngle) * sideW // how far it projects outward
  const sideOffsetX = centerW / 2 + Math.cos(bayAngle) * sideW / 2
  const sideOffsetZ = bayDepth / 2
  const glassH = height - t * 2 - 0.02

  return (
    <group>
      {/* Continuous head (top rail) */}
      <mesh position={[0, height / 2 - t / 2, bayDepth / 2]}>
        <boxGeometry args={[width, t, bayDepth + d]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
      {/* Continuous sill (bottom rail) */}
      <mesh position={[0, -height / 2 + t / 2, bayDepth / 2]}>
        <boxGeometry args={[width, t * 1.2, bayDepth + d + 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>

      {/* Center panel — flush at front */}
      <group position={[0, 0, bayDepth]}>
        <WindowFrame width={centerW} height={height - t * 2} depth={d} thickness={t * 0.7} color={frameColor} />
        <GlassPane width={centerW - t * 1.5} height={glassH} glassType={glassType} />
      </group>

      {/* Left angled panel — rotates from center edge back to wall */}
      <group position={[-sideOffsetX, 0, sideOffsetZ]} rotation={[0, bayAngle, 0]}>
        <WindowFrame width={sideW} height={height - t * 2} depth={d} thickness={t * 0.7} color={frameColor} />
        <GlassPane width={sideW - t * 1.5} height={glassH} glassType={glassType} />
      </group>

      {/* Right angled panel — mirror of left */}
      <group position={[sideOffsetX, 0, sideOffsetZ]} rotation={[0, -bayAngle, 0]}>
        <WindowFrame width={sideW} height={height - t * 2} depth={d} thickness={t * 0.7} color={frameColor} />
        <GlassPane width={sideW - t * 1.5} height={glassH} glassType={glassType} />
      </group>

      {/* Mullion posts at panel joints (vertical) */}
      <mesh position={[-centerW / 2, 0, bayDepth - d / 2]}>
        <boxGeometry args={[t * 0.8, height - t * 2, d]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
      <mesh position={[centerW / 2, 0, bayDepth - d / 2]}>
        <boxGeometry args={[t * 0.8, height - t * 2, d]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>

      {/* Interior seat board / shelf */}
      <mesh position={[0, -height / 2 + t * 1.3, bayDepth * 0.45]}>
        <boxGeometry args={[width * 0.85, 0.02, bayDepth * 0.85]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.02} />
      </mesh>
    </group>
  )
}

// ── PICTURE / FIXED: Non-operable, maximum light ──
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

// ── GARDEN: Trapezoid box projecting outward ──
// Real garden window: rear frame mounts flush to wall opening,
// front glass panel is smaller (angled sides converge), top slopes down,
// bottom is a flat shelf. 4 glass faces + shelf.
export function GardenWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.06, d = 0.08, projD = 0.25
  const innerW = width - t * 2 - 0.02
  const innerH = height - t * 2 - 0.02
  const frontW = innerW * 0.85 // front is narrower (trapezoid shape)
  const frontH = innerH * 0.8

  return (
    <group>
      {/* Rear frame — mounts to wall opening */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Front glass panel (smaller, centered) */}
      <group position={[0, -innerH * 0.05, projD]}>
        <mesh>
          <boxGeometry args={[frontW + t, frontH + t, t * 0.6]} />
          <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
        </mesh>
        <GlassPane width={frontW} height={frontH} glassType={glassType} />
      </group>

      {/* Top sloped glass (angled from rear top to front top) */}
      <group position={[0, innerH / 2 - 0.02, projD / 2]} rotation={[-Math.PI / 5, 0, 0]}>
        <GlassPane width={frontW} height={projD * 1.1} glassType={glassType} />
        {/* Top frame rail */}
        <mesh position={[0, 0, -0.005]}>
          <boxGeometry args={[frontW + t, projD * 1.1 + t * 0.5, t * 0.4]} />
          <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
        </mesh>
      </group>

      {/* Left side panel (trapezoid — connects rear to front) */}
      <group position={[-(innerW / 2 + frontW / 2) / 4 - 0.01, -innerH * 0.05, projD / 2]} rotation={[0, Math.PI / 2 + 0.15, 0]}>
        <GlassPane width={projD * 0.95} height={frontH} glassType={glassType} />
      </group>

      {/* Right side panel */}
      <group position={[(innerW / 2 + frontW / 2) / 4 + 0.01, -innerH * 0.05, projD / 2]} rotation={[0, -(Math.PI / 2 + 0.15), 0]}>
        <GlassPane width={projD * 0.95} height={frontH} glassType={glassType} />
      </group>

      {/* Bottom shelf — flat, opaque */}
      <mesh position={[0, -innerH / 2 + 0.01, projD / 2]}>
        <boxGeometry args={[innerW, 0.025, projD]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.02} />
      </mesh>

      {/* Support brackets underneath */}
      {[-innerW / 3, 0, innerW / 3].map((x, i) => (
        <mesh key={i} position={[x, -innerH / 2 - 0.02, projD * 0.4]}>
          <boxGeometry args={[0.02, 0.04, 0.08]} />
          <meshStandardMaterial color="#777" roughness={0.2} metalness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ── TRANSOM: Decorative panel above doors/windows with muntin grid ──
export function TransomWindow({ width, height, frameColor, glassType }: SP) {
  const t = 0.06, d = 0.08
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.02} height={height - t * 2 - 0.02} glassType={glassType} />
      <mesh>
        <boxGeometry args={[0.01, height - t * 2, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
      <mesh>
        <boxGeometry args={[width - t * 2, 0.01, d * 0.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.45} metalness={0.02} />
      </mesh>
    </group>
  )
}

// ── GLASS BLOCK: Grid of individual glass blocks with mortar ──
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
