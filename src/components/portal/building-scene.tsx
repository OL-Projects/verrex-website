"use client"

import { useState, useMemo } from "react"
import { Canvas, ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Html, Grid, PerspectiveCamera, Edges } from "@react-three/drei"
import * as THREE from "three"

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
  onFaceClick: (floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => void
  onPlacedWindowClick: (windowId: string) => void
  selectedPlacedId: string | null
  solidMode: boolean
}

/* ─── Window SVG mini-render on face ─── */
function FaceWindowCard({ pw, isSelected, winW, winH, onClick }: {
  pw: PlacedWindow; isSelected: boolean; winW: number; winH: number
  onClick: () => void
}) {
  return (
    <group>
      {/* Glass panel */}
      <mesh onClick={e => { e.stopPropagation(); onClick() }}>
        <planeGeometry args={[winW, winH]} />
        <meshStandardMaterial color={isSelected ? "#fbbf24" : "#dbeafe"} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Frame border */}
      <mesh>
        <planeGeometry args={[winW + 0.04, winH + 0.04]} />
        <meshStandardMaterial color={isSelected ? "#d97706" : "#1e3a5f"} side={THREE.DoubleSide} />
      </mesh>
      {/* Center mullion cross */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.02, winH]} />
        <meshStandardMaterial color={isSelected ? "#92400e" : "#1e3a5f"} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[winW, 0.02]} />
        <meshStandardMaterial color={isSelected ? "#92400e" : "#1e3a5f"} side={THREE.DoubleSide} />
      </mesh>
      {/* Label */}
      <Html position={[0, -winH / 2 - 0.2, 0]} center style={{ pointerEvents: "none" }}>
        <div className={`text-[7px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm ${isSelected ? "bg-amber-500 text-white" : "bg-slate-800 text-white"}`}>
          {pw.label} — {pw.dims}
        </div>
      </Html>
    </group>
  )
}

/* ─── Single Floor Mesh ─── */
function FloorMesh({ floor, yOffset, activeWindowId, moveMode, onFaceClick, onPlacedWindowClick, selectedPlacedId, solidMode }: {
  floor: BuildingFloor; yOffset: number; solidMode: boolean; moveMode: boolean
} & Pick<SceneProps, "activeWindowId" | "onFaceClick" | "onPlacedWindowClick" | "selectedPlacedId">) {
  const [hoveredFace, setHoveredFace] = useState<string | null>(null)
  const { width: w, depth: d, ceilingHeight: h } = floor
  const canPlace = !!activeWindowId || moveMode

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!canPlace) return
    const n = e.face?.normal
    if (!n) return
    let face: "front" | "back" | "left" | "right" | null = null
    if (n.z > 0.5) face = "front"
    else if (n.z < -0.5) face = "back"
    else if (n.x > 0.5) face = "right"
    else if (n.x < -0.5) face = "left"
    if (!face) return
    const local = e.point.clone()
    local.y -= yOffset
    let u = 0.5, v = local.y / h
    if (face === "front" || face === "back") u = (local.x + w / 2) / w
    else u = (local.z + d / 2) / d
    v = Math.max(0.1, Math.min(0.9, v))
    u = Math.max(0.05, Math.min(0.95, u))
    onFaceClick(floor.id, face, u, v)
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!canPlace) return
    e.stopPropagation()
    const n = e.face?.normal
    if (!n) return
    if (n.z > 0.5) setHoveredFace("front")
    else if (n.z < -0.5) setHoveredFace("back")
    else if (n.x > 0.5) setHoveredFace("right")
    else if (n.x < -0.5) setHoveredFace("left")
    else setHoveredFace(null)
  }

  const wallColor = solidMode ? "#f1f5f9" : floor.color
  const wallOpacity = solidMode ? 0.95 : (hoveredFace ? 0.5 : 0.25)
  const edgeColor = hoveredFace ? (moveMode ? "#a855f7" : "#3b82f6") : (solidMode ? "#94a3b8" : "#475569")

  return (
    <group position={[0, yOffset, 0]}>
      <mesh position={[0, h / 2, 0]} onClick={handleClick}
        onPointerOver={handlePointerOver} onPointerOut={() => setHoveredFace(null)}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={hoveredFace ? (moveMode ? "#c084fc" : "#60a5fa") : wallColor}
          transparent opacity={wallOpacity} side={THREE.DoubleSide} />
        <Edges color={edgeColor} linewidth={solidMode ? 1 : 1.5} />
      </mesh>
      <Html position={[-(w / 2) - 0.3, h / 2, 0]} center style={{ pointerEvents: "none" }}>
        <div className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">{floor.name}</div>
      </Html>
      {floor.windows.map(pw => {
        const isSelected = pw.id === selectedPlacedId
        const winW = Math.min(w, d) * 0.14
        const winH = h * 0.28
        let pos: [number, number, number] = [0, 0, 0]
        let rot: [number, number, number] = [0, 0, 0]
        if (pw.face === "front") { pos = [(pw.posU - 0.5) * w, pw.posV * h, d / 2 + 0.03]; rot = [0, 0, 0] }
        else if (pw.face === "back") { pos = [(pw.posU - 0.5) * w, pw.posV * h, -d / 2 - 0.03]; rot = [0, Math.PI, 0] }
        else if (pw.face === "right") { pos = [w / 2 + 0.03, pw.posV * h, (pw.posU - 0.5) * d]; rot = [0, Math.PI / 2, 0] }
        else if (pw.face === "left") { pos = [-w / 2 - 0.03, pw.posV * h, (pw.posU - 0.5) * d]; rot = [0, -Math.PI / 2, 0] }
        return (
          <group key={pw.id} position={pos} rotation={rot}>
            <FaceWindowCard pw={pw} isSelected={isSelected} winW={winW} winH={winH}
              onClick={() => onPlacedWindowClick(pw.id)} />
          </group>
        )
      })}
    </group>
  )
}

function DirectionLabels({ maxW, maxD, totalH }: { maxW: number; maxD: number; totalH: number }) {
  const y = totalH / 2
  return <>
    {([
      { text: "FRONT", pos: [0, y, maxD / 2 + 1.2] as [number, number, number] },
      { text: "BACK", pos: [0, y, -maxD / 2 - 1.2] as [number, number, number] },
      { text: "LEFT", pos: [-maxW / 2 - 1.2, y, 0] as [number, number, number] },
      { text: "RIGHT", pos: [maxW / 2 + 1.2, y, 0] as [number, number, number] },
    ]).map(l => (
      <Html key={l.text} position={l.pos} center style={{ pointerEvents: "none" }}>
        <div className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 backdrop-blur-sm">
          {l.text}
        </div>
      </Html>
    ))}
  </>
}

/* ─── Main Scene ─── */
export function BuildingScene({ floors, activeWindowId, moveMode, onFaceClick, onPlacedWindowClick, selectedPlacedId, solidMode }: SceneProps) {
  const maxW = Math.max(...floors.map(f => f.width), 8)
  const maxD = Math.max(...floors.map(f => f.depth), 6)
  const totalH = floors.reduce((s, f) => s + f.ceilingHeight, 0)
  const camDist = Math.max(maxW, maxD, totalH) * 1.8
  const offsets = useMemo(() => {
    const o: number[] = []; let y = 0
    for (const f of floors) { o.push(y); y += f.ceilingHeight }
    return o
  }, [floors])

  return (
    <Canvas style={{ width: "100%", height: "100%" }} shadows>
      <PerspectiveCamera makeDefault position={[camDist * 0.7, camDist * 0.5, camDist * 0.7]} fov={45} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08}
        minPolarAngle={Math.PI * 0.1} maxPolarAngle={Math.PI * 0.42}
        minDistance={4} maxDistance={camDist * 3} target={[0, totalH / 2, 0]} />
      <ambientLight intensity={solidMode ? 0.85 : 0.6} />
      <directionalLight position={[10, 15, 10]} intensity={solidMode ? 0.5 : 0.8} />
      {/* Ground */}
      {!solidMode && <Grid args={[50, 50]} cellSize={1} cellThickness={0.5}
        cellColor="#94a3b8" sectionSize={5} sectionColor="#64748b"
        fadeDistance={30} position={[0, -0.01, 0]} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={solidMode ? "#f8fafc" : "#e2e8f0"} transparent opacity={solidMode ? 1 : 0.3} />
      </mesh>
      {floors.map((floor, i) => (
        <FloorMesh key={floor.id} floor={floor} yOffset={offsets[i]}
          activeWindowId={activeWindowId} moveMode={moveMode}
          onFaceClick={onFaceClick} onPlacedWindowClick={onPlacedWindowClick}
          selectedPlacedId={selectedPlacedId} solidMode={solidMode} />
      ))}
      <DirectionLabels maxW={maxW} maxD={maxD} totalH={totalH} />
    </Canvas>
  )
}
