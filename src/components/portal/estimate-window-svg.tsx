"use client"

import { WINDOW_TYPES, toFraction, moduleWidth } from "@/lib/estimate-config"

interface Props { width: number; height: number; type: string }

export function EstimateWindowSVG({ width, height, type }: Props) {
  const modules = WINDOW_TYPES[type]?.modules || ["FIX"]
  const n = modules.length
  const ratio = height / width
  const svgW = 260
  const svgH = Math.min(svgW * ratio, 240)
  const f = 5, m = 3
  const innerW = svgW - 2 * f
  const innerH = svgH - 2 * f
  const totalM = (n - 1) * m
  const mw = (innerW - totalM) / n

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH + 35}`} className="w-full max-h-[260px]">
      {/* Background */}
      <rect x={f} y={f} width={innerW} height={innerH} fill="currentColor" className="text-slate-200 dark:text-slate-700" rx={1} />
      {/* Outer frame */}
      <rect x={1} y={1} width={svgW - 2} height={svgH - 2} fill="none" stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={f} rx={2} />

      {modules.map((mod, i) => {
        const mx = f + i * (mw + m)
        const my = f
        const cx = mx + mw / 2
        const cy = my + innerH / 2
        const dimW = moduleWidth(width, n)

        return (
          <g key={i}>
            {/* Module rect */}
            <rect x={mx} y={my} width={mw} height={innerH} fill="none" stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={1.5} />

            {/* Pattern */}
            {mod === "FIX" && (
              <>
                <line x1={mx} y1={cy} x2={mx + mw} y2={cy} stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={0.6} opacity={0.4} />
                <line x1={cx} y1={my} x2={cx} y2={my + innerH} stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={0.6} opacity={0.4} />
              </>
            )}
            {(mod === "CAS-L" || mod === "CAS-R") && (
              <>
                <line x1={mx + 2} y1={my + 2} x2={mx + mw - 2} y2={my + innerH - 2} stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={0.8} />
                <line x1={mx + mw - 2} y1={my + 2} x2={mx + 2} y2={my + innerH - 2} stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={0.8} />
              </>
            )}
            {mod === "SLIDE" && (
              <>
                <line x1={mx + 10} y1={cy} x2={mx + mw - 10} y2={cy} stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={1.2} />
                <polyline points={`${mx + mw - 18},${cy - 6} ${mx + mw - 10},${cy} ${mx + mw - 18},${cy + 6}`} fill="none" stroke="currentColor" className="text-slate-800 dark:text-slate-300" strokeWidth={1.2} />
              </>
            )}

            {/* Module label */}
            <text x={cx} y={svgH + 12} textAnchor="middle" fontSize={9} fontWeight={700} fill="currentColor" className="text-slate-800 dark:text-slate-300">{mod}</text>
            {/* Dimension */}
            <text x={cx} y={svgH + 23} textAnchor="middle" fontSize={8} fill="currentColor" className="text-slate-500 dark:text-slate-400">{toFraction(dimW)}</text>
          </g>
        )
      })}
      <text x={svgW / 2} y={svgH + 34} textAnchor="middle" fontSize={8} fontStyle="italic" fill="currentColor" className="text-slate-400">Exterior View</text>
    </svg>
  )
}
