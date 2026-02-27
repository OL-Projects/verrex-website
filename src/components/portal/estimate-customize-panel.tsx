"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Palette, Grid3X3, Printer } from "lucide-react"
import type { EstimateStyle } from "@/lib/estimate-hooks"

const tabs = [
  { id: "doc", label: "Document", icon: Palette },
  { id: "diagram", label: "Diagrams", icon: Grid3X3 },
  { id: "print", label: "Print", icon: Printer },
] as const

type Tab = typeof tabs[number]["id"]

const CLS = {
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5",
  row: "flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/3",
  sel: "px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none",
}

interface Props {
  open: boolean
  onClose: () => void
  style: EstimateStyle
  onUpdate: (patch: Partial<EstimateStyle>) => void
  onReset: () => void
}

export function EstimateCustomizePanel({ open, onClose, style, onUpdate, onReset }: Props) {
  const [tab, setTab] = useState<Tab>("doc")

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 z-50 flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Customize Estimate</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X className="h-5 w-5" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-white/10">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition ${tab === t.id ? "text-blue-600 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-700"}`}>
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {tab === "doc" && (
                <>
                  <div>
                    <label className={CLS.lbl}>Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={style.accentColor} onChange={e => onUpdate({ accentColor: e.target.value })} className="h-9 w-9 rounded cursor-pointer" />
                      <span className="text-xs text-slate-400">{style.accentColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className={CLS.lbl}>Font Size</label>
                    <div className="flex gap-2">
                      {(["sm", "md", "lg"] as const).map(s => (
                        <button key={s} onClick={() => onUpdate({ fontSize: s })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${style.fontSize === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{s.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={CLS.lbl}>Layout Density</label>
                    <div className="flex gap-2">
                      {(["compact", "standard", "detailed"] as const).map(l => (
                        <button key={l} onClick={() => onUpdate({ layout: l })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition ${style.layout === l ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === "diagram" && (
                <>
                  <div>
                    <label className={CLS.lbl}>Window Card Size</label>
                    <div className="flex gap-2">
                      {(["sm", "md", "lg"] as const).map(s => (
                        <button key={s} onClick={() => onUpdate({ cardSize: s })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${style.cardSize === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{s.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  {([
                    ["showModuleLabels", "Module Labels (CAS-L, FIX, etc.)"],
                    ["showEgressBadge", "Egress Compliance Badge"],
                    ["showDimensions", "Dimension Text"],
                    ["showExteriorLabel", "\"Exterior View\" Label"],
                  ] as const).map(([key, label]) => (
                    <div key={key} className={CLS.row}>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                      <button onClick={() => onUpdate({ [key]: !style[key] })}
                        className={`h-6 w-10 rounded-full flex items-center px-0.5 transition ${style[key] ? "bg-blue-500 justify-end" : "bg-slate-300 dark:bg-slate-600 justify-start"}`}>
                        <div className="h-5 w-5 rounded-full bg-white shadow-sm" />
                      </button>
                    </div>
                  ))}
                </>
              )}

              {tab === "print" && (
                <>
                  <div>
                    <label className={CLS.lbl}>Paper Size</label>
                    <select value={style.paperSize} onChange={e => onUpdate({ paperSize: e.target.value as EstimateStyle["paperSize"] })} className={CLS.sel + " w-full"}>
                      <option value="letter">Letter (8.5 × 11&quot;)</option>
                      <option value="legal">Legal (8.5 × 14&quot;)</option>
                      <option value="a4">A4 (210 × 297mm)</option>
                    </select>
                  </div>
                  <div>
                    <label className={CLS.lbl}>Orientation</label>
                    <div className="flex gap-2">
                      {(["portrait", "landscape"] as const).map(o => (
                        <button key={o} onClick={() => onUpdate({ orientation: o })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition ${style.orientation === o ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={CLS.lbl}>Margins: {style.margins}mm</label>
                    <input type="range" min={4} max={20} value={style.margins} onChange={e => onUpdate({ margins: +e.target.value })} className="w-full" />
                  </div>
                  <div>
                    <label className={CLS.lbl}>PDF Quality</label>
                    <div className="flex gap-2">
                      {(["draft", "standard", "high"] as const).map(q => (
                        <button key={q} onClick={() => onUpdate({ pdfQuality: q })}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition ${style.pdfQuality === q ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{q}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10">
              <button onClick={onReset} className="w-full py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">Reset to Defaults</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
