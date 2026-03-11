import React from "react"
import Image from "next/image"

interface VEREXLogoProps {
  className?: string
  size?: number
  variant?: "icon" | "full"
}

/**
 * VEREX VX Logo — Uses the official VX logo SVG image.
 * Displays the logo at the requested size with proper dark/light mode handling.
 */
export function VEREXIcon({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/images/vx-logo.svg"
      alt="VEREX logo"
      width={size}
      height={size}
      className={`object-contain dark:brightness-0 dark:invert ${className}`}
      priority
    />
  )
}

export function VEREXLogo({ className = "", size = 44, variant = "icon" }: VEREXLogoProps) {
  if (variant === "icon") {
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/vx-logo.svg"
          alt="VEREX logo"
          width={size}
          height={size}
          className="object-contain dark:brightness-0 dark:invert"
          priority
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/vx-logo.svg"
          alt="VEREX logo"
          width={size}
          height={size}
          className="object-contain dark:brightness-0 dark:invert"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-extrabold tracking-tight leading-none">
          VEREX
        </span>
        <span className="text-[9px] tracking-[0.2em] uppercase opacity-60 leading-tight mt-0.5">
          Windows & Doors
        </span>
      </div>
    </div>
  )
}
