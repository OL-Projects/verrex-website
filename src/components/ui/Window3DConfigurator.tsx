"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import { WindowModel, OPERABLE_TYPES } from "./window-3d/WindowModel"

// ═══════════════════════════════════════════
// Configuration constants
// ═══════════════════════════════════════════

const FRAME_COLORS = [
  { name: "White", value: "#f5f5f5" },
  { name: "Black", value: "#1a1a1a" },
  { name: "Bronze", value: "#5c4033" },
  { name: "Tan", value: "#c4a77d" },
  { name: "Grey", value: "#6b7280" },
]

const GLASS_TYPES = [
  { name: "Clear", value: "clear", desc: "Standard float glass" },
  { name: "Low-E", value: "low-e", desc: "Energy efficient coating" },
  { name: "Tinted", value: "tinted", desc: "Solar heat reduction" },
  { name: "Frosted", value: "frosted", desc: "Privacy glass" },
  { name: "Tempered", value: "tempered", desc: "Safety rated (CSA)" },
]

// ═══════════════════════════════════════════
// Main configurator component
// ═══════════════════════════════════════════

interface Window3DConfiguratorProps {
  windowType: string
  defaultWidth?: number
  defaultHeight?: number
  onConfigChange?: (config: { width: number; height: number; frameColor: string; glassType: string }) => void
}

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
  const [isOpen, setIsOpen] = useState(false)

  const MIN_SIZE = 12, MAX_SIZE = 120
  const isValidWidth = width >= MIN_SIZE && width <= MAX_SIZE
  const isValidHeight = height >= MIN_SIZE && height <= MAX_SIZE
  const isStandard = [24, 30, 36, 48, 60, 72].includes(width) || [36, 48, 60, 72, 84, 96].includes(height)
  const canOperate = OPERABLE_TYPES.has(windowType)

  const clamp = (v: number) => Math.max(MIN_SIZE, Math.min(MAX_SIZE, v))
  const setW = (v: number) => { setWidth(clamp(v)); onConfigChange?.({ width: clamp(v), height, frameColor, glassType }) }
  const setH = (v: number) => { setHeight(clamp(v)); onConfigChange?.({ width, height: clamp(v), frameColor, glassType }) }

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14]">
      {/* 3D Canvas — ONLY the window, no backdrop */}
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

            <WindowModel
              type={windowType} width={width} height={height}
              frameColor={frameColor} glassType={glassType} isOpen={isOpen}
            />

            <ContactShadows position={[0, -1.2, 0]} opacity={0.3} scale={5} blur={2.5} far={4} resolution={256} />
            <Environment preset="studio" />
            <OrbitControls
              makeDefault enableDamping dampingFactor={0.05}
              minDistance={1.5} maxDistance={6}
              minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 1.8}
              enablePan={false}
            />
          </Suspense>
        </Canvas>

        {/* Dimension overlay */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-mono">
          {width}&quot; W &times; {height}&quot; H
        </div>

        {/* Open/Close action button — bottom-right */}
        {canOperate && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute bottom-3 right-3 px-4 py-2 rounded-lg text-xs font-semibold backdrop-blur-md transition-all shadow-lg ${
              isOpen
                ? "bg-green-500/90 text-white hover:bg-green-600/90"
                : "bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700/90 ring-1 ring-slate-200/50 dark:ring-slate-700/50"
            }`}
          >
            {isOpen ? "✕ Close Window" : "↗ Open Window"}
          </button>
        )}
      </div>

      {/* Controls Panel */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0f1a]/80 backdrop-blur-md space-y-3">
        {/* Size inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Width</label>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setW(width - 1)} className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">−</button>
              <input type="number" min={MIN_SIZE} max={MAX_SIZE} value={width} onChange={(e) => setW(Number(e.target.value))}
                className={`w-16 h-7 text-center text-sm font-mono rounded-md border ${isValidWidth ? "border-slate-300 dark:border-slate-600" : "border-red-400"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40`} />
              <span className="text-xs text-slate-400">in</span>
              <button onClick={() => setW(width + 1)} className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">+</button>
            </div>
            <input type="range" min={MIN_SIZE} max={MAX_SIZE} step={1} value={width} onChange={(e) => setW(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600 mt-1" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Height</label>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setH(height - 1)} className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">−</button>
              <input type="number" min={MIN_SIZE} max={MAX_SIZE} value={height} onChange={(e) => setH(Number(e.target.value))}
                className={`w-16 h-7 text-center text-sm font-mono rounded-md border ${isValidHeight ? "border-slate-300 dark:border-slate-600" : "border-red-400"} bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40`} />
              <span className="text-xs text-slate-400">in</span>
              <button onClick={() => setH(height + 1)} className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">+</button>
            </div>
            <input type="range" min={MIN_SIZE} max={MAX_SIZE} step={1} value={height} onChange={(e) => setH(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600 mt-1" />
          </div>
        </div>

        {/* Validation */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isStandard ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
            {isStandard ? "✓ Standard Size (CSA A440)" : "Custom Size — verify NAFS"}
          </span>
          <span className="text-[10px] text-slate-400 ml-auto">{MIN_SIZE}&quot;–{MAX_SIZE}&quot;</span>
        </div>

        {/* Frame + Glass */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Frame</label>
            <div className="flex gap-1.5">
              {FRAME_COLORS.map((c) => (
                <button key={c.value} onClick={() => { setFrameColor(c.value); onConfigChange?.({ width, height, frameColor: c.value, glassType }) }}
                  className={`h-6 w-6 rounded-full border-2 transition-all ${frameColor === c.value ? "border-blue-500 scale-110 ring-2 ring-blue-500/30" : "border-slate-300 dark:border-slate-600 hover:scale-105"}`}
                  style={{ backgroundColor: c.value }} title={c.name} />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Glass</label>
            <div className="flex gap-1 flex-wrap">
              {GLASS_TYPES.map((g) => (
                <button key={g.value} onClick={() => { setGlassType(g.value); onConfigChange?.({ width, height, frameColor, glassType: g.value }) }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${glassType === g.value ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                  title={g.desc}>{g.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
