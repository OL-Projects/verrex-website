"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Center } from "@react-three/drei"
import * as THREE from "three"
import { DoubleHungWindow } from "./windows/DoubleHungWindow"
import { CasementWindow } from "./windows/CasementWindow"
import {
  SlidingWindow, AwningWindow, TiltTurnWindow, HopperWindow,
  BayBowWindow, PictureWindow, GardenWindow, SkylightWindow,
  TransomWindow, JalousieWindow, GlassBlockWindow,
  CurtainWallWindow, StorefrontWindow, GenericWindow,
} from "./windows/AllWindows"

// Which types support open/close animation
export const OPERABLE_TYPES = new Set([
  "double-hung", "casement", "sliding", "awning",
  "tilt-turn", "hopper", "skylight", "jalousie",
])

// Subtle auto-rotation wrapper
function WindowScene({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.08
  })
  return <group ref={groupRef}><Center>{children}</Center></group>
}

export function WindowModel({
  type, width, height, frameColor, glassType, isOpen,
}: {
  type: string; width: number; height: number;
  frameColor: string; glassType: string; isOpen: boolean
}) {
  const w = width / 40, h = height / 40
  const p = { width: w, height: h, frameColor, glassType, isOpen }
  const sp = { width: w, height: h, frameColor, glassType } // static props

  let win: React.ReactNode
  switch (type) {
    case "double-hung": win = <DoubleHungWindow {...p} />; break
    case "casement": win = <CasementWindow {...p} />; break
    case "sliding": win = <SlidingWindow {...p} />; break
    case "awning": win = <AwningWindow {...p} />; break
    case "tilt-turn": win = <TiltTurnWindow {...p} />; break
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
