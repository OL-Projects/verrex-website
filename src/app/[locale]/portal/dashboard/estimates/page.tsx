"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, FileText, RotateCcw, Download, ChevronDown, ChevronUp, ImagePlus, Paperclip, X, Sun, Moon, Settings, Eye, DoorOpen, PanelTop, Send, Undo2, Redo2, Save } from "lucide-react"
import { useTheme } from "next-themes"
import { useLocale } from "next-intl"
import { usePortalT } from "@/lib/portal-i18n"
import { EstimateWindowSVG } from "@/components/portal/estimate-window-svg"
import { useColorPresets, useCompanyInfo, useAutocomplete, useLogo, useEstimateStyle, useEstimateSettings, useEstimateHistory } from "@/lib/estimate-hooks"
import { useEstimateStore } from "@/lib/estimate-store"
import { EstimateCustomizePanel } from "@/components/portal/estimate-customize-panel"
import { EstimatePreviewPanel } from "@/components/portal/estimate-preview-panel"
import { EstimateLeftSidebar } from "@/components/portal/estimate-left-sidebar"
import { EstimatePDFDocument } from "@/components/portal/estimate-pdf-doc"
import {
  type EstimateState, type EstimateItem, type Room, type TrimRateSettings,
  WINDOW_TYPES, PRODUCTS, createBlankEstimate, createItem, createRoom,
  calcTotals, fmt, getTypeGroups, isDoorType, getItemDescription,
  computeCalculatedPrice, getGlassRateForItem, GLASS_RATE_UNITS, getEffectiveUnitPrice,
  perimeterInches, perimeterFeet, perimeterInUnit, getItemTrimCost, getItemInstallCost,
  inToDisplay, displayToIn, dimLabel, TRIM_UNITS, tl, getInstallFormula, INSTALL_METHODS, type InstallPricingSettings,
} from "@/lib/estimate-config"

const C = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-5 print:bg-white print:border-slate-300",
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  inp: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition print:bg-transparent print:border-slate-200",
  sel: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none transition print:bg-transparent",
}

export default function EstimatesPage() {
  const store = useEstimateStore()
  const { est, setEst, records, activeId, saveStatus, saveNow, newEstimate, loadEstimate, deleteEstimate, duplicateEstimate, templates, saveAsTemplate, loadTemplate, deleteTemplate } = store
  const history = useEstimateHistory(est, setEst)
  const { canUndo, canRedo, undo, redo } = history
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const pdfRef = useRef<HTMLDivElement>(null)
  const colors = useColorPresets()
  const { extNames, intNames } = colors
  const estSettings = useEstimateSettings()
  const { settings: estCfg } = estSettings
  const { info: coInfo } = useCompanyInfo()
  const { logo, uploadLogo, clearLogo } = useLogo()
  const { remember, suggestions } = useAutocomplete()
  const { style: estStyle, update: updateStyle, reset: resetStyle } = useEstimateStyle()
  const locale = useLocale()
  const T = usePortalT()
  const logoRef = useRef<HTMLInputElement>(null)
  const [sidePanel, setSidePanel] = useState<"none" | "preview" | "settings">("none")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const showPreview = sidePanel === "preview"
  const showCustomize = sidePanel === "settings"

  // Lock body scroll when mobile overlay panels are open
  useEffect(() => {
    if (sidePanel !== "none") {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [sidePanel])
  const [sigs, setSigs] = useState<{ client: string; rep: string }>({ client: "", rep: "" })
  const [addMenuRoom, setAddMenuRoom] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo])

  // Load saved signatures
  useEffect(() => {
    try { const s = localStorage.getItem("vx_sigs"); if (s) setSigs(JSON.parse(s)) } catch {}
  }, [])
  const saveSig = useCallback((who: "client" | "rep", data: string) => {
    setSigs(p => { const n = { ...p, [who]: data }; localStorage.setItem("vx_sigs", JSON.stringify(n)); return n })
  }, [])

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
  const resetAll = useCallback(() => { if (confirm(T.est.resetConfirm)) setEst(createBlankEstimate()) }, [T])

  // Wrap newEstimate to apply saved default T&C clauses
  const handleNewEstimate = useCallback(() => {
    newEstimate()
    const defaults = estCfg.defaultTermsLines
    if (defaults && defaults.length > 0) {
      setTimeout(() => set("termsLines", [...defaults]), 50)
    }
  }, [newEstimate, estCfg.defaultTermsLines])

  const handleBlur = useCallback((field: string, value: string) => remember(field, value), [remember])

  // ═══ PDF EXPORT — @react-pdf/renderer → real vector .pdf file download ═══
  const exportPDF = useCallback(async () => {
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const doc = <EstimatePDFDocument est={est} logo={logo || est.company.logoUrl || undefined} sigs={sigs} glassSettings={estCfg} gstRate={estCfg.gstRate} qstRate={estCfg.qstRate} showInstallation={estCfg.showInstallation} showDelivery={estCfg.showDelivery} showGST={estCfg.showGST} showQST={estCfg.showQST} paymentStages={estCfg.paymentStages} locale={locale} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${est.company.name} - Estimate ${est.estimateNumber} - ${est.clientName || "Client"}.pdf`
        .replace(/[^a-zA-Z0-9 \-_.]/g, "")
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("PDF export error:", err)
      window.print()
    }
  }, [est, logo, sigs])

  const installS: InstallPricingSettings = useMemo(() => ({ installMethod: estCfg.installMethod ?? "per-unit", installRate: estCfg.installRate ?? 25 }), [estCfg.installMethod, estCfg.installRate])
  const trimS: TrimRateSettings = useMemo(() => ({ trimUnit: estCfg.trimUnit ?? "in", flatTrimRate: estCfg.flatTrimRate ?? 0.50, colonialTrimRate: estCfg.colonialTrimRate ?? 0.75 }), [estCfg.trimUnit, estCfg.flatTrimRate, estCfg.colonialTrimRate])
  const t = useMemo(() => calcTotals(est, estCfg.gstRate, estCfg.qstRate, estCfg, { showInstallation: estCfg.showInstallation, showDelivery: estCfg.showDelivery, showGST: estCfg.showGST, showQST: estCfg.showQST }, trimS, installS), [est, estCfg, trimS])
  const dU = estCfg.dimensionUnit ?? "in"

  // ═══ SEND — 2-step: PDF download + email modal ═══
  const [showSendModal, setShowSendModal] = useState(false)
  const [pdfReady, setPdfReady] = useState(false)

  const sendEstimate = useCallback(async () => {
    setPdfReady(false)
    setShowSendModal(true)
    // Auto-generate and download PDF
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const doc = <EstimatePDFDocument est={est} logo={logo || undefined} sigs={sigs} glassSettings={estCfg} gstRate={estCfg.gstRate} qstRate={estCfg.qstRate} showInstallation={estCfg.showInstallation} showDelivery={estCfg.showDelivery} showGST={estCfg.showGST} showQST={estCfg.showQST} paymentStages={estCfg.paymentStages} locale={locale} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${est.company.name} - Estimate ${est.estimateNumber}.pdf`.replace(/[^a-zA-Z0-9 \-_.]/g, "")
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setPdfReady(true)
    } catch { setPdfReady(true) }
  }, [est, logo, sigs])

  const emailSubject = `Estimate ${est.estimateNumber} — ${est.company.name}`
  const emailBody = [
    `Dear ${est.clientName || "Client"},`,
    ``,
    `Thank you for your interest. Please find your estimate details below.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `  ESTIMATE SUMMARY`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `  Company:        ${est.company.name}`,
    `  Estimate #:     ${est.estimateNumber}`,
    `  Date:           ${est.date}`,
    `  Valid Until:     ${est.validUntil}`,
    ``,
    `  Client:         ${est.clientName}`,
    `  Address:        ${est.clientAddress}${est.clientCity ? `, ${est.clientCity}` : ""}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `  ITEMS`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    ...est.rooms.flatMap(r => [
      `  📍 ${r.name}`,
      ...r.items.map(it => {
        const prod = PRODUCTS.find(p => p.id === it.product)
        const eff = getEffectiveUnitPrice(it, estCfg)
        return `    • ${prod?.tag || it.product} — ${it.width}"W × ${it.height}"H — Qty: ${it.qty} — ${fmt(it.qty * eff)}`
      }),
      ``,
    ]),
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `  PRICING`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `  Items:          ${t.items} (${t.totalUnits} units)`,
    `  Subtotal:       ${fmt(t.prodTotal)}`,
    ...(estCfg.showInstallation ? [`  ${T.est.installation}:   ${fmt(t.install)}`] : []),
    ...(estCfg.showDelivery ? [`  Delivery:       ${fmt(t.delivery)}`] : []),
    `  ─────────────────────`,
    `  Before Tax:     ${fmt(t.subtax)}`,
    ...(estCfg.showGST ? [`  GST (${estCfg.gstRate}%):     ${fmt(t.gst)}`] : []),
    ...(estCfg.showQST ? [`  QST (${estCfg.qstRate}%):   ${fmt(t.qst)}`] : []),
    `  ═════════════════════`,
    `  TOTAL:          ${fmt(t.total)}`,
    ...(estCfg.showDeposit ? [`  Deposit (${est.depositPct}%): ${fmt(t.deposit)}`] : []),
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📎 The detailed PDF estimate with diagrams is attached.`,
    ``,
    `If you have any questions, please don't hesitate to reach out.`,
    ``,
    `Best regards,`,
    `${est.repName || est.company.name}`,
    `${est.company.phone}`,
    `${est.company.website}`,
  ].join("\n")

  const openMailto = useCallback(() => {
    window.open(`mailto:${est.clientEmail || ""}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, "_self")
  }, [est.clientEmail, emailSubject, emailBody])

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText(emailBody).catch(() => {})
  }, [emailBody])
  let globalIdx = 0

  return (
    <>
    <div className="lg:flex gap-4 items-start pb-24 max-w-none">
    {/* ═══ LEFT SIDEBAR ═══ */}
    <EstimateLeftSidebar records={records} activeId={activeId} saveStatus={saveStatus}
      onNew={handleNewEstimate} onLoad={loadEstimate} onDelete={deleteEstimate} onDuplicate={duplicateEstimate}
      mobileOpen={sidebarOpen} onMobileToggle={() => setSidebarOpen(p => !p)}
      templates={templates} onSaveAsTemplate={saveAsTemplate} onLoadTemplate={loadTemplate} onDeleteTemplate={deleteTemplate} />
    <div className={`flex-1 space-y-5 ${sidePanel !== "none" ? "max-w-3xl" : "max-w-4xl"}`}>
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-6 w-6 text-blue-500" /> {T.est.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{T.est.subtitle}</p>
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
                  <input placeholder={T.address} value={est.company.address} onChange={e => setCompany("address", e.target.value)} className="bg-transparent outline-none" />
                  <input placeholder={T.city} value={est.company.city} onChange={e => setCompany("city", e.target.value)} className="bg-transparent outline-none" />
                  <input placeholder={T.phone} value={est.company.phone} onChange={e => setCompany("phone", e.target.value)} className="bg-transparent outline-none" />
                  <input placeholder={T.website} value={est.company.website} onChange={e => setCompany("website", e.target.value)} className="bg-transparent outline-none" />
                </div>
              </div>
            </div>
            <div className="text-right space-y-1.5 w-full sm:min-w-[200px] sm:w-auto overflow-hidden">
              <p className={C.lbl}>{T.est.estimateNum}</p>
              <input value={est.estimateNumber} onChange={e => set("estimateNumber", e.target.value)} className="text-lg font-extrabold text-slate-900 dark:text-white bg-transparent outline-none text-right w-full border-b border-dashed border-slate-300 dark:border-white/20 focus:border-blue-500 print:border-none" />
              {estCfg.showDate && <div className="overflow-hidden"><label className={C.lbl}>{T.date}</label><input type="date" value={est.date} onChange={e => set("date", e.target.value)} className={`${C.inp} w-full max-w-full box-border`} /></div>}
              {estCfg.showValidUntil && <div className="overflow-hidden"><label className={C.lbl}>{T.validUntil}</label><input type="date" value={est.validUntil} onChange={e => set("validUntil", e.target.value)} className={`${C.inp} w-full max-w-full box-border`} /></div>}
              {estCfg.showRequiredBy && <div className="overflow-hidden"><label className={C.lbl}>{T.requiredBy}</label><input type="date" value={est.requiredBy} onChange={e => set("requiredBy", e.target.value)} className={`${C.inp} w-full max-w-full box-border`} /></div>}
            </div>
          </div>

          {/* Client + Ship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-200 dark:border-white/10">
            <div className="space-y-2">
              <input value={tl(est.soldToLabel, locale)} onChange={e => set("soldToLabel", e.target.value)} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-transparent outline-none" />
              {(["clientName", "clientAddress", "clientCity", "clientPhone", "clientEmail"] as const).map(f => {
                const ph: Record<string, string> = { clientName: T.est.name_, clientAddress: T.est.address_, clientCity: T.est.city_, clientPhone: T.est.phone_, clientEmail: T.est.email_ }
                return (
                <div key={f} className="relative">
                  <input list={`dl_${f}`} placeholder={ph[f] || f.replace("client", "")} value={est[f]} onChange={e => set(f, e.target.value)} onBlur={e => handleBlur(f, e.target.value)} className={C.inp} />
                  <datalist id={`dl_${f}`}>{suggestions(f).map(s => <option key={s} value={s} />)}</datalist>
                </div>
              )})}
            </div>
            <div className="space-y-2">
              <input value={tl(est.shipToLabel, locale)} onChange={e => set("shipToLabel", e.target.value)} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-transparent outline-none" />
              <select value={est.shipMethod} onChange={e => set("shipMethod", e.target.value)} className={C.sel}><option>{T.est.pickup}</option><option>{T.est.delivery}</option></select>
              <input placeholder={T.address} value={est.shipAddress} onChange={e => set("shipAddress", e.target.value)} className={C.inp} />
              <input placeholder={T.phone} value={est.shipPhone} onChange={e => set("shipPhone", e.target.value)} className={C.inp} />
              {estCfg.showRepSection && (<>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-2">{T.est.representative}</p>
                <input list="dl_rep" placeholder={T.rep} value={est.repName} onChange={e => set("repName", e.target.value)} onBlur={e => handleBlur("repName", e.target.value)} className={C.inp} />
                <datalist id="dl_rep">{suggestions("repName").map(s => <option key={s} value={s} />)}</datalist>
                <input placeholder={T.reference} value={est.repRef} onChange={e => set("repRef", e.target.value)} className={C.inp} />
              </>)}
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
                  <button onClick={() => setAddMenuRoom(addMenuRoom === room.id ? null : room.id)} className="text-xs text-blue-600 font-semibold hover:underline">{T.est.addItem}</button>
                  {addMenuRoom === room.id && (
                    <div className="absolute right-0 top-7 z-30 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/15 p-1.5 flex gap-1">
                      <button onClick={() => { addItemToRoom(room.id); setAddMenuRoom(null) }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                        <PanelTop className="h-4 w-4 text-blue-500" /> {T.est.window}
                      </button>
                      <button onClick={() => {
                        setEst(p => ({ ...p, rooms: p.rooms.map(r => r.id === room.id ? { ...r, items: [...r.items, { ...createItem(), type: "SWING-DOOR", width: 36, height: 80 }] } : r) }))
                        setAddMenuRoom(null)
                      }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-900/30 transition">
                        <DoorOpen className="h-4 w-4 text-amber-600" /> {T.est.door}
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => delRoom(room.id)} className="text-xs text-red-400 hover:text-red-600 transition print:hidden">{T.remove}</button>
              </div>

              {!isCollapsed && room.items.map((item) => {
                globalIdx++
                const prod = PRODUCTS.find(p => p.id === item.product)
                const hasCas = (WINDOW_TYPES[item.type]?.modules || []).some(m => m.startsWith("CAS"))
                const egress = hasCas && item.height >= 24
                const effPrice = getEffectiveUnitPrice(item, estCfg)
                const lineTotal = item.qty * effPrice

                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className={`${C.card} border-l-4 border-l-slate-800 dark:border-l-blue-500 mb-4 relative`}>

                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{T.est.item} #{globalIdx}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${prod?.cls}`}>{prod?.tag}</span>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.width}&quot;W × {item.height}&quot;H × {item.depth}&quot;D</span>
                      </div>
                      <input placeholder={T.est.customLabel} value={item.customLabel} onChange={e => updateItem(room.id, item.id, { customLabel: e.target.value })}
                        className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-transparent outline-none w-36" />
                    </div>

                    {/* Body: SVG | Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-slate-50/50 dark:bg-white/3 rounded-xl p-3 min-h-[200px] flex flex-col">
                        <div className="flex-1 flex items-center justify-center">
                          <EstimateWindowSVG width={item.width} height={item.height} type={item.type} flipH={item.hingeLeft ?? false} swingIn={item.swingInside ?? true} />
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-white/5 print:hidden flex-wrap gap-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">{isDoorType(item.type) ? T.est.open : T.est.hinge}</span>
                            <button onClick={() => updateItem(room.id, item.id, { hingeLeft: true })}
                              className={`px-2.5 py-1 rounded-l-lg text-[9px] font-bold transition ${(item.hingeLeft ?? false) ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}>{T.est.left}</button>
                            <button onClick={() => updateItem(room.id, item.id, { hingeLeft: false })}
                              className={`px-2.5 py-1 rounded-r-lg text-[9px] font-bold transition ${!(item.hingeLeft ?? false) ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}>{T.est.right}</button>
                            {(isDoorType(item.type) || (WINDOW_TYPES[item.type]?.modules || []).some(m => m.startsWith("CAS") || m.startsWith("TT") || m === "AWNING")) && (
                              <>
                                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 ml-2 mr-0.5">{T.est.swing}</span>
                                <button onClick={() => updateItem(room.id, item.id, { swingInside: true })}
                                  className={`px-2.5 py-1 rounded-l-lg text-[9px] font-bold transition ${(item.swingInside ?? true) ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}>{T.est.inSwing}</button>
                                <button onClick={() => updateItem(room.id, item.id, { swingInside: false })}
                                  className={`px-2.5 py-1 rounded-r-lg text-[9px] font-bold transition ${!(item.swingInside ?? true) ? "bg-green-600 text-white shadow-sm" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}>{T.est.outSwing}</button>
                              </>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded" title="Perimeter (trim length)">
                            ⊟ {perimeterInches(item.width, item.height)}&quot; / {perimeterFeet(item.width, item.height).toFixed(1)} ft
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div><label className={C.lbl}>{isDoorType(item.type) ? T.est.doorType : T.est.windowType}</label>
                          <select value={item.type} onChange={e => {
                            const newType = e.target.value
                            const patch: Partial<EstimateItem> = { type: newType }
                            if (isDoorType(newType) && !isDoorType(item.type)) { patch.height = 80; patch.width = 36 }
                            if (!isDoorType(newType) && isDoorType(item.type)) { patch.height = 48; patch.width = 48 }
                            updateItem(room.id, item.id, patch)
                          }} className={C.sel}>
                            {getTypeGroups().map(g => {
                              const itemCat = isDoorType(item.type) ? "door" : "window"
                              const filtered = g.types.filter(([k, v]) =>
                                v.category === itemCat && (v.category === "window" ? estCfg.enabledWindowTypes.includes(k) : estCfg.enabledDoorTypes.includes(k))
                              )
                              if (filtered.length === 0) return null
                              return (
                                <optgroup key={g.group} label={tl(g.group, locale)}>
                                  {filtered.map(([k, v]) => <option key={k} value={k}>{tl(v.label, locale)}</option>)}
                                </optgroup>
                              )
                            })}
                          </select>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 capitalize">{getItemDescription(item.type, item.hingeLeft ?? false, item.swingInside ?? true)}</p>
                        </div>
                        <div className={`grid gap-2 grid-cols-2 ${estCfg.showDepth || (estCfg.showThickness ?? true) ? "sm:grid-cols-3" : ""} ${estCfg.showDepth && (estCfg.showThickness ?? true) ? "sm:grid-cols-4" : ""}`}>
                          <div><label className={C.lbl}>{T.est.width}</label><input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={8} max={240} value={item.width} onChange={e => updateItem(room.id, item.id, { width: +e.target.value })} className={C.inp} /></div>
                          <div><label className={C.lbl}>{T.est.height}</label><input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={8} max={120} value={item.height} onChange={e => updateItem(room.id, item.id, { height: +e.target.value })} className={C.inp} /></div>
                          {(estCfg.showThickness ?? true) && <div><label className={C.lbl}>{T.est.thickness}</label><input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={1} max={20} step={0.5} value={item.thickness ?? 4} onChange={e => updateItem(room.id, item.id, { thickness: +e.target.value })} className={C.inp} /></div>}
                          {estCfg.showDepth && <div><label className={C.lbl}>{T.est.depth}</label><input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={1} max={12} step={0.25} value={item.depth} onChange={e => updateItem(room.id, item.id, { depth: +e.target.value })} className={C.inp} /></div>}
                        </div>
                        <div><label className={C.lbl}>{T.est.product}</label>
                          <select value={item.product} onChange={e => updateItem(room.id, item.id, { product: e.target.value })} className={C.sel}>
                            {PRODUCTS.filter(p => estCfg.enabledProducts.includes(p.id)).map(p => <option key={p.id} value={p.id}>{tl(p.label, locale)}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className={C.lbl}>{T.est.exterior}</label>
                            <select value={item.extColor} onChange={e => updateItem(room.id, item.id, { extColor: e.target.value })} className={C.sel}>
                              {extNames.map(c => <option key={c}>{tl(c, locale)}</option>)}
                            </select>
                          </div>
                          <div><label className={C.lbl}>{T.est.interior}</label>
                            <select value={item.intColor} onChange={e => updateItem(room.id, item.id, { intColor: e.target.value })} className={C.sel}>
                              {intNames.map(c => <option key={c}>{tl(c, locale)}</option>)}
                            </select>
                          </div>
                        </div>
                        <p className={`text-xs font-bold ${egress ? "text-green-600" : "text-red-500"}`}>{T.est.egress}: {egress ? T.est.egressCompliant : T.est.egressNonCompliant}</p>
                        {/* Glass Specifications */}
                        <div className="rounded-lg border border-cyan-300/50 dark:border-cyan-500/20 p-2.5 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Glass Specifications</p>
                          {([
                            ["thermal", "Thermal", estCfg.thermalOptions ?? ["Double", "Triple"]],
                            ["lowE", "Low E", estCfg.lowEOptions ?? ["1 Side", "2 Sides"]],
                            ["glassThickness", "Glass Thickness", estCfg.glassThicknessOptions ?? ["5mm", "6mm"]],
                            ["argonGas", "Argon Gas", estCfg.argonGasOptions ?? ["18mm", "24mm"]],
                            ["glassType", "Glass Type", estCfg.glassTypeOptions ?? ["Ultra Clear", "Other"]],
                            ["glassFinish", "Glass Finish", estCfg.glassFinishOptions ?? ["Clear", "Frosted"]],
                            ["screen", "Screen", estCfg.screenOptions ?? ["Included", "Not Included"]],
                          ] as [string, string, string[]][]).map(([field, label, options]) => (
                            <div key={field} className="flex items-center gap-2">
                              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 w-24 shrink-0">{label}</span>
                              <div className="flex gap-0.5 flex-1">
                                {options.map(opt => (
                                  <button key={opt} onClick={() => updateItem(room.id, item.id, { [field]: opt })}
                                    className={`flex-1 py-1 px-1.5 rounded-lg text-[9px] font-bold transition ${(item as any)[field] === opt || (!(item as any)[field] && opt === options[0]) ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-400/30" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}>
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Trim */}
                        <div className="rounded-lg border border-orange-200 dark:border-orange-500/20 p-2.5 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={item.trimInstall ?? false} onChange={e => updateItem(room.id, item.id, { trimInstall: e.target.checked })} className="accent-orange-500 w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Trim</span>
                            <span className="text-[9px] text-slate-400 ml-auto">Perimeter: {perimeterInUnit(item.width, item.height, estCfg.trimUnit ?? "in").toFixed(1)} {TRIM_UNITS.find(u => u.id === (estCfg.trimUnit ?? "in"))?.short?.slice(1) ?? "in"}</span>
                          </label>
                          {(item.trimInstall ?? false) && (
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              <div>
                                <label className={C.lbl}>{T.est.trimStyle}</label>
                                <div className="flex gap-2">
                                  <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                                    <input type="radio" name={`trim_${item.id}`} checked={(item.trimStyle ?? "flat") === "flat"} onChange={() => updateItem(room.id, item.id, { trimStyle: "flat" })} className="accent-orange-500 w-3 h-3" /> {T.est.flat}
                                  </label>
                                  <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
                                    <input type="radio" name={`trim_${item.id}`} checked={(item.trimStyle ?? "flat") === "colonial"} onChange={() => updateItem(room.id, item.id, { trimStyle: "colonial" })} className="accent-orange-500 w-3 h-3" /> {T.est.colonial}
                                  </label>
                                </div>
                              </div>
                              <div>
                                <label className={C.lbl}>{T.est.trimOverride}</label>
                                <input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={0} step={0.01} value={item.trimPrice ?? 0} onChange={e => updateItem(room.id, item.id, { trimPrice: +e.target.value })} placeholder="0=auto" className={`${C.inp} font-semibold text-xs`} />
                              </div>
                              <div>
                                <label className={C.lbl}>{T.est.trimCost}</label>
                                <div className="px-2 py-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-xs font-bold text-orange-600 dark:text-orange-400">
                                  {fmt(getItemTrimCost(item, trimS))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Installation */}
                        {estCfg.showInstallation && (
                        <div className="rounded-lg border border-blue-200 dark:border-blue-500/20 p-2.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{T.est.installation}</span>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{fmt(getItemInstallCost(item, est.installPerUnit, installS))}</span>
                          </div>
                          {getInstallFormula(item, installS) && <p className="text-[8px] text-blue-400 mt-0.5">{getInstallFormula(item, installS)}</p>}
                          <label className="flex items-center gap-2 cursor-pointer print:hidden">
                            <input type="checkbox" checked={item.installOverride ?? false} onChange={e => updateItem(room.id, item.id, { installOverride: e.target.checked })} className="accent-blue-500 w-3 h-3" />
                            <span className="text-[9px] text-slate-500">{T.est.overrideGlobalRate} (${est.installPerUnit}/{T.est.unit})</span>
                          </label>
                          {(item.installOverride ?? false) && (
                            <div className="pt-1">
                              <input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={0} step={0.01} value={item.installPrice ?? 0} onChange={e => updateItem(room.id, item.id, { installPrice: +e.target.value })} placeholder={T.est.customInstallPrice} className={`${C.inp} font-semibold text-xs`} />
                            </div>
                          )}
                        </div>
                        )}
                        {/* Notes */}
                        <div><label className={C.lbl}>{T.notes}</label>
                          <textarea rows={2} value={item.notes} onChange={e => updateItem(room.id, item.id, { notes: e.target.value })} placeholder={T.est.specialInstructions} className={`${C.inp} resize-none`} />
                        </div>
                        {/* Attachments (hidden in PDF) */}
                        <div className="print:hidden">
                          <label className={C.lbl}>{T.est.attachments}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {item.attachmentNames.map((name, ai) => (
                              <span key={ai} className="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />{name}
                                <button onClick={() => updateItem(room.id, item.id, { attachmentNames: item.attachmentNames.filter((_, j) => j !== ai) })} className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                              </span>
                            ))}
                            <label className="text-[10px] text-blue-600 cursor-pointer hover:underline">
                              + {T.attach}
                              <input type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) updateItem(room.id, item.id, { attachmentNames: [...item.attachmentNames, e.target.files[0].name] }) }} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: qty + unit price + calculated price + line total + delete */}
                    <div className="flex items-end justify-between mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex-wrap gap-y-2">
                      <div className="flex items-end gap-3 flex-wrap">
                        <div className="w-16"><label className={C.lbl}>{T.qty}</label><input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={1} max={99} value={item.qty} onChange={e => updateItem(room.id, item.id, { qty: +e.target.value })} className={C.inp} /></div>
                        <div className="w-28"><label className={C.lbl}>{T.unitPrice}</label><input type="number" onFocus={e => { if (+e.target.value === 0) e.target.select() }} min={0} step={0.01} value={item.unitPrice} onChange={e => updateItem(room.id, item.id, { unitPrice: +e.target.value })} className={`${C.inp} font-semibold`} /></div>
                        {(() => {
                          const glassInfo = getGlassRateForItem(item, estCfg)
                          if (!glassInfo.show) return null
                          const calcPrice = computeCalculatedPrice(item, glassInfo.rate, glassInfo.unit)
                          const unitLabel = GLASS_RATE_UNITS.find(u => u.id === glassInfo.unit)?.short || "/sq in"
                          return (
                            <div className="w-36 print:hidden">
                              <label className={C.lbl}>{T.est.calculatedPrice}</label>
                              <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm font-bold text-emerald-700 dark:text-emerald-400" title={`${item.width}×${item.height} @ ${fmt(glassInfo.rate)}${unitLabel}`}>
                                {fmt(calcPrice)}
                              </div>
                            </div>
                          )
                        })()}
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

        {/* Add buttons: Room / Window / Door */}
        <div className="flex gap-2 print:hidden">
          <button onClick={addRoom} className="flex-1 py-3 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl text-sm font-semibold text-slate-500 hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-1.5">
            <Plus className="h-4 w-4" /> {T.addRoom}
          </button>
          <button onClick={() => { const last = est.rooms[est.rooms.length - 1]; if (last) addItemToRoom(last.id) }}
            className="flex-1 py-3 border-2 border-dashed border-blue-300 dark:border-blue-500/30 rounded-2xl text-sm font-semibold text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition flex items-center justify-center gap-1.5">
            <PanelTop className="h-4 w-4" /> {T.addWindow}
          </button>
          <button onClick={() => { const last = est.rooms[est.rooms.length - 1]; if (last) setEst(p => ({ ...p, rooms: p.rooms.map(r => r.id === last.id ? { ...r, items: [...r.items, { ...createItem(), type: "SWING-DOOR", width: 36, height: 80 }] } : r) })) }}
            className="flex-1 py-3 border-2 border-dashed border-amber-300 dark:border-amber-500/30 rounded-2xl text-sm font-semibold text-amber-600 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition flex items-center justify-center gap-1.5">
            <DoorOpen className="h-4 w-4" /> {T.addDoor}
          </button>
        </div>

        {/* ═══ SUMMARY ═══ */}
        <div className={`${C.card} border-t-4 border-t-slate-800 dark:border-t-blue-500`}>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{estCfg.summaryTitle} — {t.items} {T.est.items} ({t.totalUnits} {T.est.units})</h2>
          <div className="space-y-1">{(() => { let gi = 0; return est.rooms.flatMap(r => r.items.map(it => { gi++; const p = PRODUCTS.find(x => x.id === it.product); const eff = getEffectiveUnitPrice(it, estCfg); return <div key={it.id} className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">#{gi} {p?.tag} {it.width}×{it.height} (×{it.qty}) {it.customLabel && `— ${it.customLabel}`}</span><span className="font-semibold">{fmt(it.qty * eff)}</span></div> })) })()}</div>
          <div className="flex justify-between font-bold border-t border-slate-200 dark:border-white/10 pt-2 mt-3 text-sm"><span>{T.est.productsSubtotal}</span><span>{fmt(t.prodTotal)}</span></div>
          <div className="mt-3 space-y-1.5 text-sm">
            {estCfg.showInstallation && <div className="flex justify-between items-center"><span>{T.est.installation} ({t.totalUnits} × $<input type="number" value={est.installPerUnit} min={0} onChange={e => set("installPerUnit", +e.target.value)} onFocus={e => { if (+e.target.value === 0) e.target.select() }} className="w-16 bg-transparent border-b border-slate-300 text-center font-semibold outline-none print:border-none" />)</span><span className="font-semibold">{fmt(t.install)}</span></div>}
            {estCfg.showDelivery && <div className="flex justify-between items-center"><span>{T.est.deliveryLabel} $<input type="number" value={est.delivery} min={0} onChange={e => set("delivery", +e.target.value)} onFocus={e => { if (+e.target.value === 0) e.target.select() }} className="w-20 bg-transparent border-b border-slate-300 text-center font-semibold outline-none print:border-none" /></span><span className="font-semibold">{fmt(t.delivery)}</span></div>}
          </div>
          {/* Itemized Trim Costs */}
          {t.trimTotal > 0 && (
            <div className="mt-2 pt-2 border-t border-orange-200 dark:border-orange-500/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">Trim</p>
              <div className="space-y-0.5">{(() => { let gi = 0; return est.rooms.flatMap(r => r.items.map(it => { gi++; if (!it.trimInstall) return null; const tc = getItemTrimCost(it, trimS); if (tc <= 0) return null; const style = (it.trimStyle ?? "flat").charAt(0).toUpperCase() + (it.trimStyle ?? "flat").slice(1); const periU = perimeterInUnit(it.width, it.height, estCfg.trimUnit ?? "in").toFixed(1); const uLbl = TRIM_UNITS.find(u => u.id === (estCfg.trimUnit ?? "in"))?.short?.slice(1) ?? "in"; return <div key={it.id} className="flex justify-between text-xs"><span className="text-slate-500">#{gi} {style} — {periU} {uLbl} (×{it.qty})</span><span className="font-semibold text-orange-600 dark:text-orange-400">{fmt(it.qty * tc)}</span></div> })) })()}</div>
              <div className="flex justify-between text-sm font-bold mt-1"><span className="text-orange-600 dark:text-orange-400">{T.est.trimTotal}</span><span className="text-orange-600 dark:text-orange-400">{fmt(t.trimTotal)}</span></div>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-slate-200 dark:border-white/10 pt-2 mt-3 text-sm"><span>{T.est.subtotalBeforeTax}</span><span>{fmt(t.subtax)}</span></div>
          {estCfg.showGST && <div className="flex justify-between text-sm mt-1"><span className="text-slate-500">TPS / GST ({estCfg.gstRate}%)</span><span>{fmt(t.gst)}</span></div>}
          {estCfg.showQST && <div className="flex justify-between text-sm"><span className="text-slate-500">TVQ / QST ({estCfg.qstRate}%)</span><span>{fmt(t.qst)}</span></div>}
          <div className="flex justify-between text-2xl font-extrabold border-t-2 border-slate-800 dark:border-white/20 pt-3 mt-3"><span>TOTAL</span><span>{fmt(t.total)}</span></div>
          {/* Payment Stages */}
          {(() => {
            const stages = (estCfg.paymentStages ?? []).filter(s => s.show)
            if (stages.length === 0) return null
            let usedPct = 0
            const rows = stages.map((s, i) => {
              const isDeposit = s.id === "deposit"
              const pct = isDeposit ? est.depositPct : s.pct
              const isRemainder = pct === 0 && !isDeposit
              let amount: number
              if (isRemainder) { amount = t.total * (1 - usedPct / 100) } else { amount = t.total * (pct / 100); usedPct += pct }
              const isLast = i === stages.length - 1
              return (
                <div key={s.id} className={`flex justify-between font-semibold ${i === 0 ? 'bg-slate-100 dark:bg-white/5 -mx-5 mt-3 px-5 py-3' : 'bg-slate-50 dark:bg-white/3 -mx-5 px-5 py-2.5 border-t border-slate-200 dark:border-white/5'} text-sm items-center ${isLast ? '-mb-5 rounded-b-2xl' : ''}`}>
                  <span className={i === 0 ? '' : 'text-slate-500'}>
                    {tl(s.label, locale)}{isDeposit && (<>: <input type="number" min={0} max={100} value={est.depositPct} onChange={e => set("depositPct", +e.target.value)} onFocus={e => { if (+e.target.value === 0) e.target.select() }} className="w-12 bg-transparent border-b border-slate-300 text-center font-bold outline-none print:border-none" />%</>)}
                    {isRemainder && <span className="text-[9px] text-slate-400 ml-1">(remainder)</span>}
                    {!isDeposit && !isRemainder && pct > 0 && <span className="text-[9px] text-slate-400 ml-1">({pct}%)</span>}
                  </span>
                  <span className="font-bold">{fmt(amount)}</span>
                </div>
              )
            })
            return <>{rows}</>
          })()}
        </div>

        {/* ═══ TERMS (editable) ═══ */}
        {estCfg.showTerms && <div className={`${C.card} text-xs text-slate-500 leading-relaxed`}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">{estCfg.termsTitle ?? T.est.termsTitle}</h2>
          <ol className="list-decimal pl-5 space-y-1.5">
            {est.termsLines.map((line, i) => (
              <li key={i}><textarea rows={2} value={line} onChange={e => { const next = [...est.termsLines]; next[i] = e.target.value; set("termsLines", next) }} className="w-full bg-transparent outline-none resize-none text-xs print:bg-transparent" /></li>
            ))}
          </ol>
          <button onClick={() => set("termsLines", [...est.termsLines, ""])} className="text-blue-600 text-xs font-semibold mt-2 print:hidden">{T.est.addClause}</button>

          {(estCfg.showSignatures ?? true) && <div className="mt-8 pt-5 border-t border-slate-200 dark:border-white/10">
            <p className={C.lbl}>{T.est.acceptanceSignatures}</p>
            <p className="mb-6 text-xs">{T.est.signatureDisclaimer}</p>
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
                        <span className="text-xs font-medium print:hidden">{T.est.clickToSign}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px]">{who === "client" ? T.est.clientSig : T.est.repSig}</p>
                    {sigs[who] && <button onClick={(e) => { e.stopPropagation(); saveSig(who, "") }} className="text-[10px] text-red-400 hover:text-red-600 print:hidden">Clear</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>}
        </div>}
      </div>

    </div>

    {/* ═══ PREVIEW PANEL (right side, desktop only) ═══ */}
    {showPreview && <EstimatePreviewPanel est={est} logo={logo || est.company.logoUrl} sigs={sigs} glassSettings={estCfg} locale={locale} onClose={() => setSidePanel("none")} />}
    {showCustomize && <EstimateCustomizePanel
      onClose={() => setSidePanel("none")}
      style={estStyle} onUpdateStyle={updateStyle}
      settings={estCfg} onUpdateSettings={estSettings.update}
      onToggleWindowType={estSettings.toggleWindowType}
      onToggleDoorType={estSettings.toggleDoorType}
      onToggleProduct={estSettings.toggleProduct}
      onAddCustomWindowType={estSettings.addCustomWindowType} onRemoveCustomWindowType={estSettings.removeCustomWindowType}
      onAddCustomDoorType={estSettings.addCustomDoorType} onRemoveCustomDoorType={estSettings.removeCustomDoorType}
      onAddCustomProduct={estSettings.addCustomProduct} onRemoveCustomProduct={estSettings.removeCustomProduct}
      extColors={colors.ext} intColors={colors.int}
      onAddExt={colors.addExt} onRemoveExt={colors.removeExt}
      onAddInt={colors.addInt} onRemoveInt={colors.removeInt}
      onReset={() => { resetStyle(); estSettings.reset() }}
    />}
    </div>

    {/* ═══ STICKY BAR — mobile-safe, no overflow ═══ */}
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 py-2 px-3 z-50 print:hidden">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap max-w-4xl mx-auto">
        <button onClick={() => setTheme(isDark ? "light" : "dark")} className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition" title={isDark ? "Light Mode" : "Dark Mode"}>
          {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-500" />}
        </button>
        <button onClick={undo} disabled={!canUndo} className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
          <Undo2 className="h-4 w-4 text-slate-500" />
        </button>
        <button onClick={redo} disabled={!canRedo} className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Y)">
          <Redo2 className="h-4 w-4 text-slate-500" />
        </button>
        <button onClick={() => setSidePanel(p => p === "settings" ? "none" : "settings")} className={`p-2 sm:px-3 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${showCustomize ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`} title="Settings">
          <Settings className="h-4 w-4" /><span className="hidden sm:inline">{T.settings}</span>
        </button>
        <button onClick={resetAll} className="p-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center gap-1.5">
          <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">{T.est.resetAll}</span>
        </button>
        <button onClick={saveNow} className="p-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center gap-1.5" title="Save estimate now">
          <Save className="h-4 w-4 text-emerald-500" /><span className="hidden sm:inline">{T.save}</span>
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-white/15 hidden sm:block" />
        <button onClick={() => setSidePanel(p => p === "preview" ? "none" : "preview")} className={`p-2 sm:px-3 sm:py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${showPreview ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
          <Eye className="h-4 w-4" /><span className="hidden sm:inline">{T.preview}</span>
        </button>
        <button onClick={exportPDF} className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold hover:bg-slate-700 dark:hover:bg-blue-500 transition flex items-center gap-1.5" title="Export / Save as PDF">
          <Download className="h-4 w-4" /><span className="hidden sm:inline">{T.est.exportPdf}</span>
        </button>
        <button onClick={sendEstimate} className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition flex items-center gap-1.5" title="Send estimate via email">
          <Send className="h-4 w-4" /><span className="hidden sm:inline">{T.est.send}</span>
        </button>
      </div>
    </div>

    {/* ═══ SEND MODAL ═══ */}
    {showSendModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSendModal(false)}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">{T.est.sendEstimate}</span>
            </div>
            <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>

          {/* PDF status */}
          <div className={`mx-5 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${pdfReady ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"}`}>
            {pdfReady ? (
              <><Download className="h-4 w-4" /> {T.est.pdfDownloaded}</>
            ) : (
              <><div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" /> {T.est.generatingPdf}</>
            )}
          </div>

          {/* Email info */}
          <div className="px-5 mt-3 space-y-2">
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">{T.est.to}:</span> <span className="text-sm text-slate-700 dark:text-slate-200">{est.clientEmail || `(${T.est.noEmail})`}</span></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">{T.est.subject}:</span> <span className="text-sm text-slate-700 dark:text-slate-200">{emailSubject}</span></div>
          </div>

          {/* Email body preview */}
          <div className="flex-1 overflow-y-auto mx-5 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <pre className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{emailBody}</pre>
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-5 py-4 border-t border-slate-200 dark:border-white/10 mt-3">
            <button onClick={copyEmail} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-1.5">
              {T.est.copyEmailText}
            </button>
            <button onClick={openMailto} disabled={!pdfReady} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-1.5">
              <Send className="h-3.5 w-3.5" /> {T.est.openEmailClient}
            </button>
          </div>
        </div>
      </div>
    )}

    </>
  )
}
