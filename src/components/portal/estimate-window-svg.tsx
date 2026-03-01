"use client"

import { WINDOW_TYPES, toFraction, moduleWidth, isDoorType } from "@/lib/estimate-config"

interface Props { width: number; height: number; type: string; flipH?: boolean }

export function EstimateWindowSVG({ width, height, type, flipH = false }: Props) {
  const cfg = WINDOW_TYPES[type]
  const modules = cfg?.modules || ["FIX"]
  const isDoor = isDoorType(type)
  const n = modules.length
  const ratio = isDoor ? Math.max(1.4, Math.min(height / width, 3.0)) : Math.max(0.3, Math.min(height / width, 2.5))
  const svgW = 280
  const svgH = Math.min(svgW * ratio, isDoor ? 320 : 260)
  const f = 6
  const m = 4
  const sash = 2.5
  const innerW = svgW - 2 * f
  const innerH = svgH - 2 * f
  const totalM = (n - 1) * m
  const mw = (innerW - totalM) / n
  const labelY = svgH + 13
  const dimY = svgH + 24
  const extY = svgH + 36

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH + 40}`} className="w-full max-h-[320px]" style={flipH ? { transform: "scaleX(-1)" } : undefined}>
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8d4e8" stopOpacity={0.25} />
          <stop offset="50%" stopColor="#d4e8f4" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#a8c8de" stopOpacity={0.3} />
        </linearGradient>
        <linearGradient id="doorPanel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b7355" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#6b5335" stopOpacity={0.25} />
        </linearGradient>
        <filter id="frameSh"><feDropShadow dx={0} dy={1} stdDeviation={1.5} floodOpacity={0.12} /></filter>
      </defs>

      {/* Outer frame */}
      <rect x={0} y={0} width={svgW} height={svgH} fill="currentColor" className="text-slate-700 dark:text-slate-400" rx={3} filter="url(#frameSh)" />
      <rect x={f} y={f} width={innerW} height={innerH} fill="currentColor" className="text-slate-100 dark:text-slate-800" rx={1} />

      {/* Door threshold */}
      {isDoor && <rect x={0} y={svgH - 4} width={svgW} height={5} fill="currentColor" className="text-slate-600 dark:text-slate-500" rx={1} />}

      {modules.map((mod, i) => {
        const mx = f + i * (mw + m)
        const my = f
        const cx = mx + mw / 2
        const cy = my + innerH / 2
        const dimW = moduleWidth(width, n)
        const sx = mx + sash, sy = my + sash, sw = mw - 2 * sash, sh = innerH - 2 * sash

        return (
          <g key={i}>
            {/* Mullion */}
            {i > 0 && <rect x={mx - m} y={f} width={m} height={innerH} fill="currentColor" className="text-slate-600 dark:text-slate-500" />}

            {/* Glass / panel fill */}
            <rect x={sx} y={sy} width={sw} height={sh} fill={isDoor ? "url(#doorPanel)" : "url(#glass)"} rx={0.5} />

            {/* Sash rail */}
            <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={0.5} />

            {/* ── WINDOW MODULES ── */}
            {mod === "FIX" && (
              <>
                <line x1={sx} y1={cy} x2={sx + sw} y2={cy} stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth={0.5} opacity={0.35} />
                <line x1={cx} y1={sy} x2={cx} y2={sy + sh} stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth={0.5} opacity={0.35} />
              </>
            )}

            {(mod === "CAS-L" || mod === "CAS-R") && (
              <>
                <line x1={sx + 1} y1={sy + 1} x2={sx + sw - 1} y2={sy + sh - 1} stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={0.7} />
                <line x1={sx + sw - 1} y1={sy + 1} x2={sx + 1} y2={sy + sh - 1} stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={0.7} />
                <circle cx={mod === "CAS-L" ? sx + sw - 8 : sx + 8} cy={cy} r={3} fill="currentColor" className="text-slate-500 dark:text-slate-400" />
                <rect x={mod === "CAS-L" ? sx + sw - 10 : sx + 6} y={cy - 10} width={4} height={20} rx={2} fill="currentColor" className="text-slate-400 dark:text-slate-500" opacity={0.6} />
              </>
            )}

            {(mod === "TT-L" || mod === "TT-R") && (
              <>
                {/* Tilt indicator: triangle from bottom center to top corners */}
                <line x1={cx} y1={sy + sh - 1} x2={sx + 1} y2={sy + 1} stroke="currentColor" className="text-blue-500" strokeWidth={0.8} strokeDasharray="4 2" />
                <line x1={cx} y1={sy + sh - 1} x2={sx + sw - 1} y2={sy + 1} stroke="currentColor" className="text-blue-500" strokeWidth={0.8} strokeDasharray="4 2" />
                {/* Turn indicator: triangle from hinge side to opposite corners */}
                {mod === "TT-L" ? (
                  <>
                    <line x1={sx + 1} y1={cy} x2={sx + sw - 1} y2={sy + 1} stroke="currentColor" className="text-red-500" strokeWidth={0.7} />
                    <line x1={sx + 1} y1={cy} x2={sx + sw - 1} y2={sy + sh - 1} stroke="currentColor" className="text-red-500" strokeWidth={0.7} />
                  </>
                ) : (
                  <>
                    <line x1={sx + sw - 1} y1={cy} x2={sx + 1} y2={sy + 1} stroke="currentColor" className="text-red-500" strokeWidth={0.7} />
                    <line x1={sx + sw - 1} y1={cy} x2={sx + 1} y2={sy + sh - 1} stroke="currentColor" className="text-red-500" strokeWidth={0.7} />
                  </>
                )}
                <circle cx={mod === "TT-L" ? sx + sw - 8 : sx + 8} cy={cy} r={3} fill="currentColor" className="text-slate-500" />
                <rect x={mod === "TT-L" ? sx + sw - 10 : sx + 6} y={cy - 10} width={4} height={20} rx={2} fill="currentColor" className="text-slate-400" opacity={0.6} />
              </>
            )}

            {mod === "AWNING" && (
              <>
                {/* Top-hung: hinge at top, opens outward from bottom */}
                <line x1={sx + 1} y1={sy + 1} x2={cx} y2={sy + sh - 1} stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={0.7} />
                <line x1={sx + sw - 1} y1={sy + 1} x2={cx} y2={sy + sh - 1} stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={0.7} />
                {/* Hinge bar at top */}
                <rect x={sx + 4} y={sy + 1} width={sw - 8} height={3} rx={1} fill="currentColor" className="text-slate-500 dark:text-slate-400" opacity={0.7} />
                {/* Handle at bottom */}
                <rect x={cx - 6} y={sy + sh - 8} width={12} height={4} rx={2} fill="currentColor" className="text-slate-500" opacity={0.7} />
              </>
            )}

            {mod === "SLIDE" && (
              <>
                <line x1={sx + 12} y1={cy} x2={sx + sw - 12} y2={cy} stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={1.2} />
                <polyline points={`${sx + sw - 20},${cy - 6} ${sx + sw - 12},${cy} ${sx + sw - 20},${cy + 6}`} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={1.2} />
                <line x1={sx + 4} y1={sy + sh - 4} x2={sx + sw - 4} y2={sy + sh - 4} stroke="currentColor" className="text-slate-400" strokeWidth={0.6} strokeDasharray="3 2" />
              </>
            )}

            {/* ── DOOR MODULES ── */}
            {(mod === "SWING-L-IN" || mod === "SWING-R-IN") && (() => {
              const hingeX = mod === "SWING-L-IN" ? sx : sx + sw
              const arcX = mod === "SWING-L-IN" ? sx + sw : sx
              const handleX = mod === "SWING-L-IN" ? sx + sw - 12 : sx + 8
              return (
                <>
                  {/* Glass panel (top portion) */}
                  <rect x={sx + 6} y={sy + 6} width={sw - 12} height={sh * 0.5} fill="url(#glass)" rx={1} stroke="currentColor" className="text-slate-400" strokeWidth={0.5} />
                  {/* Swing arc (dashed, inswing) */}
                  <path d={`M ${arcX} ${sy + sh} A ${sw} ${sw} 0 0 ${mod === "SWING-L-IN" ? 0 : 1} ${hingeX} ${sy + sh - sw * 0.7}`} fill="none" stroke="currentColor" className="text-blue-500" strokeWidth={0.8} strokeDasharray="4 3" />
                  {/* Hinge dots */}
                  <circle cx={hingeX} cy={sy + 12} r={2} fill="currentColor" className="text-slate-500" />
                  <circle cx={hingeX} cy={sy + sh - 12} r={2} fill="currentColor" className="text-slate-500" />
                  {/* Door handle */}
                  <circle cx={handleX} cy={cy + sh * 0.1} r={4} fill="none" stroke="currentColor" className="text-slate-500" strokeWidth={1.5} />
                </>
              )
            })()}

            {(mod === "SWING-L-OUT" || mod === "SWING-R-OUT") && (() => {
              const hingeX = mod === "SWING-L-OUT" ? sx : sx + sw
              const arcX = mod === "SWING-L-OUT" ? sx + sw : sx
              const handleX = mod === "SWING-L-OUT" ? sx + sw - 12 : sx + 8
              return (
                <>
                  <rect x={sx + 6} y={sy + 6} width={sw - 12} height={sh * 0.5} fill="url(#glass)" rx={1} stroke="currentColor" className="text-slate-400" strokeWidth={0.5} />
                  {/* Outswing arc (solid, outside) */}
                  <path d={`M ${arcX} ${sy + sh} A ${sw} ${sw} 0 0 ${mod === "SWING-L-OUT" ? 1 : 0} ${hingeX} ${sy + sh - sw * 0.7}`} fill="none" stroke="currentColor" className="text-green-500" strokeWidth={1} />
                  <circle cx={hingeX} cy={sy + 12} r={2} fill="currentColor" className="text-slate-500" />
                  <circle cx={hingeX} cy={sy + sh - 12} r={2} fill="currentColor" className="text-slate-500" />
                  <circle cx={handleX} cy={cy + sh * 0.1} r={4} fill="none" stroke="currentColor" className="text-slate-500" strokeWidth={1.5} />
                </>
              )
            })()}

            {(mod === "SLIDE-D" || mod === "FIX-D") && (
              <>
                {/* Door glass panel (top 60%) */}
                <rect x={sx + 6} y={sy + 6} width={sw - 12} height={sh * 0.55} fill="url(#glass)" rx={1} stroke="currentColor" className="text-slate-400" strokeWidth={0.5} />
                {mod === "SLIDE-D" && (
                  <>
                    <line x1={sx + 16} y1={cy + sh * 0.15} x2={sx + sw - 16} y2={cy + sh * 0.15} stroke="currentColor" className="text-slate-600" strokeWidth={1.2} />
                    <polyline points={`${sx + sw - 22},${cy + sh * 0.15 - 5} ${sx + sw - 16},${cy + sh * 0.15} ${sx + sw - 22},${cy + sh * 0.15 + 5}`} fill="none" stroke="currentColor" className="text-slate-600" strokeWidth={1.2} />
                    <line x1={sx + 4} y1={sy + sh - 6} x2={sx + sw - 4} y2={sy + sh - 6} stroke="currentColor" className="text-slate-400" strokeWidth={0.8} strokeDasharray="4 2" />
                    {/* Handle grip */}
                    <rect x={sx + sw - 14} y={cy + sh * 0.08} width={4} height={16} rx={2} fill="currentColor" className="text-slate-500" opacity={0.7} />
                  </>
                )}
                {mod === "FIX-D" && (
                  <>
                    <line x1={sx} y1={cy} x2={sx + sw} y2={cy} stroke="currentColor" className="text-slate-500" strokeWidth={0.4} opacity={0.3} />
                    <line x1={cx} y1={sy} x2={cx} y2={sy + sh} stroke="currentColor" className="text-slate-500" strokeWidth={0.4} opacity={0.3} />
                  </>
                )}
              </>
            )}

            {mod === "FOLD" && (
              <>
                {/* Top glass */}
                <rect x={sx + 5} y={sy + 5} width={sw - 10} height={sh * 0.5} fill="url(#glass)" rx={1} stroke="currentColor" className="text-slate-400" strokeWidth={0.5} />
                {/* Fold zigzag lines */}
                <line x1={cx} y1={sy + 2} x2={cx} y2={sy + sh - 2} stroke="currentColor" className="text-orange-500" strokeWidth={0.8} strokeDasharray="6 3" />
                {/* Fold arrows */}
                <polyline points={`${cx - 8},${cy - 4} ${cx},${cy} ${cx - 8},${cy + 4}`} fill="none" stroke="currentColor" className="text-orange-500" strokeWidth={0.8} />
                <polyline points={`${cx + 8},${cy - 4} ${cx},${cy} ${cx + 8},${cy + 4}`} fill="none" stroke="currentColor" className="text-orange-500" strokeWidth={0.8} />
                {/* Hinge pins */}
                <circle cx={i % 2 === 0 ? sx + 3 : sx + sw - 3} cy={sy + 10} r={1.5} fill="currentColor" className="text-slate-500" />
                <circle cx={i % 2 === 0 ? sx + 3 : sx + sw - 3} cy={sy + sh - 10} r={1.5} fill="currentColor" className="text-slate-500" />
              </>
            )}

            {/* Module label */}
            <text x={cx} y={labelY} textAnchor="middle" fontSize={8} fontWeight={700} fill="currentColor" className="text-slate-700 dark:text-slate-300">
              {mod.length > 8 ? mod.replace("SWING-", "SW-") : mod}
            </text>
            <text x={cx} y={dimY} textAnchor="middle" fontSize={7.5} fill="currentColor" className="text-slate-500 dark:text-slate-400">{toFraction(dimW)}</text>
          </g>
        )
      })}

      {/* Sill line (windows only) */}
      {!isDoor && <rect x={0} y={svgH - 2} width={svgW} height={3} fill="currentColor" className="text-slate-600 dark:text-slate-500" rx={1} />}

      <text x={svgW / 2} y={extY} textAnchor="middle" fontSize={8} fontStyle="italic" fill="currentColor" className="text-slate-400">
        {isDoor ? "Exterior View — Door" : "Exterior View"}
      </text>
    </svg>
  )
}
