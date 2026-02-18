"use client"
import * as THREE from "three"

// Physically-accurate glass configs (Context7: Three.js MeshPhysicalMaterial)
// IOR: Float glass = 1.52 | All types use standard soda-lime glass IOR
export const GLASS_CONFIGS: Record<string, {
  color: string; transmission: number; roughness: number;
  ior: number; thickness: number;
  attenuationColor: string; attenuationDistance: number;
  specularIntensity: number; clearcoat: number; clearcoatRoughness: number;
}> = {
  clear: {
    color: "#ffffff", transmission: 1.0, roughness: 0.0,
    ior: 1.52, thickness: 0.5,
    attenuationColor: "#ffffff", attenuationDistance: 0,
    specularIntensity: 1.0, clearcoat: 0.1, clearcoatRoughness: 0.1,
  },
  "low-e": {
    color: "#e8f4e8", transmission: 0.92, roughness: 0.02,
    ior: 1.52, thickness: 0.6,
    attenuationColor: "#d4edda", attenuationDistance: 2.0,
    specularIntensity: 0.9, clearcoat: 0.3, clearcoatRoughness: 0.05,
  },
  tinted: {
    color: "#8bb8d4", transmission: 0.75, roughness: 0.02,
    ior: 1.52, thickness: 0.8,
    attenuationColor: "#6aa3c7", attenuationDistance: 1.5,
    specularIntensity: 0.8, clearcoat: 0.15, clearcoatRoughness: 0.1,
  },
  frosted: {
    color: "#e8eef2", transmission: 0.6, roughness: 0.65,
    ior: 1.52, thickness: 0.5,
    attenuationColor: "#dde5eb", attenuationDistance: 1.0,
    specularIntensity: 0.5, clearcoat: 0.0, clearcoatRoughness: 0.4,
  },
  tempered: {
    color: "#f0f8ff", transmission: 0.98, roughness: 0.0,
    ior: 1.52, thickness: 1.0,
    attenuationColor: "#f0f8ff", attenuationDistance: 0,
    specularIntensity: 1.0, clearcoat: 0.2, clearcoatRoughness: 0.05,
  },
}

export function GlassPane({
  width, height,
  position = [0, 0, 0],
  glassType = "clear",
  rotation = [0, 0, 0],
}: {
  width: number; height: number;
  position?: [number, number, number];
  glassType?: string;
  rotation?: [number, number, number];
}) {
  const g = GLASS_CONFIGS[glassType] || GLASS_CONFIGS.clear
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[width, height, 0.012]} />
      <meshPhysicalMaterial
        color={g.color} transparent opacity={1.0}
        roughness={g.roughness} metalness={0}
        ior={g.ior} transmission={g.transmission} thickness={g.thickness}
        attenuationColor={g.attenuationColor} attenuationDistance={g.attenuationDistance}
        specularIntensity={g.specularIntensity} specularColor="#ffffff"
        clearcoat={g.clearcoat} clearcoatRoughness={g.clearcoatRoughness}
        envMapIntensity={1.5} side={THREE.DoubleSide}
      />
    </mesh>
  )
}
