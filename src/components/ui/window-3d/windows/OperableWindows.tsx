"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, LeverHandle, CrankHandle, TrackRail, Weatherstrip, WindowScreen, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

type WP = { width: number; height: number; frameColor: string; glassType: string; isOpen: boolean }

// ── SLIDING: Right panel glides left on track ──
export function SlidingWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, panelW = (width - t) / 2
  const glassW = panelW - t, glassH = height - t * 2 - 0.02
  const slideRef = useRef<THREE.Group>(null)
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const v = springStep(spring.current, isOpen ? -panelW * 0.85 : 0, dt, 130, 18)
    if (slideRef.current) slideRef.current.position.x = v
  })
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <TrackRail width={width - t * 2} position={[0, height / 2 - t * 0.8, 0]} color={frameColor} />
      <TrackRail width={width - t * 2} position={[0, -height / 2 + t * 0.8, 0]} color={frameColor} />
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, height / 2 - t * 0.4, d * 0.12]} />
      <GlassPane width={glassW} height={glassH} position={[-panelW / 2, 0, -0.01]} glassType={glassType} />
      <group ref={slideRef}>
        <group position={[panelW / 2, 0, 0.01]}>
          <WindowFrame width={panelW} height={height - t * 1.5} depth={d * 0.4} thickness={t * 0.5} color={frameColor} />
          <GlassPane width={glassW} height={glassH} glassType={glassType} />
          <LeverHandle position={[-panelW * 0.3, 0, d * 0.25]} />
        </group>
      </group>
      <WindowScreen width={width - t * 2.5} height={height - t * 2.5} position={[0, 0, -d * 0.6]} />
    </group>
  )
}

// ── AWNING: Hinges outward from top ──
export function AwningWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const pivotRef = useRef<THREE.Group>(null)
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const v = springStep(spring.current, isOpen ? -Math.PI / 6 : 0, dt, 150, 17)
    if (pivotRef.current) pivotRef.current.rotation.x = v
  })
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
      <mesh position={[0, height / 2 - t, d * 0.2]}>
        <boxGeometry args={[width - t * 3, 0.014, 0.028]} />
        <meshStandardMaterial color="#888" roughness={0.15} metalness={0.9} />
      </mesh>
      <CrankHandle position={[0, -height / 3, d * 0.3]} />
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, -height / 2 + t * 0.5, d * 0.12]} />
    </group>
  )
}

// ── HOPPER: Hinges inward from bottom ──
export function HopperWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const pivotRef = useRef<THREE.Group>(null)
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const v = springStep(spring.current, isOpen ? Math.PI / 7 : 0, dt, 140, 18)
    if (pivotRef.current) pivotRef.current.rotation.x = v
  })
  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <group position={[0, -height / 2 + t, 0]}>
        <group ref={pivotRef}>
          <GlassPane width={glassW} height={glassH} position={[0, height / 2 - t, 0]} glassType={glassType} />
        </group>
      </group>
      <LeverHandle position={[0, height / 4, d * 0.3]} />
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, height / 2 - t * 0.5, d * 0.12]} />
    </group>
  )
}

// ── SKYLIGHT: Top-hinged, angled, opens outward ──
export function SkylightWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.06, glassW = width - t * 2 - 0.02, glassH = height - t * 2 - 0.02
  const pivotRef = useRef<THREE.Group>(null)
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const v = springStep(spring.current, isOpen ? -Math.PI / 6 : 0, dt, 120, 20)
    if (pivotRef.current) pivotRef.current.rotation.x = v
  })
  return (
    <group rotation={[Math.PI / 6, 0, 0]}>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <group position={[0, height / 2 - t, 0]}>
        <group ref={pivotRef} position={[0, -(height / 2 - t), 0]}>
          <GlassPane width={glassW} height={glassH} position={[0, height / 2 - t, 0]} glassType={glassType} />
        </group>
      </group>
      <Weatherstrip width={width - t * 1.8} height={0.005} position={[0, 0, d * 0.12]} />
    </group>
  )
}

// ── JALOUSIE / LOUVRE: Horizontal slats rotate ──
export function JalousieWindow({ width, height, frameColor, glassType, isOpen }: WP) {
  const t = 0.06, d = 0.08, slatCount = 8
  const slatH = (height - t * 2) / slatCount
  const slatRefs = useRef<(THREE.Group | null)[]>([])
  const spring = useRef<SpringState>({ pos: 0, vel: 0 })
  useFrame((_, dt) => {
    const v = springStep(spring.current, isOpen ? Math.PI / 4 : 0, dt, 160, 15)
    slatRefs.current.forEach(r => { if (r) r.rotation.x = v })
  })
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
