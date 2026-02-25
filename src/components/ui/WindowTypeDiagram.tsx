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
      {/* Opening arc - bottom swings outward */}
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

/* ── CASEMENT ── side-hinged, opens outward */
function CasementDiagram() {
  return (
    <svg viewBox="0 0 180 200" className="w-full h-full max-w-[160px] max-h-[180px]">
      {/* Frame */}
      <rect x="25" y="15" width="130" height="170" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Glass */}
      <rect x="33" y="23" width="114" height="154" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Horizontal glazing bar */}
      <line x1="33" y1="100" x2="147" y2="100" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1.5" />
      {/* Left hinge indicators */}
      <rect x="22" y="55" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="22" y="130" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Handle on right */}
      <rect x="140" y="92" width="5" height="16" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Opening arc - right side swings outward */}
      <path d="M 155 30 Q 185 100 155 170" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Arrow outward */}
      <path d="M 152 100 L 168 100 M 163 95 L 168 100 L 163 105" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
    </svg>
  )
}

/* ── TILT & TURN ── dual mode: tilt from top + swing from side */
function TiltTurnDiagram() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-w-[180px] max-h-[180px]">
      {/* Frame */}
      <rect x="30" y="15" width="130" height="170" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Glass */}
      <rect x="38" y="23" width="114" height="154" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Diagonal cross showing tilt-turn dual mode */}
      <line x1="38" y1="23" x2="152" y2="177" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="152" y1="23" x2="38" y2="177" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" strokeDasharray="3 3" />
      {/* Left hinge */}
      <rect x="27" y="60" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="27" y="130" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Handle */}
      <rect x="145" y="92" width="5" height="16" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* TILT arc - top tilts inward */}
      <path d="M 45 18 Q 95 -5 145 18" fill="none" stroke="currentColor" className="text-emerald-500 dark:text-emerald-400" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M 95 18 L 95 4 M 90 9 L 95 4 L 100 9" fill="none" stroke="currentColor" className="text-emerald-500 dark:text-emerald-400" strokeWidth="1.5" />
      {/* TURN arc - side swings inward */}
      <path d="M 160 30 Q 185 100 160 170" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M 157 100 L 172 100 M 167 95 L 172 100 L 167 105" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
      {/* Labels */}
      <text x="95" y="210" textAnchor="middle" className="fill-emerald-500 dark:fill-emerald-400" fontSize="7" fontFamily="sans-serif">TILT</text>
      <text x="180" y="102" textAnchor="start" className="fill-blue-400 dark:fill-blue-500" fontSize="7" fontFamily="sans-serif">TURN</text>
    </svg>
  )
}

/* ── HAND CRANKED ── casement with crank mechanism */
function HandCrankedDiagram() {
  return (
    <svg viewBox="0 0 180 210" className="w-full h-full max-w-[160px] max-h-[190px]">
      {/* Frame */}
      <rect x="25" y="15" width="130" height="160" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Glass */}
      <rect x="33" y="23" width="114" height="144" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Left hinge indicators */}
      <rect x="22" y="50" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="22" y="120" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Opening arc */}
      <path d="M 155 25 Q 180 95 155 165" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Crank mechanism at bottom */}
      <circle cx="90" cy="190" r="4" className="fill-slate-500 dark:fill-slate-400" />
      <line x1="90" y1="175" x2="90" y2="186" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="2" />
      <line x1="90" y1="190" x2="108" y2="196" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="2.5" />
      <circle cx="108" cy="196" r="3" className="fill-slate-400 dark:fill-slate-500" />
      {/* Crank label */}
      <text x="90" y="207" textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="7" fontFamily="sans-serif">CRANK</text>
    </svg>
  )
}

/* ── SLIDING DOOR ── tall panels on floor track */
function SlidingDoorDiagram() {
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full max-w-[200px] max-h-[160px]">
      {/* Floor line */}
      <line x1="10" y1="165" x2="210" y2="165" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" />
      {/* Frame */}
      <rect x="25" y="15" width="170" height="150" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="6" />
      {/* Left panel (fixed) */}
      <rect x="33" y="23" width="76" height="134" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Right panel (slides) */}
      <rect x="113" y="23" width="76" height="134" rx="1" className="fill-sky-200/70 dark:fill-sky-800/40" />
      {/* Center rail */}
      <line x1="110" y1="15" x2="110" y2="165" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="4" />
      {/* Floor track detail */}
      <rect x="30" y="160" width="160" height="4" rx="1" className="fill-slate-300 dark:fill-slate-600" />
      {/* Handle on right panel */}
      <rect x="118" y="82" width="5" height="20" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Sliding arrow */}
      <path d="M 165 90 L 135 90 M 142 85 L 135 90 L 142 95" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="2" />
      {/* Glazing bars */}
      <line x1="33" y1="90" x2="109" y2="90" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
      <line x1="113" y1="90" x2="189" y2="90" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
    </svg>
  )
}

/* ── FOLDING DOOR ── multi-panel bi-fold */
function FoldingDoorDiagram() {
  return (
    <svg viewBox="0 0 240 180" className="w-full h-full max-w-[220px] max-h-[160px]">
      {/* Floor line */}
      <line x1="5" y1="165" x2="235" y2="165" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" />
      {/* Frame */}
      <rect x="15" y="15" width="210" height="150" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="5" />
      {/* 4 panels */}
      <rect x="22" y="22" width="48" height="136" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      <rect x="73" y="22" width="48" height="136" rx="1" className="fill-sky-200/60 dark:fill-sky-800/30" />
      <rect x="124" y="22" width="48" height="136" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      <rect x="175" y="22" width="48" height="136" rx="1" className="fill-sky-200/60 dark:fill-sky-800/30" />
      {/* Panel dividers */}
      <line x1="70" y1="15" x2="70" y2="165" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2.5" />
      <line x1="121" y1="15" x2="121" y2="165" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2.5" />
      <line x1="172" y1="15" x2="172" y2="165" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2.5" />
      {/* Floor track */}
      <rect x="20" y="160" width="200" height="4" rx="1" className="fill-slate-300 dark:fill-slate-600" />
      {/* Fold direction arrows */}
      <path d="M 46 90 L 26 75 M 46 90 L 26 105" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
      <path d="M 97 90 L 117 75 M 97 90 L 117 105" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
      <path d="M 148 90 L 128 75 M 148 90 L 128 105" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
      <path d="M 199 90 L 219 75 M 199 90 L 219 105" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
      {/* Fold label */}
      <text x="120" y="12" textAnchor="middle" className="fill-blue-400 dark:fill-blue-500" fontSize="7" fontFamily="sans-serif">BI-FOLD</text>
    </svg>
  )
}

/* ── SWING DOOR ── traditional hinged door */
function SwingDoorDiagram() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-w-[180px] max-h-[180px]">
      {/* Wall lines */}
      <line x1="10" y1="20" x2="40" y2="20" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="6" />
      <line x1="160" y1="20" x2="190" y2="20" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="6" />
      {/* Floor line */}
      <line x1="10" y1="180" x2="190" y2="180" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="2" />
      {/* Frame */}
      <rect x="40" y="18" width="120" height="162" rx="2" fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="5" />
      {/* Glass panel */}
      <rect x="48" y="30" width="104" height="90" rx="1" className="fill-sky-100 dark:fill-sky-900/30" />
      {/* Lower panel (solid) */}
      <rect x="48" y="124" width="104" height="48" rx="1" className="fill-slate-100 dark:fill-slate-800/50" />
      <line x1="48" y1="124" x2="152" y2="124" stroke="currentColor" className="text-slate-300 dark:text-slate-600" strokeWidth="1.5" />
      {/* Left hinges */}
      <rect x="37" y="50" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      <rect x="37" y="140" width="6" height="14" rx="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* Handle */}
      <circle cx="142" cy="105" r="5" fill="none" stroke="currentColor" className="text-slate-500 dark:text-slate-400" strokeWidth="2" />
      <circle cx="142" cy="105" r="2" className="fill-slate-500 dark:fill-slate-400" />
      {/* 90° swing arc */}
      <path d="M 160 20 Q 200 100 160 180" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Arrow */}
      <path d="M 158 100 L 178 100 M 173 95 L 178 100 L 173 105" fill="none" stroke="currentColor" className="text-blue-500 dark:text-blue-400" strokeWidth="1.5" />
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
