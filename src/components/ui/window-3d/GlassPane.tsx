"use client"

// ═══════════════════════════════════════════════════════════════
// Clean glass material — simple transparency with env reflections
// No transmission buffer = no self-reflection artifacts
// Uses meshStandardMaterial for clean, artifact-free rendering
// ═══════════════════════════════════════════════════════════════

export const GLASS_CONFIGS: Record<string, {
  color: string
  opacity: number
  roughness: number
  metalness: number
  envMapIntensity: number
}> = {
  clear: {
    color: "#f0f5fa",
    opacity: 0.12,
    roughness: 0.05,
    metalness: 0.1,
    envMapIntensity: 0.4,
  },
  "low-e": {
    color: "#d4ecd6",
    opacity: 0.18,
    roughness: 0.08,
    metalness: 0.1,
    envMapIntensity: 0.35,
  },
  tinted: {
    color: "#6a9ab8",
    opacity: 0.35,
    roughness: 0.06,
    metalness: 0.08,
    envMapIntensity: 0.3,
  },
  frosted: {
    color: "#dce3e8",
    opacity: 0.6,
    roughness: 0.5,
    metalness: 0.02,
    envMapIntensity: 0.15,
  },
  tempered: {
    color: "#f2f8ff",
    opacity: 0.1,
    roughness: 0.03,
    metalness: 0.12,
    envMapIntensity: 0.45,
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
      <boxGeometry args={[width, height, 0.008]} />
      <meshStandardMaterial
        color={g.color}
        transparent
        opacity={g.opacity}
        roughness={g.roughness}
        metalness={g.metalness}
        envMapIntensity={g.envMapIntensity}
      />
    </mesh>
  )
}
