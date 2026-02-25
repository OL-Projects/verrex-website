"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, CrankHandle, Hinge, LockPoint, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Single Casement Window
// ONE sash panel, hinged on the LEFT stile, swings OUTWARD to the right.
// This is the standard casement — NOT a French casement (which has two panels).
// Hardware: 3 hinges on left, handle/lock on right stile, optional crank at bottom.
export function SingleCasementWindow({ width, height, frameColor, glassType, isOpen, showCrank = false }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean; showCrank?: boolean
}) {
  const t = 0.06, d = 0.08
  const sashW = width - t * 2
  const sashH = height - t * 2
  const glassW = sashW - t * 1.4
  const glassH = sashH - t * 1.4
  const sashRef = useRef<THREE.Group>(null)

  // Spring physics — single sash swings outward from left hinge
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const target = isOpen ? -Math.PI / 4 : 0  // swings outward (negative Y rotation = opens right)
    const angle = springStep(spring.current, target, dt, 120, 15)
    if (sashRef.current) sashRef.current.rotation.y = angle
  })

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Weatherstrip gaskets around inner perimeter */}
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
        <group ref={sashRef} position={[0, 0, 0]}>
          <group position={[sashW / 2, 0, 0]}>
            {/* Sash frame */}
            <WindowFrame width={sashW} height={sashH} depth={d * 0.5} thickness={t * 0.65} color={frameColor} />

            {/* Glass pane */}
            <GlassPane width={glassW} height={glassH} glassType={glassType} />

            {/* Handle on RIGHT stile (lock side) */}
            <mesh position={[sashW / 2 - t * 0.5, 0, d * 0.28]}>
              <boxGeometry args={[0.015, 0.06, 0.02]} />
              <meshStandardMaterial color="#999" roughness={0.3} metalness={0.5} />
            </mesh>

            {/* Multi-point lock on right stile */}
            <LockPoint position={[sashW / 2 - t * 0.3, sashH / 4, d * 0.2]} />
            <LockPoint position={[sashW / 2 - t * 0.3, -sashH / 4, d * 0.2]} />
          </group>
        </group>
      </group>

      {/* Crank handle at bottom frame — only shown on hand-cranked variant */}
      {showCrank && (
        <CrankHandle position={[0, -height / 2 + t * 0.3, d * 0.35]} />
      )}

      {/* Exterior screen behind the window */}
      <WindowScreen width={sashW - t} height={sashH - t} position={[0, 0, -d * 0.6]} />
    </group>
  )
}
