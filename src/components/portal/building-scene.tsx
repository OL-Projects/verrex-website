"use client"

import { useRef, useState, useMemo } from "react"
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Html, Grid, Text, PerspectiveCamera, Edges } from "@react-three/drei"
import * as THREE from "three"

/* ─── Types ─── */
export interface PlacedWindow {
  id: string
  face: "front" | "back" | "left" | "right"
  posU: number   // 0-1 horizontal on face
  posV: number   // 0-1 vertical on face
  measurementId: string
  label: string
  dims: string
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
  onFaceClick: (floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => void
  onPlacedWindowClick: (windowId: string) => void
  selectedPlacedId: string | null
}

/* ─── Single Floor Mesh ─── */
function FloorMesh({ floor, yOffset, activeWindowId, onFaceClick, onPlacedWindowClick, selectedPlacedId }: {
  floor: BuildingFloor; yOffset: number
} & Pick<SceneProps, "activeWindowId" | "onFaceClick" | "onPlacedWindowClick" | "selectedPlacedId">) {
  const [hoveredFace, setHoveredFace] = useState<string | null>(null)
  const { width: w, depth: d, ceilingHeight: h } = floor
  const y = yOffset + h / 2

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!activeWindowId) return
    const n = e.face?.normal
    if (!n) return
    let face: "front" | "back" | "left" | "right" | null = null
    if (n.z > 0.5) face = "front"
    else if (n.z < -0.5) face = "back"
    else if (n.x > 0.5) face = "right"
    else if (n.x < -0.5) face = "left"
    if (!face) return

    // Compute UV on face
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
    if (!activeWindowId) return
    e.stopPropagation()
    const n = e.face?.normal
    if (!n) return
    if (n.z > 0.5) setHoveredFace("front")
    else if (n.z < -0.5) setHoveredFace("back")
    else if (n.x > 0.5) setHoveredFace("right")
    else if (n.x < -0.5) setHoveredFace("left")
    else setHoveredFace(null)
  }

  return (
    <group position={[0, yOffset, 0]}>
      {/* Main box */}
      <mesh position={[0, h / 2, 0]} onClick={handleClick}
        onPointerOver={handlePointerOver} onPointerOut={() => setHoveredFace(null)}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={hoveredFace ? "#60a5fa" : floor.color}
          transparent opacity={hoveredFace ? 0.5 : 0.25}
          side={THREE.DoubleSide}
        />
        <Edges color={hoveredFace ? "#3b82f6" : "#475569"} linewidth={1.5} />
      </mesh>

      {/* Floor label */}
      <Html position={[-(w / 2) - 0.3, h / 2, 0]} center
        style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        <div className="bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
          {floor.name}
        </div>
      </Html>

      {/* Placed windows on faces */}
      {floor.windows.map(pw => {
        const isSelected = pw.id === selectedPlacedId
        let pos: [number, number, number] = [0, 0, 0]
        let rot: [number, number, number] = [0, 0, 0]
        const winW = Math.min(w, d) * 0.12
        const winH = h * 0.25
        if (pw.face === "front") { pos = [(pw.posU - 0.5) * w, pw.posV * h, d / 2 + 0.02]; rot = [0, 0, 0] }
        else if (pw.face === "back") { pos = [(pw.posU - 0.5) * w, pw.posV * h, -d / 2 - 0.02]; rot = [0, Math.PI, 0] }
        else if (pw.face === "right") { pos = [w / 2 + 0.02, pw.posV * h, (pw.posU - 0.5) * d]; rot = [0, Math.PI / 2, 0] }
        else if (pw.face === "left") { pos = [-w / 2 - 0.02, pw.posV * h, (pw.posU - 0.5) * d]; rot = [0, -Math.PI / 2, 0] }

        return (
          <group key={pw.id} position={pos} rotation={rot}>
            <mesh onClick={e => { e.stopPropagation(); onPlacedWindowClick(pw.id) }}>
              <planeGeometry args={[winW, winH]} />
              <meshStandardMaterial color={isSelected ? "#f59e0b" : "#93c5fd"} transparent opacity={0.85} side={THREE.DoubleSide} />
            </mesh>
            <Edges color={isSelected ? "#d97706" : "#2563eb"} />
            <Html position={[0, -winH / 2 - 0.15, 0]} center style={{ pointerEvents: "none" }}>
              <div className={`text-[7px] font-bold px-1 py-0.5 rounded whitespace-nowrap ${isSelected ? "bg-amber-500 text-white" : "bg-blue-600/90 text-white"}`}>
                {pw.label} {pw.dims}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

/* ─── Direction Labels ─── */
function DirectionLabels({ maxW, maxD, totalH }: { maxW: number; maxD: number; totalH: number }) {
  const y = totalH / 2
  const labels: { text: string; pos: [number, number, number] }[] = [
    { text: "FRONT", pos: [0, y, maxD / 2 + 1] },
    { text: "BACK", pos: [0, y, -maxD / 2 - 1] },
    { text: "LEFT", pos: [-maxW / 2 - 1, y, 0] },
    { text: "RIGHT", pos: [maxW / 2 + 1, y, 0] },
  ]
  return <>
    {labels.map(l => (
      <Html key={l.text} position={l.pos} center style={{ pointerEvents: "none" }}>
        <div className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 backdrop-blur-sm">
          {l.text}
        </div>
      </Html>
    ))}
  </>
}

/* ─── Main Scene ─── */
export function BuildingScene({ floors, activeWindowId, onFaceClick, onPlacedWindowClick, selectedPlacedId }: SceneProps) {
  const maxW = Math.max(...floors.map(f => f.width), 8)
  const maxD = Math.max(...floors.map(f => f.depth), 6)
  const totalH = floors.reduce((s, f) => s + f.ceilingHeight, 0)
  const camDist = Math.max(maxW, maxD, totalH) * 1.8

  // Compute Y offsets
  const offsets = useMemo(() => {
    const o: number[] = []
    let y = 0
    for (const f of floors) { o.push(y); y += f.ceilingHeight }
    return o
  }, [floors])

  return (
    <Canvas style={{ width: "100%", height: "100%" }} shadows>
      <PerspectiveCamera makeDefault position={[camDist * 0.7, camDist * 0.5, camDist * 0.7]} fov={45} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08}
        minPolarAngle={Math.PI * 0.1} maxPolarAngle={Math.PI * 0.42}
        minDistance={4} maxDistance={camDist * 3} target={[0, totalH / 2, 0]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />

      {/* Ground */}
      <Grid args={[50, 50]} cellSize={1} cellThickness={0.5}
        cellColor="#94a3b8" sectionSize={5} sectionColor="#64748b"
        fadeDistance={30} position={[0, -0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
      </mesh>

      {/* Building floors */}
      {floors.map((floor, i) => (
        <FloorMesh key={floor.id} floor={floor} yOffset={offsets[i]}
          activeWindowId={activeWindowId}
          onFaceClick={onFaceClick}
          onPlacedWindowClick={onPlacedWindowClick}
          selectedPlacedId={selectedPlacedId} />
      ))}

      {/* Direction labels */}
      <DirectionLabels maxW={maxW} maxD={maxD} totalH={totalH} />
    </Canvas>
  )
}
