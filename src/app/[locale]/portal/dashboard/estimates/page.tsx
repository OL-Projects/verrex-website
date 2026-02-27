"use client"

import { useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Printer, RotateCcw, FileText } from "lucide-react"
import { EstimateWindowSVG } from "@/components/portal/estimate-window-svg"
import {
  type EstimateState, type EstimateItem,
  WINDOW_TYPES, PRODUCTS, EXT_COLORS, INT_COLORS,
  createBlankEstimate, createBlankItem, calcTotals, fmt,
} from "@/lib/estimate-config"

/* ── tiny helpers ─────────────────────────────── */
const cls = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-5",
  label: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  input: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition",
  select: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition appearance-none",
}

export default function EstimatesPage() {
  const [est, setEst] = useState<EstimateState>(createBlankEstimate)
  const bottomRef = useRef<HTMLDivElement>(null)

  /* partial update */
  const set = useCallback(<K extends keyof EstimateState>(k: K, v: EstimateState[K]) => setEst(p => ({ ...p, [k]: v })), [])
  const updateItem = useCallback((id: string, patch: Partial<EstimateItem>) => {
    setEst(p => ({ ...p, items: p.items.map(it => it.id === id ? { ...it, ...patch } : it) }))
  }, [])
  const addItem = useCallback(() => {
    setEst(p => ({ ...p, items: [...p.items, createBlankItem()] }))
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 120)
  }, [])
  const deleteItem = useCallback((id: string) => {
    setEst(p => p.items.length <= 1 ? p : { ...p, items: p.items.filter(it => it.id !== id) })
  }, [])
  const resetAll = useCallback(() => { if (confirm("Reset all data?")) setEst(createBlankEstimate()) }, [])

  const t = calcTotals(est)

  return (
    <div className="space-y-5 max-w-4xl print:max-w-none print:space-y-3 pb-24">
      {/* ── Page Title (hidden in print) ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><FileText className="h-6 w-6 text-blue-500" /> Estimate Creator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create professional window & door estimates matching the VERREX template</p>
      </motion.div>

      {/* ── Header Card ── */}
      <div className={`${cls.card} border-t-4 border-t-slate-800 dark:border-t-blue-500 print:border-t-slate-800`}>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <input value={est.companyName} onChange={e => set("companyName", e.target.value)} className="text-2xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full" />
            <input value={est.tagline} onChange={e => set("tagline", e.target.value)} className="text-xs tracking-widest text-slate-500 dark:text-slate-400 bg-transparent border-none outline-none w-full mt-1" />
          </div>
          <div className="text-right space-y-2 min-w-[200px]">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estimate #</p>
            <input value={est.estimateNumber} onChange={e => set("estimateNumber", e.target.value)} className="text-lg font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none text-right w-full" />
            <div className="grid grid-cols-1 gap-1.5 text-left">
              <div><label className={cls.label}>Date</label><input type="date" value={est.date} onChange={e => set("date", e.target.value)} className={cls.input} /></div>
              <div><label className={cls.label}>Valid Until</label><input type="date" value={est.validUntil} onChange={e => set("validUntil", e.target.value)} className={cls.input} /></div>
              <div><label className={cls.label}>Required By</label><input type="date" value={est.requiredBy} onChange={e => set("requiredBy", e.target.value)} className={cls.input} /></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-200 dark:border-white/10">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Sold To</h3>
            <input placeholder="Client Name" value={est.clientName} onChange={e => set("clientName", e.target.value)} className={cls.input} />
            <input placeholder="Address" value={est.clientAddress} onChange={e => set("clientAddress", e.target.value)} className={cls.input} />
            <input placeholder="City, Province, Postal" value={est.clientCity} onChange={e => set("clientCity", e.target.value)} className={cls.input} />
            <input placeholder="Phone" value={est.clientPhone} onChange={e => set("clientPhone", e.target.value)} className={cls.input} />
            <input placeholder="Email" value={est.clientEmail} onChange={e => set("clientEmail", e.target.value)} className={cls.input} />
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Ship To</h3>
            <select value={est.shipMethod} onChange={e => set("shipMethod", e.target.value)} className={cls.select}>
              <option>PICKUP</option><option>DELIVERY</option>
            </select>
            <input placeholder="Address" value={est.shipAddress} onChange={e => set("shipAddress", e.target.value)} className={cls.input} />
            <input placeholder="Phone" value={est.shipPhone} onChange={e => set("shipPhone", e.target.value)} className={cls.input} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 pt-2">Representative</h3>
            <input placeholder="Rep Name" value={est.repName} onChange={e => set("repName", e.target.value)} className={cls.input} />
            <input placeholder="Reference" value={est.repRef} onChange={e => set("repRef", e.target.value)} className={cls.input} />
          </div>
        </div>
      </div>

      {/* ── Items ── */}
      {est.items.map((item, idx) => {
        const prod = PRODUCTS.find(p => p.id === item.product)
        const hasCasement = (WINDOW_TYPES[item.type]?.modules || []).some(m => m.startsWith("CAS"))
        const egress = hasCasement && item.height >= 24
        const lineTotal = item.qty * item.unitPrice

        return (
          <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
            className={`${cls.card} border-l-4 border-l-slate-800 dark:border-l-blue-500 print:border-l-slate-800 relative`}>
            {/* delete */}
            <button onClick={() => deleteItem(item.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition print:hidden"><Trash2 className="h-4 w-4" /></button>

            {/* header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">Item #{idx + 1}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${prod?.tagClass}`}>{prod?.tag}</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.width}&quot; W × {item.height}&quot; H</span>
              </div>
              <input placeholder="LOCATION" value={item.location} onChange={e => updateItem(item.id, { location: e.target.value })}
                className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-transparent border-none outline-none w-32 print:text-slate-700" />
            </div>

            {/* body: preview | config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-center justify-center bg-slate-50/50 dark:bg-white/3 rounded-xl p-4 min-h-[200px]">
                <EstimateWindowSVG width={item.width} height={item.height} type={item.type} />
              </div>

              <div className="space-y-3">
                <div><label className={cls.label}>Window Type</label>
                  <select value={item.type} onChange={e => updateItem(item.id, { type: e.target.value })} className={cls.select}>
                    {Object.entries(WINDOW_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={cls.label}>Width (in)</label><input type="number" min={8} max={240} value={item.width} onChange={e => updateItem(item.id, { width: +e.target.value })} className={cls.input} /></div>
                  <div><label className={cls.label}>Height (in)</label><input type="number" min={8} max={120} value={item.height} onChange={e => updateItem(item.id, { height: +e.target.value })} className={cls.input} /></div>
                </div>
                <div><label className={cls.label}>Product</label>
                  <select value={item.product} onChange={e => updateItem(item.id, { product: e.target.value })} className={cls.select}>
                    {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={cls.label}>Exterior</label>
                    <select value={item.extColor} onChange={e => updateItem(item.id, { extColor: e.target.value })} className={cls.select}>
                      {EXT_COLORS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className={cls.label}>Interior</label>
                    <select value={item.intColor} onChange={e => updateItem(item.id, { intColor: e.target.value })} className={cls.select}>
                      {INT_COLORS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <p className={`text-xs font-bold ${egress ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>EGRESS: {egress ? "Compliant ✓" : "Non-compliant"}</p>
              </div>
            </div>

            {/* footer: qty + price */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-16"><label className={cls.label}>Qty</label><input type="number" min={1} max={99} value={item.qty} onChange={e => updateItem(item.id, { qty: +e.target.value })} className={cls.input} /></div>
                <div className="w-28"><label className={cls.label}>Unit Price</label><input type="number" min={0} step={0.01} value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: +e.target.value })} className={`${cls.input} font-semibold`} /></div>
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{fmt(lineTotal)}</span>
            </div>
          </motion.div>
        )
      })}

      {/* ── Add Item ── */}
      <button onClick={addItem} className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition print:hidden">
        <Plus className="inline h-4 w-4 mr-1 -mt-0.5" /> Add Window Item
      </button>

      {/* ── Summary ── */}
      <div className={`${cls.card} border-t-4 border-t-slate-800 dark:border-t-blue-500 print:border-t-slate-800`}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Pricing Summary — {est.items.length} Line Items ({t.totalUnits} Units)</h2>
        <div className="space-y-1.5">
          {est.items.map((it, i) => {
            const p = PRODUCTS.find(x => x.id === it.product)
            return <div key={it.id} className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">Item #{i + 1} — {p?.tag} {it.width}×{it.height} (×{it.qty})</span><span className="font-semibold text-slate-900 dark:text-white">{fmt(it.qty * it.unitPrice)}</span></div>
          })}
        </div>
        <div className="flex justify-between font-bold border-t border-slate-200 dark:border-white/10 pt-2 mt-3 text-sm"><span>Products Subtotal</span><span>{fmt(t.prodTotal)}</span></div>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300">Installation ({t.totalUnits} units × $<input type="number" value={est.installPerUnit} min={0} onChange={e => set("installPerUnit", +e.target.value)} className="w-16 bg-transparent border-b border-slate-300 dark:border-white/20 text-center font-semibold outline-none print:border-none" />)</span>
            <span className="font-semibold">{fmt(t.install)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300">Delivery & Handling $<input type="number" value={est.delivery} min={0} onChange={e => set("delivery", +e.target.value)} className="w-20 bg-transparent border-b border-slate-300 dark:border-white/20 text-center font-semibold outline-none print:border-none" /></span>
            <span className="font-semibold">{fmt(t.delivery)}</span>
          </div>
        </div>
        <div className="flex justify-between font-bold border-t border-slate-200 dark:border-white/10 pt-2 mt-3 text-sm"><span>Subtotal Before Tax</span><span>{fmt(t.subtax)}</span></div>
        <div className="flex justify-between text-sm mt-1"><span className="text-slate-500">TPS / GST (5%)</span><span>{fmt(t.gst)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">TVQ / QST (9.975%)</span><span>{fmt(t.qst)}</span></div>
        <div className="flex justify-between text-2xl font-extrabold border-t-2 border-slate-800 dark:border-white/20 pt-3 mt-3 text-slate-900 dark:text-white"><span>TOTAL</span><span>{fmt(t.total)}</span></div>
        <div className="flex justify-between font-semibold bg-slate-100 dark:bg-white/5 -mx-5 -mb-5 mt-3 px-5 py-3 rounded-b-2xl text-sm">
          <span>Deposit Required: {est.depositPct}%</span><span className="font-bold">{fmt(t.deposit)}</span>
        </div>
      </div>

      {/* ── Terms ── */}
      <div className={`${cls.card} text-xs text-slate-500 dark:text-slate-400 leading-relaxed`}>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Terms & Conditions</h2>
        <ol className="list-decimal pl-5 space-y-0.5">
          <li>This estimate is valid for 30 days from issue date.</li>
          <li>A deposit of {est.depositPct}% is required at contract signing. Remaining {100 - est.depositPct}% due 24 hours before delivery.</li>
          <li>Approximate delivery as per required-by date — subject to manufacturer lead times.</li>
          <li>All products carry full manufacturer warranty. Installation warranty provided separately.</li>
          <li>Any modifications must be submitted in writing and may affect pricing and delivery timelines.</li>
          <li>The value of delivered/installed products must be paid upon receipt of merchandise.</li>
          <li>Prices include all listed products and services. Additional work quoted separately.</li>
        </ol>
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Acceptance & Signatures</h3>
          <p className="mb-4">By signing below, the client accepts the terms, specifications, and pricing outlined in this estimate.</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="border-t border-slate-800 dark:border-slate-300 pt-1 text-[11px]">Client Signature & Date</div>
            <div className="border-t border-slate-800 dark:border-slate-300 pt-1 text-[11px]">Representative Signature & Date</div>
          </div>
        </div>
      </div>

      {/* ── Sticky Action Bar ── */}
      <div ref={bottomRef} className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 py-3 px-4 flex items-center justify-center gap-3 z-50 print:hidden">
        <button onClick={resetAll} className="px-5 py-2.5 rounded-xl border-2 border-slate-800 dark:border-white/20 text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition flex items-center gap-1.5">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <button onClick={() => window.print()} className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-sm font-bold hover:bg-slate-700 dark:hover:bg-blue-500 transition flex items-center gap-1.5">
          <Printer className="h-4 w-4" /> Export PDF
        </button>
      </div>
    </div>
  )
}
