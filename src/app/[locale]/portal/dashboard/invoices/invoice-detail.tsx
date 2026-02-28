"use client"

import { X, Download, Send, CheckCircle2, Ban, Printer } from "lucide-react"
import type { Invoice } from "@/types/portal"

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
  void: "bg-gray-200 text-gray-500 line-through",
}

export default function InvoiceDetail({ invoice: inv, onClose, onSend, onPay, onVoid, onDownloadPdf }: Props) {
  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto" style={{ animation: "slideInRight 0.3s ease-out forwards" }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusBadge[inv.status]}`}>{inv.status}</span>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {inv.status === "draft" && <button onClick={onSend} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white"><Send className="h-3 w-3" />Send</button>}
            {(inv.status === "sent" || inv.status === "overdue") && <button onClick={onPay} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle2 className="h-3 w-3" />Mark Paid</button>}
            {inv.status !== "void" && inv.status !== "paid" && <button onClick={onVoid} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-100 dark:bg-red-500/10 text-red-600"><Ban className="h-3 w-3" />Void</button>}
            <button onClick={onDownloadPdf} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"><Download className="h-3 w-3" />PDF</button>
            <button onClick={() => window.print()} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><Printer className="h-4 w-4" /></button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="p-6 sm:p-10">
          <div className="max-w-[640px] mx-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg overflow-hidden print:shadow-none print:border-0">

            {/* Header Bar */}
            <div className="bg-slate-900 dark:bg-slate-800 px-8 py-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">VERREX INDUSTRIES</h1>
                  <p className="text-slate-400 text-xs mt-1">Premium Windows & Doors</p>
                  <div className="text-[10px] text-slate-400 mt-3 space-y-0.5 leading-relaxed">
                    <p>1234 Boulevard Industriel</p>
                    <p>Montreal, QC H2X 3K6</p>
                    <p>Tel: (514) 555-0100</p>
                    <p>info@verrexindustries.ca</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black tracking-tight opacity-20">INVOICE</p>
                  <div className="mt-3 text-[10px] text-slate-300 space-y-0.5">
                    <p className="font-mono font-bold text-white text-sm">{inv.invoiceNumber}</p>
                    <p className="mt-2">GST/TPS: 123 456 789 RT0001</p>
                    <p>QST/TVQ: 1234 5678 9012 TQ0001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates + Bill To */}
            <div className="px-8 py-5 border-b border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">BILLED TO</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{inv.clientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{inv.clientAddress}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{inv.clientCity}</p>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{inv.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Due Date</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{inv.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Terms</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{inv.paymentTerms}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="px-8 py-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-900 dark:border-slate-600">
                    <th className="text-left text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-widest py-2 pr-4">Description</th>
                    <th className="text-center text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-widest py-2 w-14">Qty</th>
                    <th className="text-right text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-widest py-2 w-24">Unit Price</th>
                    <th className="text-right text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-widest py-2 w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((item, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
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
            <div className="px-8 pb-5">
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span><span className="font-mono">{fmt(inv.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>GST/TPS (5%)</span><span className="font-mono">{fmt(inv.taxGST)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>QST/TVQ (9.975%)</span><span className="font-mono">{fmt(inv.taxQST)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white border-t-2 border-slate-900 dark:border-slate-600 pt-2">
                    <span>TOTAL</span><span className="font-mono">{fmt(inv.total)}</span>
                  </div>
                  {inv.depositPaid > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                        <span>Deposit Paid</span><span className="font-mono">−{fmt(inv.depositPaid)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-blue-700 dark:text-blue-400 border-t border-slate-300 dark:border-slate-700 pt-1.5">
                        <span>BALANCE DUE</span><span className="font-mono">{fmt(inv.balanceDue)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {inv.notes && (
              <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{inv.notes}</p>
              </div>
            )}

            {/* Payment Info */}
            <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Information</p>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 leading-relaxed">
                <p>E-Transfer: payments@verrexindustries.ca</p>
                <p>Cheque payable to: Verrex Industries Inc.</p>
                <p>Please reference invoice <span className="font-mono font-bold">{inv.invoiceNumber}</span></p>
              </div>
              {inv.paidDate && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />Paid on {inv.paidDate}{inv.paidMethod && ` via ${inv.paidMethod}`}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-[9px] text-slate-500 space-y-0.5">
                  <p>Verrex Industries Inc. — Licensed Contractor RBQ #5678-9012-34</p>
                  <p>Energy Star® Certified · NFRC Rated · CSA Approved</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500">Thank you for your business</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">verrexindustries.ca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
