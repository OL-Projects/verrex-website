"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Monitor, Smartphone } from "lucide-react"

const DESKTOP_WIDTH = 1280

export function ViewportToggle() {
  const [mounted, setMounted] = useState(false)
  const [isDesktopMode, setIsDesktopMode] = useState(false)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  // Store physical screen width on first load (before any viewport changes)
  const physicalWidth = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
    // Capture the PHYSICAL screen width on mount - this never changes regardless of viewport
    physicalWidth.current = window.screen.width
    
    const checkMobile = window.screen.width < 1024 || 
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobileDevice(checkMobile)

    // Restore saved preference
    const saved = localStorage.getItem("verrex-viewport-mode")
    if (saved === "desktop" && checkMobile) {
      setIsDesktopMode(true)
      setTimeout(() => switchToDesktop(), 200)
    }
  }, [])

  const switchToDesktop = useCallback(() => {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) return

    // Use stored physical screen width (never changes with zoom)
    const screenW = physicalWidth.current || window.screen.width
    const scale = Math.round((screenW / DESKTOP_WIDTH) * 1000) / 1000

    // Step 1: Reset viewport first to normalize
    viewport.setAttribute("content", "width=device-width, initial-scale=1")
    
    // Step 2: After browser processes reset, apply desktop viewport
    requestAnimationFrame(() => {
      setTimeout(() => {
        viewport.setAttribute(
          "content",
          `width=${DESKTOP_WIDTH}, initial-scale=${scale}, minimum-scale=${scale * 0.5}, maximum-scale=3, user-scalable=yes`
        )
        document.documentElement.classList.add("desktop-forced")
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 50)
    })
  }, [])

  const switchToMobile = useCallback(() => {
    const viewport = document.querySelector('meta[name="viewport"]')
    if (!viewport) return

    document.documentElement.classList.remove("desktop-forced")
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
    )
  }, [])

  // Handle orientation changes
  useEffect(() => {
    const handleOrientation = () => {
      // Re-capture physical width after rotation
      setTimeout(() => {
        physicalWidth.current = window.screen.width
        if (isDesktopMode) {
          switchToDesktop()
        }
      }, 300)
    }
    window.addEventListener("orientationchange", handleOrientation)
    return () => window.removeEventListener("orientationchange", handleOrientation)
  }, [isDesktopMode, switchToDesktop])

  const toggle = () => {
    const newMode = !isDesktopMode
    setIsDesktopMode(newMode)
    localStorage.setItem("verrex-viewport-mode", newMode ? "desktop" : "mobile")
    
    if (newMode) {
      switchToDesktop()
    } else {
      switchToMobile()
    }
  }

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
  }

  if (!isMobileDevice) return null

  return (
    <button
      onClick={toggle}
      className={`relative h-9 w-9 rounded-lg border flex items-center justify-center overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        isDesktopMode
          ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
      }`}
      aria-label={`Switch to ${isDesktopMode ? "mobile" : "desktop"} view`}
      title={isDesktopMode ? "Back to Mobile View" : "Switch to Desktop View"}
    >
      {isDesktopMode ? (
        <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      ) : (
        <Smartphone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      )}
      {isDesktopMode && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      )}
    </button>
  )
}
