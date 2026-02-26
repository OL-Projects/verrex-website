"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { getInvoicesByRole } from "@/lib/portal-data"
import { Receipt, DollarSign, Clock, CheckCircle2, AlertTriangle, FileText, Download } from "lucide-react"

const statusConfig: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { color: "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400", icon: FileText },
  sent: { color: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400", icon: Clock },
  paid: { color: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400", icon: CheckCircle2 },
  overdue: { color: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400", icon: AlertTriangle },
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""
  const role = session?.user?.role || "admin"
  const invoices = getInvoicesByRole(userId, role)

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.depositPaid, 0)
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{invoices.length} invoices</p>
        </div>
        {role === "admin" && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
            <Receipt className="h-4 w-4" /> Create Invoice
          </button>
        )}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalRevenue.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalPaid.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${totalOutstanding.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Invoice List */}
      {invoices.map((invoice, idx) => {
        const config = statusConfig[invoice.status] || statusConfig.draft
        const StatusIcon = config.icon
        return (
          <motion.div key={invoice.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.1 }}
            className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invoice #{invoice.id.replace("inv_", "INV-")}</h3>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-medium uppercase ${config.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {invoice.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{invoice.clientName} • Due {invoice.dueDate}</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
            </div>

            {/* Line items */}
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

            {/* Totals */}
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-700 dark:text-slate-300">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Tax (15%)</span>
                <span className="text-slate-700 dark:text-slate-300">${invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 dark:border-white/10 pt-2">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-slate-900 dark:text-white">${invoice.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">Deposit Paid</span>
                <span className="text-green-600 dark:text-green-400">-${invoice.depositPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-white/10 pt-2">
                <span className="text-amber-600 dark:text-amber-400">Balance Due</span>
                <span className="text-amber-600 dark:text-amber-400">${invoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )
      })}

      {invoices.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-12 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-center">
          <Receipt className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white">No invoices yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Invoices will appear here once created for your projects.</p>
        </motion.div>
      )}
    </div>
  )
}
