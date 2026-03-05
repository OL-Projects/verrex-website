"use client"

import { useState, useMemo, useCallback, useRef, memo } from "react"
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

interface LiveMovePos {
  windowId: string
  floorId: string
  face: "front" | "back" | "left" | "right"
  posU: number
  posV: number
}

interface ActiveWindowConfig {
  typeKey: string
  wInches: number
  hInches: number
  label: string
}

interface SceneProps {
  floors: BuildingFloor[]
  activeWindowId: string | null
  activeWindowConfig?: ActiveWindowConfig | null
  moveMode: boolean
  compileMode: boolean
  onFaceClick: (floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => void
  onPlacedWindowClick: (windowId: string) => void
  selectedPlacedId: string | null
  solidMode: boolean
  unit?: "ft" | "m"
  selectMode?: boolean
  onDeselect?: () => void
}

/* ─── Fenestration SVG (unchanged) ─── */
function FenestrationSVG({ typeKey, w, h }: { typeKey?: string; w: number; h: number }) {
  const cfg = typeKey ? WINDOW_TYPES[typeKey] : null
  const modules = cfg?.modules || ["FIX"]
  const n = modules.length
  const svgW = 100
  const svgH = svgW * (h / (w || 1))
  const f = 4; const m = 3
  const iW = svgW - 2 * f; const iH = svgH - 2 * f
  const mw = (iW - (n - 1) * m) / n
  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "100%" }}>
      <rect x={0} y={0} width={svgW} height={svgH} fill="#1e3a5f" rx={2} />
      <rect x={f} y={f} width={iW} height={iH} fill="#dbeafe" rx={1} />
      {modules.map((mod, i) => {
        const mx = f + i * (mw + m); const cx = mx + mw / 2; const cy = f + iH / 2
        if (i > 0) return <g key={i}><rect x={mx - m} y={f} width={m} height={iH} fill="#1e3a5f" />{renderModule(mod, mx, f, mw, iH, cx, cy)}</g>
        return <g key={i}>{renderModule(mod, mx, f, mw, iH, cx, cy)}</g>
      })}
    </svg>
  )
}

function renderModule(mod: string, mx: number, my: number, mw: number, mh: number, cx: number, cy: number) {
  const s = 2; const sx = mx + s, sy = my + s, sw = mw - 2 * s, sh = mh - 2 * s
  const isLeft = mod === "CAS-L" || mod === "TT-L"
  if (mod === "FIX" || mod === "FIX-D") return <rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} />
  if (mod === "CAS-L" || mod === "CAS-R") {
    const hx = isLeft ? sx : sx + sw; const ohx = isLeft ? sx + sw : sx
    return <g><rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} /><line x1={hx} y1={cy} x2={ohx} y2={sy} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} /><line x1={hx} y1={cy} x2={ohx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} /></g>
  }
  if (mod === "TT-L" || mod === "TT-R") {
    const hx = isLeft ? sx : sx + sw; const ohx = isLeft ? sx + sw : sx
    return <g><rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} /><line x1={hx} y1={cy} x2={ohx} y2={sy} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} /><line x1={hx} y1={cy} x2={ohx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} /><line x1={cx} y1={sy} x2={sx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.6} opacity={0.35} strokeDasharray="3 2" /><line x1={cx} y1={sy} x2={sx + sw} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.6} opacity={0.35} strokeDasharray="3 2" /></g>
  }
  if (mod === "AWNING") return <g><rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} /><line x1={cx} y1={sy} x2={sx} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} /><line x1={cx} y1={sy} x2={sx + sw} y2={sy + sh} stroke="#1e3a5f" strokeWidth={0.8} opacity={0.5} /></g>
  if (mod === "SLIDE" || mod === "SLIDE-D") return <g><rect x={sx} y={sy} width={sw} height={sh} fill={mod === "SLIDE-D" ? "#9ca3af" : "#dbeafe"} stroke="#1e3a5f" strokeWidth={1.5} /><line x1={sx + 6} y1={cy} x2={sx + sw - 6} y2={cy} stroke="#1e3a5f" strokeWidth={1} /><polyline points={`${sx + sw - 12},${cy - 4} ${sx + sw - 6},${cy} ${sx + sw - 12},${cy + 4}`} fill="none" stroke="#1e3a5f" strokeWidth={1} /></g>
  if (mod === "SWING" || mod.startsWith("SWING")) return <g><rect x={sx} y={sy} width={sw} height={sh} fill="#9ca3af" stroke="#1e3a5f" strokeWidth={1.5} /><rect x={sx + 4} y={sy + 4} width={sw - 8} height={sh * 0.3} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={0.6} rx={1} /><path d={`M ${sx + sw} ${sy + sh} A ${sw * 0.6} ${sw * 0.6} 0 0 1 ${sx + sw - sw * 0.5} ${sy + sh - sw * 0.5}`} fill="none" stroke="#3b82f6" strokeWidth={0.8} strokeDasharray="3 2" /></g>
  if (mod === "FOLD") return <g><rect x={sx} y={sy} width={sw} height={sh} fill="#9ca3af" stroke="#1e3a5f" strokeWidth={1.5} /><rect x={sx + 3} y={sy + 3} width={sw - 6} height={sh * 0.4} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={0.5} rx={1} /><line x1={cx} y1={sy} x2={cx} y2={sy + sh} stroke="#f97316" strokeWidth={0.8} strokeDasharray="4 2" /></g>
  return <rect x={sx} y={sy} width={sw} height={sh} fill="#dbeafe" stroke="#1e3a5f" strokeWidth={1.5} />
}

/* ─── Window card on face (PURE VISUAL — no intercept mesh, clicks handled by box mesh) ─── */
const FaceWindowCard = memo(function FaceWindowCard({ pw, isSelected, isHovered, winW, winH, compileMode, solidMode }: {
  pw: PlacedWindow; isSelected: boolean; isHovered?: boolean; winW: number; winH: number
  compileMode: boolean; solidMode: boolean
}) {
  const ratio = (pw.hInches || 48) / (pw.wInches || 48)
  const adjH = Math.min(winH, winW * ratio * 1.2)
  const adjW = adjH / ratio
  const htmlW = Math.max(50, adjW * 50)
  const htmlH = htmlW * ratio

  return (
    <group>
      {/* Visual only — all pointer events disabled. Clicks detected on the box mesh via hit-testing. */}
      <Html position={[0, 0, 0.02]} center transform
        occlude={solidMode ? true : undefined}
        style={{ pointerEvents: "none" }}
        distanceFactor={6}>
        <div style={{ width: htmlW, height: htmlH, pointerEvents: "none" }}
          className={`${isSelected ? "ring-2 ring-amber-400 rounded-sm" : isHovered ? "ring-2 ring-cyan-400/80 rounded-sm" : ""}`}>
          <FenestrationSVG typeKey={pw.typeKey} w={pw.wInches || 48} h={pw.hInches || 48} />
        </div>
      </Html>
      {(solidMode || compileMode || isSelected || isHovered) && (
        <Html position={[0, -adjH / 2 - 0.18, 0]} center transform
          occlude={solidMode ? true : undefined}
          style={{ pointerEvents: "none" }}>
          <div className={`text-[7px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm ${isSelected ? "bg-amber-500 text-white" : "bg-slate-800 text-white"}`}>
            {pw.label} — {pw.dims}
          </div>
        </Html>
      )}
    </group>
  )
})

/* ─── Single Floor ─── */
function FloorMesh({ floor, yOffset, activeWindowId, activeWindowConfig, moveMode, compileMode, onFaceClick, onPlacedWindowClick, selectedPlacedId, solidMode, liveMovePos, setLiveMovePos, unit, movingWindow }: {
  floor: BuildingFloor; yOffset: number; solidMode: boolean; moveMode: boolean; compileMode: boolean; unit: "ft" | "m"
  activeWindowConfig?: ActiveWindowConfig | null
  liveMovePos: LiveMovePos | null; setLiveMovePos: (p: LiveMovePos | null) => void
  movingWindow?: PlacedWindow | null
} & Pick<SceneProps, "activeWindowId" | "onFaceClick" | "onPlacedWindowClick" | "selectedPlacedId">) {
  const [hoveredFace, setHoveredFace] = useState<string | null>(null)
  const [hoveredWindowId, setHoveredWindowId] = useState<string | null>(null)
  const [ghostHit, setGhostHit] = useState<{ face: "front"|"back"|"left"|"right"; u: number; v: number } | null>(null)
  const boxRef = useRef<THREE.Mesh>(null)
  const { width: w, depth: d, ceilingHeight: h } = floor
  const canPlace = !compileMode && (!!activeWindowId || moveMode)
  const inchToUnit = unit === "ft" ? 1 / 12 : 0.0254

  const computeFaceHit = useCallback((e: ThreeEvent<PointerEvent | MouseEvent>) => {
    const n = e.face?.normal
    if (!n) return null
    let face: "front" | "back" | "left" | "right" | null = null
    if (n.z > 0.5) face = "front"; else if (n.z < -0.5) face = "back"
    else if (n.x > 0.5) face = "right"; else if (n.x < -0.5) face = "left"
    if (!face) return null
    const local = e.point.clone(); local.y -= yOffset
    let u = 0.5, v = local.y / h
    if (face === "front" || face === "back") u = (local.x + w / 2) / w
    else u = (local.z + d / 2) / d
    v = Math.max(0.1, Math.min(0.9, v)); u = Math.max(0.05, Math.min(0.95, u))
    return { face: face as "front" | "back" | "left" | "right", u, v }
  }, [w, d, h, yOffset])

  const toWorldPos = useCallback((face: string, u: number, v: number) => {
    let pos: [number, number, number] = [0, 0, 0]; let rot: [number, number, number] = [0, 0, 0]
    if (face === "front") { pos = [(u - 0.5) * w, v * h, d / 2 + 0.04]; rot = [0, 0, 0] }
    else if (face === "back") { pos = [(u - 0.5) * w, v * h, -d / 2 - 0.04]; rot = [0, Math.PI, 0] }
    else if (face === "right") { pos = [w / 2 + 0.04, v * h, (u - 0.5) * d]; rot = [0, Math.PI / 2, 0] }
    else if (face === "left") { pos = [-w / 2 - 0.04, v * h, (u - 0.5) * d]; rot = [0, -Math.PI / 2, 0] }
    return { pos, rot }
  }, [w, d, h])

  /* ─── Hit-test: check if a click at (face, u, v) overlaps a placed window ─── */
  const findWindowAtPosition = useCallback((face: string, u: number, v: number): PlacedWindow | null => {
    const faceW = (face === "front" || face === "back") ? w : d
    const faceH = h
    let closest: PlacedWindow | null = null
    let closestDist = Infinity
    for (const pw of floor.windows) {
      if (pw.face !== face) continue
      // Window half-extents in face-UV space — generous tolerance so visual matches clickable area
      // Use at least ±0.12 in U and ±0.18 in V so the hit zone covers the visible Html card
      const rawHalfU = ((pw.wInches || 48) * inchToUnit / faceW) / 2
      const rawHalfV = ((pw.hInches || 48) * inchToUnit / faceH) / 2
      const halfU = Math.max(rawHalfU + 0.04, 0.12)
      const halfV = Math.max(rawHalfV + 0.04, 0.18)
      const du = Math.abs(u - pw.posU)
      const dv = Math.abs(v - pw.posV)
      if (du < halfU && dv < halfV) {
        const dist = du * du + dv * dv
        if (dist < closestDist) { closest = pw; closestDist = dist }
      }
    }
    return closest
  }, [floor.windows, w, d, h, inchToUnit])

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    const hit = computeFaceHit(e)
    // Always detect window hover for visual feedback (cyan ring)
    if (hit && !moveMode) {
      const hoverWin = findWindowAtPosition(hit.face, hit.u, hit.v)
      setHoveredWindowId(hoverWin?.id ?? null)
    } else {
      setHoveredWindowId(null)
    }
    if (!canPlace) { setHoveredFace(null); return }
    e.stopPropagation()
    if (hit) {
      setHoveredFace(hit.face)
      if (moveMode && selectedPlacedId) {
        setLiveMovePos({ windowId: selectedPlacedId, floorId: floor.id, face: hit.face, posU: hit.u, posV: hit.v })
        setGhostHit(null)
      } else if (activeWindowId && !moveMode && activeWindowConfig) {
        setGhostHit({ face: hit.face, u: hit.u, v: hit.v })
      } else {
        setGhostHit(null)
      }
    } else { setHoveredFace(null); setGhostHit(null) }
  }, [canPlace, moveMode, selectedPlacedId, activeWindowId, activeWindowConfig, computeFaceHit, findWindowAtPosition, setLiveMovePos, floor.id])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const hit = computeFaceHit(e)
    if (!hit) return

    // ALWAYS check for placed window under cursor first (except when dropping in move mode)
    if (!(moveMode && selectedPlacedId)) {
      const clickedWin = findWindowAtPosition(hit.face, hit.u, hit.v)
      if (clickedWin) {
        // Found a placed window — select/grab it regardless of basket selection
        onPlacedWindowClick(clickedWin.id)
        return
      }
    }

    // No placed window under cursor — proceed with placement/move/drop
    if (!canPlace) return // Nothing to do if no basket window and not in move mode

    // In move mode: drop the window at this position
    // In placement mode: place from basket
    onFaceClick(floor.id, hit.face, hit.u, hit.v)
  }, [canPlace, moveMode, selectedPlacedId, computeFaceHit, onFaceClick, floor.id, findWindowAtPosition, onPlacedWindowClick])

  const wc = solidMode ? "#ffffff" : floor.color
  const wo = solidMode ? 1 : (hoveredFace ? 0.5 : 0.25)
  const ec = hoveredFace ? (moveMode ? "#a855f7" : "#3b82f6") : (solidMode ? "#d1d5db" : "#475569")

  // Remove selected window from scene immediately when in move mode (so its invisible plane doesn't block pointer events)
  const windowsToRender = floor.windows.filter(pw => {
    if (moveMode && selectedPlacedId === pw.id) return false
    return true
  })

  return (
    <group position={[0, yOffset, 0]}>
      <mesh ref={boxRef} position={[0, h / 2, 0]} onClick={handleClick}
        onPointerMove={handlePointerMove} onPointerOut={() => { setHoveredFace(null); setHoveredWindowId(null); setGhostHit(null) }}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={hoveredFace ? (moveMode ? "#c084fc" : "#60a5fa") : wc}
          transparent={!solidMode} opacity={wo} side={solidMode ? THREE.FrontSide : THREE.DoubleSide}
          depthWrite={solidMode} />
        <Edges color={ec} linewidth={solidMode ? 0.5 : 1.5} />
      </mesh>
      <Html position={[-(w / 2) - 0.3, h / 2, 0]} center
        occlude={solidMode ? true : undefined}
        style={{ pointerEvents: "none" }}>
        <div className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">{floor.name}</div>
      </Html>
      {/* Regular windows */}
      {windowsToRender.map(pw => {
        const isSelected = pw.id === selectedPlacedId
        const winW = (pw.wInches || 48) * inchToUnit
        const winH = (pw.hInches || 48) * inchToUnit
        const wp = toWorldPos(pw.face, pw.posU, pw.posV)
        return (
          <group key={pw.id} position={wp.pos} rotation={wp.rot}>
            <FaceWindowCard pw={pw} isSelected={isSelected} isHovered={hoveredWindowId === pw.id} winW={winW} winH={winH}
              compileMode={compileMode} solidMode={solidMode} />
          </group>
        )
      })}
      {/* Live-moving window preview on this floor */}
      {movingWindow && liveMovePos && liveMovePos.floorId === floor.id && (() => {
        const winW = (movingWindow.wInches || 48) * inchToUnit
        const winH = (movingWindow.hInches || 48) * inchToUnit
        const wp = toWorldPos(liveMovePos.face, liveMovePos.posU, liveMovePos.posV)
        return (
          <group position={wp.pos} rotation={wp.rot}>
            <FaceWindowCard pw={movingWindow} isSelected={true} winW={winW} winH={winH}
              compileMode={compileMode} solidMode={solidMode} />
          </group>
        )
      })()}
      {/* Ghost preview for initial placement from basket */}
      {ghostHit && activeWindowConfig && !moveMode && (() => {
        const gw = activeWindowConfig.wInches * inchToUnit
        const gh = activeWindowConfig.hInches * inchToUnit
        const ratio = activeWindowConfig.hInches / activeWindowConfig.wInches
        const adjH = Math.min(gh, gw * ratio * 1.2)
        const adjW = adjH / ratio
        const htmlW = Math.max(50, adjW * 50)
        const htmlH = htmlW * ratio
        const wp = toWorldPos(ghostHit.face, ghostHit.u, ghostHit.v)
        return (
          <group position={wp.pos} rotation={wp.rot}>
            <Html position={[0, 0, 0.02]} center transform style={{ pointerEvents: "none" }} distanceFactor={6}>
              <div style={{ width: htmlW, height: htmlH, opacity: 0.45 }}
                className="ring-2 ring-amber-400 ring-dashed rounded-sm">
                <FenestrationSVG typeKey={activeWindowConfig.typeKey} w={activeWindowConfig.wInches} h={activeWindowConfig.hInches} />
              </div>
            </Html>
            <Html position={[0, -adjH / 2 - 0.18, 0]} center transform style={{ pointerEvents: "none" }}>
              <div className="text-[7px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap bg-amber-500/70 text-white shadow-sm animate-pulse">
                {activeWindowConfig.label} — Click to place
              </div>
            </Html>
          </group>
        )
      })()}
    </group>
  )
}

/* ─── Ground-level direction stickers ─── */
function GroundArrow({ position, rotY, color }: { position: [number, number, number]; rotY: number; color: string }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const v = new Float32Array([0, 0, -0.4, -0.2, 0, 0.15, 0.2, 0, 0.15])
    g.setAttribute("position", new THREE.BufferAttribute(v, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} position={position} rotation={[0, rotY, 0]}>
      <meshBasicMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  )
}

function DirectionLabels({ maxW, maxD, solidMode }: { maxW: number; maxD: number; solidMode: boolean }) {
  const labels = useMemo(() => [
    { text: "FRONT", pos: [0, 0.12, maxD / 2 + 1.2] as [number, number, number], arrowPos: [0, 0.03, maxD / 2 + 0.5] as [number, number, number], arrowRot: 0, color: "#3b82f6" },
    { text: "BACK", pos: [0, 0.12, -maxD / 2 - 1.2] as [number, number, number], arrowPos: [0, 0.03, -maxD / 2 - 0.5] as [number, number, number], arrowRot: Math.PI, color: "#8b5cf6" },
    { text: "LEFT", pos: [-maxW / 2 - 1.2, 0.12, 0] as [number, number, number], arrowPos: [-maxW / 2 - 0.5, 0.03, 0] as [number, number, number], arrowRot: -Math.PI / 2, color: "#10b981" },
    { text: "RIGHT", pos: [maxW / 2 + 1.2, 0.12, 0] as [number, number, number], arrowPos: [maxW / 2 + 0.5, 0.03, 0] as [number, number, number], arrowRot: Math.PI / 2, color: "#f59e0b" },
  ], [maxW, maxD])

  return (
    <>
      {labels.map(l => (
        <group key={l.text}>
          {/* Flat arrow on ground surface pointing at building */}
          <GroundArrow position={l.arrowPos} rotY={l.arrowRot} color={l.color} />
          {/* Ground-level label */}
          <Html position={l.pos} center
            occlude={solidMode ? true : undefined}
            style={{ pointerEvents: "none" }}>
            <div className="flex items-center gap-1 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm"
              style={{ backgroundColor: l.color, color: "#fff" }}>
              {l.text}
            </div>
          </Html>
        </group>
      ))}
    </>
  )
}

/* ─── Scale indicator ─── */
function ScaleIndicator({ unit }: { unit: "ft" | "m" }) {
  return (
    <group position={[-2, 0.02, -2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 0.04]} />
        <meshBasicMaterial color="#475569" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0, 0]}>
        <planeGeometry args={[0.04, 0.15]} />
        <meshBasicMaterial color="#475569" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.5, 0, 0]}>
        <planeGeometry args={[0.04, 0.15]} />
        <meshBasicMaterial color="#475569" />
      </mesh>
      <Html position={[0, 0.15, 0]} center style={{ pointerEvents: "none" }}>
        <div className="text-[8px] font-bold text-slate-500 whitespace-nowrap">1 {unit}</div>
      </Html>
    </group>
  )
}

/* ─── Main Scene ─── */
export function BuildingScene({ floors, activeWindowId, activeWindowConfig, moveMode, compileMode, onFaceClick, onPlacedWindowClick, selectedPlacedId, solidMode, unit = "ft", selectMode = false, onDeselect }: SceneProps) {
  const isSolid = solidMode || compileMode
  const [liveMovePos, setLiveMovePos] = useState<LiveMovePos | null>(null)

  const maxW = Math.max(...floors.map(f => f.width), 8)
  const maxD = Math.max(...floors.map(f => f.depth), 6)
  const totalH = floors.reduce((s, f) => s + f.ceilingHeight, 0)
  const camDist = Math.max(maxW, maxD, totalH) * 1.8
  const offsets = useMemo(() => { const o: number[] = []; let y = 0; for (const f of floors) { o.push(y); y += f.ceilingHeight }; return o }, [floors])

  // Find the window being moved across all floors (available as soon as selectedPlacedId is set)
  const allWindows = useMemo(() => floors.flatMap(f => f.windows), [floors])
  const movingWindow = moveMode && selectedPlacedId ? allWindows.find(w => w.id === selectedPlacedId) ?? null : null

  // Enhanced face click that clears liveMovePos
  const handleFaceClick = useCallback((floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => {
    setLiveMovePos(null)
    onFaceClick(floorId, face, u, v)
  }, [onFaceClick])

  return (
    <Canvas style={{ width: "100%", height: "100%", cursor: moveMode ? "grabbing" : selectMode ? "crosshair" : "auto" }} shadows dpr={[1, 1.5]} flat
      performance={{ min: 0.5 }}
      onPointerMissed={() => onDeselect?.()}>
      <PerspectiveCamera makeDefault position={[camDist * 0.7, camDist * 0.5, camDist * 0.7]} fov={45} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08}
        enabled={!moveMode && !selectMode}
        minPolarAngle={Math.PI * 0.05} maxPolarAngle={Math.PI * 0.485}
        minDistance={3} maxDistance={camDist * 3} target={[0, totalH / 2, 0]} />
      {/* Lighting */}
      <ambientLight intensity={isSolid ? 0.85 : 0.6} />
      <directionalLight position={[10, 15, 10]} intensity={isSolid ? 0.5 : 0.8} castShadow={isSolid} />
      {isSolid && <directionalLight position={[-8, 10, -5]} intensity={0.2} />}
      {/* Ground */}
      {!isSolid && <Grid args={[50, 50]} cellSize={1} cellThickness={0.5}
        cellColor="#94a3b8" sectionSize={5} sectionColor="#64748b"
        fadeDistance={30} position={[0, -0.01, 0]} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={isSolid ? "#f1f5f9" : "#e2e8f0"} transparent opacity={isSolid ? 1 : 0.3} />
      </mesh>
      {/* Floors */}
      {floors.map((floor, i) => (
        <FloorMesh key={floor.id} floor={floor} yOffset={offsets[i]}
          activeWindowId={activeWindowId} activeWindowConfig={activeWindowConfig}
          moveMode={moveMode} compileMode={compileMode}
          onFaceClick={handleFaceClick} onPlacedWindowClick={onPlacedWindowClick}
          selectedPlacedId={selectedPlacedId} solidMode={isSolid}
          liveMovePos={liveMovePos} setLiveMovePos={setLiveMovePos} unit={unit} movingWindow={movingWindow} />
      ))}
      {/* Cross-floor live-move: render moving window on target floor */}
      {movingWindow && liveMovePos && (() => {
        const targetFloorIdx = floors.findIndex(f => f.id === liveMovePos.floorId)
        const sourceFloorIdx = floors.findIndex(f => f.windows.some(w => w.id === liveMovePos.windowId))
        if (targetFloorIdx >= 0 && targetFloorIdx !== sourceFloorIdx) {
          const tf = floors[targetFloorIdx]
          const yOff = offsets[targetFloorIdx]
          const inchToUnit = unit === "ft" ? 1 / 12 : 0.0254
          const winW = (movingWindow.wInches || 48) * inchToUnit
          const winH = (movingWindow.hInches || 48) * inchToUnit
          let pos: [number, number, number] = [0, 0, 0]; let rot: [number, number, number] = [0, 0, 0]
          const { face, posU: u, posV: v } = liveMovePos
          if (face === "front") { pos = [(u - 0.5) * tf.width, v * tf.ceilingHeight + yOff, tf.depth / 2 + 0.04] }
          else if (face === "back") { pos = [(u - 0.5) * tf.width, v * tf.ceilingHeight + yOff, -tf.depth / 2 - 0.04]; rot = [0, Math.PI, 0] }
          else if (face === "right") { pos = [tf.width / 2 + 0.04, v * tf.ceilingHeight + yOff, (u - 0.5) * tf.depth]; rot = [0, Math.PI / 2, 0] }
          else if (face === "left") { pos = [-tf.width / 2 - 0.04, v * tf.ceilingHeight + yOff, (u - 0.5) * tf.depth]; rot = [0, -Math.PI / 2, 0] }
          return (
            <group position={pos} rotation={rot}>
              <FaceWindowCard pw={movingWindow} isSelected={true} winW={winW} winH={winH}
                compileMode={compileMode} solidMode={isSolid} />
            </group>
          )
        }
        return null
      })()}
      {/* Direction labels on ground */}
      <DirectionLabels maxW={maxW} maxD={maxD} solidMode={isSolid} />
      {/* Scale indicator */}
      <ScaleIndicator unit={unit} />
    </Canvas>
  )
}
