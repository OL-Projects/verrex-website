"use client"

import { useState, useEffect } from "react"

/**
 * Hook to read the user's profile photo from localStorage.
 * The photo is stored by the settings page as base64 in `verrex_prefs_{userId}`.
 */
export function useProfilePhoto(userId: string): string {
  const [photo, setPhoto] = useState("")

  useEffect(() => {
    if (!userId || typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(`verrex_prefs_${userId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        setPhoto(parsed.profilePhoto || "")
      }
    } catch { /* ignore */ }

    // Listen for storage changes (e.g. settings page updates photo)
    const handler = (e: StorageEvent) => {
      if (e.key === `verrex_prefs_${userId}` && e.newValue) {
        try { setPhoto(JSON.parse(e.newValue).profilePhoto || "") } catch { /* ignore */ }
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [userId])

  return photo
}
