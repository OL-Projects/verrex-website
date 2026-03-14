"use client"

interface UserAvatarProps {
  image?: string | null
  name: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-12 w-12 text-lg",
}

/**
 * Shared avatar component — renders user's profile photo from DB
 * or falls back to gradient circle with first initial.
 * Use everywhere avatars appear for consistent cross-role propagation.
 */
export default function UserAvatar({ image, name, size = "md", className = "" }: UserAvatarProps) {
  const sc = sizeClasses[size]
  const initial = name?.charAt(0)?.toUpperCase() || "?"

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sc} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <div className={`${sc} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initial}
    </div>
  )
}
