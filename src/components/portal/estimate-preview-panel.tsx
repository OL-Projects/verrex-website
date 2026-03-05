"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { usePortalT } from "@/lib/portal-i18n"
import { X, ZoomIn, ZoomOut, RotateCcw, FileText, Factory } from "lucide-react"
import { BlobProvider } from "@react-pdf/renderer"
import { EstimatePDFDocument } from "./estimate-pdf-doc"
import { type EstimateState, type GlassPricingSettings, type PaymentStageConfig, allItems } from "@/lib/estimate-config"

interface Props {
  est: EstimateState
  logo: string
  sigs?: { client: string; rep: string }
  glassSettings?: GlassPricingSettings & { gstRate?: number; qstRate?: number; showInstallation?: boolean; showDelivery?: boolean; showGST?: boolean; showQST?: boolean; paymentStages?: PaymentStageConfig[] }
  locale?: string
  onClose: () => void
}

export function EstimatePreviewPanel({ est, logo, sigs, glassSettings, locale = "en", onClose }: Props) {
  const T = usePortalT()
  const [zoom, setZoom] = useState(100)
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [pdfMode, setPdfMode] = useState<"estimate" | "manufacturer">("estimate")

  // Hash key forces BlobProvider to fully regenerate when any item data changes
  const pdfKeyRaw = useMemo(() => {
    const items = allItems(est)
    return items.map(i => `${i.type}:${i.width}:${i.height}:${i.hingeLeft}:${i.swingInside}:${i.trimInstall}:${i.trimStyle}:${i.qty}:${i.unitPrice}:${i.extColor}:${i.intColor}:${(i.customModules || []).join(",")}`).join("|")
      + `|${est.estimateNumber}|${est.clientName}|${est.depositPct}|${est.delivery}|${est.installPerUnit}|${est.rooms.length}|${refreshCounter}|${pdfMode}`
  }, [est, refreshCounter, pdfMode])

  // Debounce the PDF key — waits 800ms after last change before regenerating
  const [pdfKey, setPdfKey] = useState(pdfKeyRaw)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setPdfKey(pdfKeyRaw), 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [pdfKeyRaw])
  // Mode switch triggers immediate regeneration
  useEffect(() => { setPdfKey(pdfKeyRaw) }, [pdfMode])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 lg:static lg:inset-auto lg:z-10 lg:flex lg:flex-col lg:w-[860px] lg:shrink-0 lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-t-xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPdfMode("estimate")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition ${pdfMode === "estimate" ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-700"}`}
          >
            <FileText className="h-3 w-3" />Estimate
          </button>
          <button
            onClick={() => setPdfMode("manufacturer")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition ${pdfMode === "manufacturer" ? "bg-orange-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-700"}`}
          >
            <Factory className="h-3 w-3" />Manufacturer
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="text-slate-400 hover:text-slate-600"><ZoomOut className="h-3.5 w-3.5" /></button>
          <span className="text-[10px] font-bold text-slate-500 w-8 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="text-slate-400 hover:text-slate-600"><ZoomIn className="h-3.5 w-3.5" /></button>
          <button onClick={() => setRefreshCounter(c => c + 1)} className="text-slate-400 hover:text-blue-500 transition" title={"Refresh"}><RotateCcw className="h-3.5 w-3.5" /></button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* PDF iframe — actual rendered PDF */}
      <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 border-x border-slate-200 dark:border-white/10">
        <BlobProvider key={pdfKey} document={<EstimatePDFDocument est={est} logo={logo || undefined} sigs={sigs} glassSettings={glassSettings} gstRate={glassSettings?.gstRate} qstRate={glassSettings?.qstRate} showInstallation={glassSettings?.showInstallation} showDelivery={glassSettings?.showDelivery} showGST={glassSettings?.showGST} showQST={glassSettings?.showQST} paymentStages={glassSettings?.paymentStages} locale={locale} mode={pdfMode} />}>
          {({ url, loading, error }) => {
            if (loading) {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 font-bold">Generating PDF…</p>
                  </div>
                </div>
              )
            }
            if (error) {
              return (
                <div className="flex items-center justify-center h-full p-4">
                  <p className="text-xs text-red-500">PDF generation error: {error.message}</p>
                </div>
              )
            }
            if (!url) return null
            return (
              <iframe
                src={`${url}#zoom=${zoom}`}
                className="w-full h-full border-0"
                title={T.est.pdfPreview}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
              />
            )
          }}
        </BlobProvider>
      </div>

      {/* Scale slider */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-b-xl border border-t-0 border-slate-200 dark:border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 w-8">Scale</span>
          <input type="range" min={50} max={200} value={zoom} onChange={e => setZoom(+e.target.value)}
            className="flex-1 h-1 accent-blue-500 cursor-pointer" />
          <span className="text-[10px] font-bold text-slate-500 w-9 text-right">{zoom}%</span>
        </div>
      </div>
    </div>
  )
}
