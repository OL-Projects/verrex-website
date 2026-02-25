"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Center } from "@react-three/drei"
import * as THREE from "three"
import { DoubleHungWindow } from "./windows/DoubleHungWindow"
import { CasementWindow } from "./windows/CasementWindow"
import { SingleCasementWindow } from "./windows/SingleCasementWindow"
import { SlidingDoor } from "./windows/SlidingDoor"
import { FoldingDoor } from "./windows/FoldingDoor"
import { SwingDoor } from "./windows/SwingDoor"
import { TiltTurnWindow, type TiltTurnMode } from "./windows/TiltTurnWindow"
import {
  SlidingWindow, AwningWindow, HopperWindow,
  BayBowWindow, PictureWindow, GardenWindow, SkylightWindow,
  TransomWindow, JalousieWindow, GlassBlockWindow,
  CurtainWallWindow, StorefrontWindow, GenericWindow,
} from "./windows/AllWindows"

// Which types support open/close animation
export const OPERABLE_TYPES = new Set([
  "double-hung", "casement", "sliding", "awning",
  "tilt-turn", "hand-cranked", "hopper", "skylight", "jalousie",
  "sliding-door", "folding-door", "swing-door",
])

// Subtle auto-rotation wrapper
function WindowScene({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.08
  })
  return <group ref={groupRef}><Center>{children}</Center></group>
}

export { type TiltTurnMode } from "./windows/TiltTurnWindow"

export function WindowModel({
  type, width, height, frameColor, glassType, isOpen, tiltTurnMode = "closed",
}: {
  type: string; width: number; height: number;
  frameColor: string; glassType: string; isOpen: boolean; tiltTurnMode?: TiltTurnMode
}) {
  const w = width / 40, h = height / 40
  const p = { width: w, height: h, frameColor, glassType, isOpen }
  const sp = { width: w, height: h, frameColor, glassType } // static props

  let win: React.ReactNode
  switch (type) {
    case "double-hung": win = <AwningWindow {...p} />; break  // Top Hung = hinged at top, bottom swings outward
    case "casement": win = <SingleCasementWindow {...p} />; break  // Single panel, left-hinged, swings right
    case "sliding": win = <SlidingWindow {...p} />; break
    case "awning": win = <AwningWindow {...p} />; break
    case "tilt-turn": win = <TiltTurnWindow width={w} height={h} frameColor={frameColor} glassType={glassType} openMode={tiltTurnMode} />; break
    case "hand-cranked": win = <SingleCasementWindow {...p} showCrank />; break  // Casement + crank handle
    case "sliding-door": win = <SlidingDoor {...p} />; break
    case "folding-door": win = <FoldingDoor {...p} />; break
    case "swing-door": win = <SwingDoor {...p} />; break
    case "hopper": win = <HopperWindow {...p} />; break
    case "bay-bow": win = <BayBowWindow {...sp} />; break
    case "picture": win = <PictureWindow {...sp} />; break
    case "garden": win = <GardenWindow {...sp} />; break
    case "skylight": win = <SkylightWindow {...p} />; break
    case "transom": win = <TransomWindow {...sp} />; break
    case "jalousie": win = <JalousieWindow {...p} />; break
    case "glass-block": win = <GlassBlockWindow {...sp} />; break
    case "curtain-wall": win = <CurtainWallWindow {...sp} />; break
    case "storefront": win = <StorefrontWindow {...sp} />; break
    default: win = <GenericWindow {...sp} />; break
  }

  return <WindowScene>{win}</WindowScene>
}
