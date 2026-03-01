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

  const FC = "#334155"
  const IC = "#f1f5f9"
  const ML = "#475569"
  const GL = "#d4e8f4"
  const LC = "#64748b"
  const TXT = "#334155"

  // Resolve effective hinge side per module from flipH (hingeLeft from card)
  const resolveHinge = (mod: string): boolean => {
    if (mod === "SWING") return flipH
    if (mod.startsWith("SWING")) return flipH
    if (mod === "CAS-L" || mod === "TT-L") return !flipH
    if (mod === "CAS-R" || mod === "TT-R") return flipH
    return flipH
  }

  return (
    <Svg viewBox={`0 0 ${svgW} ${svgH + 20}`} style={{ width: 100, height: (svgH + 20) * (100 / svgW) }}>
      <Defs>
        <LinearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#b8d4e8" stopOpacity={0.3} />
          <Stop offset="100%" stopColor="#a8c8de" stopOpacity={0.4} />
        </LinearGradient>
        <LinearGradient id="dpG" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#9ca3af" stopOpacity={0.7} />
          <Stop offset="100%" stopColor="#6b7280" stopOpacity={0.88} />
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
        const hingeOnLeft = resolveHinge(mod)

        return (
          <G key={i}>
            {/* Mullion */}
            {i > 0 && <Rect x={mx - m} y={f} width={m} height={innerH} fill={ML} />}

            {/* ── FIXED WINDOW ── */}
            {mod === "FIX" && (
              <G>
                <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#gl)" />
                <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} />
                <Line x1={sx} y1={cy} x2={sx + sw} y2={cy} stroke={LC} strokeWidth={0.3} opacity={0.4} />
                <Line x1={cx} y1={sy} x2={cx} y2={sy + sh} stroke={LC} strokeWidth={0.3} opacity={0.4} />
              </G>
            )}

            {/* ── CASEMENT ── */}
            {(mod === "CAS-L" || mod === "CAS-R") && (() => {
              const hx = hingeOnLeft ? sx : sx + sw
              const ohx = hingeOnLeft ? sx + sw : sx
              return (
                <G>
                  <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#gl)" />
                  <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} />
                  <Line x1={hx} y1={sy + 1} x2={ohx} y2={cy} stroke={FC} strokeWidth={0.5} />
                  <Line x1={hx} y1={sy + sh - 1} x2={ohx} y2={cy} stroke={FC} strokeWidth={0.5} />
                  {/* Hinge markers */}
                  <Rect x={hx - 1.5} y={sy + 6} width={3} height={4} rx={0.5} fill={LC} opacity={0.5} />
                  <Rect x={hx - 1.5} y={sy + sh - 10} width={3} height={4} rx={0.5} fill={LC} opacity={0.5} />
                  {/* Handle */}
                  <Circle cx={ohx} cy={cy} r={2} fill={LC} />
                </G>
              )
            })()}

            {/* ── TILT & TURN ── */}
            {(mod === "TT-L" || mod === "TT-R") && (() => {
              const hx = hingeOnLeft ? sx : sx + sw
              const ohx = hingeOnLeft ? sx + sw : sx
              return (
                <G>
                  <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#gl)" />
                  <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} />
                  {/* Tilt triangle (blue dashed) */}
                  <Line x1={cx} y1={sy + sh - 1} x2={sx + 1} y2={sy + 1} stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3 1" />
                  <Line x1={cx} y1={sy + sh - 1} x2={sx + sw - 1} y2={sy + 1} stroke="#3b82f6" strokeWidth={0.5} strokeDasharray="3 1" />
                  {/* Turn triangle (red) */}
                  <Line x1={hx} y1={cy} x2={ohx} y2={sy + 1} stroke="#ef4444" strokeWidth={0.5} />
                  <Line x1={hx} y1={cy} x2={ohx} y2={sy + sh - 1} stroke="#ef4444" strokeWidth={0.5} />
                  {/* Hinge markers */}
                  <Rect x={hx - 1.5} y={sy + 6} width={3} height={4} rx={0.5} fill={LC} opacity={0.5} />
                  <Rect x={hx - 1.5} y={sy + sh - 10} width={3} height={4} rx={0.5} fill={LC} opacity={0.5} />
                  {/* Handle */}
                  <Circle cx={ohx} cy={cy} r={2} fill={LC} />
                </G>
              )
            })()}

            {/* ── AWNING ── */}
            {mod === "AWNING" && (
              <G>
                <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#gl)" />
                <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} />
                <Line x1={sx + 1} y1={sy + 1} x2={cx} y2={sy + sh - 1} stroke={FC} strokeWidth={0.5} />
                <Line x1={sx + sw - 1} y1={sy + 1} x2={cx} y2={sy + sh - 1} stroke={FC} strokeWidth={0.5} />
                <Rect x={sx + 3} y={sy + 1} width={sw - 6} height={2} fill={LC} rx={1} />
              </G>
            )}

            {/* ── SLIDER WINDOW ── */}
            {mod === "SLIDE" && (
              <G>
                <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#gl)" />
                <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} />
                <Line x1={sx + 8} y1={cy} x2={sx + sw - 8} y2={cy} stroke={FC} strokeWidth={0.8} />
                <Path d={`M ${sx + sw - 12} ${cy - 4} L ${sx + sw - 8} ${cy} L ${sx + sw - 12} ${cy + 4}`} fill="none" stroke={FC} strokeWidth={0.8} />
                <Line x1={sx + 3} y1={sy + sh - 3} x2={sx + sw - 3} y2={sy + sh - 3} stroke={LC} strokeWidth={0.4} strokeDasharray="2 1" />
              </G>
            )}

            {/* ── SWING DOOR (detailed — matches web SVG) ── */}
            {mod.startsWith("SWING") && (() => {
              const hx = hingeOnLeft ? sx : sx + sw
              const openSide = hingeOnLeft ? sx + sw : sx
              const handleX = hingeOnLeft ? sx + sw - 7 : sx + 5
              const panelGap = 4
              const glassTop = sy + 5
              const glassH = sh * 0.3
              const raisedX1 = sx + panelGap
              const raisedW = sw - 2 * panelGap
              const raisedTop = glassTop + glassH + 6
              const raisedH1 = (sy + sh - raisedTop - 8) * 0.45
              const raisedY2 = raisedTop + raisedH1 + 5
              const raisedH2 = (sy + sh - raisedTop - 8) * 0.45
              const arcR = sw * 0.65
              const arcColor = swingIn ? "#3b82f6" : "#22c55e"

              return (
                <G>
                  {/* Door panel */}
                  <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#dpG)" rx={1} />
                  <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} rx={1} />

                  {/* Upper glass lite */}
                  <Rect x={raisedX1} y={glassTop} width={raisedW} height={glassH} fill="url(#gl)" rx={1} stroke={LC} strokeWidth={0.4} />

                  {/* Raised panels */}
                  <Rect x={raisedX1} y={raisedTop} width={raisedW} height={raisedH1} fill="none" stroke={ML} strokeWidth={0.6} rx={1} />
                  <Rect x={raisedX1} y={raisedY2} width={raisedW} height={raisedH2} fill="none" stroke={ML} strokeWidth={0.6} rx={1} />

                  {/* 3 Hinge marks */}
                  <Rect x={hx - 1.5} y={sy + 5} width={3} height={4} rx={0.5} fill={FC} opacity={0.6} />
                  <Rect x={hx - 1.5} y={cy - 2} width={3} height={4} rx={0.5} fill={FC} opacity={0.6} />
                  <Rect x={hx - 1.5} y={sy + sh - 9} width={3} height={4} rx={0.5} fill={FC} opacity={0.6} />

                  {/* Lever handle */}
                  <Rect x={handleX - 1} y={cy - 4} width={4} height={12} rx={1.5} fill={FC} opacity={0.5} />
                  <Circle cx={handleX + 1} cy={cy + 6} r={1} fill={FC} opacity={0.4} />

                  {/* Swing arc */}
                  <Path
                    d={`M ${openSide} ${sy + sh} A ${arcR} ${arcR} 0 0 ${hingeOnLeft ? 0 : 1} ${hingeOnLeft ? openSide - arcR * 0.7 : openSide + arcR * 0.7} ${sy + sh - arcR * 0.7}`}
                    fill="none" stroke={arcColor}
                    strokeWidth={swingIn ? 0.6 : 0.8}
                    strokeDasharray={swingIn ? "3 2" : "0"}
                  />
                  {/* IN/OUT label */}
                  <SvgText
                    x={hingeOnLeft ? openSide - arcR * 0.35 : openSide + arcR * 0.35}
                    y={sy + sh - arcR * 0.35}
                    style={{ fontSize: 5, fontWeight: 700, fill: arcColor, textAnchor: "middle" }}
                  >
                    {swingIn ? "IN" : "OUT"}
                  </SvgText>
                </G>
              )
            })()}

            {/* ── SLIDING DOOR ── */}
            {(mod === "SLIDE-D" || mod === "FIX-D") && (
              <G>
                {/* Door panel */}
                <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#dpG)" rx={1} />
                <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} rx={1} />
                {/* Upper glass area */}
                <Rect x={sx + 3} y={sy + 3} width={sw - 6} height={sh * 0.55} fill="url(#gl)" rx={1} stroke={LC} strokeWidth={0.3} />
                {/* Lower raised panel */}
                <Rect x={sx + 4} y={sy + sh * 0.6 + 2} width={sw - 8} height={sh * 0.32} fill="none" stroke={ML} strokeWidth={0.6} rx={1} />
                {mod === "SLIDE-D" && (
                  <G>
                    <Line x1={sx + 8} y1={cy + sh * 0.15} x2={sx + sw - 8} y2={cy + sh * 0.15} stroke={FC} strokeWidth={0.8} />
                    <Path d={`M ${sx + sw - 12} ${cy + sh * 0.15 - 3} L ${sx + sw - 8} ${cy + sh * 0.15} L ${sx + sw - 12} ${cy + sh * 0.15 + 3}`} fill="none" stroke={FC} strokeWidth={0.8} />
                    <Line x1={sx + 3} y1={sy + sh - 3} x2={sx + sw - 3} y2={sy + sh - 3} stroke={LC} strokeWidth={0.4} strokeDasharray="2 1" />
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

            {/* ── FOLDING DOOR ── */}
            {mod === "FOLD" && (
              <G>
                {/* Door panel */}
                <Rect x={sx} y={sy} width={sw} height={sh} fill="url(#dpG)" rx={1} />
                <Rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ML} strokeWidth={sash} rx={1} />
                {/* Upper glass */}
                <Rect x={sx + 3} y={sy + 3} width={sw - 6} height={sh * 0.45} fill="url(#gl)" rx={1} stroke={LC} strokeWidth={0.3} />
                {/* Lower raised panel */}
                <Rect x={sx + 4} y={sy + sh * 0.55} width={sw - 8} height={sh * 0.35} fill="none" stroke={ML} strokeWidth={0.6} rx={1} />
                {/* Fold line */}
                <Line x1={cx} y1={sy + 2} x2={cx} y2={sy + sh - 2} stroke="#f97316" strokeWidth={0.6} strokeDasharray="4 2" />
                {/* Hinge pins */}
                <Circle cx={i % 2 === 0 ? sx + 2 : sx + sw - 2} cy={sy + 8} r={1} fill={LC} />
                <Circle cx={i % 2 === 0 ? sx + 2 : sx + sw - 2} cy={sy + sh - 8} r={1} fill={LC} />
              </G>
            )}

            {/* Module label */}
            <SvgText x={cx} y={svgH + 8} style={{ fontSize: 5, fontWeight: 700, fill: TXT, textAnchor: "middle" }}>
              {mod === "SWING" ? (hingeOnLeft ? "SW-L" : "SW-R") : mod.length > 8 ? mod.replace("SWING-", "SW-") : mod}
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
