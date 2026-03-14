"use client"

import { useState, useEffect } from "react"

// Custom event name for same-tab photo updates
const PHOTO_CHANGED_EVENT = "verrex-profile-photo-changed"

/**
 * Dispatch a custom event when profile photo changes (for same-tab listeners).
 * StorageEvent only fires across tabs, so we need this for sidebar/topbar/etc.
 */
export function dispatchPhotoChanged(userId: string, photo: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(PHOTO_CHANGED_EVENT, { detail: { userId, photo } }))
}

/**
 * Hook to read the user's profile photo.
 * - For the CURRENT user (isCurrentUser=true): reads from localStorage + syncs to DB
 * - For OTHER users (isCurrentUser=false): fetches from DB via sender.image field
 *
 * Listens for both StorageEvent (cross-tab) and custom event (same-tab) changes.
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

      // Listen for storage changes (cross-tab)
      const storageHandler = (e: StorageEvent) => {
        if (e.key === `verrex_prefs_${userId}` && e.newValue) {
          try {
            const newPhoto = JSON.parse(e.newValue).profilePhoto || ""
            setPhoto(newPhoto)
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

      // Listen for custom event (same-tab — sidebar, topbar, etc.)
      const customHandler = (e: Event) => {
        const detail = (e as CustomEvent).detail
        if (detail?.userId === userId) {
          setPhoto(detail.photo || "")
        }
      }

      window.addEventListener("storage", storageHandler)
      window.addEventListener(PHOTO_CHANGED_EVENT, customHandler)
      return () => {
        window.removeEventListener("storage", storageHandler)
        window.removeEventListener(PHOTO_CHANGED_EVENT, customHandler)
      }
    }
  }, [userId, isCurrentUser])

  return photo
}

/**
 * Save profile photo to localStorage AND sync to DB.
 * Also dispatches a same-tab event so all components update immediately.
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

  // Dispatch same-tab event for immediate refresh
  dispatchPhotoChanged(userId, photoBase64)

  // Sync to DB
  try {
    await fetch("/api/portal/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: photoBase64 }),
    })
  } catch { /* ignore */ }
}

/**
 * Compress an image file using canvas.
 * Returns a base64 data URL that fits under maxSizeBytes.
 * Accepts PNG, JPEG, and SVG files.
 */
export function compressImage(file: File, maxSizeBytes = 2 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    // SVGs are already small — read directly
    if (file.type === "image/svg+xml") {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error("Failed to read SVG"))
      reader.readAsDataURL(file)
      return
    }

    // For raster images (PNG, JPEG): use canvas to compress
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      let quality = 0.9
      const maxDim = 1200 // Max dimension for profile photos

      // Scale down if too large
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) { reject(new Error("Canvas not supported")); return }

      ctx.drawImage(img, 0, 0, width, height)

      // Iteratively reduce quality until under maxSizeBytes
      let dataUrl = canvas.toDataURL("image/jpeg", quality)
      let attempts = 0

      while (dataUrl.length > maxSizeBytes * 1.37 && quality > 0.1 && attempts < 10) {
        // 1.37 accounts for base64 overhead (~37% larger than binary)
        quality -= 0.1
        dataUrl = canvas.toDataURL("image/jpeg", quality)
        attempts++
      }

      // If still too large, scale down further
      if (dataUrl.length > maxSizeBytes * 1.37) {
        const furtherScale = 0.6
        canvas.width = Math.round(width * furtherScale)
        canvas.height = Math.round(height * furtherScale)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        dataUrl = canvas.toDataURL("image/jpeg", 0.7)
      }

      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}
