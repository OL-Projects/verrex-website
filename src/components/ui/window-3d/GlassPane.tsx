"use client"

// ═══════════════════════════════════════════════════════════════
// Physically-based glass using native meshPhysicalMaterial
// IOR: Soda-lime float glass = 1.52 (ASTM C1036 / CSA A440)
// Uses Three.js built-in transmission (no infinite mirror recursion)
// ═══════════════════════════════════════════════════════════════

export const GLASS_CONFIGS: Record<string, {
  color: string
  transmission: number
  thickness: number
  roughness: number
  ior: number
  clearcoat: number
  opacity: number
}> = {
  clear: {
    color: "#f8fbff",
    transmission: 0.96,
    thickness: 0.5,
    roughness: 0.05,
    ior: 1.52,
    clearcoat: 0.1,
    opacity: 1,
  },
  "low-e": {
    color: "#dceeda",
    transmission: 0.88,
    thickness: 0.5,
    roughness: 0.08,
    ior: 1.52,
    clearcoat: 0.15,
    opacity: 1,
  },
  tinted: {
    color: "#7aaec8",
    transmission: 0.65,
    thickness: 0.6,
    roughness: 0.06,
    ior: 1.52,
    clearcoat: 0.1,
    opacity: 1,
  },
  frosted: {
    color: "#e4eaef",
    transmission: 0.7,
    thickness: 0.35,
    roughness: 0.55,
    ior: 1.52,
    clearcoat: 0,
    opacity: 1,
  },
  tempered: {
    color: "#f2f9ff",
    transmission: 0.95,
    thickness: 0.55,
    roughness: 0.03,
    ior: 1.52,
    clearcoat: 0.15,
    opacity: 1,
  },
}

export function GlassPane({
  width,
  height,
  position = [0, 0, 0],
  glassType = "clear",
  rotation = [0, 0, 0],
}: {
  width: number
  height: number
  position?: [number, number, number]
  glassType?: string
  rotation?: [number, number, number]
}) {
  const g = GLASS_CONFIGS[glassType] || GLASS_CONFIGS.clear

  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[width, height, 0.012]} />
      <meshPhysicalMaterial
        color={g.color}
        transmission={g.transmission}
        thickness={g.thickness}
        roughness={g.roughness}
        metalness={0}
        ior={g.ior}
        clearcoat={g.clearcoat}
        clearcoatRoughness={0.1}
        envMapIntensity={0.6}
        transparent
        opacity={g.opacity}
      />
    </mesh>
  )
}
