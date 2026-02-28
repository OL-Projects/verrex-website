"use client"

import { useState, useRef, useCallback } from "react"
import { Download, Send, CheckCircle2, Ban, Printer, Loader2 } from "lucide-react"
import type { Invoice } from "@/types/portal"
import { InvoicePDFDocument } from "./invoice-pdf-doc"

interface Props {
  invoice: Invoice
  onClose: () => void
  onSend: () => void
  onPay: () => void
  onVoid: () => void
  onDownloadPdf: () => void
}

const statusBadge: Record<string, string> = {
  draft: "bg-slate-200 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-gray-200 text-gray-500",
}

/* Number → words helper (simplified for invoice amounts) */
function amountToWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  if (n === 0) return "Zero"
  const whole = Math.floor(n)
  const cents = Math.round((n - whole) * 100)
  const convert = (num: number): string => {
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? "-" + ones[num % 10] : "")
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "")
    if (num < 1000000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "")
    return convert(Math.floor(num / 1000000)) + " Million" + (num % 1000000 ? " " + convert(num % 1000000) : "")
  }
  return convert(whole) + ` and ${String(cents).padStart(2, "0")}/100 Dollars (CAD)`
}

export default function InvoiceDetail({ invoice: inv, onClose, onSend, onPay, onVoid, onDownloadPdf }: Props) {
  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const isVoid = inv.status === "void"
  const [pdfLoading, setPdfLoading] = useState(false)
  const invoiceDocRef = useRef<HTMLDivElement>(null)

  /* ── PDF Download via @react-pdf/renderer ── */
  const exportPDF = useCallback(async () => {
    setPdfLoading(true)
    try {
      const { pdf } = await import("@react-pdf/renderer")
      const doc = <InvoicePDFDocument invoice={inv} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Verrex - Invoice ${inv.invoiceNumber} - ${inv.clientName}.pdf`.replace(/[^a-zA-Z0-9 \-_.]/g, "")
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("PDF export error:", err)
      alert("PDF generation failed. Please try again.")
    } finally {
      setPdfLoading(false)
    }
  }, [inv])

  /* ── Print just the invoice document (not the whole page) ── */
  const printInvoice = useCallback(() => {
    const el = invoiceDocRef.current
    if (!el) return
    const win = window.open("", "_blank", "width=800,height=1000")
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #0f172a; background: #fff; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>${el.innerHTML}</body></html>`)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 400)
  }, [inv.invoiceNumber])

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge[inv.status]}`}>{inv.status}</span>
          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {inv.status === "draft" && <button onClick={onSend} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white"><Send className="h-3 w-3" />Send</button>}
          {(inv.status === "sent" || inv.status === "overdue") && <button onClick={onPay} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle2 className="h-3 w-3" />Paid</button>}
          {inv.status !== "void" && inv.status !== "paid" && <button onClick={onVoid} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-50 dark:bg-red-500/10 text-red-600"><Ban className="h-3 w-3" />Void</button>}
          <button onClick={exportPDF} disabled={pdfLoading} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50">
            {pdfLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}PDF
          </button>
          <button onClick={printInvoice} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400" title="Print invoice only"><Printer className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="flex-1 overflow-y-auto p-5">
        <div ref={invoiceDocRef}>
        <div className="max-w-[640px] mx-auto bg-white dark:bg-slate-950 border-2 border-blue-200 dark:border-blue-900/40 shadow-lg rounded-sm overflow-hidden relative border-l-4 border-l-blue-400">

          {/* VOID watermark */}
          {isVoid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-[100px] font-black text-red-200 dark:text-red-800/30 -rotate-30 select-none tracking-widest">VOID</span>
            </div>
          )}

          {/* Header — Pale Blue Official */}
          <div className="bg-blue-50 dark:bg-blue-950/40 px-7 py-5 border-b-2 border-blue-200 dark:border-blue-900/40">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-black tracking-[0.15em] text-blue-900 dark:text-blue-200 uppercase">Verrex Industries</h1>
                <p className="text-blue-600/60 dark:text-blue-400/50 text-[10px] font-semibold tracking-wider uppercase mt-0.5">Premium Windows & Doors Manufacturer</p>
                <div className="text-[10px] text-blue-800/60 dark:text-blue-300/50 mt-3 space-y-0.5 leading-relaxed font-medium">
                  <p>1234 Boulevard Industriel</p>
                  <p>Montréal, QC H2X 3K6</p>
                  <p>Tél: (514) 555-0100 · info@verrexindustries.ca</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-blue-800/50 dark:text-blue-300/40 uppercase tracking-[0.2em]">Facture / Invoice</p>
                <div className="mt-2 px-3 py-1.5 rounded border border-blue-300 dark:border-blue-800/50 bg-white dark:bg-blue-950/30 inline-block">
                  <p className="font-mono font-black text-sm text-blue-900 dark:text-blue-200">{inv.invoiceNumber}</p>
                </div>
                <div className="mt-3 text-[9px] text-blue-700/50 dark:text-blue-400/40 space-y-0.5 font-medium">
                  <p>GST/TPS: 123 456 789 RT0001</p>
                  <p>QST/TVQ: 1234 5678 9012 TQ0001</p>
                  <p>RBQ: 5678-9012-34</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates + Bill To */}
          <div className="px-7 py-5 border-b border-blue-100 dark:border-blue-900/20">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-[0.15em] mb-1.5">Billed To / Facturé à</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{inv.clientName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{inv.clientAddress}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{inv.clientCity}</p>
              </div>
              <div className="text-right">
                <div className="inline-grid grid-cols-2 gap-x-5 gap-y-2 text-right">
                  <div><p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-wider">Issue Date</p><p className="text-xs font-semibold text-slate-900 dark:text-white">{inv.issueDate}</p></div>
                  <div><p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-wider">Due Date</p><p className="text-xs font-semibold text-slate-900 dark:text-white">{inv.dueDate}</p></div>
                  <div><p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-wider">Terms</p><p className="text-xs font-semibold text-slate-900 dark:text-white">{inv.paymentTerms}</p></div>
                  <div><p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-wider">Status</p><p className={`text-xs font-bold uppercase ${inv.status === "paid" ? "text-emerald-600" : inv.status === "overdue" ? "text-red-600" : "text-slate-600 dark:text-slate-300"}`}>{inv.status}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="px-7 py-4">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-blue-300 dark:border-blue-800/50">
                  <th className="text-left text-[9px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-[0.12em] py-2 pr-4">Description</th>
                  <th className="text-center text-[9px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-[0.12em] py-2 w-12">Qty</th>
                  <th className="text-right text-[9px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-[0.12em] py-2 w-24">Unit Price</th>
                  <th className="text-right text-[9px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-[0.12em] py-2 w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item, i) => (
                  <tr key={i} className={`border-b border-blue-50 dark:border-blue-900/10 ${i % 2 === 0 ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}`}>
                    <td className="py-2.5 pr-4 text-xs text-slate-700 dark:text-slate-300">{item.description}</td>
                    <td className="py-2.5 text-center text-xs text-slate-600 dark:text-slate-400 font-mono">{item.quantity}</td>
                    <td className="py-2.5 text-right text-xs text-slate-600 dark:text-slate-400 font-mono">{fmt(item.unitPrice)}</td>
                    <td className="py-2.5 text-right text-xs font-semibold text-slate-900 dark:text-white font-mono">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-7 pb-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400"><span>Subtotal</span><span className="font-mono">{fmt(inv.subtotal)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400"><span>GST / TPS (5%)</span><span className="font-mono">{fmt(inv.taxGST)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400"><span>QST / TVQ (9.975%)</span><span className="font-mono">{fmt(inv.taxQST)}</span></div>
                <div className="h-px bg-blue-300 dark:bg-blue-800/50 my-1" />
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white"><span>TOTAL</span><span className="font-mono">{fmt(inv.total)}</span></div>
                {inv.depositPaid > 0 && (
                  <>
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400"><span>Deposit Applied</span><span className="font-mono">−{fmt(inv.depositPaid)}</span></div>
                    <div className="h-px bg-blue-200 dark:bg-blue-800/30 my-1" />
                    <div className="flex justify-between text-sm font-black text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 px-2 py-1.5 rounded"><span>BALANCE DUE</span><span className="font-mono">{fmt(inv.balanceDue)}</span></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="px-7 pb-3">
            <div className="border border-dashed border-blue-200 dark:border-blue-800/30 rounded px-3 py-2">
              <p className="text-[9px] text-blue-700/50 dark:text-blue-400/40 uppercase font-bold tracking-wider mb-0.5">Amount in Words / Montant en lettres</p>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic font-medium">{amountToWords(inv.balanceDue > 0 ? inv.balanceDue : inv.total)}</p>
            </div>
          </div>

          {/* Notes */}
          {inv.notes && (
            <div className="px-7 py-3 border-t border-blue-100 dark:border-blue-900/20">
              <p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-[0.12em] mb-1">Notes / Remarques</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{inv.notes}</p>
            </div>
          )}

          {/* Signature */}
          <div className="px-7 py-4 border-t border-blue-100 dark:border-blue-900/20">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-wider mb-6">Authorized Signature / Signature autorisée</p>
                <div className="border-b border-slate-300 dark:border-slate-600 mb-1" />
                <p className="text-[9px] text-slate-400">Name / Date</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-wider mb-6">Client Acknowledgement</p>
                <div className="border-b border-slate-300 dark:border-slate-600 mb-1" />
                <p className="text-[9px] text-slate-400">Signature / Date</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="px-7 py-3 border-t border-blue-100 dark:border-blue-900/20 bg-blue-50/50 dark:bg-blue-950/20">
            <p className="text-[9px] font-bold text-blue-700/50 dark:text-blue-400/40 uppercase tracking-[0.12em] mb-1.5">Payment Information / Modalités de paiement</p>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 leading-relaxed">
              <p>Interac E-Transfer: <span className="font-medium">payments@verrexindustries.ca</span></p>
              <p>Cheque payable to: <span className="font-medium">Verrex Industries Inc.</span></p>
              <p>Reference: <span className="font-mono font-bold">{inv.invoiceNumber}</span></p>
            </div>
            {inv.paidDate && (
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />PAID — {inv.paidDate}{inv.paidMethod && ` via ${inv.paidMethod}`}
              </div>
            )}
          </div>

          {/* Footer — Pale Blue Official */}
          <div className="px-7 py-3 border-t-2 border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/40">
            <div className="flex items-start justify-between gap-4">
              <div className="text-[8px] text-blue-800/40 dark:text-blue-400/30 space-y-0.5 leading-relaxed font-medium">
                <p>Verrex Industries Inc. — Licensed Contractor (RBQ #5678-9012-34)</p>
                <p>GST/TPS: 123 456 789 RT0001 · QST/TVQ: 1234 5678 9012 TQ0001</p>
                <p>Energy Star® Certified · NFRC Rated · CSA Approved</p>
              </div>
              <div className="text-right shrink-0">
                <div className="border border-blue-200 dark:border-blue-800/40 rounded px-2 py-1 inline-block">
                  <p className="text-[7px] text-blue-800/40 dark:text-blue-400/30 uppercase font-bold tracking-wider leading-tight">Official Document</p>
                  <p className="text-[7px] text-blue-800/40 dark:text-blue-400/30 font-mono">verrexindustries.ca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
