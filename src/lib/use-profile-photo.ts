"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Hook to read the user's profile photo.
 * - For the CURRENT user (isCurrentUser=true): reads from localStorage + syncs to DB
 * - For OTHER users (isCurrentUser=false): fetches from DB via sender.image field
 *
 * The settings page stores photo as base64 in `verrex_prefs_{userId}`.
 * This hook also pushes that to the DB so other users can see it.
 */
export function useProfilePhoto(userId: string, isCurrentUser = false): string {
  const [photo, setPhoto] = useState("")

  useEffect(() => {
    if (!userId || typeof window === "undefined") return

    if (isCurrentUser) {
      // Read from localStorage (current user's own photo)
      try {
        const raw = localStorage.getItem(`verrex_prefs_${userId}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          const localPhoto = parsed.profilePhoto || ""
          setPhoto(localPhoto)
          // Sync to DB in background
          if (localPhoto) {
            fetch("/api/portal/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: localPhoto }),
            }).catch(() => {})
          }
        }
      } catch { /* ignore */ }

      // Listen for storage changes
      const handler = (e: StorageEvent) => {
        if (e.key === `verrex_prefs_${userId}` && e.newValue) {
          try {
            const newPhoto = JSON.parse(e.newValue).profilePhoto || ""
            setPhoto(newPhoto)
            // Sync to DB
            if (newPhoto) {
              fetch("/api/portal/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: newPhoto }),
              }).catch(() => {})
            }
          } catch { /* ignore */ }
        }
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    }
  }, [userId, isCurrentUser])

  return photo
}

/**
 * Save profile photo to localStorage AND sync to DB.
 */
export async function saveProfilePhoto(userId: string, photoBase64: string) {
  if (typeof window === "undefined") return

  // Save to localStorage
  try {
    const raw = localStorage.getItem(`verrex_prefs_${userId}`)
    const prefs = raw ? JSON.parse(raw) : {}
    prefs.profilePhoto = photoBase64
    localStorage.setItem(`verrex_prefs_${userId}`, JSON.stringify(prefs))
  } catch { /* ignore */ }

  // Sync to DB
  try {
    await fetch("/api/portal/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: photoBase64 }),
    })
  } catch { /* ignore */ }
}
