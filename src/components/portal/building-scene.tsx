"use client"

import { useState, useMemo, useCallback } from "react"
import { Canvas, ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Html, Grid, PerspectiveCamera, Edges } from "@react-three/drei"
import * as THREE from "three"
import { WINDOW_TYPES } from "@/lib/estimate-config"

/* ─── Types ─── */
export interface PlacedWindow {
  id: string
  face: "front" | "back" | "left" | "right"
  posU: number
  posV: number
  measurementId: string
  label: string
  dims: string
  windowType?: string
  typeKey?: string
  wInches?: number
  hInches?: number
}

export interface BuildingFloor {
  id: string
  name: string
  width: number
  depth: number
  ceilingHeight: number
  color: string
  windows: PlacedWindow[]
}

interface SceneProps {
  floors: BuildingFloor[]
  activeWindowId: string | null
  moveMode: boolean
  compileMode: boolean
  onFaceClick: (floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => void
  onPlacedWindowClick: (windowId: string) => void
  selectedPlacedId: string | null
  solidMode: boolean
}

/* ─── Mini fenestration SVG for faces (no translations needed) ─── */
function FenestrationSVG({ typeKey, w, h }: { typeKey?: string; w: number; h: number }) {
  const cfg = typeKey ? WINDOW_TYPES[typeKey] : null
  const modules = cfg?.modules || ["FIX"]
  const n = modules.length
  const svgW = 100
  const svgH = svgW * (h / (w || 1))
  const f = 4
  const m = 3
  const iW = svgW - 2 * f
  const iH = svgH - 2 * f
  const mw = (iW - (n - 1) * m) / n

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={svgW} height={svgH} fill="#1e3a5f" rx={2} />
      <rect x={f} y={f} width={iW} height={iH} fill="#dbeafe" rx={1} />
      {modules.map((mod, i) => {
        const mx = f + i * (mw + m)
        const cx = mx + mw / 2
        const cy = f + iH / 2
        if (i > 0) return (
          <g key={i}>
            <rect x={mx - m} y={f} width={m} height={iH} fill="#1e3a5f" />
            {renderModule(mod, mx, f, mw, iH, cx, cy)}
          </g>
        )
        return <g key={i}>{renderModule(mod, mx, f, mw, iH, cx, cy)}</g>
      })}
    </svg>
  )
}

function renderModule(mod: string, mx: number, my: number, mw: number, mh: number, cx: number, cy: number) {
  const s = 2
  const sx = mx + s, sy = my + s, sw = mw - 2 * s, sh = mh - 2 * s
  const isLeft = mod === "CAS-L" || mod === "TT-L"

  if (mod === "FIX" || mod === "FIX-D") {
    return <rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} />
  }
  if (mod === "CAS-L" || mod === "CAS-R") {
    const hx = isLeft ? sx : sx + sw
    const ohx = isLeft ? sx + sw : sx
    return (
      <g>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} />
        <line x1={hx} y1={cy} x2={ohx} y2={sy} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} />
        <line x1={hx} y1={cy} x2={ohx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} />
      </g>
    )
  }
  if (mod === "TT-L" || mod === "TT-R") {
    const hx = isLeft ? sx : sx + sw
    const ohx = isLeft ? sx + sw : sx
    return (
      <g>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} />
        <line x1={hx} y1={cy} x2={ohx} y2={sy} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} />
        <line x1={hx} y1={cy} x2={ohx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} />
        <line x1={cx} y1={sy} x2={sx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.6} opacity={0.35} strokeDasharray="3 2" />
        <line x1={cx} y1={sy} x2={sx + sw} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.6} opacity={0.35} strokeDasharray="3 2" />
      </g>
    )
  }
  if (mod === "AWNING") {
    return (
      <g>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} />
        <line x1={cx} y1={sy} x2={sx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} />
        <line x1={cx} y1={sy} x2={sx + sw} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} />
      </g>
    )
  }
  if (mod === "SLIDE" || mod === "SLIDE-D") {
    return (
      <g>
        <rect x={sx} y={sy} width={sw} height={sh} fill={mod === "SLIDE-D" ? "#9ca3af" : "#dbeafe"} stroke="#1e3a5f" strokeWidth={1.5} />
        <line x1={sx + 6} y1={cy} x2={sx + sw - 6} y2={cy} stroke="#1e3a5f" strokeWidth={1} />
        <polyline points={`${sx + sw - 12},${cy - 4} ${sx + sw - 6},${cy} ${sx + sw - 12},${cy + 4}`} fill="none" stroke="#1e3a5f" strokeWidth={1} />
      </g>
    )
  }
  if (mod === "SWING" || mod.startsWith("SWING")) {
    return (
      <g>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#9ca3af" stroke="#1e3a5f" strokeWidth={1.5} />
        <rect x={sx + 4} y={sy + 4} width={sw - 8} height={sh * 0.3} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={0.6} rx={1} />
        <path d={`M ${sx + sw} ${sy + sh} A ${sw * 0.6} ${sw * 0.6} 0 0 1 ${sx + sw - sw * 0.5} ${sy + sh - sw * 0.5}`}
          fill="none" stroke="#3b82f6" strokeWidth={0.8} strokeDasharray="3 2" />
      </g>
    )
  }
  if (mod === "FOLD") {
    return (
      <g>
        <rect x={sx} y={sy} width={sw} height={sh} fill="#9ca3af" stroke="#1e3a5f" strokeWidth={1.5} />
        <rect x={sx + 3} y={sy + 3} width={sw - 6} height={sh * 0.4} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={0.5} rx={1} />
        <line x1={cx} y1={sy} x2={cx} y2={sy + sh} stroke="#f97316" strokeWidth={0.8} strokeDasharray="4 2" />
      </g>
    )
  }
  // Default: FIX fallback
  return <rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} />
}

/* ─── Window marker on face ─── */
function FaceWindowCard({ pw, isSelected, winW, winH, onClick, compileMode }: {
  pw: PlacedWindow; isSelected: boolean; winW: number; winH: number
  onClick: () => void; compileMode: boolean
}) {
  const ratio = (pw.hInches || 48) / (pw.wInches || 48)
  const adjH = Math.min(winH, winW * ratio * 1.2)
  const adjW = adjH / ratio
  const htmlW = Math.max(50, adjW * 50)
  const htmlH = htmlW * ratio

  return (
    <group>
      {/* Clickable hitbox */}
      <mesh onClick={e => { e.stopPropagation(); onClick() }}>
        <planeGeometry args={[adjW + 0.1, adjH + 0.1]} />
        <meshStandardMaterial color="transparent" transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      {/* SVG render via Html */}
      <Html position={[0, 0, 0.02]} center style={{ pointerEvents: compileMode ? "auto" : "none" }}
        distanceFactor={6}>
        <div style={{ width: htmlW, height: htmlH }} className={`${isSelected ? "ring-2 ring-amber-400 rounded-sm" : ""}`}
          onClick={e => { e.stopPropagation(); onClick() }}>
          <FenestrationSVG typeKey={pw.typeKey} w={pw.wInches || 48} h={pw.hInches || 48} />
        </div>
      </Html>
      {/* Label */}
      <Html position={[0, -adjH / 2 - 0.18, 0]} center style={{ pointerEvents: compileMode ? "auto" : "none" }}>
        <div className={`text-[7px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm ${isSelected ? "bg-amber-500 text-white" : "bg-slate-800 text-white"}`}>
          {pw.label} — {pw.dims}
        </div>
      </Html>
    </group>
  )
}

/* ─── Ghost preview during drag ─── */
function GhostWindow() {
  return (
    <group>
      <mesh>
        <planeGeometry args={[0.6, 0.5]} />
        <meshStandardMaterial color="#a855f7" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.64, 0.54]} />
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ─── Single Floor ─── */
function FloorMesh({ floor, yOffset, activeWindowId, moveMode, compileMode, onFaceClick, onPlacedWindowClick, selectedPlacedId, solidMode }: {
  floor: BuildingFloor; yOffset: number; solidMode: boolean; moveMode: boolean; compileMode: boolean
} & Pick<SceneProps, "activeWindowId" | "onFaceClick" | "onPlacedWindowClick" | "selectedPlacedId">) {
  const [hoveredFace, setHoveredFace] = useState<string | null>(null)
  const [ghostPos, setGhostPos] = useState<{ face: string; pos: [number, number, number]; rot: [number, number, number] } | null>(null)
  const { width: w, depth: d, ceilingHeight: h } = floor
  const canPlace = !compileMode && (!!activeWindowId || moveMode)

  const computeFaceHit = useCallback((e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const n = e.face?.normal
    if (!n) return null
    let face: "front" | "back" | "left" | "right" | null = null
    if (n.z > 0.5) face = "front"
    else if (n.z < -0.5) face = "back"
    else if (n.x > 0.5) face = "right"
    else if (n.x < -0.5) face = "left"
    if (!face) return null
    const local = e.point.clone(); local.y -= yOffset
    let u = 0.5, v = local.y / h
    if (face === "front" || face === "back") u = (local.x + w / 2) / w
    else u = (local.z + d / 2) / d
    v = Math.max(0.1, Math.min(0.9, v)); u = Math.max(0.05, Math.min(0.95, u))
    return { face, u, v }
  }, [w, d, h, yOffset])

  const toWorldPos = useCallback((face: string, u: number, v: number): { pos: [number, number, number]; rot: [number, number, number] } => {
    let pos: [number, number, number] = [0, 0, 0]; let rot: [number, number, number] = [0, 0, 0]
    if (face === "front") { pos = [(u - 0.5) * w, v * h, d / 2 + 0.04]; rot = [0, 0, 0] }
    else if (face === "back") { pos = [(u - 0.5) * w, v * h, -d / 2 - 0.04]; rot = [0, Math.PI, 0] }
    else if (face === "right") { pos = [w / 2 + 0.04, v * h, (u - 0.5) * d]; rot = [0, Math.PI / 2, 0] }
    else if (face === "left") { pos = [-w / 2 - 0.04, v * h, (u - 0.5) * d]; rot = [0, -Math.PI / 2, 0] }
    return { pos, rot }
  }, [w, d, h])

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!canPlace) { setHoveredFace(null); setGhostPos(null); return }
    e.stopPropagation()
    const hit = computeFaceHit(e)
    if (hit) {
      setHoveredFace(hit.face)
      if (moveMode) {
        const wp = toWorldPos(hit.face, hit.u, hit.v)
        setGhostPos({ face: hit.face, ...wp })
      }
    } else {
      setHoveredFace(null); setGhostPos(null)
    }
  }, [canPlace, moveMode, computeFaceHit, toWorldPos])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!canPlace) return
    const hit = computeFaceHit(e)
    if (!hit) return
    onFaceClick(floor.id, hit.face as "front" | "back" | "left" | "right", hit.u, hit.v)
    setGhostPos(null)
  }, [canPlace, computeFaceHit, onFaceClick, floor.id])

  const wc = solidMode ? "#ffffff" : floor.color
  const wo = solidMode ? 0.98 : (hoveredFace ? 0.5 : 0.25)
  const ec = hoveredFace ? (moveMode ? "#a855f7" : "#3b82f6") : (solidMode ? "#c8d3dd" : "#475569")

  return (
    <group position={[0, yOffset, 0]}>
      <mesh position={[0, h / 2, 0]} onClick={handleClick}
        onPointerMove={handlePointerMove} onPointerOut={() => { setHoveredFace(null); setGhostPos(null) }}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={hoveredFace ? (moveMode ? "#c084fc" : "#60a5fa") : wc}
          transparent opacity={wo} side={THREE.DoubleSide} />
        <Edges color={ec} linewidth={solidMode ? 0.8 : 1.5} />
      </mesh>
      <Html position={[-(w / 2) - 0.3, h / 2, 0]} center style={{ pointerEvents: "none" }}>
        <div className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">{floor.name}</div>
      </Html>
      {/* Ghost preview in move/drag mode */}
      {ghostPos && (
        <group position={ghostPos.pos} rotation={ghostPos.rot}>
          <GhostWindow />
        </group>
      )}
      {floor.windows.map(pw => {
        const isSelected = pw.id === selectedPlacedId
        const winW = Math.min(w, d) * 0.15; const winH = h * 0.3
        const wp = toWorldPos(pw.face, pw.posU, pw.posV)
        return (
          <group key={pw.id} position={wp.pos} rotation={wp.rot}>
            <FaceWindowCard pw={pw} isSelected={isSelected} winW={winW} winH={winH}
              onClick={() => onPlacedWindowClick(pw.id)} compileMode={compileMode} />
          </group>
        )
      })}
    </group>
  )
}

/* ─── Ground-level direction signposts ─── */
function DirectionLabels({ maxW, maxD }: { maxW: number; maxD: number }) {
  return <>{([
    { text: "FRONT", arrow: "↑", pos: [0, 0.15, maxD / 2 + 0.9] as [number, number, number] },
    { text: "BACK", arrow: "↓", pos: [0, 0.15, -maxD / 2 - 0.9] as [number, number, number] },
    { text: "LEFT", arrow: "→", pos: [-maxW / 2 - 0.9, 0.15, 0] as [number, number, number] },
    { text: "RIGHT", arrow: "←", pos: [maxW / 2 + 0.9, 0.15, 0] as [number, number, number] },
  ]).map(l => (
    <Html key={l.text} position={l.pos} center style={{ pointerEvents: "none" }}>
      <div className="flex items-center gap-1 text-[9px] font-black tracking-wider text-slate-600 dark:text-slate-300 uppercase bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-300 dark:border-white/15 shadow-sm">
        <span className="text-blue-500 text-[11px]">{l.arrow}</span>
        <span>{l.text}</span>
      </div>
    </Html>
  ))}</>
}

/* ─── Main Scene ─── */
export function BuildingScene({ floors, activeWindowId, moveMode, compileMode, onFaceClick, onPlacedWindowClick, selectedPlacedId, solidMode }: SceneProps) {
  const isSolid = solidMode || compileMode
  const maxW = Math.max(...floors.map(f => f.width), 8)
  const maxD = Math.max(...floors.map(f => f.depth), 6)
  const totalH = floors.reduce((s, f) => s + f.ceilingHeight, 0)
  const camDist = Math.max(maxW, maxD, totalH) * 1.8
  const offsets = useMemo(() => { const o: number[] = []; let y = 0; for (const f of floors) { o.push(y); y += f.ceilingHeight }; return o }, [floors])

  return (
    <Canvas style={{ width: "100%", height: "100%" }} shadows>
      <PerspectiveCamera makeDefault position={[camDist * 0.7, camDist * 0.5, camDist * 0.7]} fov={45} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08}
        enabled={!moveMode}
        minPolarAngle={Math.PI * 0.1} maxPolarAngle={Math.PI * 0.42}
        minDistance={4} maxDistance={camDist * 3} target={[0, totalH / 2, 0]} />
      <ambientLight intensity={isSolid ? 0.9 : 0.6} />
      <directionalLight position={[10, 15, 10]} intensity={isSolid ? 0.4 : 0.8} />
      {!isSolid && <Grid args={[50, 50]} cellSize={1} cellThickness={0.5}
        cellColor="#94a3b8" sectionSize={5} sectionColor="#64748b"
        fadeDistance={30} position={[0, -0.01, 0]} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={isSolid ? "#f8fafc" : "#e2e8f0"} transparent opacity={isSolid ? 1 : 0.3} />
      </mesh>
      {floors.map((floor, i) => (
        <FloorMesh key={floor.id} floor={floor} yOffset={offsets[i]}
          activeWindowId={activeWindowId} moveMode={moveMode} compileMode={compileMode}
          onFaceClick={onFaceClick} onPlacedWindowClick={onPlacedWindowClick}
          selectedPlacedId={selectedPlacedId} solidMode={isSolid} />
      ))}
      <DirectionLabels maxW={maxW} maxD={maxD} />
    </Canvas>
  )
}
