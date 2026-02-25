"use client"

interface WindowTypeDiagramProps {
  id: string
  className?: string
}

export function WindowTypeDiagram({ id, className = "" }: WindowTypeDiagramProps) {
  const diagrams: Record<string, React.ReactNode> = {
    "double-hung": <TopHungDiagram />,
    "sliding": <SlidingWindowDiagram />,
    "casement": <CasementDiagram />,
    "tilt-turn": <TiltTurnDiagram />,
    "hand-cranked": <HandCrankedDiagram />,
    "sliding-door": <SlidingDoorDiagram />,
    "folding-door": <FoldingDoorDiagram />,
    "swing-door": <SwingDoorDiagram />,
  }

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 ${className}`}>
      {diagrams[id] || <GenericDiagram />}
    </div>
  )
}

/* ── TOP HUNG ── hinged at top, bottom swings outward */
function TopHungDiagram() {
  return (
    <svg viewBox="0 0 200 180" className="w-full h-full max-w-[180px] max-h-[160px]">
      {/* Frame */}
      <rect x="30" y="20" width="140" height="140" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Glass */}
      <rect x="38" y="28" width="124" height="124" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Horizontal glazing bar */}
      <line x1="38" y1="90" x2="162" y2="90" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1.5" />
      {/* Top hinge indicators */}
      <rect x="70" y="18" width="16" height="6" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="114" y="18" width="16" height="6" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Opening arc — bottom swings outward */}
      <path d="M 42 155 Q 100 175 158 155" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Arrow at bottom center */}
      <path d="M 100 158 L 100 172 M 95 167 L 100 172 L 105 167" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
      {/* Label */}
      <text x="100" y="12" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="8" fontFamily="sans-serif">HINGE</text>
    </svg>
  )
}

/* ── SLIDING WINDOW ── horizontal sliding on tracks */
function SlidingWindowDiagram() {
  return (
    <svg viewBox="0 0 220 160" className="w-full h-full max-w-[200px] max-h-[140px]">
      {/* Frame */}
      <rect x="20" y="20" width="180" height="120" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Left panel (fixed) */}
      <rect x="28" y="28" width="82" height="104" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Right panel (slides) */}
      <rect x="112" y="28" width="82" height="104" rx="1" className="fill-sky-200/70 dark:fill-sky-800/40" />
      {/* Center divider / rail */}
      <line x1="110" y1="20" x2="110" y2="140" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="3" />
      {/* Track indicators top & bottom */}
      <line x1="28" y1="25" x2="192" y2="25" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      <line x1="28" y1="135" x2="192" y2="135" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Sliding arrow on right panel */}
      <path d="M 160 80 L 130 80 M 137 75 L 130 80 L 137 85" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="2" />
      {/* Handle on right panel */}
      <rect x="116" y="72" width="4" height="16" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Label */}
      <text x="153" y="100" textAnchor="middle" className="fill-blue-400 dark:fill-blue-500" fontSize="7" fontFamily="sans-serif">SLIDES</text>
    </svg>
  )
}

/* ── CASEMENT ── side-hinged, opens outward — standard elevation schematic */
function CasementDiagram() {
  return (
    <svg viewBox="0 0 160 200" className="w-full h-full max-w-[140px] max-h-[180px]">
      {/* Outer frame */}
      <rect x="20" y="15" width="120" height="170" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Sash / glass area */}
      <rect x="28" y="23" width="104" height="154" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Architectural diagonal indicator — hinge-top-left to handle-bottom-right */}
      <line x1="28" y1="23" x2="132" y2="177" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Second diagonal — hinge-bottom-left to handle-top-right (forms X at sash center) */}
      <line x1="28" y1="177" x2="132" y2="23" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* 3 hinges on left stile */}
      <rect x="17" y="40" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="17" y="93" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="17" y="146" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Handle bar on right stile */}
      <rect x="128" y="92" width="6" height="18" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Label */}
      <text x="80" y="8" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="7" fontFamily="sans-serif">OPENS OUT →</text>
    </svg>
  )
}

/* ── TILT & TURN ── ISO diamond symbol: 4 triangles from center point to frame midpoints */
function TiltTurnDiagram() {
  return (
    <svg viewBox="0 0 160 200" className="w-full h-full max-w-[140px] max-h-[180px]">
      {/* Outer frame */}
      <rect x="20" y="15" width="120" height="170" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Sash / glass area */}
      <rect x="28" y="23" width="104" height="154" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Diamond/rhombus connecting midpoints of sash sides (ISO tilt-turn symbol) */}
      {/* Midpoints: top=80,23  right=132,100  bottom=80,177  left=28,100 */}
      <polygon
        points="80,23 132,100 80,177 28,100"
        fill="none"
        stroke="currentColor"
        className="text-blue-500 dark:text-blue-400"
        strokeWidth="1.5"
        strokeDasharray="5 3"
      />
      {/* Center point where diagonals of diamond cross */}
      <circle cx="80" cy="100" r="3" className="fill-blue-500 dark:fill-blue-400" />
      {/* TILT indicator — top triangle colored */}
      <polygon points="80,23 132,100 28,100" fill="currentColor" className="text-emerald-500/15 dark:text-emerald-400/15" />
      {/* TURN indicator — right triangle colored */}
      <polygon points="132,100 80,23 80,177" fill="currentColor" className="text-blue-500/15 dark:text-blue-400/15" />
      {/* Handle on right stile */}
      <rect x="128" y="92" width="6" height="18" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* 3 hinges on left stile */}
      <rect x="17" y="40" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="17" y="93" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="17" y="146" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Labels */}
      <text x="80" y="70" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400" fontSize="8" fontWeight="600" fontFamily="sans-serif">TILT</text>
      <text x="115" y="104" textAnchor="middle" className="fill-blue-600 dark:fill-blue-400" fontSize="8" fontWeight="600" fontFamily="sans-serif">TURN</text>
    </svg>
  )
}

/* ── HAND CRANKED ── casement with worm-gear crank mechanism at bottom */
function HandCrankedDiagram() {
  return (
    <svg viewBox="0 0 160 210" className="w-full h-full max-w-[140px] max-h-[190px]">
      {/* Outer frame */}
      <rect x="20" y="15" width="120" height="155" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Sash / glass area */}
      <rect x="28" y="23" width="104" height="139" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Architectural diagonal X indicator — casement opens outward */}
      <line x1="28" y1="23" x2="132" y2="162" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="5 3" />
      <line x1="28" y1="162" x2="132" y2="23" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* 3 hinges on left */}
      <rect x="17" y="38" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="17" y="84" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="17" y="130" width="6" height="12" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Crank mechanism below window */}
      {/* Mounting plate */}
      <rect x="68" y="176" width="24" height="6" rx="2" className="fill-slate-400 dark:fill-slate-500" />
      {/* Worm gear housing (circle) */}
      <circle cx="80" cy="192" r="7" fill="none" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="2" />
      <circle cx="80" cy="192" r="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Crank arm + handle */}
      <line x1="87" y1="192" x2="110" y2="192" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="2.5" />
      <circle cx="110" cy="192" r="4" fill="none" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="2" />
      {/* Connecting rod from gear to window bottom */}
      <line x1="80" y1="185" x2="80" y2="170" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Label */}
      <text x="80" y="208" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="7" fontFamily="sans-serif">CRANK</text>
    </svg>
  )
}

/* ── SLIDING GLASS DOOR ── floor-to-ceiling glass panels on heavy track */
function SlidingDoorDiagram() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full max-w-[180px] max-h-[200px]">
      {/* Floor */}
      <line x1="5" y1="205" x2="195" y2="205" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" />
      {/* Header track */}
      <rect x="18" y="10" width="164" height="6" rx="1" className="fill-slate-300 dark:fill-slate-600" />
      {/* Heavy outer frame */}
      <rect x="20" y="12" width="160" height="192" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="5" />
      {/* Left panel — FIXED (larger glass area with thin frame) */}
      <rect x="27" y="19" width="72" height="178" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Left panel inner frame lines */}
      <rect x="27" y="19" width="72" height="178" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Right panel — SLIDES (slightly overlapping center rail) */}
      <rect x="103" y="19" width="72" height="178" rx="1" className="fill-sky-200/60 dark:fill-sky-800/30" />
      <rect x="103" y="19" width="72" height="178" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Center meeting stile (overlapping rail — thicker to show overlap) */}
      <rect x="96" y="12" width="10" height="192" className="fill-slate-400 dark:fill-slate-500" />
      {/* Horizontal handle bar on active panel */}
      <rect x="108" y="110" width="4" height="28" rx="2" className="fill-slate-600 dark:fill-slate-300" />
      {/* Floor track detail (recessed channel) */}
      <rect x="25" y="198" width="150" height="5" rx="1" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="1.5" />
      <line x1="30" y1="200" x2="170" y2="200" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Slide direction arrow */}
      <path d="M 155 124 L 125 124 M 132 119 L 125 124 L 132 129" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="2" />
      {/* Label */}
      <text x="140" y="142" textAnchor="middle" className="fill-blue-400 dark:fill-blue-500" fontSize="7" fontFamily="sans-serif">SLIDES</text>
      {/* Fixed label on left panel */}
      <text x="63" y="112" textAnchor="middle" className="fill-slate-300 dark:fill-slate-600" fontSize="7" fontFamily="sans-serif">FIXED</text>
    </svg>
  )
}

/* ── FOLDING DOOR ── 4-panel bi-fold with alternating diagonal fold indicators */
function FoldingDoorDiagram() {
  return (
    <svg viewBox="0 0 240 220" className="w-full h-full max-w-[220px] max-h-[200px]">
      {/* Floor */}
      <line x1="5" y1="205" x2="235" y2="205" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" />
      {/* Top pivot track */}
      <rect x="13" y="10" width="214" height="5" rx="1" className="fill-slate-300 dark:fill-slate-600" />
      {/* Outer frame */}
      <rect x="15" y="12" width="210" height="192" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="5" />
      {/* Bottom guide track */}
      <rect x="20" y="198" width="200" height="5" rx="1" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="1.5" />

      {/* Panel 1 (left) — folds LEFT */}
      <rect x="22" y="19" width="48" height="178" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      <rect x="22" y="19" width="48" height="178" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Diagonal: folds left — line from top-right to bottom-left */}
      <line x1="70" y1="19" x2="22" y2="197" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Panel 2 — folds RIGHT */}
      <rect x="73" y="19" width="48" height="178" rx="1" className="fill-sky-200/50 dark:fill-sky-800/20" />
      <rect x="73" y="19" width="48" height="178" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Diagonal: folds right — line from top-left to bottom-right */}
      <line x1="73" y1="19" x2="121" y2="197" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Panel 3 — folds LEFT */}
      <rect x="124" y="19" width="48" height="178" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      <rect x="124" y="19" width="48" height="178" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Diagonal: folds left */}
      <line x1="172" y1="19" x2="124" y2="197" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Panel 4 (right) — folds RIGHT */}
      <rect x="175" y="19" width="48" height="178" rx="1" className="fill-sky-200/50 dark:fill-sky-800/20" />
      <rect x="175" y="19" width="48" height="178" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />
      {/* Diagonal: folds right */}
      <line x1="175" y1="19" x2="223" y2="197" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Hinge points between panels (pivot hardware) */}
      <circle cx="71" cy="108" r="3" className="fill-slate-500 dark:fill-slate-400" />
      <circle cx="122" cy="108" r="3" className="fill-slate-500 dark:fill-slate-400" />
      <circle cx="174" cy="108" r="3" className="fill-slate-500 dark:fill-slate-400" />

      {/* Panel divider stiles */}
      <line x1="70" y1="12" x2="70" y2="204" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2.5" />
      <line x1="121" y1="12" x2="121" y2="204" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2.5" />
      <line x1="174" y1="12" x2="174" y2="204" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2.5" />

      {/* Label */}
      <text x="120" y="7" textAnchor="middle" className="fill-blue-400 dark:fill-blue-500" fontSize="7" fontFamily="sans-serif">BI-FOLD — 4 PANELS</text>
    </svg>
  )
}

/* ── SWING DOOR ── commercial glass door with push bar, bottom rail, 90° arc */
function SwingDoorDiagram() {
  return (
    <svg viewBox="0 0 200 220" className="w-full h-full max-w-[180px] max-h-[200px]">
      {/* Wall on each side */}
      <rect x="5" y="10" width="35" height="14" className="fill-slate-300 dark:fill-slate-600" />
      <rect x="160" y="10" width="35" height="14" className="fill-slate-300 dark:fill-slate-600" />
      {/* Floor */}
      <line x1="5" y1="205" x2="195" y2="205" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" />

      {/* Door frame */}
      <rect x="40" y="12" width="120" height="192" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="5" />

      {/* Large glass vision panel (top 75% of door) */}
      <rect x="48" y="20" width="104" height="144" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      <rect x="48" y="20" width="104" height="144" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />

      {/* Bottom solid rail (kick plate) */}
      <rect x="48" y="168" width="104" height="28" rx="1" className="fill-slate-200 dark:fill-slate-700" />
      <rect x="48" y="168" width="104" height="28" rx="1" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1" />

      {/* Horizontal push/panic bar across glass */}
      <rect x="52" y="110" width="96" height="5" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Push bar mounting brackets */}
      <rect x="56" y="106" width="6" height="13" rx="1" className="fill-slate-400 dark:fill-slate-500" />
      <rect x="138" y="106" width="6" height="13" rx="1" className="fill-slate-400 dark:fill-slate-500" />

      {/* 3 hinges on left stile */}
      <rect x="37" y="40" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="37" y="95" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="37" y="170" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />

      {/* 90° swing arc — from door edge outward */}
      <path d="M 160 17 Q 210 110 160 200" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Swing arrow */}
      <path d="M 158 108 L 178 108 M 173 103 L 178 108 L 173 113" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />

      {/* Threshold at bottom */}
      <rect x="42" y="200" width="116" height="4" rx="1" className="fill-slate-400 dark:fill-slate-500" />

      {/* Labels */}
      <text x="100" y="90" textAnchor="middle" className="fill-slate-300 dark:fill-slate-600" fontSize="8" fontFamily="sans-serif">GLASS</text>
      <text x="100" y="186" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="7" fontFamily="sans-serif">KICK PLATE</text>
    </svg>
  )
}

/* ── GENERIC FALLBACK ── */
function GenericDiagram() {
  return (
    <svg viewBox="0 0 160 160" className="w-full h-full max-w-[140px] max-h-[140px]">
      <rect x="20" y="20" width="120" height="120" rx="3" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="5" />
      <rect x="28" y="28" width="104" height="104" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      <line x1="80" y1="28" x2="80" y2="132" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1.5" />
      <line x1="28" y1="80" x2="132" y2="80" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1.5" />
    </svg>
  )
}
