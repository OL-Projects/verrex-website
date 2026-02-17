"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react"

gsap.registerPlugin(useGSAP)

interface Window3DViewerProps {
  windowType: string
  icon: string
  color?: string
}

export function Window3DViewer({ windowType, icon, color = "#3b82f6" }: Window3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: -15, y: 25 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Entry animation with GSAP
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    tl.from(".window-frame", {
      scale: 0.3,
      opacity: 0,
      rotationY: -90,
      duration: 1,
    })
      .from(".window-glass", {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
      }, "-=0.4")
      .from(".window-handle", {
        scale: 0,
        opacity: 0,
        duration: 0.4,
      }, "-=0.2")
      .from(".window-label", {
        y: 20,
        opacity: 0,
        duration: 0.5,
      }, "-=0.2")

    // Subtle idle float animation
    gsap.to(".window-scene", {
      y: -5,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    })
  }, { scope: containerRef, dependencies: [windowType], revertOnUpdate: true })

  // Mouse/touch drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - dy * 0.5)),
      y: prev.y + dx * 0.5,
    }))
    lastPos.current = { x: e.clientX, y: e.clientY }
  }, [isDragging])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Scroll zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)))
  }, [])

  const resetView = () => {
    gsap.to({}, {
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: function() {
        const progress = this.progress()
        setRotation({
          x: rotation.x + (-15 - rotation.x) * progress,
          y: rotation.y + (25 - rotation.y) * progress,
        })
        setZoom(zoom + (1 - zoom) * progress)
      }
    })
  }

  // Get window-specific 3D shape
  const getWindowShape = () => {
    switch (windowType) {
      case "double-hung":
        return (
          <div className="window-frame relative" style={{ width: 180, height: 280 }}>
            <div className="absolute inset-0 rounded-lg border-[12px] border-slate-700 dark:border-slate-300 bg-transparent shadow-2xl">
              {/* Top sash */}
              <div className="window-glass absolute top-0 left-0 right-0 h-[48%] bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30 border-b-[3px] border-slate-600 dark:border-slate-400 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
              </div>
              {/* Bottom sash */}
              <div className="window-glass absolute bottom-0 left-0 right-0 h-[48%] bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
              </div>
              {/* Center divider */}
              <div className="absolute top-[48%] left-0 right-0 h-[4%] bg-slate-600 dark:bg-slate-400" />
              {/* Window handle */}
              <div className="window-handle absolute top-[55%] left-1/2 -translate-x-1/2 w-8 h-2 bg-slate-500 dark:bg-slate-300 rounded-full" />
            </div>
          </div>
        )
      case "casement":
        return (
          <div className="window-frame relative" style={{ width: 200, height: 280 }}>
            <div className="absolute inset-0 rounded-lg border-[12px] border-slate-700 dark:border-slate-300 shadow-2xl">
              <div className="window-glass absolute inset-0 bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
                {/* Vertical divider */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-slate-600 dark:bg-slate-400 -translate-x-1/2" />
              </div>
              {/* Crank handle */}
              <div className="window-handle absolute bottom-4 right-4 w-6 h-6 border-2 border-slate-500 dark:border-slate-300 rounded-full">
                <div className="absolute top-1/2 left-1/2 w-3 h-[2px] bg-slate-500 dark:bg-slate-300 -translate-y-1/2" />
              </div>
            </div>
          </div>
        )
      case "sliding":
        return (
          <div className="window-frame relative" style={{ width: 280, height: 200 }}>
            <div className="absolute inset-0 rounded-lg border-[12px] border-slate-700 dark:border-slate-300 shadow-2xl">
              <div className="window-glass absolute inset-0 bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
                <div className="absolute top-0 bottom-0 left-1/2 w-[4px] bg-slate-600 dark:bg-slate-400 -translate-x-1/2" />
              </div>
              <div className="window-handle absolute top-1/2 left-[52%] w-2 h-10 bg-slate-500 dark:bg-slate-300 rounded-full -translate-y-1/2" />
            </div>
          </div>
        )
      case "bay-bow":
        return (
          <div className="window-frame relative flex" style={{ width: 300, height: 240 }}>
            {/* Left angled panel */}
            <div className="w-[25%] h-full border-[8px] border-slate-700 dark:border-slate-300 -skew-y-6 shadow-xl">
              <div className="window-glass h-full bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
              </div>
            </div>
            {/* Center panel */}
            <div className="w-[50%] h-full border-[10px] border-slate-700 dark:border-slate-300 shadow-2xl z-10">
              <div className="window-glass h-full bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
              </div>
            </div>
            {/* Right angled panel */}
            <div className="w-[25%] h-full border-[8px] border-slate-700 dark:border-slate-300 skew-y-6 shadow-xl">
              <div className="window-glass h-full bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
              </div>
            </div>
          </div>
        )
      default:
        // Generic window shape for other types
        return (
          <div className="window-frame relative" style={{ width: 200, height: 260 }}>
            <div className="absolute inset-0 rounded-lg border-[12px] border-slate-700 dark:border-slate-300 shadow-2xl">
              <div className="window-glass absolute inset-0 bg-gradient-to-br from-sky-200/60 to-blue-300/40 dark:from-sky-800/40 dark:to-blue-900/30 backdrop-blur-sm flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tl from-white/20 to-transparent" />
                <span className="text-5xl relative z-10">{icon}</span>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0a0f1a] dark:to-[#060b14] rounded-2xl overflow-hidden select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* 3D Scene */}
      <div
        className="window-scene"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "center center",
        }}
      >
        <div
          ref={windowRef}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            transformStyle: "preserve-3d",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {getWindowShape()}
        </div>
      </div>

      {/* Drag hint */}
      <div className="window-label absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 dark:bg-white/10 backdrop-blur-sm text-white text-xs">
        <Move className="h-3 w-3" /> Drag to rotate • Scroll to zoom
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(2, z + 0.2)) }}
          className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.2)) }}
          className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); resetView() }}
          className="h-8 w-8 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
