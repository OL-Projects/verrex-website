"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { EstimateWindowSVG } from "./estimate-window-svg"
import {
  type EstimateState,
  WINDOW_TYPES, PRODUCTS, calcTotals, fmt,
} from "@/lib/estimate-config"

/* Page dimensions at full size (px at 96dpi) — letter: 816×1056 */
const FULL_W = 816
const FULL_H = 1056
const PANEL_W = 380
const SCALE = PANEL_W / FULL_W // ≈ 0.466

interface Props {
  est: EstimateState
  logo: string
  onClose: () => void
}

export function EstimatePreviewPanel({ est, logo, onClose }: Props) {
  const [page, setPage] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!contentRef.current) return
    const h = contentRef.current.scrollHeight
    setTotalPages(Math.max(1, Math.ceil(h / FULL_H)))
  }, [est])

  const t = calcTotals(est)
  let gi = 0

  return (
    <div className="hidden lg:flex flex-col w-[380px] shrink-0 sticky top-0 h-[calc(100vh-4rem)] z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-t-xl border border-slate-200 dark:border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Preview</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">{Math.round(SCALE * 100)}%</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Paper viewport */}
      <div className="flex-1 overflow-hidden bg-slate-200 dark:bg-slate-950 border-x border-slate-200 dark:border-white/10 relative">
        <div className="absolute inset-0 overflow-hidden flex items-start justify-center pt-3">
          <div
            style={{ width: FULL_W, minHeight: FULL_H, transform: `scale(${SCALE})`, transformOrigin: "top center", marginTop: -(page * FULL_H * SCALE) + "px" }}
            className="bg-white text-slate-900 shadow-xl transition-[margin] duration-300"
          >
            <div ref={contentRef} style={{ padding: 40 }}>
              {/* ── Header ── */}
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "3px solid #1e293b", paddingBottom: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {logo && <img src={logo} alt="" style={{ height: 40, width: 40, objectFit: "contain" }} />}
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>{est.company.name}</div>
                    <div style={{ fontSize: 8, letterSpacing: 3, color: "#64748b" }}>{est.company.tagline}</div>
                    {est.company.phone && <div style={{ fontSize: 7, color: "#94a3b8", marginTop: 2 }}>{est.company.phone} • {est.company.website}</div>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 2 }}>Estimate #</div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{est.estimateNumber}</div>
                  <div style={{ fontSize: 7, color: "#94a3b8" }}>Date: {est.date}{est.validUntil && ` • Valid: ${est.validUntil}`}</div>
                </div>
              </div>

              {/* ── Client / Ship ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 7, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginBottom: 4 }}>{est.soldToLabel}</div>
                  <div style={{ fontSize: 9, fontWeight: 700 }}>{est.clientName || "—"}</div>
                  <div style={{ fontSize: 8, color: "#64748b" }}>{est.clientAddress} {est.clientCity}</div>
                  <div style={{ fontSize: 8, color: "#64748b" }}>{est.clientPhone} {est.clientEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: 7, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginBottom: 4 }}>{est.shipToLabel}</div>
                  <div style={{ fontSize: 9, fontWeight: 700 }}>{est.shipMethod}</div>
                  <div style={{ fontSize: 8, color: "#64748b" }}>{est.shipAddress}</div>
                  <div style={{ fontSize: 7, color: "#64748b", marginTop: 6 }}>Rep: {est.repName || "—"}</div>
                </div>
              </div>

              {/* ── Rooms & Items ── */}
              {est.rooms.map(room => (
                <div key={room.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: 4, borderBottom: "2px solid #1e293b", paddingBottom: 3, marginBottom: 8 }}>{room.name}</div>
                  {room.items.map(item => {
                    gi++
                    const prod = PRODUCTS.find(p => p.id === item.product)
                    return (
                      <div key={item.id} style={{ display: "flex", gap: 10, marginBottom: 10, borderLeft: "3px solid #1e293b", paddingLeft: 8 }}>
                        <div style={{ width: 90, minHeight: 70 }}>
                          <EstimateWindowSVG width={item.width} height={item.height} type={item.type} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 9, fontWeight: 800 }}>Item #{gi} — {prod?.tag}</span>
                            <span style={{ fontSize: 8, fontWeight: 700 }}>{item.customLabel}</span>
                          </div>
                          <div style={{ fontSize: 8, color: "#475569" }}>{WINDOW_TYPES[item.type]?.label} • {item.width}&quot;W × {item.height}&quot;H × {item.depth}&quot;D</div>
                          <div style={{ fontSize: 7, color: "#64748b" }}>Ext: {item.extColor} / Int: {item.intColor}</div>
                          {item.notes && <div style={{ fontSize: 7, color: "#94a3b8", fontStyle: "italic", marginTop: 2 }}>{item.notes}</div>}
                          <div style={{ fontSize: 9, fontWeight: 800, textAlign: "right", marginTop: 2 }}>×{item.qty} — {fmt(item.qty * item.unitPrice)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* ── Summary ── */}
              <div style={{ borderTop: "3px solid #1e293b", paddingTop: 10, marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, marginBottom: 4 }}><span>Products</span><span>{fmt(t.prodTotal)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#475569" }}><span>Installation</span><span>{fmt(t.install)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#475569" }}><span>Delivery</span><span>{fmt(t.delivery)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#475569", marginTop: 4 }}><span>GST (5%)</span><span>{fmt(t.gst)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#475569" }}><span>QST (9.975%)</span><span>{fmt(t.qst)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 900, borderTop: "2px solid #1e293b", paddingTop: 6, marginTop: 6 }}><span>TOTAL</span><span>{fmt(t.total)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, background: "#f1f5f9", padding: "4px 6px", borderRadius: 4, marginTop: 6 }}><span>Deposit ({est.depositPct}%)</span><span>{fmt(t.deposit)}</span></div>
              </div>

              {/* ── Terms (condensed) ── */}
              <div style={{ marginTop: 16, paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 9, fontWeight: 800, marginBottom: 4 }}>Terms & Conditions</div>
                {est.termsLines.map((l, i) => <div key={i} style={{ fontSize: 6.5, color: "#64748b", marginBottom: 1 }}>{i + 1}. {l}</div>)}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 30 }}>
                  <div style={{ borderBottom: "1px solid #1e293b", minHeight: 40 }}><div style={{ fontSize: 7, marginTop: 36 }}>Client Signature & Date</div></div>
                  <div style={{ borderBottom: "1px solid #1e293b", minHeight: 40 }}><div style={{ fontSize: 7, marginTop: 36 }}>Representative Signature & Date</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Nav */}
      <div className="flex items-center justify-center gap-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-b-xl border border-t-0 border-slate-200 dark:border-white/10">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-slate-500 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
        <span className="text-[10px] font-bold text-slate-500">Page {page + 1} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-slate-500 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
