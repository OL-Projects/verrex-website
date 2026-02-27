"use client"

import { useState } from "react"
import { ChevronDown, Trash2, Plus, RotateCcw, FileText, PanelTop, DoorOpen, Receipt, X } from "lucide-react"
import type { EstimateStyle, EstimateSettings, ColorPreset, CustomOption } from "@/lib/estimate-hooks"
import { WINDOW_TYPES, PRODUCTS } from "@/lib/estimate-config"

const CLS = {
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5",
  row: "flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-white/3",
  sel: "px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm outline-none w-full",
  inp: "flex-1 min-w-0 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs outline-none",
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`h-5 w-9 rounded-full flex items-center px-0.5 transition shrink-0 ${on ? "bg-blue-500 justify-end" : "bg-slate-300 dark:bg-slate-600 justify-start"}`}>
      <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
    </button>
  )
}

function Section({ icon: Icon, title, open, onToggle, children }: {
  icon: React.ComponentType<{ className?: string }>; title: string
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="border-b border-slate-200 dark:border-white/10 last:border-b-0">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50/50 dark:hover:bg-white/3 transition">
        <Icon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex-1">{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-3 space-y-2">{children}</div>}
    </div>
  )
}

function ColorManager({ label, colors, onAdd, onRemove }: {
  label: string; colors: ColorPreset[]; onAdd: (n: string, h: string) => void; onRemove: (id: string) => void
}) {
  const [name, setName] = useState(""); const [hex, setHex] = useState("#000000")
  return (
    <div>
      <p className={CLS.lbl}>{label}</p>
      <div className="space-y-1 mb-1.5">
        {colors.map(c => (
          <div key={c.id} className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50/50 dark:bg-white/3">
            <span className="h-3.5 w-3.5 rounded shrink-0" style={{ backgroundColor: c.hex }} />
            <span className="text-[10px] flex-1 truncate">{c.name}</span>
            <button onClick={() => onRemove(c.id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} className="h-6 w-6 rounded cursor-pointer shrink-0" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className={CLS.inp} />
        <button onClick={() => { if (name.trim()) { onAdd(name.trim(), hex); setName("") } }}
          className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold shrink-0"><Plus className="h-2.5 w-2.5 inline" /></button>
      </div>
    </div>
  )
}

function AddRemoveList({ label, items, onAdd, onRemove }: {
  label: string; items: CustomOption[]; onAdd: (label: string) => void; onRemove: (id: string) => void
}) {
  const [val, setVal] = useState("")
  return (
    <div>
      <p className={CLS.lbl}>{label}</p>
      {items.length > 0 && (
        <div className="space-y-1 mb-1.5">
          {items.map(c => (
            <div key={c.id} className="flex items-center justify-between p-1 rounded-lg bg-blue-50/50 dark:bg-blue-500/10">
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-medium truncate flex-1 mr-1">✦ {c.label}</span>
              <button onClick={() => onRemove(c.id)} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="h-2.5 w-2.5" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1">
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Add custom…" className={CLS.inp}
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal("") } }} />
        <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal("") } }}
          className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold shrink-0"><Plus className="h-2.5 w-2.5 inline" /></button>
      </div>
    </div>
  )
}

interface Props {
  onClose: () => void
  style: EstimateStyle; onUpdateStyle: (p: Partial<EstimateStyle>) => void
  settings: EstimateSettings; onUpdateSettings: (p: Partial<EstimateSettings>) => void
  onToggleWindowType: (k: string) => void; onToggleDoorType: (k: string) => void; onToggleProduct: (id: string) => void
  onAddCustomWindowType: (l: string) => void; onRemoveCustomWindowType: (id: string) => void
  onAddCustomDoorType: (l: string) => void; onRemoveCustomDoorType: (id: string) => void
  onAddCustomProduct: (l: string) => void; onRemoveCustomProduct: (id: string) => void
  extColors: ColorPreset[]; intColors: ColorPreset[]
  onAddExt: (n: string, h: string) => void; onRemoveExt: (id: string) => void
  onAddInt: (n: string, h: string) => void; onRemoveInt: (id: string) => void
  onReset: () => void
}

export function EstimateCustomizePanel(props: Props) {
  const { onClose, style, onUpdateStyle: uS, settings: s, onUpdateSettings: uSet, onReset } = props
  const [open, setOpen] = useState<Record<string, boolean>>({ header: true })
  const t = (id: string) => setOpen(p => ({ ...p, [id]: !p[id] }))

  const winEntries = Object.entries(WINDOW_TYPES).filter(([, v]) => v.category === "window")
  const doorEntries = Object.entries(WINDOW_TYPES).filter(([, v]) => v.category === "door")

  return (
    <div className="hidden lg:flex flex-col w-[420px] shrink-0 sticky top-0 h-[calc(100vh-4rem)] z-10">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-t-xl border border-slate-200 dark:border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Estimate Settings</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
        {/* ═══ SECTION 1: HEADER ═══ */}
        <Section icon={FileText} title="Estimate Header" open={!!open.header} onToggle={() => t("header")}>
          <div className={CLS.row}><span className="text-[11px]">Date</span><Toggle on={s.showDate} onToggle={() => uSet({ showDate: !s.showDate })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Valid Until</span><Toggle on={s.showValidUntil} onToggle={() => uSet({ showValidUntil: !s.showValidUntil })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Required By</span><Toggle on={s.showRequiredBy} onToggle={() => uSet({ showRequiredBy: !s.showRequiredBy })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Representative</span><Toggle on={s.showRepSection} onToggle={() => uSet({ showRepSection: !s.showRepSection })} /></div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Client Fields</p>
          {([["showClientName","Name"],["showClientAddress","Address"],["showClientCity","City"],["showClientPhone","Phone"],["showClientEmail","Email"]] as const).map(([k,l]) => (
            <div key={k} className={CLS.row}><span className="text-[11px]">{l}</span><Toggle on={s[k]} onToggle={() => uSet({ [k]: !s[k] })} /></div>
          ))}

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Shipping Fields</p>
          <div className={CLS.row}><span className="text-[11px]">Ship Method</span><Toggle on={s.showShipMethod} onToggle={() => uSet({ showShipMethod: !s.showShipMethod })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Ship Address</span><Toggle on={s.showShipAddress} onToggle={() => uSet({ showShipAddress: !s.showShipAddress })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Ship Phone</span><Toggle on={s.showShipPhone} onToggle={() => uSet({ showShipPhone: !s.showShipPhone })} /></div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Document Style</p>
          <div className="mb-2">
            <label className={CLS.lbl}>Accent Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={style.accentColor} onChange={e => uS({ accentColor: e.target.value })} className="h-7 w-7 rounded cursor-pointer" />
              <span className="text-[9px] text-slate-400">{style.accentColor}</span>
            </div>
          </div>
          <div className="mb-2">
            <label className={CLS.lbl}>Font Size</label>
            <div className="flex gap-1.5">
              {(["sm","md","lg"] as const).map(sz => (
                <button key={sz} onClick={() => uS({ fontSize: sz })} className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${style.fontSize === sz ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{sz.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div className="mb-2">
            <label className={CLS.lbl}>Layout</label>
            <div className="flex gap-1.5">
              {(["compact","standard","detailed"] as const).map(l => (
                <button key={l} onClick={() => uS({ layout: l })} className={`flex-1 py-1 rounded-lg text-[9px] font-bold capitalize ${style.layout === l ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{l}</button>
              ))}
            </div>
          </div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Print / PDF</p>
          <div className="mb-2">
            <label className={CLS.lbl}>Paper</label>
            <select value={style.paperSize} onChange={e => uS({ paperSize: e.target.value as EstimateStyle["paperSize"] })} className={CLS.sel}>
              <option value="letter">Letter</option><option value="legal">Legal</option><option value="a4">A4</option>
            </select>
          </div>
          <div className="flex gap-1.5 mb-2">
            {(["portrait","landscape"] as const).map(o => (
              <button key={o} onClick={() => uS({ orientation: o })} className={`flex-1 py-1 rounded-lg text-[9px] font-bold capitalize ${style.orientation === o ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{o}</button>
            ))}
          </div>
          <div className="mb-2">
            <label className={CLS.lbl}>Margins: {style.margins}mm</label>
            <input type="range" min={4} max={20} value={style.margins} onChange={e => uS({ margins: +e.target.value })} className="w-full h-1" />
          </div>
          <div className="flex gap-1.5">
            {(["draft","standard","high"] as const).map(q => (
              <button key={q} onClick={() => uS({ pdfQuality: q })} className={`flex-1 py-1 rounded-lg text-[9px] font-bold capitalize ${style.pdfQuality === q ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{q}</button>
            ))}
          </div>
        </Section>

        {/* ═══ SECTION 2: WINDOW CARD ═══ */}
        <Section icon={PanelTop} title="Window Card" open={!!open.window} onToggle={() => t("window")}>
          <div className={CLS.row}><span className="text-[11px]">Depth Field</span><Toggle on={s.showDepth} onToggle={() => uSet({ showDepth: !s.showDepth })} /></div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Diagram</p>
          <div className="flex gap-1.5 mb-1">
            {(["sm","md","lg"] as const).map(sz => (
              <button key={sz} onClick={() => uS({ cardSize: sz })} className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${style.cardSize === sz ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{sz.toUpperCase()}</button>
            ))}
          </div>
          {([["showModuleLabels","Module Labels"],["showEgressBadge","Egress Badge"],["showDimensions","Dimensions"],["showExteriorLabel","Exterior Label"]] as const).map(([k,l]) => (
            <div key={k} className={CLS.row}><span className="text-[11px]">{l}</span><Toggle on={style[k]} onToggle={() => uS({ [k]: !style[k] })} /></div>
          ))}

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Window Types</p>
          <div className="max-h-36 overflow-y-auto space-y-0.5 mb-1">
            {winEntries.map(([k, cfg]) => (
              <div key={k} className="flex items-center justify-between p-1 rounded-lg bg-slate-50/30 dark:bg-white/2">
                <span className="text-[10px] truncate flex-1 mr-1">{cfg.label}</span>
                <Toggle on={s.enabledWindowTypes.includes(k)} onToggle={() => props.onToggleWindowType(k)} />
              </div>
            ))}
          </div>
          <AddRemoveList label="Custom Window Types" items={s.customWindowTypes} onAdd={props.onAddCustomWindowType} onRemove={props.onRemoveCustomWindowType} />

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Products</p>
          {PRODUCTS.map(p => (
            <div key={p.id} className="flex items-center justify-between p-1 rounded-lg bg-slate-50/30 dark:bg-white/2 mb-0.5">
              <span className="text-[10px]">{p.label}</span>
              <Toggle on={s.enabledProducts.includes(p.id)} onToggle={() => props.onToggleProduct(p.id)} />
            </div>
          ))}
          <AddRemoveList label="Custom Products" items={s.customProducts} onAdd={props.onAddCustomProduct} onRemove={props.onRemoveCustomProduct} />

          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <ColorManager label="Exterior Colors" colors={props.extColors} onAdd={props.onAddExt} onRemove={props.onRemoveExt} />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <ColorManager label="Interior Colors" colors={props.intColors} onAdd={props.onAddInt} onRemove={props.onRemoveInt} />
          </div>
        </Section>

        {/* ═══ SECTION 3: DOOR CARD ═══ */}
        <Section icon={DoorOpen} title="Door Card" open={!!open.door} onToggle={() => t("door")}>
          <div className="max-h-36 overflow-y-auto space-y-0.5 mb-1">
            {doorEntries.map(([k, cfg]) => (
              <div key={k} className="flex items-center justify-between p-1 rounded-lg bg-slate-50/30 dark:bg-white/2">
                <span className="text-[10px] truncate flex-1 mr-1">{cfg.label}</span>
                <Toggle on={s.enabledDoorTypes.includes(k)} onToggle={() => props.onToggleDoorType(k)} />
              </div>
            ))}
          </div>
          <AddRemoveList label="Custom Door Types" items={s.customDoorTypes} onAdd={props.onAddCustomDoorType} onRemove={props.onRemoveCustomDoorType} />
        </Section>

        {/* ═══ SECTION 4: PRICING SUMMARY ═══ */}
        <Section icon={Receipt} title="Pricing Summary" open={!!open.pricing} onToggle={() => t("pricing")}>
          <div className="mb-2">
            <label className={CLS.lbl}>Section Title</label>
            <input value={s.summaryTitle} onChange={e => uSet({ summaryTitle: e.target.value })} className={CLS.inp + " w-full"} />
          </div>
          <div className={CLS.row}><span className="text-[11px]">Installation</span><Toggle on={s.showInstallation} onToggle={() => uSet({ showInstallation: !s.showInstallation })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Delivery</span><Toggle on={s.showDelivery} onToggle={() => uSet({ showDelivery: !s.showDelivery })} /></div>
          <div className={CLS.row}>
            <span className="text-[11px]">GST / TPS</span>
            <div className="flex items-center gap-1">
              <input type="number" value={s.gstRate} onChange={e => uSet({ gstRate: +e.target.value })} step={0.1} min={0} max={20} className="w-14 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
              <span className="text-[10px] text-slate-400">%</span>
              <Toggle on={s.showGST} onToggle={() => uSet({ showGST: !s.showGST })} />
            </div>
          </div>
          <div className={CLS.row}>
            <span className="text-[11px]">QST / TVQ</span>
            <div className="flex items-center gap-1">
              <input type="number" value={s.qstRate} onChange={e => uSet({ qstRate: +e.target.value })} step={0.1} min={0} max={20} className="w-14 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
              <span className="text-[10px] text-slate-400">%</span>
              <Toggle on={s.showQST} onToggle={() => uSet({ showQST: !s.showQST })} />
            </div>
          </div>
          <div className={CLS.row}><span className="text-[11px]">Deposit</span><Toggle on={s.showDeposit} onToggle={() => uSet({ showDeposit: !s.showDeposit })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Balance Remaining</span><Toggle on={s.showBalance} onToggle={() => uSet({ showBalance: !s.showBalance })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Terms & Conditions</span><Toggle on={s.showTerms} onToggle={() => uSet({ showTerms: !s.showTerms })} /></div>
          {s.showTerms && <>
            <div className="mt-1.5">
              <label className={CLS.lbl}>T&C Section Title</label>
              <input value={s.termsTitle ?? "Terms & Conditions"} onChange={e => uSet({ termsTitle: e.target.value })} className={CLS.inp + " w-full"} />
            </div>
            <div className={CLS.row}><span className="text-[11px]">Signatures</span><Toggle on={s.showSignatures ?? true} onToggle={() => uSet({ showSignatures: !(s.showSignatures ?? true) })} /></div>
            <div className={CLS.row}><span className="text-[11px]">Signature Date Label</span><Toggle on={s.showSignatureDate ?? true} onToggle={() => uSet({ showSignatureDate: !(s.showSignatureDate ?? true) })} /></div>
          </>}
        </Section>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800 rounded-b-xl border border-t-0 border-slate-200 dark:border-white/10 px-4 py-2">
        <button onClick={onReset} className="w-full py-1.5 rounded-lg text-[10px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition flex items-center justify-center gap-1">
          <RotateCcw className="h-3 w-3" /> Reset All
        </button>
      </div>
    </div>
  )
}
