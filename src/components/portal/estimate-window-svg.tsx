"use client"

import { WINDOW_TYPES, toFraction, moduleWidth } from "@/lib/estimate-config"

interface Props { width: number; height: number; type: string }

export function EstimateWindowSVG({ width, height, type }: Props) {
  const modules = WINDOW_TYPES[type]?.modules || ["FIX"]
  const n = modules.length
  const ratio = Math.max(0.3, Math.min(height / width, 2.5))
  const svgW = 280
  const svgH = Math.min(svgW * ratio, 260)
  const f = 6       // frame thickness
  const m = 4       // mullion width
  const sash = 2.5  // inner sash rail
  const innerW = svgW - 2 * f
  const innerH = svgH - 2 * f
  const totalM = (n - 1) * m
  const mw = (innerW - totalM) / n

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH + 38}`} className="w-full max-h-[280px]">
      <defs>
        {/* Glass gradient */}
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8d4e8" stopOpacity={0.25} />
          <stop offset="50%" stopColor="#d4e8f4" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#a8c8de" stopOpacity={0.3} />
        </linearGradient>
        {/* Frame shadow */}
        <filter id="frameSh"><feDropShadow dx={0} dy={1} stdDeviation={1.5} floodOpacity={0.12} /></filter>
      </defs>

      {/* Outer frame with shadow */}
      <rect x={0} y={0} width={svgW} height={svgH} fill="currentColor" className="text-slate-700 dark:text-slate-400" rx={3} filter="url(#frameSh)" />
      {/* Inner frame void */}
      <rect x={f} y={f} width={innerW} height={innerH} fill="currentColor" className="text-slate-100 dark:text-slate-800" rx={1} />

      {modules.map((mod, i) => {
        const mx = f + i * (mw + m)
        const my = f
        const cx = mx + mw / 2
        const cy = my + innerH / 2
        const dimW = moduleWidth(width, n)

        // Sash inset
        const sx = mx + sash, sy = my + sash, sw = mw - 2 * sash, sh = innerH - 2 * sash

        return (
          <g key={i}>
            {/* Mullion divider */}
            {i > 0 && <rect x={mx - m} y={f} width={m} height={innerH} fill="currentColor" className="text-slate-600 dark:text-slate-500" />}

            {/* Glass fill */}
            <rect x={sx} y={sy} width={sw} height={sh} fill="url(#glass)" rx={0.5} />

            {/* Sash rail (inner frame) */}
            <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={0.5} />

            {/* Patterns */}
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
                {/* Handle knob */}
                <circle
                  cx={mod === "CAS-L" ? sx + sw - 8 : sx + 8}
                  cy={cy}
                  r={3}
                  fill="currentColor" className="text-slate-500 dark:text-slate-400"
                />
                <rect
                  x={mod === "CAS-L" ? sx + sw - 10 : sx + 6}
                  y={cy - 10}
                  width={4} height={20} rx={2}
                  fill="currentColor" className="text-slate-400 dark:text-slate-500" opacity={0.6}
                />
              </>
            )}
            {mod === "SLIDE" && (
              <>
                <line x1={sx + 12} y1={cy} x2={sx + sw - 12} y2={cy} stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={1.2} />
                <polyline points={`${sx + sw - 20},${cy - 6} ${sx + sw - 12},${cy} ${sx + sw - 20},${cy + 6}`} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={1.2} />
                {/* Track line */}
                <line x1={sx + 4} y1={sy + sh - 4} x2={sx + sw - 4} y2={sy + sh - 4} stroke="currentColor" className="text-slate-400" strokeWidth={0.6} strokeDasharray="3 2" />
              </>
            )}

            {/* Module type label */}
            <text x={cx} y={svgH + 13} textAnchor="middle" fontSize={9} fontWeight={700} fill="currentColor" className="text-slate-700 dark:text-slate-300">{mod}</text>
            {/* Dimension label */}
            <text x={cx} y={svgH + 24} textAnchor="middle" fontSize={8} fill="currentColor" className="text-slate-500 dark:text-slate-400">{toFraction(dimW)}</text>
          </g>
        )
      })}

      {/* Sill line */}
      <rect x={0} y={svgH - 2} width={svgW} height={3} fill="currentColor" className="text-slate-600 dark:text-slate-500" rx={1} />

      <text x={svgW / 2} y={svgH + 36} textAnchor="middle" fontSize={8} fontStyle="italic" fill="currentColor" className="text-slate-400">Exterior View</text>
    </svg>
  )
}
