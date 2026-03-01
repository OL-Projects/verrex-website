import { Svg, Rect, Line, Circle, Path, G, Text as SvgText, Defs, LinearGradient, Stop } from "@react-pdf/renderer"
import { WINDOW_TYPES, toFraction, moduleWidth, isDoorType } from "@/lib/estimate-config"

interface Props { width: number; height: number; type: string; flipH?: boolean; swingIn?: boolean }

export function EstimateWindowSVGPDF({ width, height, type, flipH = false, swingIn = true }: Props) {
  const cfg = WINDOW_TYPES[type]
  let modules = cfg?.modules || ["FIX"]
  const isDoor = isDoorType(type)

  // Sliding doors: flipH controls which side the sliding panel is on
  if (modules.includes("SLIDE-D") && flipH) {
    modules = [...modules].reverse()
  }

  const n = modules.length
  // True ratio with scale cap for PDF
  const ratio = height / (width || 1)
  const svgW = 140
  const maxH = isDoor ? 180 : 120
  const svgH = Math.min(svgW * ratio, maxH)
  const f = 3
  const m = 2
  const sash = 1.5
  const innerW = svgW - 2 * f
  const innerH = svgH - 2 * f
  const mw = (innerW - (n - 1) * m) / n

  const FC = "#334155" // frame color (slate-700)
  const IC = "#f1f5f9" // inner bg (slate-100)
  const ML = "#475569" // mullion (slate-600)
  const GL = "#d4e8f4" // glass
  const DP = "#9ca3af" // door panel (grey)
  const LC = "#64748b" // line color (slate-500)
  const TXT = "#334155"

  return (
    <Svg viewBox={`0 0 ${svgW} ${svgH + 20}`} style={{ width: 100, height: (svgH + 20) * (100 / svgW) }}>
      <Defs>
        <LinearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#b8d4e8" stopOpacity={0.3} />
          <Stop offset="100%" stopColor="#a8c8de" stopOpacity={0.4} />
        </LinearGradient>
      </Defs>

      {/* Outer frame */}
      <Rect x={0} y={0} width={svgW} height={svgH} fill={FC} rx={2} />
      <Rect x={f} y={f} width={innerW} height={innerH} fill={IC} rx={1} />

      {/* Door threshold */}
      {isDoor && <Rect x={0} y={svgH - 2} width={svgW} height={3} fill={ML} rx={1} />}

      {modules.map((mod, i) => {
        const mx = f + i * (mw + m)
        const my = f
        const cx = mx + mw / 2
        const cy = my + innerH / 2
        const dimW = moduleWidth(width, n)
        const sx = mx + sash, sy = my + sash, sw = mw - 2 * sash, sh = innerH - 2 * sash

        return (
          <G key={i}>
            {/* Mullion */}
            {i > 0 && <Rect x={mx - m} y={f} width={m} height={innerH} fill={ML} />}

            {/* Glass fill */}
            <Rect x={sx} y={sy} width={sw} height={sh} fill={isDoor ? DP : GL} opacity={isDoor ? 0.2 : 0.3} />

            {/* Sash rail */}
            <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} />

            {/* ── WINDOW MODULES ── */}
            {mod === "FIX" && (
              <G>
                <Line x1={sx} y1={cy} x2={sx + sw} y2={cy} stroke={LC} strokeWidth={0.3} opacity={0.4} />
                <Line x1={cx} y1={sy} x2={cx} y2={sy + sh} stroke={LC} strokeWidth={0.3} opacity={0.4} />
              </G>
            )}

            {(mod === "CAS-L" || mod === "CAS-R") && (
              <G>
                <Line x1={sx + 1} y1={sy + 1} x2={sx + sw - 1} y2={sy + sh - 1} stroke={FC} strokeWidth={0.5} />
                <Line x1={sx + sw - 1} y1={sy + 1} x2={sx + 1} y2={sy + sh - 1} stroke={FC} strokeWidth={0.5} />
                <Circle cx={mod === "CAS-L" ? sx + sw - 5 : sx + 5} cy={cy} r={2} fill={LC} />
              </G>
            )}

            {(mod === "TT-L" || mod === "TT-R") && (
              <G>
                <Line x1={cx} y1={sy + sh - 1} x2={sx + 1} y2={sy + 1} stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3 1" />
                <Line x1={cx} y1={sy + sh - 1} x2={sx + sw - 1} y2={sy + 1} stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3 1" />
                {mod === "TT-L" ? (
                  <G>
                    <Line x1={sx + 1} y1={cy} x2={sx + sw - 1} y2={sy + 1} stroke="#ef4444" strokeWidth={0.5} />
                    <Line x1={sx + 1} y1={cy} x2={sx + sw - 1} y2={sy + sh - 1} stroke="#ef4444" strokeWidth={0.5} />
                  </G>
                ) : (
                  <G>
                    <Line x1={sx + sw - 1} y1={cy} x2={sx + 1} y2={sy + 1} stroke="#ef4444" strokeWidth={0.5} />
                    <Line x1={sx + sw - 1} y1={cy} x2={sx + 1} y2={sy + sh - 1} stroke="#ef4444" strokeWidth={0.5} />
                  </G>
                )}
                <Circle cx={mod === "TT-L" ? sx + sw - 5 : sx + 5} cy={cy} r={2} fill={LC} />
              </G>
            )}

            {mod === "AWNING" && (
              <G>
                <Line x1={sx + 1} y1={sy + 1} x2={cx} y2={sy + sh - 1} stroke={FC} strokeWidth={0.5} />
                <Line x1={sx + sw - 1} y1={sy + 1} x2={cx} y2={sy + sh - 1} stroke={FC} strokeWidth={0.5} />
                <Rect x={sx + 3} y={sy + 1} width={sw - 6} height={2} fill={LC} rx={1} />
              </G>
            )}

            {mod === "SLIDE" && (
              <G>
                <Line x1={sx + 8} y1={cy} x2={sx + sw - 8} y2={cy} stroke={FC} strokeWidth={0.8} />
                <Path d={`M ${sx + sw - 12} ${cy - 4} L ${sx + sw - 8} ${cy} L ${sx + sw - 12} ${cy + 4}`} fill="none" stroke={FC} strokeWidth={0.8} />
                <Line x1={sx + 3} y1={sy + sh - 3} x2={sx + sw - 3} y2={sy + sh - 3} stroke={LC} strokeWidth={0.4} strokeDasharray="2 1" />
              </G>
            )}

            {/* ── DOOR MODULES ── */}
            {(mod === "SWING-L-IN" || mod === "SWING-R-IN") && (() => {
              const hingeX = mod === "SWING-L-IN" ? sx : sx + sw
              const arcX = mod === "SWING-L-IN" ? sx + sw : sx
              const handleX = mod === "SWING-L-IN" ? sx + sw - 8 : sx + 8
              return (
                <G>
                  <Rect x={sx + 4} y={sy + 4} width={sw - 8} height={sh * 0.5} fill={GL} opacity={0.4} stroke={LC} strokeWidth={0.3} />
                  <Path d={`M ${arcX} ${sy + sh} A ${sw} ${sw} 0 0 ${mod === "SWING-L-IN" ? 0 : 1} ${hingeX} ${sy + sh - sw * 0.7}`} fill="none" stroke="#3b82f6" strokeWidth={0.6} strokeDasharray="3 2" />
                  <Circle cx={hingeX} cy={sy + 8} r={1.5} fill={LC} />
                  <Circle cx={hingeX} cy={sy + sh - 8} r={1.5} fill={LC} />
                  <Circle cx={handleX} cy={cy + sh * 0.1} r={3} fill="none" stroke={LC} strokeWidth={1} />
                </G>
              )
            })()}

            {(mod === "SWING-L-OUT" || mod === "SWING-R-OUT") && (() => {
              const hingeX = mod === "SWING-L-OUT" ? sx : sx + sw
              const arcX = mod === "SWING-L-OUT" ? sx + sw : sx
              const handleX = mod === "SWING-L-OUT" ? sx + sw - 8 : sx + 8
              return (
                <G>
                  <Rect x={sx + 4} y={sy + 4} width={sw - 8} height={sh * 0.5} fill={GL} opacity={0.4} stroke={LC} strokeWidth={0.3} />
                  <Path d={`M ${arcX} ${sy + sh} A ${sw} ${sw} 0 0 ${mod === "SWING-L-OUT" ? 1 : 0} ${hingeX} ${sy + sh - sw * 0.7}`} fill="none" stroke="#22c55e" strokeWidth={0.7} />
                  <Circle cx={hingeX} cy={sy + 8} r={1.5} fill={LC} />
                  <Circle cx={hingeX} cy={sy + sh - 8} r={1.5} fill={LC} />
                  <Circle cx={handleX} cy={cy + sh * 0.1} r={3} fill="none" stroke={LC} strokeWidth={1} />
                </G>
              )
            })()}

            {(mod === "SLIDE-D" || mod === "FIX-D") && (
              <G>
                <Rect x={sx + 4} y={sy + 4} width={sw - 8} height={sh * 0.55} fill={GL} opacity={0.4} stroke={LC} strokeWidth={0.3} />
                {mod === "SLIDE-D" && (
                  <G>
                    <Line x1={sx + 10} y1={cy + sh * 0.15} x2={sx + sw - 10} y2={cy + sh * 0.15} stroke={FC} strokeWidth={0.8} />
                    <Path d={`M ${sx + sw - 14} ${cy + sh * 0.15 - 3} L ${sx + sw - 10} ${cy + sh * 0.15} L ${sx + sw - 14} ${cy + sh * 0.15 + 3}`} fill="none" stroke={FC} strokeWidth={0.8} />
                  </G>
                )}
                {mod === "FIX-D" && (
                  <G>
                    <Line x1={sx} y1={cy} x2={sx + sw} y2={cy} stroke={LC} strokeWidth={0.3} opacity={0.3} />
                    <Line x1={cx} y1={sy} x2={cx} y2={sy + sh} stroke={LC} strokeWidth={0.3} opacity={0.3} />
                  </G>
                )}
              </G>
            )}

            {mod === "FOLD" && (
              <G>
                <Rect x={sx + 3} y={sy + 3} width={sw - 6} height={sh * 0.5} fill={GL} opacity={0.4} stroke={LC} strokeWidth={0.3} />
                <Line x1={cx} y1={sy + 2} x2={cx} y2={sy + sh - 2} stroke="#f97316" strokeWidth={0.6} strokeDasharray="4 2" />
                <Circle cx={i % 2 === 0 ? sx + 2 : sx + sw - 2} cy={sy + 8} r={1} fill={LC} />
                <Circle cx={i % 2 === 0 ? sx + 2 : sx + sw - 2} cy={sy + sh - 8} r={1} fill={LC} />
              </G>
            )}

            {/* Module label */}
            <SvgText x={cx} y={svgH + 8} style={{ fontSize: 5, fontWeight: 700, fill: TXT, textAnchor: "middle" }}>
              {mod.length > 8 ? mod.replace("SWING-", "SW-") : mod}
            </SvgText>
            <SvgText x={cx} y={svgH + 14} style={{ fontSize: 4.5, fill: LC, textAnchor: "middle" }}>
              {toFraction(dimW)}
            </SvgText>
          </G>
        )
      })}

      {/* Sill line (windows only) */}
      {!isDoor && <Rect x={0} y={svgH - 1.5} width={svgW} height={2} fill={ML} rx={1} />}

      <SvgText x={svgW / 2} y={svgH + 19} style={{ fontSize: 4, fill: LC, textAnchor: "middle", fontStyle: "italic" }}>
        {isDoor ? "Exterior — Door" : "Exterior View"}
      </SvgText>
    </Svg>
  )
}
