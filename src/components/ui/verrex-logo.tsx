import React from "react"

interface VerrexLogoProps {
  className?: string
  size?: number
  variant?: "icon" | "full"
}

/**
 * VERREX VX Monogram Logo — Premium Edition
 * A sophisticated V+X geometric mark with layered strokes,
 * inner glow, and gradient depth for a high-end brand feel.
 */
export function VerrexIcon({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 48 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-label="VERREX logo"
    >
      <defs>
        {/* Primary gradient — bright blue to white */}
        <linearGradient id="vx-main" x1="8" y1="4" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="35%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
        {/* Glow gradient for shadow strokes */}
        <linearGradient id="vx-glow" x1="8" y1="4" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#BFDBFE" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
        </linearGradient>
        {/* Accent gradient for X extensions */}
        <linearGradient id="vx-accent" x1="16" y1="30" x2="32" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.6" />
        </linearGradient>
        {/* Soft glow filter */}
        <filter id="vx-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow layer — soft V shadow */}
      <path
        d="M8 7L24 33L40 7"
        stroke="url(#vx-glow)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* V — Primary shape (bold, crisp) */}
      <path
        d="M8 7L24 33L40 7"
        stroke="url(#vx-main)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#vx-soft-glow)"
      />

      {/* X — Left extension from vertex */}
      <path
        d="M24 33L13 45"
        stroke="url(#vx-accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* X — Right extension from vertex */}
      <path
        d="M24 33L35 45"
        stroke="url(#vx-accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* X glow shadows */}
      <path d="M24 33L13 45" stroke="url(#vx-glow)" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
      <path d="M24 33L35 45" stroke="url(#vx-glow)" strokeWidth="6" strokeLinecap="round" opacity="0.3" />

      {/* Vertex highlight — luminous point where V meets X */}
      <circle cx="24" cy="33" r="3" fill="url(#vx-main)" opacity="0.35" />
      <circle cx="24" cy="33" r="1.5" fill="white" opacity="0.8" />

      {/* Top accent highlights on V arms */}
      <circle cx="8" cy="7" r="1.2" fill="white" opacity="0.6" />
      <circle cx="40" cy="7" r="1.2" fill="white" opacity="0.6" />
    </svg>
  )
}

export function VerrexLogo({ className = "", size = 44, variant = "icon" }: VerrexLogoProps) {
  if (variant === "icon") {
    return (
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 shadow-lg shadow-blue-500/30 ring-1 ring-white/10 ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Inner subtle highlight */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-transparent to-white/10" />
        <VerrexIcon size={size * 0.62} />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 shadow-lg shadow-blue-500/30 ring-1 ring-white/10"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent via-transparent to-white/10" />
        <VerrexIcon size={size * 0.62} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-extrabold tracking-tight leading-none">
          VERREX
        </span>
        <span className="text-[9px] tracking-[0.2em] uppercase opacity-60 leading-tight mt-0.5">
          Windows & Doors
        </span>
      </div>
    </div>
  )
}
