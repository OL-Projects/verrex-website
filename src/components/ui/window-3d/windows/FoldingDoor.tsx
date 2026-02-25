"use client"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { WindowFrame, Hinge, springStep, type SpringState } from "../WindowParts"
import { GlassPane } from "../GlassPane"

// Folding Door (Bi-fold / NanaWall / Accordion Glass Door)
// 4 full-height glass panels that fold accordion-style to the LEFT when opened.
// When closed: 4 flat glass panels side by side filling the frame.
// When open: panels fold and stack to the left side.
// Top-hung from an overhead track with rolling carriages.
// Bottom: small floor guide pin (not a full channel track).
// Each panel is tall, narrow (portrait), thin aluminum frames, 90%+ glass.
//
// Fold hierarchy (opens to left):
//   Panel 1: hinged to left frame jamb, swings right/outward
//   Panel 2: hinged to panel 1's right edge, counter-folds
//   Panel 3: hinged to panel 2's right edge, folds same as panel 1
//   Panel 4: hinged to panel 3's right edge, counter-folds
//   Result: all 4 panels stack against left wall in a zigzag

export function FoldingDoor({ width, height, frameColor, glassType, isOpen }: {
  width: number; height: number; frameColor: string; glassType: string; isOpen: boolean
}) {
  const t = 0.06, d = 0.07
  const panelW = (width - t * 2) / 4
  const sashT = t * 0.55  // thin sash frame for maximum glass
  const glassW = panelW - sashT * 2
  const glassH = height - t * 2 - sashT * 2

  // Spring refs for each fold joint
  const joint1 = useRef<THREE.Group>(null)  // Panel 1 hinge (at left jamb)
  const joint2 = useRef<THREE.Group>(null)  // Panel 2 hinge (at panel 1 right edge)
  const joint3 = useRef<THREE.Group>(null)  // Panel 3 hinge (at panel 2 right edge)
  const joint4 = useRef<THREE.Group>(null)  // Panel 4 hinge (at panel 3 right edge)
  const sp1 = useRef<SpringState>({ pos: 0, vel: 0 })
  const sp2 = useRef<SpringState>({ pos: 0, vel: 0 })
  const sp3 = useRef<SpringState>({ pos: 0, vel: 0 })
  const sp4 = useRef<SpringState>({ pos: 0, vel: 0 })

  useFrame((_, dt) => {
    // When open: panels fold ~150° at each joint, alternating direction
    const foldAngle = isOpen ? Math.PI * 0.82 : 0
    const a1 = springStep(sp1.current, foldAngle, dt, 50, 13)
    const a2 = springStep(sp2.current, -foldAngle, dt, 45, 13)
    const a3 = springStep(sp3.current, foldAngle, dt, 42, 13)
    const a4 = springStep(sp4.current, -foldAngle, dt, 40, 13)
    if (joint1.current) joint1.current.rotation.y = a1
    if (joint2.current) joint2.current.rotation.y = a2
    if (joint3.current) joint3.current.rotation.y = a3
    if (joint4.current) joint4.current.rotation.y = a4
  })

  // Single glass panel component
  const Panel = () => (
    <group>
      <WindowFrame width={panelW} height={height - t * 2} depth={d * 0.45} thickness={sashT} color={frameColor} />
      <GlassPane width={glassW} height={glassH} glassType={glassType} />
    </group>
  )

  return (
    <group>
      {/* Outer frame (head, sill, jambs) */}
      <WindowFrame width={width} height={height} depth={d} thickness={t} color={frameColor} />

      {/* Overhead track (visible at top) */}
      <mesh position={[0, height / 2 - t * 0.5, d * 0.15]}>
        <boxGeometry args={[width - t * 1.5, 0.018, 0.025]} />
        <meshStandardMaterial color="#888" roughness={0.25} metalness={0.6} />
      </mesh>

      {/* Floor guide pin (small, centered) */}
      <mesh position={[0, -height / 2 + t * 0.3, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.015, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Accordion fold chain: all panels linked from left jamb */}
      {/* Joint 1: Panel 1 pivots at left jamb */}
      <group position={[-width / 2 + t, 0, 0]}>
        <group ref={joint1}>
          {/* Panel 1 */}
          <group position={[panelW / 2, 0, 0]}>
            <Panel />
            {/* Hinge hardware between panel 1 and 2 */}
            <Hinge position={[panelW / 2, height / 4, d * 0.2]} />
            <Hinge position={[panelW / 2, -height / 4, d * 0.2]} />

            {/* Joint 2: Panel 2 pivots at panel 1 right edge */}
            <group position={[panelW / 2, 0, 0]}>
              <group ref={joint2}>
                <group position={[panelW / 2, 0, 0]}>
                  <Panel />
                  <Hinge position={[panelW / 2, height / 4, d * 0.2]} />
                  <Hinge position={[panelW / 2, -height / 4, d * 0.2]} />

                  {/* Joint 3: Panel 3 pivots at panel 2 right edge */}
                  <group position={[panelW / 2, 0, 0]}>
                    <group ref={joint3}>
                      <group position={[panelW / 2, 0, 0]}>
                        <Panel />
                        <Hinge position={[panelW / 2, height / 4, d * 0.2]} />
                        <Hinge position={[panelW / 2, -height / 4, d * 0.2]} />

                        {/* Joint 4: Panel 4 pivots at panel 3 right edge */}
                        <group position={[panelW / 2, 0, 0]}>
                          <group ref={joint4}>
                            <group position={[panelW / 2, 0, 0]}>
                              <Panel />
                            </group>
                          </group>
                        </group>
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Floor threshold */}
      <mesh position={[0, -height / 2 - 0.012, 0]}>
        <boxGeometry args={[width + 0.02, 0.02, d * 1.3]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.03} />
      </mesh>
    </group>
  )
}
