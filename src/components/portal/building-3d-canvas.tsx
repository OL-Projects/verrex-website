"use client"

import dynamic from "next/dynamic"
import type { BuildingFloor } from "./building-scene"

const BuildingScene = dynamic(
  () => import("./building-scene").then(m => ({ default: m.BuildingScene })),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-white/3 rounded-2xl">
      <div className="text-center space-y-2">
        <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading 3D Viewer…</p>
      </div>
    </div>
  )}
)

interface Props {
  floors: BuildingFloor[]
  activeWindowId: string | null
  onFaceClick: (floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => void
  onPlacedWindowClick: (windowId: string) => void
  selectedPlacedId: string | null
}

export function Building3DCanvas(props: Props) {
  return (
    <div className="w-full h-full min-h-[400px]">
      <BuildingScene {...props} />
    </div>
  )
}
