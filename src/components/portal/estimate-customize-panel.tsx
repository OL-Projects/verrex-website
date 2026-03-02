"use client"

import { useState } from "react"
import { useLocale } from "next-intl"
import { usePortalT } from "@/lib/portal-i18n"
import { ChevronDown, Trash2, Plus, RotateCcw, FileText, PanelTop, DoorOpen, Receipt, ScrollText, X, Ruler, CreditCard } from "lucide-react"
import type { EstimateStyle, EstimateSettings, ColorPreset, CustomOption } from "@/lib/estimate-hooks"
import { WINDOW_TYPES, PRODUCTS, GLASS_RATE_UNITS, TRIM_UNITS, INSTALL_METHODS, type PaymentStageConfig , tl } from "@/lib/estimate-config"

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
  const T = usePortalT()
  const locale = useLocale()
  const { onClose, style, onUpdateStyle: uS, settings: s, onUpdateSettings: uSet, onReset } = props
  const [open, setOpen] = useState<Record<string, boolean>>({ header: true })
  const t = (id: string) => setOpen(p => ({ ...p, [id]: !p[id] }))

  const winEntries = Object.entries(WINDOW_TYPES).filter(([, v]) => v.category === "window")
  const doorEntries = Object.entries(WINDOW_TYPES).filter(([, v]) => v.category === "door")

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 lg:static lg:inset-auto lg:z-10 lg:flex lg:flex-col lg:w-[420px] lg:shrink-0 lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)]" style={{ touchAction: "pan-y" }}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800 lg:rounded-t-xl border-b lg:border border-slate-200 dark:border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Estimate Settings</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900" style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}>
        {/* ═══ SECTION 1: HEADER ═══ */}
        <Section icon={FileText} title={T.est.headerSection} open={!!open.header} onToggle={() => t("header")}>
          <div className={CLS.row}><span className="text-[11px]">Date</span><Toggle on={s.showDate} onToggle={() => uSet({ showDate: !s.showDate })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Valid Until</span><Toggle on={s.showValidUntil} onToggle={() => uSet({ showValidUntil: !s.showValidUntil })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Required By</span><Toggle on={s.showRequiredBy} onToggle={() => uSet({ showRequiredBy: !s.showRequiredBy })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Representative</span><Toggle on={s.showRepSection} onToggle={() => uSet({ showRepSection: !s.showRepSection })} /></div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Client Fields</p>
          {([["showClientName", T.est.name_],["showClientAddress", T.est.address_],["showClientCity", T.est.city_],["showClientPhone", T.est.phone_],["showClientEmail", T.est.email_]] as const).map(([k,l]) => (
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
        <Section icon={PanelTop} title={T.est.windowCardSection} open={!!open.window} onToggle={() => t("window")}>
          <div className={CLS.row}><span className="text-[11px]">Thickness Field</span><Toggle on={s.showThickness ?? true} onToggle={() => uSet({ showThickness: !(s.showThickness ?? true) })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Depth Field</span><Toggle on={s.showDepth} onToggle={() => uSet({ showDepth: !s.showDepth })} /></div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Diagram</p>
          <div className="flex gap-1.5 mb-1">
            {(["sm","md","lg"] as const).map(sz => (
              <button key={sz} onClick={() => uS({ cardSize: sz })} className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${style.cardSize === sz ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{sz.toUpperCase()}</button>
            ))}
          </div>
          {([["showModuleLabels", T.est.moduleLabels],["showEgressBadge", T.est.egressBadge],["showDimensions", T.est.dimensions],["showExteriorLabel", T.est.exteriorLabel]] as const).map(([k,l]) => (
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
          <AddRemoveList label={T.est.customWindowTypes} items={s.customWindowTypes} onAdd={props.onAddCustomWindowType} onRemove={props.onRemoveCustomWindowType} />

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Products</p>
          {PRODUCTS.map(p => (
            <div key={p.id} className="flex items-center justify-between p-1 rounded-lg bg-slate-50/30 dark:bg-white/2 mb-0.5">
              <span className="text-[10px]">{tl(p.label, locale)}</span>
              <Toggle on={s.enabledProducts.includes(p.id)} onToggle={() => props.onToggleProduct(p.id)} />
            </div>
          ))}
          <AddRemoveList label={T.est.customProducts} items={s.customProducts} onAdd={props.onAddCustomProduct} onRemove={props.onRemoveCustomProduct} />

          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <ColorManager label={T.est.exteriorColors} colors={props.extColors} onAdd={props.onAddExt} onRemove={props.onRemoveExt} />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <ColorManager label={T.est.interiorColors} colors={props.intColors} onAdd={props.onAddInt} onRemove={props.onRemoveInt} />
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">🔢 Calculated Price</p>
            <div className={CLS.row}><span className="text-[11px]">Show Calculated Price</span><Toggle on={s.showCalculatedPrice ?? true} onToggle={() => uSet({ showCalculatedPrice: !(s.showCalculatedPrice ?? true) })} /></div>
            <div className="mt-1.5">
              <label className={CLS.lbl}>Measurement Unit</label>
              <div className="flex gap-1">
                {GLASS_RATE_UNITS.map(u => (
                  <button key={u.id} onClick={() => uSet({ glassRateUnit: u.id })}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold ${(s.glassRateUnit ?? "sqin") === u.id ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                    {tl(u.label, locale)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-1.5">
              <label className={CLS.lbl}>Double Tempered Glass Rate</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">$</span>
                <input type="number" value={s.doubleTemperedRate ?? 0.50} onChange={e => uSet({ doubleTemperedRate: +e.target.value })} step={0.01} min={0}
                  className="w-20 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
                <span className="text-[9px] text-slate-400">{GLASS_RATE_UNITS.find(u => u.id === (s.glassRateUnit ?? "sqin"))?.short}</span>
              </div>
            </div>
            <div className="mt-1.5">
              <label className={CLS.lbl}>Triple Tempered Glass Rate</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">$</span>
                <input type="number" value={s.tripleTemperedRate ?? 0.75} onChange={e => uSet({ tripleTemperedRate: +e.target.value })} step={0.01} min={0}
                  className="w-20 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
                <span className="text-[9px] text-slate-400">{GLASS_RATE_UNITS.find(u => u.id === (s.glassRateUnit ?? "sqin"))?.short}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ SECTION 3: DOOR CARD ═══ */}
        <Section icon={DoorOpen} title={T.est.doorCardSection} open={!!open.door} onToggle={() => t("door")}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Diagram</p>
          <div className="flex gap-1.5 mb-1">
            {(["sm","md","lg"] as const).map(sz => (
              <button key={sz} onClick={() => uS({ cardSize: sz })} className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${style.cardSize === sz ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{sz.toUpperCase()}</button>
            ))}
          </div>
          {([["showModuleLabels", T.est.moduleLabels],["showDimensions", T.est.dimensions]] as const).map(([k,l]) => (
            <div key={k} className={CLS.row}><span className="text-[11px]">{l}</span><Toggle on={style[k]} onToggle={() => uS({ [k]: !style[k] })} /></div>
          ))}

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Door Types</p>
          <div className="max-h-36 overflow-y-auto space-y-0.5 mb-1">
            {doorEntries.map(([k, cfg]) => (
              <div key={k} className="flex items-center justify-between p-1 rounded-lg bg-slate-50/30 dark:bg-white/2">
                <span className="text-[10px] truncate flex-1 mr-1">{cfg.label}</span>
                <Toggle on={s.enabledDoorTypes.includes(k)} onToggle={() => props.onToggleDoorType(k)} />
              </div>
            ))}
          </div>
          <AddRemoveList label={T.est.customDoorTypes} items={s.customDoorTypes} onAdd={props.onAddCustomDoorType} onRemove={props.onRemoveCustomDoorType} />

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Products</p>
          {PRODUCTS.map(p => (
            <div key={p.id} className="flex items-center justify-between p-1 rounded-lg bg-slate-50/30 dark:bg-white/2 mb-0.5">
              <span className="text-[10px]">{tl(p.label, locale)}</span>
              <Toggle on={s.enabledProducts.includes(p.id)} onToggle={() => props.onToggleProduct(p.id)} />
            </div>
          ))}

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-1">Colors</p>
          <p className="text-[9px] text-slate-400 italic">Door colors share the same Exterior/Interior presets as windows. Edit them in the Window Card section above.</p>

          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1.5">🔢 Calculated Price</p>
            <div className={CLS.row}><span className="text-[11px]">Show Calculated Price</span><Toggle on={s.doorShowCalculatedPrice ?? true} onToggle={() => uSet({ doorShowCalculatedPrice: !(s.doorShowCalculatedPrice ?? true) })} /></div>
            <div className="mt-1.5">
              <label className={CLS.lbl}>Measurement Unit</label>
              <div className="flex gap-1">
                {GLASS_RATE_UNITS.map(u => (
                  <button key={u.id} onClick={() => uSet({ doorGlassRateUnit: u.id })}
                    className={`flex-1 py-1 rounded-lg text-[9px] font-bold ${(s.doorGlassRateUnit ?? "sqin") === u.id ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                    {tl(u.label, locale)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-1.5">
              <label className={CLS.lbl}>Double Tempered Glass Rate</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">$</span>
                <input type="number" value={s.doorDoubleTemperedRate ?? 0.50} onChange={e => uSet({ doorDoubleTemperedRate: +e.target.value })} step={0.01} min={0}
                  className="w-20 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
                <span className="text-[9px] text-slate-400">{GLASS_RATE_UNITS.find(u => u.id === (s.doorGlassRateUnit ?? "sqin"))?.short}</span>
              </div>
            </div>
            <div className="mt-1.5">
              <label className={CLS.lbl}>Triple Tempered Glass Rate</label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">$</span>
                <input type="number" value={s.doorTripleTemperedRate ?? 0.75} onChange={e => uSet({ doorTripleTemperedRate: +e.target.value })} step={0.01} min={0}
                  className="w-20 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
                <span className="text-[9px] text-slate-400">{GLASS_RATE_UNITS.find(u => u.id === (s.doorGlassRateUnit ?? "sqin"))?.short}</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══ SECTION 4: PRICING SUMMARY ═══ */}
        <Section icon={Receipt} title={T.est.pricingSection} open={!!open.pricing} onToggle={() => t("pricing")}>
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
        </Section>

        {/* ═══ SECTION 4B: MEASUREMENTS ═══ */}
        <Section icon={Ruler} title={T.est.measureSection} open={!!open.measure} onToggle={() => t("measure")}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Dimension Unit</p>
          <div className="flex gap-1.5 mb-3">
            {([["in","Inches (″)"],["cm","Centimeters (cm)"]] as const).map(([k,l]) => (
              <button key={k} onClick={() => uSet({ dimensionUnit: k as "in" | "cm" })}
                className={`flex-1 py-1 rounded-lg text-[9px] font-bold ${(s.dimensionUnit ?? "in") === k ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{l}</button>
            ))}
          </div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500 mb-1">🔸 Trim Pricing</p>
          <div className="mt-1.5">
            <label className={CLS.lbl}>Trim Rate Unit</label>
            <div className="flex gap-1">
              {TRIM_UNITS.map(u => (
                <button key={u.id} onClick={() => uSet({ trimUnit: u.id })}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-bold ${(s.trimUnit ?? "in") === u.id ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                  {tl(u.label, locale)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-1.5">
            <label className={CLS.lbl}>Flat Trim Rate</label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">$</span>
              <input type="number" value={s.flatTrimRate ?? 0.50} onChange={e => uSet({ flatTrimRate: +e.target.value })} step={0.01} min={0}
                className="w-20 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
              <span className="text-[9px] text-slate-400">{TRIM_UNITS.find(u => u.id === (s.trimUnit ?? "in"))?.short}</span>
            </div>
          </div>
          <div className="mt-1.5">
            <label className={CLS.lbl}>Colonial Trim Rate</label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">$</span>
              <input type="number" value={s.colonialTrimRate ?? 0.75} onChange={e => uSet({ colonialTrimRate: +e.target.value })} step={0.01} min={0}
                className="w-20 px-1 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
              <span className="text-[9px] text-slate-400">{TRIM_UNITS.find(u => u.id === (s.trimUnit ?? "in"))?.short}</span>
            </div>
          </div>
        </Section>

        {/* ═══ SECTION 4C: PAYMENT STAGES ═══ */}
        <Section icon={CreditCard} title={T.est.paymentSection} open={!!open.payments} onToggle={() => t("payments")}>
          <p className="text-[9px] text-slate-400 mb-2">Configure the payment breakdown shown below the total. Stages with 0% auto-fill the remainder.</p>
          <div className="space-y-1.5">
            {(s.paymentStages ?? []).map((stage, i) => (
              <div key={stage.id} className="p-2 rounded-xl bg-slate-50/50 dark:bg-white/3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Toggle on={stage.show} onToggle={() => {
                    const next = [...(s.paymentStages ?? [])]; next[i] = { ...next[i], show: !next[i].show }; uSet({ paymentStages: next })
                  }} />
                  <input value={stage.label} onChange={e => {
                    const next = [...(s.paymentStages ?? [])]; next[i] = { ...next[i], label: e.target.value }; uSet({ paymentStages: next })
                  }} className={CLS.inp + " text-[11px] font-semibold"} />
                  {stage.id !== "deposit" && (
                    <button onClick={() => uSet({ paymentStages: (s.paymentStages ?? []).filter(x => x.id !== stage.id) })}
                      className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="h-3 w-3" /></button>
                  )}
                </div>
                {stage.id !== "deposit" && (
                  <div className="flex items-center gap-1 pl-11">
                    <input type="number" value={stage.pct} min={0} max={100} onChange={e => {
                      const next = [...(s.paymentStages ?? [])]; next[i] = { ...next[i], pct: +e.target.value }; uSet({ paymentStages: next })
                    }} className="w-14 px-1 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-center outline-none" />
                    <span className="text-[9px] text-slate-400">% of total {stage.pct === 0 && "(remainder)"}</span>
                  </div>
                )}
                {stage.id === "deposit" && (
                  <p className="text-[9px] text-slate-400 pl-11">Uses deposit % set on each estimate</p>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => {
            const id = `ps_${Date.now()}`
            uSet({ paymentStages: [...(s.paymentStages ?? []), { id, label: T.est.newPaymentStage, pct: 0, show: true }] })
          }} className="text-blue-600 text-[10px] font-semibold mt-2 hover:underline">+ Add Payment Stage</button>
        </Section>

        {/* ═══ SECTION 5: TERMS & CONDITIONS ═══ */}
        <Section icon={ScrollText} title={T.est.termsSection} open={!!open.terms} onToggle={() => t("terms")}>
          <div className={CLS.row}><span className="text-[11px]">Show T&C Section</span><Toggle on={s.showTerms} onToggle={() => uSet({ showTerms: !s.showTerms })} /></div>
          <div className="mt-1.5">
            <label className={CLS.lbl}>Section Title</label>
            <input value={s.termsTitle ?? T.est.termsSection} onChange={e => uSet({ termsTitle: e.target.value })} className={CLS.inp + " w-full"} />
          </div>
          <div className={CLS.row}><span className="text-[11px]">Signatures</span><Toggle on={s.showSignatures ?? true} onToggle={() => uSet({ showSignatures: !(s.showSignatures ?? true) })} /></div>
          <div className={CLS.row}><span className="text-[11px]">Signature Date</span><Toggle on={s.showSignatureDate ?? true} onToggle={() => uSet({ showSignatureDate: !(s.showSignatureDate ?? true) })} /></div>

          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-3 mb-1">Default Clauses (for new estimates)</p>
          <div className="space-y-1.5">
            {(s.defaultTermsLines ?? []).map((line, i) => (
              <div key={i} className="flex gap-1 items-start">
                <span className="text-[9px] text-slate-400 mt-1 shrink-0">{i + 1}.</span>
                <textarea rows={2} value={line} onChange={e => {
                  const next = [...(s.defaultTermsLines ?? [])]; next[i] = e.target.value
                  uSet({ defaultTermsLines: next })
                }} className={CLS.inp + " w-full resize-none text-[10px]"} />
                <button onClick={() => {
                  const next = (s.defaultTermsLines ?? []).filter((_, j) => j !== i)
                  uSet({ defaultTermsLines: next })
                }} className="text-red-400 hover:text-red-600 shrink-0 mt-1"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <button onClick={() => uSet({ defaultTermsLines: [...(s.defaultTermsLines ?? []), ""] })}
            className="text-blue-600 text-[10px] font-semibold mt-1.5 hover:underline">+ Add clause</button>
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
