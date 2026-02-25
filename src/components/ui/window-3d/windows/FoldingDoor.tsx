"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, Hinge, TrackRail, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Folding Door (Bi-fold)
// 4 glass panels that fold accordion-style. Panels 1+2 fold left, panels 3+4 fold right.
// Heavy aluminum frame, top pivot track, bottom guide track.
export function FoldingDoor({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.08
  const panelW = (width - t * 2) / 4
  const glassW = panelW - t * 1.2
  const glassH = height - t * 2 - 0.02

  const fold1 = useRef<THREE.Group>(null)
  const fold2 = useRef<THREE.Group>(null)
  const fold3 = useRef<THREE.Group>(null)
  const fold4 = useRef<THREE.Group>(null)
  const sp1 = useRef<SpringState>({ pos: 0, vel: 0 })
  const sp2 = useRef<SpringState>({ pos: 0, vel: 0 })

  useFrame((_, dt) => {
    const target = isOpen ? Math.PI * 0.45 : 0
    const a1 = springStep(sp1.current, target, dt, 60, 14)
    const a2 = springStep(sp2.current, target, dt, 55, 14)
    if (fold1.current) fold1.current.rotation.y = -a1
    if (fold2.current) fold2.current.rotation.y = a1
    if (fold3.current) fold3.current.rotation.y = -a2
    if (fold4.current) fold4.current.rotation.y = a2
  })

  const Panel = ({ w, h }: { w: number; h: number }) => (
    <group>
      <WindowFrame width={w} height={h} depth={d * 0.5} thickness={t * 0.6} color={frameColor} />
      <GlassPane width={w - t * 1.2} height={h - t * 1.2} glassType={glassType} />
    </group>
  )

  const pH = height - t * 2

  return (
    <group>
      {/* Outer frame */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Top pivot track */}
      <TrackRail width={width - t * 2} position={[0, height / 2 - t * 0.3, 0]} color={frameColor} />
      {/* Bottom guide track */}
      <TrackRail width={width - t * 2} position={[0, -height / 2 + t * 0.3, 0]} color={frameColor} />

      {/* Panel pair LEFT (1+2) — pivot at left edge of panel 1 */}
      <group position={[-width / 2 + t + panelW / 2, 0, 0]}>
        <group ref={fold1} position={[-panelW / 2, 0, 0]}>
          <group position={[panelW / 2, 0, 0]}>
            <Panel w={panelW} h={pH} />
            {/* Hinge between panel 1 and 2 */}
            <Hinge position={[panelW / 2, height / 4, d * 0.25]} />
            <Hinge position={[panelW / 2, -height / 4, d * 0.25]} />
            {/* Panel 2 pivots at right edge of panel 1 */}
            <group ref={fold2} position={[panelW / 2, 0, 0]}>
              <group position={[panelW / 2, 0, 0]}>
                <Panel w={panelW} h={pH} />
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Panel pair RIGHT (3+4) — pivot at right edge of panel 4 */}
      <group position={[width / 2 - t - panelW / 2, 0, 0]}>
        <group ref={fold3} position={[panelW / 2, 0, 0]}>
          <group position={[-panelW / 2, 0, 0]}>
            <Panel w={panelW} h={pH} />
            <Hinge position={[-panelW / 2, height / 4, d * 0.25]} />
            <Hinge position={[-panelW / 2, -height / 4, d * 0.25]} />
            <group ref={fold4} position={[-panelW / 2, 0, 0]}>
              <group position={[-panelW / 2, 0, 0]}>
                <Panel w={panelW} h={pH} />
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Floor threshold */}
      <mesh position={[0, -height / 2 - 0.015, 0]}>
        <boxGeometry args={[width, 0.025, d * 1.2]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.03} />
      </mesh>
    </group>
  )
}
