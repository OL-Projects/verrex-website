"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, Trash2, Plus, RotateCcw, FileText, PanelTop, DoorOpen, Receipt } from "lucide-react"
import type { EstimateStyle, EstimateSettings, ColorPreset } from "@/lib/estimate-hooks"
import { WINDOW_TYPES, PRODUCTS } from "@/lib/estimate-config"

/* ── Shared classes ──────────────────────────── */
const CLS = {
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5",
  row: "flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-white/3",
  sel: "px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none",
}

/* ── Toggle Switch ───────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`h-6 w-10 rounded-full flex items-center px-0.5 transition shrink-0 ${on ? "bg-blue-500 justify-end" : "bg-slate-300 dark:bg-slate-600 justify-start"}`}>
      <div className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </button>
  )
}

/* ── Accordion Section ───────────────────────── */
function Section({ id, icon: Icon, title, open, onToggle, children }: {
  id: string; icon: React.ComponentType<{ className?: string }>; title: string
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border-b border-slate-200 dark:border-white/10 last:border-b-0">
      <button onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-5 py-3.5 text-left hover:bg-slate-50/50 dark:hover:bg-white/3 transition">
        <Icon className="h-4 w-4 text-blue-500 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex-1">{title}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Color Manager (inline add/remove) ───────── */
function ColorManager({ label, colors, onAdd, onRemove }: {
  label: string; colors: ColorPreset[]
  onAdd: (name: string, hex: string) => void; onRemove: (id: string) => void
}) {
  const [name, setName] = useState("")
  const [hex, setHex] = useState("#000000")
  return (
    <div>
      <p className={CLS.lbl}>{label}</p>
      <div className="space-y-1 mb-2">
        {colors.map(c => (
          <div key={c.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50/50 dark:bg-white/3">
            <span className="h-4 w-4 rounded border border-slate-200 dark:border-white/10 shrink-0" style={{ backgroundColor: c.hex }} />
            <span className="text-xs flex-1 truncate">{c.name}</span>
            <span className="text-[9px] text-slate-400">{c.hex}</span>
            <button onClick={() => onRemove(c.id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="h-3 w-3" /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} className="h-7 w-7 rounded cursor-pointer shrink-0" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Color name"
          className="flex-1 min-w-0 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs outline-none" />
        <button onClick={() => { if (name.trim()) { onAdd(name.trim(), hex); setName("") } }}
          className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shrink-0 flex items-center gap-0.5">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
    </div>
  )
}

/* ── Main Panel Props ────────────────────────── */
interface Props {
  open: boolean
  onClose: () => void
  style: EstimateStyle
  onUpdateStyle: (patch: Partial<EstimateStyle>) => void
  settings: EstimateSettings
  onUpdateSettings: (patch: Partial<EstimateSettings>) => void
  onToggleWindowType: (key: string) => void
  onToggleDoorType: (key: string) => void
  onToggleProduct: (id: string) => void
  extColors: ColorPreset[]
  intColors: ColorPreset[]
  onAddExt: (name: string, hex: string) => void
  onRemoveExt: (id: string) => void
  onAddInt: (name: string, hex: string) => void
  onRemoveInt: (id: string) => void
  onReset: () => void
}

export function EstimateCustomizePanel({
  open, onClose,
  style, onUpdateStyle,
  settings, onUpdateSettings,
  onToggleWindowType, onToggleDoorType, onToggleProduct,
  extColors, intColors, onAddExt, onRemoveExt, onAddInt, onRemoveInt,
  onReset,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ header: true })
  const toggle = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }))

  // Group window types vs door types
  const windowEntries = Object.entries(WINDOW_TYPES).filter(([, v]) => v.category === "window")
  const doorEntries = Object.entries(WINDOW_TYPES).filter(([, v]) => v.category === "door")

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[calc(100vw-16px)] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 z-50 flex flex-col shadow-2xl">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-200 dark:border-white/10 shrink-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Estimate Settings</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"><X className="h-5 w-5" /></button>
            </div>

            {/* ── Scrollable Sections ── */}
            <div className="flex-1 overflow-y-auto">

              {/* ═══ SECTION 1: ESTIMATE HEADER CARD ═══ */}
              <Section id="header" icon={FileText} title="Estimate Header" open={!!openSections.header} onToggle={() => toggle("header")}>
                {/* Field toggles */}
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Date field</span><Toggle on={settings.showDate} onToggle={() => onUpdateSettings({ showDate: !settings.showDate })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Valid Until field</span><Toggle on={settings.showValidUntil} onToggle={() => onUpdateSettings({ showValidUntil: !settings.showValidUntil })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Required By field</span><Toggle on={settings.showRequiredBy} onToggle={() => onUpdateSettings({ showRequiredBy: !settings.showRequiredBy })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Representative section</span><Toggle on={settings.showRepSection} onToggle={() => onUpdateSettings({ showRepSection: !settings.showRepSection })} /></div>

                {/* Document style */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Document Style</p>
                  <div className="mb-3">
                    <label className={CLS.lbl}>Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={style.accentColor} onChange={e => onUpdateStyle({ accentColor: e.target.value })} className="h-8 w-8 rounded cursor-pointer" />
                      <span className="text-[10px] text-slate-400">{style.accentColor}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className={CLS.lbl}>Font Size</label>
                    <div className="flex gap-2">
                      {(["sm", "md", "lg"] as const).map(s => (
                        <button key={s} onClick={() => onUpdateStyle({ fontSize: s })}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${style.fontSize === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{s.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className={CLS.lbl}>Layout Density</label>
                    <div className="flex gap-2">
                      {(["compact", "standard", "detailed"] as const).map(l => (
                        <button key={l} onClick={() => onUpdateStyle({ layout: l })}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition ${style.layout === l ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Print settings */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Print / PDF</p>
                  <div className="mb-3">
                    <label className={CLS.lbl}>Paper Size</label>
                    <select value={style.paperSize} onChange={e => onUpdateStyle({ paperSize: e.target.value as EstimateStyle["paperSize"] })} className={CLS.sel + " w-full"}>
                      <option value="letter">Letter (8.5 × 11&quot;)</option>
                      <option value="legal">Legal (8.5 × 14&quot;)</option>
                      <option value="a4">A4 (210 × 297mm)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className={CLS.lbl}>Orientation</label>
                    <div className="flex gap-2">
                      {(["portrait", "landscape"] as const).map(o => (
                        <button key={o} onClick={() => onUpdateStyle({ orientation: o })}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition ${style.orientation === o ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className={CLS.lbl}>Margins: {style.margins}mm</label>
                    <input type="range" min={4} max={20} value={style.margins} onChange={e => onUpdateStyle({ margins: +e.target.value })} className="w-full" />
                  </div>
                  <div>
                    <label className={CLS.lbl}>PDF Quality</label>
                    <div className="flex gap-2">
                      {(["draft", "standard", "high"] as const).map(q => (
                        <button key={q} onClick={() => onUpdateStyle({ pdfQuality: q })}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition ${style.pdfQuality === q ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{q}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              {/* ═══ SECTION 2: WINDOW CARD ═══ */}
              <Section id="window" icon={PanelTop} title="Window Card" open={!!openSections.window} onToggle={() => toggle("window")}>
                {/* Depth toggle */}
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Depth field</span><Toggle on={settings.showDepth} onToggle={() => onUpdateSettings({ showDepth: !settings.showDepth })} /></div>

                {/* Diagram toggles */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Diagram Display</p>
                  <div className="mb-2">
                    <label className={CLS.lbl}>Card Size</label>
                    <div className="flex gap-2">
                      {(["sm", "md", "lg"] as const).map(s => (
                        <button key={s} onClick={() => onUpdateStyle({ cardSize: s })}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${style.cardSize === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>{s.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  {([
                    ["showModuleLabels", "Module Labels (CAS-L, FIX, etc.)"],
                    ["showEgressBadge", "Egress Compliance Badge"],
                    ["showDimensions", "Dimension Text"],
                    ["showExteriorLabel", "\"Exterior View\" Label"],
                  ] as const).map(([key, label]) => (
                    <div key={key} className={CLS.row + " mb-1"}>
                      <span className="text-xs text-slate-700 dark:text-slate-300">{label}</span>
                      <Toggle on={style[key]} onToggle={() => onUpdateStyle({ [key]: !style[key] })} />
                    </div>
                  ))}
                </div>

                {/* Window Types toggles */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Available Window Types</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {windowEntries.map(([key, cfg]) => (
                      <div key={key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/30 dark:bg-white/2">
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate flex-1 mr-2">{cfg.label}</span>
                        <Toggle on={settings.enabledWindowTypes.includes(key)} onToggle={() => onToggleWindowType(key)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products toggles */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Available Products</p>
                  <div className="space-y-1">
                    {PRODUCTS.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/30 dark:bg-white/2">
                        <span className="text-[11px] text-slate-700 dark:text-slate-300">{p.label}</span>
                        <Toggle on={settings.enabledProducts.includes(p.id)} onToggle={() => onToggleProduct(p.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <ColorManager label="Exterior Colors" colors={extColors} onAdd={onAddExt} onRemove={onRemoveExt} />
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5">
                  <ColorManager label="Interior Colors" colors={intColors} onAdd={onAddInt} onRemove={onRemoveInt} />
                </div>
              </Section>

              {/* ═══ SECTION 3: DOOR CARD ═══ */}
              <Section id="door" icon={DoorOpen} title="Door Card" open={!!openSections.door} onToggle={() => toggle("door")}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Available Door Types</p>
                <div className="space-y-1">
                  {doorEntries.map(([key, cfg]) => (
                    <div key={key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/30 dark:bg-white/2">
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate flex-1 mr-2">{cfg.label}</span>
                      <Toggle on={settings.enabledDoorTypes.includes(key)} onToggle={() => onToggleDoorType(key)} />
                    </div>
                  ))}
                </div>
              </Section>

              {/* ═══ SECTION 4: PRICING SUMMARY ═══ */}
              <Section id="pricing" icon={Receipt} title="Pricing Summary" open={!!openSections.pricing} onToggle={() => toggle("pricing")}>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Installation row</span><Toggle on={settings.showInstallation} onToggle={() => onUpdateSettings({ showInstallation: !settings.showInstallation })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Delivery row</span><Toggle on={settings.showDelivery} onToggle={() => onUpdateSettings({ showDelivery: !settings.showDelivery })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show GST (TPS 5%)</span><Toggle on={settings.showGST} onToggle={() => onUpdateSettings({ showGST: !settings.showGST })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show QST (TVQ 9.975%)</span><Toggle on={settings.showQST} onToggle={() => onUpdateSettings({ showQST: !settings.showQST })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Deposit section</span><Toggle on={settings.showDeposit} onToggle={() => onUpdateSettings({ showDeposit: !settings.showDeposit })} /></div>
                <div className={CLS.row}><span className="text-xs text-slate-700 dark:text-slate-300">Show Terms & Conditions</span><Toggle on={settings.showTerms} onToggle={() => onUpdateSettings({ showTerms: !settings.showTerms })} /></div>
              </Section>

            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 shrink-0">
              <button onClick={onReset} className="w-full py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition flex items-center justify-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset All to Defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
