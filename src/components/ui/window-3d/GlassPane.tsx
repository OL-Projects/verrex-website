"use client"
import { MeshTransmissionMaterial } from "@react-three/drei"

// ═══════════════════════════════════════════════════════════════
// Physically-based glass configurations
// IOR: Soda-lime float glass = 1.52 (ASTM C1036 / CSA A440)
// Real-world glass thickness reference:
//   Single pane: 3–6 mm | IGU double: 22 mm (4-14-4) | IGU triple: 36 mm
// MeshTransmissionMaterial from Drei — real refraction, caustics,
// chromatic aberration, anisotropic blur
// ═══════════════════════════════════════════════════════════════

export const GLASS_CONFIGS: Record<string, {
  color: string
  transmission: number
  thickness: number
  roughness: number
  chromaticAberration: number
  anisotropicBlur: number
  distortion: number
  ior: number
}> = {
  // Standard clear float glass — maximum transparency, slight edge refraction
  clear: {
    color: "#ffffff",
    transmission: 1,
    thickness: 0.4,
    roughness: 0,
    chromaticAberration: 0.04,
    anisotropicBlur: 0.06,
    distortion: 0,
    ior: 1.52,
  },
  // Low-emissivity coating — slight green tint, reduced solar heat gain
  "low-e": {
    color: "#dceeda",
    transmission: 0.92,
    thickness: 0.5,
    roughness: 0.02,
    chromaticAberration: 0.02,
    anisotropicBlur: 0.04,
    distortion: 0,
    ior: 1.52,
  },
  // Solar tinted (grey-blue) — reduces glare and heat transmission
  tinted: {
    color: "#7aaec8",
    transmission: 0.7,
    thickness: 0.6,
    roughness: 0.01,
    chromaticAberration: 0.03,
    anisotropicBlur: 0.05,
    distortion: 0,
    ior: 1.52,
  },
  // Acid-etched / sandblasted frosted — privacy glass with diffused light
  frosted: {
    color: "#e4eaef",
    transmission: 0.82,
    thickness: 0.35,
    roughness: 0.6,
    chromaticAberration: 0.01,
    anisotropicBlur: 0.9,
    distortion: 0.08,
    ior: 1.52,
  },
  // Tempered safety glass (CSA certified) — optically clear, thicker for strength
  tempered: {
    color: "#f2f9ff",
    transmission: 0.98,
    thickness: 0.55,
    roughness: 0,
    chromaticAberration: 0.045,
    anisotropicBlur: 0.05,
    distortion: 0,
    ior: 1.52,
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
      <MeshTransmissionMaterial
        transmissionSampler
        color={g.color}
        transmission={g.transmission}
        thickness={g.thickness}
        roughness={g.roughness}
        chromaticAberration={g.chromaticAberration}
        anisotropicBlur={g.anisotropicBlur}
        distortion={g.distortion}
        distortionScale={0.5}
        temporalDistortion={0}
        ior={g.ior}
        envMapIntensity={1.5}
      />
    </mesh>
  )
}
