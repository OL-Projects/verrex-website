"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, FileText, RotateCcw, Download, ChevronDown, ChevronUp, ImagePlus, Paperclip, X, Sun, Moon, Settings, Eye, DoorOpen, PanelTop } from "lucide-react"
import { useTheme } from "next-themes"
import { EstimateWindowSVG } from "@/components/portal/estimate-window-svg"
import { useColorPresets, useCompanyInfo, useAutocomplete, useLogo, useEstimateStyle } from "@/lib/estimate-hooks"
import { EstimateCustomizePanel } from "@/components/portal/estimate-customize-panel"
import { EstimatePreviewPanel } from "@/components/portal/estimate-preview-panel"
import {
  type EstimateState, type EstimateItem, type Room,
  WINDOW_TYPES, PRODUCTS, createBlankEstimate, createItem, createRoom,
  calcTotals, allItems, fmt, getTypeGroups, isDoorType,
} from "@/lib/estimate-config"

const C = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-5 print:bg-white print:border-slate-300",
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  inp: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition print:bg-transparent print:border-slate-200",
  sel: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none transition print:bg-transparent",
}

export default function EstimatesPage() {
  const [est, setEst] = useState<EstimateState>(createBlankEstimate)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const pdfRef = useRef<HTMLDivElement>(null)
  const { extNames, intNames } = useColorPresets()
  const { info: coInfo } = useCompanyInfo()
  const { logo, uploadLogo, clearLogo } = useLogo()
  const { remember, suggestions } = useAutocomplete()
  const { style: estStyle, update: updateStyle, reset: resetStyle } = useEstimateStyle()
  const logoRef = useRef<HTMLInputElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [sigs, setSigs] = useState<{ client: string; rep: string }>({ client: "", rep: "" })
  const [addMenuRoom, setAddMenuRoom] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  // Load saved signatures
  useEffect(() => {
    try { const s = localStorage.getItem("vx_sigs"); if (s) setSigs(JSON.parse(s)) } catch {}
  }, [])
  const saveSig = useCallback((who: "client" | "rep", data: string) => {
    setSigs(p => { const n = { ...p, [who]: data }; localStorage.setItem("vx_sigs", JSON.stringify(n)); return n })
  }, [])

  // Merge company info on mount
  useState(() => { setEst(p => ({ ...p, company: { ...p.company, ...coInfo, logoUrl: logo || p.company.logoUrl } })) })

  const set = useCallback(<K extends keyof EstimateState>(k: K, v: EstimateState[K]) => setEst(p => ({ ...p, [k]: v })), [])
  const setCompany = useCallback((k: string, v: string) => setEst(p => ({ ...p, company: { ...p.company, [k]: v } })), [])

  const updateRoom = useCallback((rid: string, patch: Partial<Room>) => {
    setEst(p => ({ ...p, rooms: p.rooms.map(r => r.id === rid ? { ...r, ...patch } : r) }))
  }, [])
  const addRoom = useCallback(() => setEst(p => ({ ...p, rooms: [...p.rooms, createRoom("NEW ROOM")] })), [])
  const delRoom = useCallback((rid: string) => setEst(p => p.rooms.length <= 1 ? p : { ...p, rooms: p.rooms.filter(r => r.id !== rid) }), [])
  const addItemToRoom = useCallback((rid: string) => {
    setEst(p => ({ ...p, rooms: p.rooms.map(r => r.id === rid ? { ...r, items: [...r.items, createItem()] } : r) }))
  }, [])
  const updateItem = useCallback((rid: string, iid: string, patch: Partial<EstimateItem>) => {
    setEst(p => ({ ...p, rooms: p.rooms.map(r => r.id === rid ? { ...r, items: r.items.map(it => it.id === iid ? { ...it, ...patch } : it) } : r) }))
  }, [])
  const delItem = useCallback((rid: string, iid: string) => {
    setEst(p => ({ ...p, rooms: p.rooms.map(r => r.id === rid ? { ...r, items: r.items.length <= 1 ? r.items : r.items.filter(it => it.id !== iid) } : r) }))
  }, [])
  const resetAll = useCallback(() => { if (confirm("Reset all data?")) setEst(createBlankEstimate()) }, [])

  const handleBlur = useCallback((field: string, value: string) => remember(field, value), [remember])

  const exportPDF = useCallback(async () => {
    const el = pdfRef.current
    if (!el) return
    const html2pdf = (await import("html2pdf.js")).default
    html2pdf().set({
      margin: [8, 8, 8, 8],
      filename: `${est.company.name} - Estimate ${est.estimateNumber}.pdf`,
      image: { type: "jpeg", quality: 0.96 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }).from(el).save()
  }, [est.company.name, est.estimateNumber])

  const t = calcTotals(est)
  let globalIdx = 0

  return (
    <>
    <div className={`lg:flex gap-6 items-start pb-24 ${showPreview ? "max-w-none" : "max-w-4xl"}`}>
    <div className={`flex-1 space-y-5 ${showPreview ? "max-w-3xl" : "max-w-4xl"}`}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-6 w-6 text-blue-500" /> Estimate Creator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Professional window & door estimates with live diagrams</p>
      </motion.div>

      <div ref={pdfRef} className="space-y-5 print:space-y-3">
        {/* ═══ HEADER ═══ */}
        <div className={`${C.card} border-t-4 border-t-slate-800 dark:border-t-blue-500`}>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 flex gap-3 items-start">
              {/* Logo */}
              <div className="shrink-0">
                {(logo || est.company.logoUrl) ? (
                  <div className="relative group">
                    <img src={logo || est.company.logoUrl} alt="Logo" className="h-14 w-14 object-contain rounded-lg" />
                    <button onClick={clearLogo} className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center print:hidden"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => logoRef.current?.click()} className="h-14 w-14 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition print:hidden">
                    <ImagePlus className="h-5 w-5" />
                  </button>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]) }} />
              </div>
              <div className="flex-1">
                <input value={est.company.name} onChange={e => setCompany("name", e.target.value)} className="text-2xl font-extrabold text-slate-900 dark:text-white bg-transparent outline-none w-full" />
                <input value={est.company.tagline} onChange={e => setCompany("tagline", e.target.value)} className="text-xs tracking-widest text-slate-500 bg-transparent outline-none w-full mt-0.5" />
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                  <input placeholder="Address" value={est.company.address} onChange={e => setCompany("address", e.target.value)} className="bg-transparent outline-none" />
                  <input placeholder="City" value={est.company.city} onChange={e => setCompany("city", e.target.value)} className="bg-transparent outline-none" />
                  <input placeholder="Phone" value={est.company.phone} onChange={e => setCompany("phone", e.target.value)} className="bg-transparent outline-none" />
                  <input placeholder="Website" value={est.company.website} onChange={e => setCompany("website", e.target.value)} className="bg-transparent outline-none" />
                </div>
              </div>
            </div>
            <div className="text-right space-y-1.5 min-w-[200px]">
              <p className={C.lbl}>Estimate #</p>
              <input value={est.estimateNumber} onChange={e => set("estimateNumber", e.target.value)} className="text-lg font-extrabold text-slate-900 dark:text-white bg-transparent outline-none text-right w-full border-b border-dashed border-slate-300 dark:border-white/20 focus:border-blue-500 print:border-none" />
              <div><label className={C.lbl}>Date</label><input type="date" value={est.date} onChange={e => set("date", e.target.value)} className={C.inp} /></div>
              <div><label className={C.lbl}>Valid Until</label><input type="date" value={est.validUntil} onChange={e => set("validUntil", e.target.value)} className={C.inp} /></div>
              <div><label className={C.lbl}>Required By</label><input type="date" value={est.requiredBy} onChange={e => set("requiredBy", e.target.value)} className={C.inp} /></div>
            </div>
          </div>

          {/* Client + Ship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-200 dark:border-white/10">
            <div className="space-y-2">
              <input value={est.soldToLabel} onChange={e => set("soldToLabel", e.target.value)} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-transparent outline-none" />
              {(["clientName", "clientAddress", "clientCity", "clientPhone", "clientEmail"] as const).map(f => (
                <div key={f} className="relative">
                  <input list={`dl_${f}`} placeholder={f.replace("client", "")} value={est[f]} onChange={e => set(f, e.target.value)} onBlur={e => handleBlur(f, e.target.value)} className={C.inp} />
                  <datalist id={`dl_${f}`}>{suggestions(f).map(s => <option key={s} value={s} />)}</datalist>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input value={est.shipToLabel} onChange={e => set("shipToLabel", e.target.value)} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-transparent outline-none" />
              <select value={est.shipMethod} onChange={e => set("shipMethod", e.target.value)} className={C.sel}><option>PICKUP</option><option>DELIVERY</option></select>
              <input placeholder="Address" value={est.shipAddress} onChange={e => set("shipAddress", e.target.value)} className={C.inp} />
              <input placeholder="Phone" value={est.shipPhone} onChange={e => set("shipPhone", e.target.value)} className={C.inp} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-2">Representative</p>
              <input list="dl_rep" placeholder="Rep Name" value={est.repName} onChange={e => set("repName", e.target.value)} onBlur={e => handleBlur("repName", e.target.value)} className={C.inp} />
              <datalist id="dl_rep">{suggestions("repName").map(s => <option key={s} value={s} />)}</datalist>
              <input placeholder="Reference" value={est.repRef} onChange={e => set("repRef", e.target.value)} className={C.inp} />
            </div>
          </div>
        </div>

        {/* ═══ ROOMS + ITEMS ═══ */}
        {est.rooms.map(room => {
          const isCollapsed = collapsed[room.id]
          return (
            <div key={room.id}>
              {/* Room header */}
              <div className="flex items-center gap-2 mb-3 mt-2">
                <button onClick={() => setCollapsed(p => ({ ...p, [room.id]: !isCollapsed }))} className="text-slate-400 hover:text-slate-600 transition print:hidden">
                  {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                <input value={room.name} onChange={e => updateRoom(room.id, { name: e.target.value })} className="text-xs font-extrabold uppercase tracking-[3px] text-slate-700 dark:text-slate-300 bg-transparent outline-none flex-1 border-b-2 border-slate-800 dark:border-white/20 pb-1" />
                <div className="relative print:hidden">
                  <button onClick={() => setAddMenuRoom(addMenuRoom === room.id ? null : room.id)} className="text-xs text-blue-600 font-semibold hover:underline">+ Add Item</button>
                  {addMenuRoom === room.id && (
                    <div className="absolute right-0 top-7 z-30 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/15 p-1.5 flex gap-1">
                      <button onClick={() => { addItemToRoom(room.id); setAddMenuRoom(null) }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                        <PanelTop className="h-4 w-4 text-blue-500" /> Window
                      </button>
                      <button onClick={() => {
                        setEst(p => ({ ...p, rooms: p.rooms.map(r => r.id === room.id ? { ...r, items: [...r.items, { ...createItem(), type: "SWING-R-IN", width: 36, height: 80 }] } : r) }))
                        setAddMenuRoom(null)
                      }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-900/30 transition">
                        <DoorOpen className="h-4 w-4 text-amber-600" /> Door
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => delRoom(room.id)} className="text-xs text-red-400 hover:text-red-600 transition print:hidden">Remove</button>
              </div>

              {!isCollapsed && room.items.map((item) => {
                globalIdx++
                const prod = PRODUCTS.find(p => p.id === item.product)
                const hasCas = (WINDOW_TYPES[item.type]?.modules || []).some(m => m.startsWith("CAS"))
                const egress = hasCas && item.height >= 24
                const lineTotal = item.qty * item.unitPrice

                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className={`${C.card} border-l-4 border-l-slate-800 dark:border-l-blue-500 mb-4 relative`}>

                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">Item #{globalIdx}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${prod?.cls}`}>{prod?.tag}</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.width}&quot;W × {item.height}&quot;H × {item.depth}&quot;D</span>
                      </div>
                      <input placeholder="Custom Label" value={item.customLabel} onChange={e => updateItem(room.id, item.id, { customLabel: e.target.value })}
                        className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-transparent outline-none w-36" />
                    </div>

                    {/* Body: SVG | Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex items-center justify-center bg-slate-50/50 dark:bg-white/3 rounded-xl p-3 min-h-[200px]">
                        <EstimateWindowSVG width={item.width} height={item.height} type={item.type} />
                      </div>
                      <div className="space-y-2.5">
                        <div><label className={C.lbl}>{isDoorType(item.type) ? "Door" : "Window"} Type</label>
                          <select value={item.type} onChange={e => {
                            const newType = e.target.value
                            const patch: Partial<EstimateItem> = { type: newType }
                            if (isDoorType(newType) && !isDoorType(item.type)) { patch.height = 80; patch.width = 36 }
                            if (!isDoorType(newType) && isDoorType(item.type)) { patch.height = 48; patch.width = 48 }
                            updateItem(room.id, item.id, patch)
                          }} className={C.sel}>
                            {getTypeGroups().map(g => (
                              <optgroup key={g.group} label={g.group}>
                                {g.types.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div><label className={C.lbl}>Width</label><input type="number" min={8} max={240} value={item.width} onChange={e => updateItem(room.id, item.id, { width: +e.target.value })} className={C.inp} /></div>
                          <div><label className={C.lbl}>Height</label><input type="number" min={8} max={120} value={item.height} onChange={e => updateItem(room.id, item.id, { height: +e.target.value })} className={C.inp} /></div>
                          <div><label className={C.lbl}>Depth</label><input type="number" min={1} max={12} step={0.25} value={item.depth} onChange={e => updateItem(room.id, item.id, { depth: +e.target.value })} className={C.inp} /></div>
                        </div>
                        <div><label className={C.lbl}>Product</label>
                          <select value={item.product} onChange={e => updateItem(room.id, item.id, { product: e.target.value })} className={C.sel}>
                            {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={C.lbl}>Exterior</label>
                            <select value={item.extColor} onChange={e => updateItem(room.id, item.id, { extColor: e.target.value })} className={C.sel}>
                              {extNames.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div><label className={C.lbl}>Interior</label>
                            <select value={item.intColor} onChange={e => updateItem(room.id, item.id, { intColor: e.target.value })} className={C.sel}>
                              {intNames.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <p className={`text-xs font-bold ${egress ? "text-green-600" : "text-red-500"}`}>EGRESS: {egress ? "Compliant ✓" : "Non-compliant"}</p>
                        {/* Notes */}
                        <div><label className={C.lbl}>Notes</label>
                          <textarea rows={2} value={item.notes} onChange={e => updateItem(room.id, item.id, { notes: e.target.value })} placeholder="Special instructions…" className={`${C.inp} resize-none`} />
                        </div>
                        {/* Attachments (hidden in PDF) */}
                        <div className="print:hidden">
                          <label className={C.lbl}>Attachments</label>
                          <div className="flex flex-wrap gap-1.5">
                            {item.attachmentNames.map((name, ai) => (
                              <span key={ai} className="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />{name}
                                <button onClick={() => updateItem(room.id, item.id, { attachmentNames: item.attachmentNames.filter((_, j) => j !== ai) })} className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                              </span>
                            ))}
                            <label className="text-[10px] text-blue-600 cursor-pointer hover:underline">
                              + Attach
                              <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) updateItem(room.id, item.id, { attachmentNames: [...item.attachmentNames, e.target.files[0].name] }) }} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: qty + price + delete */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-16"><label className={C.lbl}>Qty</label><input type="number" min={1} max={99} value={item.qty} onChange={e => updateItem(room.id, item.id, { qty: +e.target.value })} className={C.inp} /></div>
                        <div className="w-28"><label className={C.lbl}>Unit Price</label><input type="number" min={0} step={0.01} value={item.unitPrice} onChange={e => updateItem(room.id, item.id, { unitPrice: +e.target.value })} className={`${C.inp} font-semibold`} /></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white">{fmt(lineTotal)}</span>
                        <button onClick={() => delItem(room.id, item.id)} className="text-red-400 hover:text-red-600 transition print:hidden" title="Delete item"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )
        })}

        {/* Add room */}
        <button onClick={addRoom} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl text-sm font-semibold text-slate-500 hover:border-blue-500 hover:text-blue-500 transition print:hidden">
          <Plus className="inline h-4 w-4 mr-1 -mt-0.5" /> Add Room
        </button>

        {/* ═══ SUMMARY ═══ */}
        <div className={`${C.card} border-t-4 border-t-slate-800 dark:border-t-blue-500`}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Pricing Summary — {t.items} Items ({t.totalUnits} Units)</h2>
          <div className="space-y-1">{(() => { let gi = 0; return est.rooms.flatMap(r => r.items.map(it => { gi++; const p = PRODUCTS.find(x => x.id === it.product); return <div key={it.id} className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">#{gi} {p?.tag} {it.width}×{it.height} (×{it.qty}) {it.customLabel && `— ${it.customLabel}`}</span><span className="font-semibold">{fmt(it.qty * it.unitPrice)}</span></div> })) })()}</div>
          <div className="flex justify-between font-bold border-t border-slate-200 dark:border-white/10 pt-2 mt-3 text-sm"><span>Products Subtotal</span><span>{fmt(t.prodTotal)}</span></div>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between items-center"><span>Installation ({t.totalUnits} × $<input type="number" value={est.installPerUnit} min={0} onChange={e => set("installPerUnit", +e.target.value)} className="w-16 bg-transparent border-b border-slate-300 text-center font-semibold outline-none print:border-none" />)</span><span className="font-semibold">{fmt(t.install)}</span></div>
            <div className="flex justify-between items-center"><span>Delivery $<input type="number" value={est.delivery} min={0} onChange={e => set("delivery", +e.target.value)} className="w-20 bg-transparent border-b border-slate-300 text-center font-semibold outline-none print:border-none" /></span><span className="font-semibold">{fmt(t.delivery)}</span></div>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-200 dark:border-white/10 pt-2 mt-3 text-sm"><span>Subtotal Before Tax</span><span>{fmt(t.subtax)}</span></div>
          <div className="flex justify-between text-sm mt-1"><span className="text-slate-500">TPS / GST (5%)</span><span>{fmt(t.gst)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">TVQ / QST (9.975%)</span><span>{fmt(t.qst)}</span></div>
          <div className="flex justify-between text-2xl font-extrabold border-t-2 border-slate-800 dark:border-white/20 pt-3 mt-3"><span>TOTAL</span><span>{fmt(t.total)}</span></div>
          <div className="flex justify-between font-semibold bg-slate-100 dark:bg-white/5 -mx-5 -mb-5 mt-3 px-5 py-3 rounded-b-2xl text-sm items-center">
            <span>Deposit Required: <input type="number" min={0} max={100} value={est.depositPct} onChange={e => set("depositPct", +e.target.value)} className="w-12 bg-transparent border-b border-slate-300 text-center font-bold outline-none print:border-none" />%</span>
            <span className="font-bold">{fmt(t.deposit)}</span>
          </div>
        </div>

        {/* ═══ TERMS (editable) ═══ */}
        <div className={`${C.card} text-xs text-slate-500 leading-relaxed`}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Terms & Conditions</h2>
          <ol className="list-decimal pl-5 space-y-1.5">
            {est.termsLines.map((line, i) => (
              <li key={i}><textarea rows={2} value={line} onChange={e => { const next = [...est.termsLines]; next[i] = e.target.value; set("termsLines", next) }} className="w-full bg-transparent outline-none resize-none text-xs print:bg-transparent" /></li>
            ))}
          </ol>
          <button onClick={() => set("termsLines", [...est.termsLines, ""])} className="text-blue-600 text-xs font-semibold mt-2 print:hidden">+ Add clause</button>

          <div className="mt-8 pt-5 border-t border-slate-200 dark:border-white/10">
            <p className={C.lbl}>Acceptance & Signatures</p>
            <p className="mb-6 text-xs">By signing below, the client accepts the terms, specifications, and pricing outlined in this estimate.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 mt-8">
              {(["client", "rep"] as const).map(who => (
                <div key={who}>
                  <div className="min-h-[80px] border-b-2 border-slate-800 dark:border-slate-300 relative group cursor-pointer"
                    onClick={() => {
                      const canvas = document.createElement("canvas"); canvas.width = 500; canvas.height = 150
                      const ctx = canvas.getContext("2d"); if (!ctx) return
                      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 500, 150)
                      const overlay = document.createElement("div")
                      overlay.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.6);gap:12px"
                      const inner = document.createElement("div"); inner.style.cssText = "background:#fff;border-radius:16px;padding:20px;text-align:center"
                      inner.innerHTML = `<p style="font-size:14px;font-weight:700;margin-bottom:8px">${who === "client" ? "Client" : "Representative"} Signature</p><p style="font-size:11px;color:#666;margin-bottom:12px">Draw your signature below</p>`
                      inner.appendChild(canvas); canvas.style.cssText = "border:2px solid #e2e8f0;border-radius:8px;cursor:crosshair;touch-action:none"
                      const btnRow = document.createElement("div"); btnRow.style.cssText = "display:flex;gap:8px;margin-top:12px;justify-content:center"
                      const btnClear = document.createElement("button"); btnClear.textContent = "Clear"; btnClear.style.cssText = "padding:8px 20px;border-radius:8px;border:1px solid #ccc;font-size:13px;font-weight:600;cursor:pointer"
                      const btnSave = document.createElement("button"); btnSave.textContent = "Save"; btnSave.style.cssText = "padding:8px 20px;border-radius:8px;background:#1e40af;color:#fff;font-size:13px;font-weight:600;cursor:pointer"
                      const btnCancel = document.createElement("button"); btnCancel.textContent = "Cancel"; btnCancel.style.cssText = "padding:8px 20px;border-radius:8px;border:1px solid #ccc;font-size:13px;cursor:pointer"
                      btnRow.append(btnClear, btnSave, btnCancel); inner.appendChild(btnRow); overlay.appendChild(inner); document.body.appendChild(overlay)
                      let drawing = false
                      const getPos = (e: MouseEvent | TouchEvent) => {
                        const r = canvas.getBoundingClientRect(); const t = "touches" in e ? e.touches[0] : e
                        return { x: (t.clientX - r.left) * (500 / r.width), y: (t.clientY - r.top) * (150 / r.height) }
                      }
                      const start = (e: MouseEvent | TouchEvent) => { e.preventDefault(); drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
                      const move = (e: MouseEvent | TouchEvent) => { if (!drawing) return; e.preventDefault(); const p = getPos(e); ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#000"; ctx.lineTo(p.x, p.y); ctx.stroke() }
                      const end = () => { drawing = false }
                      canvas.addEventListener("mousedown", start); canvas.addEventListener("mousemove", move); canvas.addEventListener("mouseup", end)
                      canvas.addEventListener("touchstart", start, { passive: false }); canvas.addEventListener("touchmove", move, { passive: false }); canvas.addEventListener("touchend", end)
                      btnClear.onclick = () => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 500, 150) }
                      btnSave.onclick = () => { saveSig(who, canvas.toDataURL("image/png")); document.body.removeChild(overlay) }
                      btnCancel.onclick = () => { document.body.removeChild(overlay) }
                      overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay) }
                    }}>
                    {sigs[who] ? (
                      <img src={sigs[who]} alt={`${who} signature`} className="h-[76px] w-full object-contain" />
                    ) : (
                      <div className="h-[76px] flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition">
                        <span className="text-xs font-medium print:hidden">Click to sign</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px]">{who === "client" ? "Client" : "Representative"} Signature & Date</p>
                    {sigs[who] && <button onClick={(e) => { e.stopPropagation(); saveSig(who, "") }} className="text-[10px] text-red-400 hover:text-red-600 print:hidden">Clear</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>

    {/* ═══ PREVIEW PANEL (right side, desktop only) ═══ */}
    {showPreview && <EstimatePreviewPanel est={est} logo={logo} onClose={() => setShowPreview(false)} />}
    </div>

    {/* ═══ STICKY BAR — mobile-safe, no overflow ═══ */}
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 py-2 px-3 z-50 print:hidden">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap max-w-4xl mx-auto">
        <button onClick={() => setTheme(isDark ? "light" : "dark")} className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition" title={isDark ? "Light Mode" : "Dark Mode"}>
          {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
        </button>
        <button onClick={() => setShowCustomize(true)} className="p-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center gap-1.5" title="Settings">
          <Settings className="h-4 w-4 text-slate-500" /><span className="hidden sm:inline">Settings</span>
        </button>
        <button onClick={resetAll} className="p-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center gap-1.5">
          <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset</span>
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-white/15 hidden sm:block" />
        <button onClick={() => setShowPreview(p => !p)} className={`p-2 sm:px-3 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${showPreview ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
          <Eye className="h-4 w-4" /><span className="hidden sm:inline">Preview</span>
        </button>
        <button onClick={exportPDF} className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-700 dark:hover:bg-blue-500 transition flex items-center gap-1.5" title="Download as PDF file">
          <Download className="h-4 w-4" /><span className="hidden xs:inline">Export PDF</span>
        </button>
      </div>
    </div>

    {/* ═══ CUSTOMIZE PANEL ═══ */}
    <EstimateCustomizePanel open={showCustomize} onClose={() => setShowCustomize(false)} style={estStyle} onUpdate={updateStyle} onReset={resetStyle} />
    </>
  )
}
