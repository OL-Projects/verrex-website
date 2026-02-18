"use client"

import { Suspense, useState, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei"
import * as THREE from "three"

// ── Frame helper: builds an extruded rectangular frame ──
function WindowFrame({
  width,
  height,
  depth,
  thickness,
  color,
}: {
  width: number
  height: number
  depth: number
  thickness: number
  color: string
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-width / 2, -height / 2)
    s.lineTo(width / 2, -height / 2)
    s.lineTo(width / 2, height / 2)
    s.lineTo(-width / 2, height / 2)
    s.lineTo(-width / 2, -height / 2)

    const hole = new THREE.Path()
    const iw = width / 2 - thickness
    const ih = height / 2 - thickness
    hole.moveTo(-iw, -ih)
    hole.lineTo(iw, -ih)
    hole.lineTo(iw, ih)
    hole.lineTo(-iw, ih)
    hole.lineTo(-iw, -ih)
    s.holes.push(hole)
    return s
  }, [width, height, thickness])

  const extrudeSettings = useMemo(
    () => ({ depth, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.005, bevelSegments: 3 }),
    [depth]
  )

  return (
    <mesh position={[0, 0, -depth / 2]}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
    </mesh>
  )
}

// ── Glass pane ──
function GlassPane({
  width,
  height,
  position = [0, 0, 0],
  glassType = "clear",
}: {
  width: number
  height: number
  position?: [number, number, number]
  glassType?: string
}) {
  const glassColor = glassType === "tinted" ? "#b8d4e3" : glassType === "frosted" ? "#e8eef2" : "#d6eaf8"
  const opacity = glassType === "frosted" ? 0.6 : 0.3
  const roughness = glassType === "frosted" ? 0.8 : 0.05

  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, 0.012]} />
      <meshPhysicalMaterial
        color={glassColor}
        transparent
        opacity={opacity}
        roughness={roughness}
        metalness={0.1}
        transmission={glassType === "frosted" ? 0.3 : 0.85}
        thickness={0.5}
        envMapIntensity={1.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ── Rubber seal strip ──
function Seal({ points, radius = 0.008 }: { points: [number, number, number][]; radius?: number }) {
  const curve = useMemo(() => {
    const vecs = points.map((p) => new THREE.Vector3(...p))
    return new THREE.CatmullRomCurve3(vecs, false)
  }, [points])

  return (
    <mesh>
      <tubeGeometry args={[curve, 32, radius, 8, false]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0} />
    </mesh>
  )
}

// ── Handle geometry ──
function Handle({ position, rotation = [0, 0, 0], type = "lever" }: { position: [number, number, number]; rotation?: [number, number, number]; type?: string }) {
  return (
    <group position={position} rotation={rotation as unknown as THREE.Euler}>
      {type === "lever" ? (
        <>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.03, 0.01, 0.04]} />
            <meshStandardMaterial color="#888" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.04, 0.02]}>
            <boxGeometry args={[0.02, 0.07, 0.015]} />
            <meshStandardMaterial color="#888" roughness={0.2} metalness={0.8} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 0, 0.02]}>
          <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
          <meshStandardMaterial color="#888" roughness={0.2} metalness={0.8} />
        </mesh>
      )}
    </group>
  )
}

// ═══════════════════════════════════════════
// WINDOW TYPE GEOMETRIES
// ═══════════════════════════════════════════

function DoubleHungWindow({ width, height, frameColor, glassType }: { width: number; height: number; frameColor: string; glassType: string }) {
  const t = 0.06
  const d = 0.08
  const sashH = (height - t) / 2
  const glassW = width - t * 2 - 0.02
  const glassH = sashH - t - 0.01

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Top sash frame */}
      <WindowFrame width={width - t * 2 + 0.01} height={sashH} depth={d * 0.6} thickness={t * 0.7} color={frameColor} />
      <group position={[0, sashH / 2 + t * 0.2, 0]}>
        <WindowFrame width={width - t * 2 + 0.01} height={sashH} depth={d * 0.6} thickness={t * 0.7} color={frameColor} />
      </group>
      {/* Top glass */}
      <GlassPane width={glassW} height={glassH} position={[0, sashH / 2 + t * 0.2, 0]} glassType={glassType} />
      {/* Bottom glass */}
      <GlassPane width={glassW} height={glassH} position={[0, -sashH / 2 + t * 0.1, 0.01]} glassType={glassType} />
      {/* Meeting rail */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width - t * 1.5, 0.025, d * 0.5]} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Handle */}
      <Handle position={[0, -0.05, d * 0.35]} type="lever" />
    </group>
  )
}

function CasementWindow({ width, height, frameColor, glassType }: { width: number; height: number; frameColor: string; glassType: string }) {
  const t = 0.06
  const d = 0.08
  const halfW = (width - t) / 2
  const glassW = halfW - t * 1.2
  const glassH = height - t * 2 - 0.02

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Center mullion */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.03, height - t * 2, d]} />
        <meshStandardMaterial color={frameColor} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Left glass */}
      <GlassPane width={glassW} height={glassH} position={[-halfW / 2 - 0.01, 0, 0]} glassType={glassType} />
      {/* Right glass */}
      <GlassPane width={glassW} height={glassH} position={[halfW / 2 + 0.01, 0, 0]} glassType={glassType} />
      {/* Crank handle */}
      <Handle position={[width / 4, -height / 4, d * 0.35]} type="crank" />
      {/* Hinges */}
      {[-height / 3, 0, height / 3].map((y, i) => (
        <mesh key={i} position={[-width / 2 + t * 0.3, y, d * 0.2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.05, 8]} />
          <meshStandardMaterial color="#777" roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function SlidingWindow({ width, height, frameColor, glassType }: { width: number; height: number; frameColor: string; glassType: string }) {
  const t = 0.06
  const d = 0.08
  const panelW = (width - t) / 2
  const glassW = panelW - t
  const glassH = height - t * 2 - 0.02

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      {/* Track rail top & bottom */}
      <mesh position={[0, height / 2 - t * 0.8, 0]}>
        <boxGeometry args={[width - t * 2, 0.008, d * 0.8]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, -height / 2 + t * 0.8, 0]}>
        <boxGeometry args={[width - t * 2, 0.008, d * 0.8]} />
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Left panel (fixed) */}
      <GlassPane width={glassW} height={glassH} position={[-panelW / 2, 0, -0.01]} glassType={glassType} />
      {/* Right panel (sliding, slightly forward) */}
      <GlassPane width={glassW} height={glassH} position={[panelW / 2, 0, 0.01]} glassType={glassType} />
      {/* Right panel sub-frame */}
      <WindowFrame width={panelW} height={height - t * 1.5} depth={d * 0.4} thickness={t * 0.5} color={frameColor} />
      {/* Handle */}
      <Handle position={[panelW * 0.15, 0, d * 0.3]} type="lever" />
    </group>
  )
}

function BayBowWindow({ width, height, frameColor, glassType }: { width: number; height: number; frameColor: string; glassType: string }) {
  const centerW = width * 0.5
  const sideW = width * 0.28
  const angle = Math.PI / 7
  const d = 0.08
  const t = 0.06

  return (
    <group>
      {/* Center panel */}
      <group position={[0, 0, 0.1]}>
        <WindowFrame width={centerW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={centerW - t * 2 - 0.02} height={height - t * 2 - 0.02} position={[0, 0, 0]} glassType={glassType} />
      </group>
      {/* Left angled panel */}
      <group position={[-centerW / 2 - sideW * 0.35, 0, 0.03]} rotation={[0, angle, 0]}>
        <WindowFrame width={sideW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={sideW - t * 2 - 0.02} height={height - t * 2 - 0.02} position={[0, 0, 0]} glassType={glassType} />
      </group>
      {/* Right angled panel */}
      <group position={[centerW / 2 + sideW * 0.35, 0, 0.03]} rotation={[0, -angle, 0]}>
        <WindowFrame width={sideW} height={height} depth={d} thickness={t} color={frameColor} />
        <GlassPane width={sideW - t * 2 - 0.02} height={height - t * 2 - 0.02} position={[0, 0, 0]} glassType={glassType} />
      </group>
    </group>
  )
}

function AwningWindow({ width, height, frameColor, glassType }: { width: number; height: number; frameColor: string; glassType: string }) {
  const t = 0.06
  const d = 0.08
  const glassW = width - t * 2 - 0.02
  const glassH = height - t * 2 - 0.02

  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={glassW} height={glassH} position={[0, 0, 0]} glassType={glassType} />
      {/* Top hinge bar */}
      <mesh position={[0, height / 2 - t, d * 0.2]}>
        <boxGeometry args={[width - t * 3, 0.012, 0.025]} />
        <meshStandardMaterial color="#777" roughness={0.3} metalness={0.7} />
      </mesh>
      <Handle position={[0, -height / 3, d * 0.35]} type="lever" />
    </group>
  )
}

function PictureWindow({ width, height, frameColor, glassType }: { width: number; height: number; frameColor: string; glassType: string }) {
  const t = 0.07
  const d = 0.08

  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.01} height={height - t * 2 - 0.01} position={[0, 0, 0]} glassType={glassType} />
    </group>
  )
}

function GenericWindow({ width, height, frameColor, glassType }: { width: number; height: number; frameColor: string; glassType: string }) {
  const t = 0.06
  const d = 0.08

  return (
    <group>
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />
      <GlassPane width={width - t * 2 - 0.02} height={height - t * 2 - 0.02} position={[0, 0, 0]} glassType={glassType} />
      <Handle position={[0, -height / 4, d * 0.35]} type="lever" />
    </group>
  )
}

// ═══════════════════════════════════════════
// Scene wrapper with subtle rotation
// ═══════════════════════════════════════════

function WindowScene({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.08
    }
  })
  return (
    <group ref={groupRef}>
      <Center>{children}</Center>
    </group>
  )
}

// ═══════════════════════════════════════════
// Map window type ID → component
// ═══════════════════════════════════════════

function WindowModel({
  type, width, height, frameColor, glassType,
}: {
  type: string; width: number; height: number; frameColor: string; glassType: string
}) {
  // Convert inches to 3D units (scale down)
  const w = width / 40
  const h = height / 40

  const props = { width: w, height: h, frameColor, glassType }

  switch (type) {
    case "double-hung": return <DoubleHungWindow {...props} />
    case "casement": return <CasementWindow {...props} />
    case "sliding": return <SlidingWindow {...props} />
    case "bay-bow": return <BayBowWindow {...props} />
    case "awning": return <AwningWindow {...props} />
    case "picture": return <PictureWindow {...props} />
    default: return <GenericWindow {...props} />
  }
}

// ═══════════════════════════════════════════
// Main exported configurator
// ═══════════════════════════════════════════

interface Window3DConfiguratorProps {
  windowType: string
  defaultWidth?: number
  defaultHeight?: number
  onConfigChange?: (config: { width: number; height: number; frameColor: string; glassType: string }) => void
}

const FRAME_COLORS = [
  { name: "White", value: "#f5f5f5" },
  { name: "Black", value: "#1a1a1a" },
  { name: "Bronze", value: "#5c4033" },
  { name: "Tan", value: "#c4a77d" },
  { name: "Grey", value: "#6b7280" },
]

const GLASS_TYPES = [
  { name: "Clear", value: "clear" },
  { name: "Tinted", value: "tinted" },
  { name: "Frosted", value: "frosted" },
]

export function Window3DConfigurator({
  windowType,
  defaultWidth = 36,
  defaultHeight = 48,
  onConfigChange,
}: Window3DConfiguratorProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [height, setHeight] = useState(defaultHeight)
  const [frameColor, setFrameColor] = useState("#f5f5f5")
  const [glassType, setGlassType] = useState("clear")

  const handleWidthChange = (v: number) => {
    setWidth(v)
    onConfigChange?.({ width: v, height, frameColor, glassType })
  }
  const handleHeightChange = (v: number) => {
    setHeight(v)
    onConfigChange?.({ width, height: v, frameColor, glassType })
  }

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14]">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow shadow-mapSize={1024} />
            <directionalLight position={[-3, 3, -3]} intensity={0.3} />
            <spotLight position={[0, 5, 2]} intensity={0.4} angle={0.6} penumbra={0.8} />

            <WindowScene>
              <WindowModel type={windowType} width={width} height={height} frameColor={frameColor} glassType={glassType} />
            </WindowScene>

            <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={5} blur={2.5} far={4} resolution={256} />
            <Environment preset="apartment" />
            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.05}
              minDistance={1.5}
              maxDistance={6}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 1.8}
              enablePan={false}
            />
          </Suspense>
        </Canvas>

        {/* Dimension overlay */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-mono">
          {width}&quot; W &times; {height}&quot; H
        </div>
      </div>

      {/* Controls Panel */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-md space-y-4">
        {/* Size sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Width: {width}&quot;
            </label>
            <input
              type="range"
              min={18}
              max={96}
              step={1}
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>18&quot;</span><span>96&quot;</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Height: {height}&quot;
            </label>
            <input
              type="range"
              min={18}
              max={96}
              step={1}
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>18&quot;</span><span>96&quot;</span>
            </div>
          </div>
        </div>

        {/* Frame color & glass type */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Frame Colour</label>
            <div className="flex gap-2">
              {FRAME_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setFrameColor(c.value); onConfigChange?.({ width, height, frameColor: c.value, glassType }) }}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${frameColor === c.value ? "border-blue-500 scale-110 ring-2 ring-blue-500/30" : "border-slate-300 dark:border-slate-600 hover:scale-105"}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">Glass Type</label>
            <div className="flex gap-1.5">
              {GLASS_TYPES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => { setGlassType(g.value); onConfigChange?.({ width, height, frameColor, glassType: g.value }) }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${glassType === g.value ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
