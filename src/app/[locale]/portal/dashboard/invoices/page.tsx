"use client"

import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { usePortalStore } from "@/lib/portal-store"
import { useState } from "react"
import { Receipt, DollarSign, Clock, CheckCircle2, AlertTriangle, FileText, Download, X, CreditCard } from "lucide-react"

const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { color: "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400", icon: FileText },
  sent: { color: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400", icon: Clock },
  paid: { color: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400", icon: CheckCircle2 },
  overdue: { color: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400", icon: AlertTriangle },
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const userId = session?.user?.id || "usr_admin_001"
  const role = session?.user?.role || "admin"

  const [payModal, setPayModal] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState("")

  const totalRevenue = store.invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = store.invoices.reduce((sum, inv) => sum + inv.depositPaid, 0)
  const totalOutstanding = store.invoices.reduce((sum, inv) => sum + inv.balanceDue, 0)

  const handlePay = () => {
    if (!payModal || !payAmount) return
    const amount = parseFloat(payAmount)
    if (isNaN(amount) || amount <= 0) return
    store.markInvoicePaid(payModal, amount, userId)
    setPayModal(null)
    setPayAmount("")
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{store.invoices.length} invoices</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center"><DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-500/15 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoice List */}
      {store.invoices.map((invoice, idx) => {
        const config = statusConfig[invoice.status] || statusConfig.draft
        const StatusIcon = config.icon
        return (
          <motion.div key={invoice.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invoice #{invoice.id.replace("inv_", "INV-")}</h3>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${config.color}`}><StatusIcon className="h-3 w-3" />{invoice.status}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{invoice.clientName} • Due {invoice.dueDate}</p>
              </div>
              <div className="flex items-center gap-2">
                {invoice.status !== "paid" && invoice.balanceDue > 0 && (
                  <button onClick={() => { setPayModal(invoice.id); setPayAmount(invoice.balanceDue.toString()) }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors">
                    <CreditCard className="h-3.5 w-3.5" /> Record Payment
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              {invoice.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg odd:bg-slate-50/50 dark:odd:bg-white/3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ${item.unitPrice.toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">${item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Subtotal</span><span>${invoice.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Tax</span><span>${invoice.tax.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 dark:border-white/10 pt-2"><span>Total</span><span>${invoice.total.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400"><span>Paid</span><span>-${invoice.depositPaid.toLocaleString()}</span></div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-white/10 pt-2 text-amber-600 dark:text-amber-400"><span>Balance Due</span><span>${invoice.balanceDue.toLocaleString()}</span></div>
            </div>
          </motion.div>
        )
      })}

      {/* Payment Modal */}
      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setPayModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Record Payment</h2>
                <button onClick={() => setPayModal(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Payment Amount ($)</label>
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} step="0.01" min="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500/40 focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-white/10">
                <button onClick={() => setPayModal(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">Cancel</button>
                <button onClick={handlePay} disabled={!payAmount || parseFloat(payAmount) <= 0}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50">
                  Confirm Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
