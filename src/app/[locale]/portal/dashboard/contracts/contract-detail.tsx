"use client"

import { useState, useCallback } from "react"
import { Download, Send, CheckCircle2, Ban, Printer, Loader2, Play, Flag } from "lucide-react"
import type { Contract } from "@/types/portal"
import { ContractPDFDocument } from "./contract-pdf-doc"
import { useLocale } from "next-intl"

interface Props {
  contract: Contract
  onClose: () => void
  onSend: () => void
  onSign: () => void
  onActivate: () => void
  onComplete: () => void
  onVoid: () => void
}

const statusBadge: Record<string, string> = {
  draft: "bg-slate-200 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  signed: "bg-purple-100 text-purple-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-green-100 text-green-700",
  void: "bg-gray-200 text-gray-500",
}

export default function ContractDetail({ contract: c, onSend, onSign, onActivate, onComplete, onVoid }: Props) {
  const locale = useLocale()
  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const isVoid = c.status === "void"
  const [pdfLoading, setPdfLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)

  const exportPDF = useCallback(async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const blob = await pdf(<ContractPDFDocument contract={c} locale={locale} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Verex - Contract ${c.contractNumber} - ${c.clientName}.pdf`.replace(/[^a-zA-Z0-9 \-_.]/g, "")
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch { alert("PDF generation failed.") } finally { setPdfLoading(false) }
  }, [c])

  const printContract = useCallback(async () => {
    setPrintLoading(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const blob = await pdf(<ContractPDFDocument contract={c} locale={locale} />).toBlob()
      window.open(URL.createObjectURL(blob), "_blank")
    } catch { alert("Print preview failed.") } finally { setPrintLoading(false) }
  }, [c])

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge[c.status]}`}>{c.status}</span>
          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{c.contractNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {c.status === "draft" && <button onClick={onSend} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white"><Send className="h-3 w-3" />Send</button>}
          {c.status === "sent" && <button onClick={onSign} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-purple-600 hover:bg-purple-700 text-white"><CheckCircle2 className="h-3 w-3" />Mark Signed</button>}
          {c.status === "signed" && <button onClick={onActivate} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white"><Play className="h-3 w-3" />Activate</button>}
          {c.status === "active" && <button onClick={onComplete} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-600 hover:bg-green-700 text-white"><Flag className="h-3 w-3" />Complete</button>}
          {c.status !== "void" && c.status !== "completed" && <button onClick={onVoid} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600"><Ban className="h-3 w-3" />Void</button>}
          <button onClick={exportPDF} disabled={pdfLoading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50">
            {pdfLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}PDF
          </button>
          <button onClick={printContract} disabled={printLoading} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-50" title="Print">
            {printLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Contract Document */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-[680px] mx-auto bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-900/40 shadow-lg rounded-sm overflow-hidden relative border-l-4 border-l-blue-400">
          {isVoid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-[100px] font-black text-red-200 dark:text-red-800/30 -rotate-30 select-none tracking-widest">VOID</span>
            </div>
          )}

          {/* Header */}
          <div className="bg-blue-50 dark:bg-blue-950/40 px-7 py-5 border-b-2 border-blue-200 dark:border-blue-900/40">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black tracking-[0.15em] text-blue-900 dark:text-blue-200 uppercase">Verex Industries</h1>
                <p className="text-blue-600/60 dark:text-blue-400/50 text-[10px] font-semibold tracking-wider uppercase mt-0.5">Contrat de Service / Service Agreement</p>
                <div className="text-[10px] text-blue-800/60 dark:text-blue-300/50 mt-3 space-y-0.5 leading-relaxed font-medium">
                  <p>1234 Boulevard Industriel</p>
                  <p>Montréal, QC H2X 3K6</p>
                  <p>Tél: (514) 555-0100 · info@verexindustries.ca</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-blue-800/50 dark:text-blue-300/40 uppercase tracking-[0.2em]">Contract</p>
                <div className="mt-2 px-3 py-1.5 rounded border border-blue-300 dark:border-blue-800/50 bg-white dark:bg-blue-950/30 inline-block">
                  <p className="font-mono font-black text-sm text-blue-900 dark:text-blue-200">{c.contractNumber}</p>
                </div>
                <div className="mt-3 text-[9px] text-blue-700/50 dark:text-blue-400/40 space-y-0.5 font-medium">
                  <p>RBQ: 5678-9012-34</p>
                  <p>GST/TPS: 123 456 789 RT0001</p>
                  <p>QST/TVQ: 1234 5678 9012 TQ0001</p>
                </div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="px-7 py-5 border-b border-blue-100 dark:border-blue-900/20">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-[0.15em] mb-1.5">Contractor / Entrepreneur</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Verex Industries Inc.</p>
                <p className="text-xs text-slate-500">1234 Boulevard Industriel, Montréal, QC H2X 3K6</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-[0.15em] mb-1.5">Client</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{c.clientName}</p>
                <p className="text-xs text-slate-500">{c.clientAddress}</p>
                <p className="text-xs text-slate-500">{c.clientCity}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div><p className="text-[9px] font-bold text-blue-700/50 uppercase">Start Date</p><p className="text-xs font-semibold text-slate-900 dark:text-white">{c.startDate}</p></div>
              <div><p className="text-[9px] font-bold text-blue-700/50 uppercase">Completion</p><p className="text-xs font-semibold text-slate-900 dark:text-white">{c.completionDate}</p></div>
              <div><p className="text-[9px] font-bold text-blue-700/50 uppercase">Warranty</p><p className="text-xs font-semibold text-slate-900 dark:text-white">{c.warrantyYears} Years</p></div>
              <div><p className="text-[9px] font-bold text-blue-700/50 uppercase">Status</p><p className={`text-xs font-bold uppercase ${c.status === "signed" || c.status === "active" ? "text-emerald-600" : "text-slate-600 dark:text-slate-300"}`}>{c.status}{c.signedDate ? ` — ${c.signedDate}` : ""}</p></div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="px-7 py-4">
            <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-[0.12em] mb-2">Scope of Work / Étendue des travaux</p>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-blue-300 dark:border-blue-800/50">
                  <th className="text-left text-[9px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider py-2 pr-3">Description</th>
                  <th className="text-center text-[9px] font-bold text-blue-900 dark:text-blue-200 uppercase w-12 py-2">Qty</th>
                  <th className="text-left text-[9px] font-bold text-blue-900 dark:text-blue-200 uppercase py-2">Specifications</th>
                </tr>
              </thead>
              <tbody>
                {c.scopeItems.map((item, i) => (
                  <tr key={i} className={`border-b border-blue-50 dark:border-blue-900/10 ${i % 2 === 0 ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}`}>
                    <td className="py-2 pr-3 text-xs text-slate-700 dark:text-slate-300">{item.description}</td>
                    <td className="py-2 text-center text-xs text-slate-600 font-mono">{item.quantity}</td>
                    <td className="py-2 text-[10px] text-slate-500 dark:text-slate-400">{item.specifications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total + Payment Schedule */}
          <div className="px-7 pb-4">
            <div className="flex justify-between items-center mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800/40">
              <span className="text-sm font-black text-blue-900 dark:text-blue-200">TOTAL CONTRACT VALUE</span>
              <span className="text-sm font-black text-blue-900 dark:text-blue-200 font-mono">{fmt(c.totalValue)}</span>
            </div>
            <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-[0.12em] mb-2">Payment Schedule / Échéancier de paiement</p>
            {c.paymentSchedule.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-blue-50 dark:border-blue-900/10 last:border-0">
                <div className="flex items-center gap-2">
                  {p.status === "paid" ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <div className="h-3 w-3 rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                  <span className="text-xs text-slate-700 dark:text-slate-300">{p.milestone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">{p.percentage}%</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{fmt(p.amount)}</span>
                  <span className="text-slate-400 text-[10px]">{p.dueDate}</span>
                  <span className={`text-[9px] font-bold uppercase ${p.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Terms & Conditions */}
          <div className="px-7 py-4 border-t border-blue-100 dark:border-blue-900/20">
            <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-[0.12em] mb-2">Terms & Conditions / Termes et conditions</p>
            <ol className="list-decimal list-outside ml-4 space-y-1.5">
              {c.terms.map((term, i) => (
                <li key={i} className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed pl-1">{term}</li>
              ))}
            </ol>
          </div>

          {/* Notes */}
          {c.notes && (
            <div className="px-7 py-3 border-t border-blue-100 dark:border-blue-900/20">
              <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-[0.12em] mb-1">Notes / Remarques</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{c.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="px-7 py-4 border-t border-blue-100 dark:border-blue-900/20">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-wider mb-8">Contractor / Entrepreneur</p>
                <div className="border-b border-slate-300 dark:border-slate-600 mb-1" />
                <p className="text-[9px] text-slate-400">Verex Industries Inc. — Date</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-blue-700/50 uppercase tracking-wider mb-8">Client</p>
                <div className="border-b border-slate-300 dark:border-slate-600 mb-1" />
                <p className="text-[9px] text-slate-400">{c.clientName} — Date</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 py-3 border-t-2 border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/40">
            <div className="flex items-start justify-between gap-4">
              <div className="text-[8px] text-blue-800/40 dark:text-blue-400/30 space-y-0.5 font-medium">
                <p>Verex Industries Inc. — Licensed Contractor (RBQ #5678-9012-34)</p>
                <p>GST/TPS: 123 456 789 RT0001 · QST/TVQ: 1234 5678 9012 TQ0001</p>
                <p>Governed by the Civil Code of Québec (CCQ Art. 2098–2129)</p>
              </div>
              <div className="text-right shrink-0">
                <div className="border border-blue-200 dark:border-blue-800/40 rounded px-2 py-1 inline-block">
                  <p className="text-[7px] text-blue-800/40 uppercase font-bold tracking-wider leading-tight">Official Document</p>
                  <p className="text-[7px] text-blue-800/40 font-mono">verexindustries.ca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
