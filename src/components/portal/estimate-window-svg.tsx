"use client"

import { WINDOW_TYPES, toFraction, moduleWidth, isDoorType } from "@/lib/estimate-config"

interface Props { width: number; height: number; type: string; flipH?: boolean; swingIn?: boolean }

export function EstimateWindowSVG({ width, height, type, flipH = false, swingIn = true }: Props) {
  const cfg = WINDOW_TYPES[type]
  let modules = cfg?.modules || ["FIX"]
  const isDoor = isDoorType(type)

  // For sliding doors: flipH controls which side the sliding panel is on
  const hasSlideD = modules.includes("SLIDE-D")
  if (hasSlideD && flipH) {
    modules = [...modules].reverse() // swap: SLIDE-D moves to opposite side
  }

  const n = modules.length
  // Use true aspect ratio from dimensions — no artificial clamping
  const ratio = height / (width || 1)
  const svgW = 280
  const svgH = svgW * ratio
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

  // Resolve effective hinge side per module from flipH (hingeLeft from card)
  const resolveHinge = (mod: string): boolean => {
    // Generic SWING module — directly use flipH
    if (mod === "SWING") return flipH
    // Legacy SWING-L/R modules (backward compat) — flipH overrides
    if (mod.startsWith("SWING")) return flipH
    // Casement / TT — flipH overrides the baked-in L/R
    if (mod === "CAS-L" || mod === "TT-L") return !flipH
    if (mod === "CAS-R" || mod === "TT-R") return flipH
    return flipH
  }

  // Resolve inswing/outswing — swingIn from card is the source of truth
  const resolveSwing = (): boolean => swingIn

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH + 40}`} className="w-full" style={{ maxHeight: isDoor ? 360 : 220 }}>
      <defs>
        <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8d4e8" stopOpacity={0.22} />
          <stop offset="50%" stopColor="#d4e8f4" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#a8c8de" stopOpacity={0.28} />
        </linearGradient>
        <linearGradient id="doorPanelG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ca3af" stopOpacity={0.7} />
          <stop offset="40%" stopColor="#8891a0" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#6b7280" stopOpacity={0.88} />
        </linearGradient>
        <linearGradient id="doorFrameG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <filter id="fSh"><feDropShadow dx={0} dy={1} stdDeviation={1.5} floodOpacity={0.12} /></filter>
        <filter id="inset"><feFlood floodColor="#000" floodOpacity={0.08} result="f" /><feComposite in="f" in2="SourceGraphic" operator="in" result="s" /><feGaussianBlur in="s" stdDeviation={1.5} /><feComposite in2="SourceGraphic" operator="atop" /></filter>
      </defs>

      {/* Outer frame */}
      <rect x={0} y={0} width={svgW} height={svgH} fill="currentColor" className="text-slate-700 dark:text-slate-400" rx={3} filter="url(#fSh)" />
      <rect x={f} y={f} width={innerW} height={innerH} fill="currentColor" className="text-slate-100 dark:text-slate-800" rx={1} />

      {/* Door threshold / sill */}
      {isDoor && <rect x={0} y={svgH - 4} width={svgW} height={5} fill="currentColor" className="text-slate-600 dark:text-slate-500" rx={1} />}

      {modules.map((mod, i) => {
        const mx = f + i * (mw + m)
        const my = f
        const cx = mx + mw / 2
        const cy = my + innerH / 2
        const dimW = moduleWidth(width, n)
        const sx = mx + sash, sy = my + sash, sw = mw - 2 * sash, sh = innerH - 2 * sash
        const hingeOnLeft = resolveHinge(mod)
        const isInswing = resolveSwing()

        return (
          <g key={i}>
            {/* Mullion */}
            {i > 0 && <rect x={mx - m} y={f} width={m} height={innerH} fill="currentColor" className="text-slate-600 dark:text-slate-500" />}

            {/* ── FIXED WINDOW ── */}
            {mod === "FIX" && (
              <>
                <rect x={sx} y={sy} width={sw} height={sh} fill="url(#glassG)" rx={0.5} />
                <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={0.5} />
              </>
            )}

            {/* ── CASEMENT (native L/R) ── */}
            {(mod === "CAS-L" || mod === "CAS-R") && (() => {
              const hx = hingeOnLeft ? sx : sx + sw
              const ohx = hingeOnLeft ? sx + sw : sx
              const leverDir = hingeOnLeft ? 1 : -1
              return (
                <>
                  <rect x={sx} y={sy} width={sw} height={sh} fill="url(#glassG)" rx={0.5} />
                  <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={0.5} />
                  {/* Hinge markers */}
                  <rect x={hx - 2.5} y={sy + 8} width={5} height={8} rx={1.5} fill="currentColor" className="text-slate-600 dark:text-slate-400" opacity={0.6} />
                  <rect x={hx - 2.5} y={sy + sh - 16} width={5} height={8} rx={1.5} fill="currentColor" className="text-slate-600 dark:text-slate-400" opacity={0.6} />
                  {/* ★ Prominent T-handle on opposite side */}
                  <rect x={ohx - 3} y={cy - 16} width={6} height={32} rx={3} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.35} />
                  <rect x={ohx - 2} y={cy - 12} width={4} height={24} rx={2} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.85} />
                  <rect x={ohx - 2} y={cy - 2} width={leverDir * 14} height={4} rx={2} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.85} />
                </>
              )
            })()}

            {/* ── TILT & TURN (native L/R) ── */}
            {(mod === "TT-L" || mod === "TT-R") && (() => {
              const hx = hingeOnLeft ? sx : sx + sw
              const ohx = hingeOnLeft ? sx + sw : sx
              const leverDir = hingeOnLeft ? 1 : -1
              return (
                <>
                  <rect x={sx} y={sy} width={sw} height={sh} fill="url(#glassG)" rx={0.5} />
                  <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={0.5} />
                  {/* Hinge markers */}
                  <rect x={hx - 2.5} y={sy + 8} width={5} height={8} rx={1.5} fill="currentColor" className="text-slate-600 dark:text-slate-400" opacity={0.6} />
                  <rect x={hx - 2.5} y={sy + sh - 16} width={5} height={8} rx={1.5} fill="currentColor" className="text-slate-600 dark:text-slate-400" opacity={0.6} />
                  {/* ★ Prominent T-handle on opposite side */}
                  <rect x={ohx - 3} y={cy - 16} width={6} height={32} rx={3} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.35} />
                  <rect x={ohx - 2} y={cy - 12} width={4} height={24} rx={2} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.85} />
                  <rect x={ohx - 2} y={cy - 2} width={leverDir * 14} height={4} rx={2} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.85} />
                  {/* TT label */}
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill="currentColor" className="text-slate-400 dark:text-slate-500" opacity={0.5}>T&amp;T</text>
                </>
              )
            })()}

            {/* ── AWNING (Top Hung) ── */}
            {mod === "AWNING" && (
              <>
                <rect x={sx} y={sy} width={sw} height={sh} fill="url(#glassG)" rx={0.5} />
                <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={0.5} />
                {/* Top hinge bar */}
                <rect x={sx + 6} y={sy + 1} width={sw - 12} height={4} rx={1.5} fill="currentColor" className="text-slate-600 dark:text-slate-400" opacity={0.7} />
                {/* ★ Prominent bottom handle */}
                <rect x={cx - 10} y={sy + sh - 10} width={20} height={6} rx={3} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.35} />
                <rect x={cx - 7} y={sy + sh - 9} width={14} height={4} rx={2} fill="currentColor" className="text-slate-800 dark:text-slate-300" opacity={0.85} />
              </>
            )}

            {/* ── SLIDER (Window) ── */}
            {mod === "SLIDE" && (
              <>
                <rect x={sx} y={sy} width={sw} height={sh} fill="url(#glassG)" rx={0.5} />
                <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={0.5} />
                <line x1={sx + 12} y1={cy} x2={sx + sw - 12} y2={cy} stroke="currentColor" className="text-slate-600" strokeWidth={1.2} />
                <polyline points={`${sx + sw - 20},${cy - 6} ${sx + sw - 12},${cy} ${sx + sw - 20},${cy + 6}`} fill="none" stroke="currentColor" className="text-slate-600" strokeWidth={1.2} />
                <line x1={sx + 4} y1={sy + sh - 4} x2={sx + sw - 4} y2={sy + sh - 4} stroke="currentColor" className="text-slate-400" strokeWidth={0.6} strokeDasharray="3 2" />
              </>
            )}

            {/* ── SWING DOOR (all variants — native L/R, In/Out) ── */}
            {mod.startsWith("SWING") && (() => {
              const hx = hingeOnLeft ? sx : sx + sw
              const openSide = hingeOnLeft ? sx + sw : sx
              const handleX = hingeOnLeft ? sx + sw - 14 : sx + 10
              const glassTop = sy + 10
              const glassH = sh * 0.3
              const panelGap = 8
              const raisedX1 = sx + panelGap
              const raisedW = sw - 2 * panelGap
              const raisedTop = glassTop + glassH + 12
              const raisedH1 = (sy + sh - raisedTop - 14) * 0.45
              const raisedH2 = (sy + sh - raisedTop - 14) * 0.45
              const raisedY2 = raisedTop + raisedH1 + 10
              const arcR = sw * 0.65

              return (
                <>
                  {/* Door panel — solid opaque fill */}
                  <rect x={sx} y={sy} width={sw} height={sh} fill="url(#doorPanelG)" rx={1} />
                  <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={1} />

                  {/* Upper glass lite */}
                  <rect x={sx + panelGap} y={glassTop} width={raisedW} height={glassH} fill="url(#glassG)" rx={1.5} stroke="currentColor" className="text-slate-500" strokeWidth={0.8} />
                  {/* Glass cross-hatch */}
                  <line x1={sx + panelGap} y1={glassTop + glassH / 2} x2={sx + panelGap + raisedW} y2={glassTop + glassH / 2} stroke="currentColor" className="text-slate-400" strokeWidth={0.3} opacity={0.3} />

                  {/* Raised panels (two rectangles) */}
                  <rect x={raisedX1} y={raisedTop} width={raisedW} height={raisedH1} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={1} rx={1.5} filter="url(#inset)" />
                  <rect x={raisedX1} y={raisedY2} width={raisedW} height={raisedH2} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={1} rx={1.5} filter="url(#inset)" />

                  {/* 3 Hinge rectangles on hinge side */}
                  {[sy + 10, cy - 4, sy + sh - 18].map((hy, hi) => (
                    <rect key={hi} x={hx - 3} y={hy} width={6} height={8} rx={1} fill="currentColor" className="text-slate-700 dark:text-slate-500" opacity={0.6} />
                  ))}

                  {/* Lever handle with backplate */}
                  <rect x={handleX - 2} y={cy - 14} width={8} height={28} rx={3} fill="currentColor" className="text-slate-700 dark:text-slate-400" opacity={0.3} />
                  <rect x={handleX} y={cy - 8} width={4} height={16} rx={2} fill="currentColor" className="text-slate-700 dark:text-slate-400" opacity={0.7} />
                  <circle cx={handleX + 2} cy={cy + 12} r={2} fill="currentColor" className="text-slate-600 dark:text-slate-400" opacity={0.5} />

                  {/* Swing arc */}
                  <path
                    d={`M ${openSide} ${sy + sh} A ${arcR} ${arcR} 0 0 ${hingeOnLeft ? 0 : 1} ${hingeOnLeft ? openSide - arcR * 0.7 : openSide + arcR * 0.7} ${sy + sh - arcR * 0.7}`}
                    fill="none" stroke="currentColor"
                    className={isInswing ? "text-blue-500" : "text-green-500"}
                    strokeWidth={isInswing ? 0.8 : 1.2}
                    strokeDasharray={isInswing ? "5 3" : "none"}
                  />
                  {/* IN/OUT label near arc */}
                  <text
                    x={hingeOnLeft ? openSide - arcR * 0.35 : openSide + arcR * 0.35}
                    y={sy + sh - arcR * 0.4}
                    textAnchor="middle" fontSize={7} fontWeight={700}
                    fill="currentColor"
                    className={isInswing ? "text-blue-500" : "text-green-500"}
                  >
                    {isInswing ? "IN" : "OUT"}
                  </text>
                </>
              )
            })()}

            {/* ── SLIDING DOOR ── */}
            {(mod === "SLIDE-D" || mod === "FIX-D") && (
              <>
                {/* Door panel */}
                <rect x={sx} y={sy} width={sw} height={sh} fill="url(#doorPanelG)" rx={1} />
                <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={1} />
                {/* Upper glass area (60%) */}
                <rect x={sx + 6} y={sy + 6} width={sw - 12} height={sh * 0.55} fill="url(#glassG)" rx={1} stroke="currentColor" className="text-slate-400" strokeWidth={0.6} />
                {/* Lower raised panel */}
                <rect x={sx + 8} y={sy + sh * 0.6 + 4} width={sw - 16} height={sh * 0.32} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={0.8} rx={1.5} filter="url(#inset)" />
                {mod === "SLIDE-D" && (
                  <>
                    <line x1={sx + 16} y1={cy + sh * 0.15} x2={sx + sw - 16} y2={cy + sh * 0.15} stroke="currentColor" className="text-slate-600" strokeWidth={1.2} />
                    <polyline points={`${sx + sw - 22},${cy + sh * 0.15 - 5} ${sx + sw - 16},${cy + sh * 0.15} ${sx + sw - 22},${cy + sh * 0.15 + 5}`} fill="none" stroke="currentColor" className="text-slate-600" strokeWidth={1.2} />
                    <line x1={sx + 4} y1={sy + sh - 6} x2={sx + sw - 4} y2={sy + sh - 6} stroke="currentColor" className="text-slate-400" strokeWidth={0.8} strokeDasharray="4 2" />
                    <rect x={sx + sw - 14} y={cy + sh * 0.08} width={4} height={16} rx={2} fill="currentColor" className="text-slate-600" opacity={0.7} />
                  </>
                )}
              </>
            )}

            {/* ── FOLDING DOOR ── */}
            {mod === "FOLD" && (
              <>
                <rect x={sx} y={sy} width={sw} height={sh} fill="url(#doorPanelG)" rx={1} />
                <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={sash} rx={1} />
                {/* Upper glass */}
                <rect x={sx + 5} y={sy + 5} width={sw - 10} height={sh * 0.45} fill="url(#glassG)" rx={1} stroke="currentColor" className="text-slate-400" strokeWidth={0.5} />
                {/* Lower raised panel */}
                <rect x={sx + 7} y={sy + sh * 0.55} width={sw - 14} height={sh * 0.35} fill="none" stroke="currentColor" className="text-slate-600 dark:text-slate-400" strokeWidth={0.8} rx={1.5} filter="url(#inset)" />
                {/* Fold line */}
                <line x1={cx} y1={sy + 2} x2={cx} y2={sy + sh - 2} stroke="currentColor" className="text-orange-500" strokeWidth={0.8} strokeDasharray="6 3" />
                <polyline points={`${cx - 8},${cy - 4} ${cx},${cy} ${cx - 8},${cy + 4}`} fill="none" stroke="currentColor" className="text-orange-500" strokeWidth={0.8} />
                <polyline points={`${cx + 8},${cy - 4} ${cx},${cy} ${cx + 8},${cy + 4}`} fill="none" stroke="currentColor" className="text-orange-500" strokeWidth={0.8} />
                {/* Hinge pins */}
                <circle cx={i % 2 === 0 ? sx + 3 : sx + sw - 3} cy={sy + 10} r={1.5} fill="currentColor" className="text-slate-500" />
                <circle cx={i % 2 === 0 ? sx + 3 : sx + sw - 3} cy={sy + sh - 10} r={1.5} fill="currentColor" className="text-slate-500" />
              </>
            )}

            {/* Module label */}
            <text x={cx} y={labelY} textAnchor="middle" fontSize={8} fontWeight={700} fill="currentColor" className="text-slate-700 dark:text-slate-300">
              {mod.length > 8 ? mod.replace("SWING-", "SW-").replace("-IN", "↙").replace("-OUT", "↗") : mod}
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
