"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { usePortalStore } from "@/lib/portal-store"
import {
  Receipt, DollarSign, Clock, CheckCircle2, AlertTriangle, FileText,
  Download, Send, Ban, Eye, Plus, Filter, TrendingUp, Pencil, Copy,
} from "lucide-react"
import type { Invoice } from "@/types/portal"
import InvoiceForm from "./invoice-form"
import InvoiceDetail from "./invoice-detail"

type StatusFilter = "all" | "draft" | "sent" | "paid" | "overdue" | "void"

const statusConfig: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-500/15", icon: FileText },
  sent: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/15", icon: Send },
  paid: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15", icon: CheckCircle2 },
  overdue: { color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/15", icon: AlertTriangle },
  void: { color: "text-gray-400 dark:text-gray-500", bg: "bg-gray-100 dark:bg-gray-500/10", icon: Ban },
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const userId = session?.user?.id || "usr_admin_001"
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [showForm, setShowForm] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null)

  const filtered = useMemo(() => {
    if (filter === "all") return store.invoices
    return store.invoices.filter(i => i.status === filter)
  }, [store.invoices, filter])

  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Stats
  const totalInvoiced = store.invoices.reduce((s, i) => s + (i.status !== "void" ? i.total : 0), 0)
  const totalCollected = store.invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0)
  const totalOutstanding = store.invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.balanceDue, 0)
  const overdueCount = store.invoices.filter(i => i.status === "overdue").length
  const overdueAmount = store.invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0)

  const filterCounts = {
    all: store.invoices.length,
    draft: store.invoices.filter(i => i.status === "draft").length,
    sent: store.invoices.filter(i => i.status === "sent").length,
    paid: store.invoices.filter(i => i.status === "paid").length,
    overdue: store.invoices.filter(i => i.status === "overdue").length,
    void: store.invoices.filter(i => i.status === "void").length,
  }

  const handleSend = (inv: Invoice) => { store.sendInvoice(inv.id); setViewInvoice(null) }
  const handlePay = (inv: Invoice) => { store.markInvoicePaid(inv.id, inv.balanceDue, userId); setViewInvoice(null) }
  const handleVoid = (inv: Invoice) => { store.voidInvoice(inv.id); setViewInvoice(null) }

  const handleDuplicate = (inv: Invoice) => {
    const invNum = `INV-VEREX-${new Date().getFullYear()}-${String(store.invoices.length + 1).padStart(4, "0")}`
    store.createInvoice({ ...inv, invoiceNumber: invNum, status: "draft", issueDate: new Date().toISOString().split("T")[0], dueDate: "", sentDate: undefined, paidDate: undefined, paidMethod: undefined })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Receipt className="h-6 w-6 text-blue-600" />Invoices</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{store.invoices.length} invoices · {fmt(totalInvoiced)} total</p>
        </div>
        <button onClick={() => { setEditInvoice(null); setShowForm(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all">
          <Plus className="h-3.5 w-3.5" />New Invoice
        </button>
      </motion.div>

      {/* Forms / Detail */}
      <InvoiceForm open={showForm} onClose={() => setShowForm(false)} editInvoice={editInvoice} />
      {viewInvoice && (
        <InvoiceDetail invoice={viewInvoice} onClose={() => setViewInvoice(null)}
          onSend={() => handleSend(viewInvoice)} onPay={() => handlePay(viewInvoice)}
          onVoid={() => handleVoid(viewInvoice)} onDownloadPdf={() => {}} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Invoiced", value: fmt(totalInvoiced), icon: Receipt, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/15" },
          { label: "Collected", value: fmt(totalCollected), icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15" },
          { label: "Outstanding", value: fmt(totalOutstanding), icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/15" },
          { label: `Overdue (${overdueCount})`, value: fmt(overdueAmount), icon: AlertTriangle, color: overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400", bg: overdueCount > 0 ? "bg-red-100 dark:bg-red-500/15" : "bg-emerald-100 dark:bg-emerald-500/15" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div><p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p><p className="text-[11px] text-slate-500 dark:text-slate-400">{s.label}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        {(["all", "draft", "sent", "paid", "overdue", "void"] as StatusFilter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10"}`}>
            {f} {filterCounts[f] > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"}`}>{filterCounts[f]}</span>}
          </button>
        ))}
      </div>

      {/* Invoice Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Receipt className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No {filter === "all" ? "" : filter} invoices found.</p>
          </div>
        )}
        {filtered.map((inv, idx) => {
          const cfg = statusConfig[inv.status] || statusConfig.draft
          const StatusIcon = cfg.icon
          const isOverdue = inv.status === "overdue"
          return (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className={`rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border ${isOverdue ? "border-red-300 dark:border-red-500/30 ring-1 ring-red-100 dark:ring-red-500/10" : "border-slate-200/60 dark:border-white/10"} overflow-hidden`}>

              {/* Card Header */}
              <div className="px-5 py-4 flex items-start gap-4">
                {/* Status Icon */}
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>{inv.status}</span>
                    {inv.paidDate && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Paid {inv.paidDate}</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{inv.clientName}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>Issued: {inv.issueDate}</span>
                    <span>Due: {inv.dueDate}</span>
                    <span>{inv.paymentTerms}</span>
                    <span>{inv.items.length} items</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">{fmt(inv.total)}</p>
                  {inv.balanceDue > 0 && inv.balanceDue < inv.total && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">Balance: {fmt(inv.balanceDue)}</p>
                  )}
                  {inv.depositPaid > 0 && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Deposit: {fmt(inv.depositPaid)}</p>
                  )}
                </div>
              </div>

              {/* Line Items Preview (collapsed) */}
              <div className="px-5 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {inv.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                      {item.description.length > 35 ? item.description.slice(0, 35) + "…" : item.description}
                    </span>
                  ))}
                  {inv.items.length > 3 && <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-500">+{inv.items.length - 3} more</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 flex-wrap">
                <button onClick={() => setViewInvoice(inv)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-colors"><Eye className="h-3 w-3" />View</button>
                {inv.status === "draft" && (
                  <>
                    <button onClick={() => { setEditInvoice(inv); setShowForm(true) }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"><Pencil className="h-3 w-3" />Edit</button>
                    <button onClick={() => store.sendInvoice(inv.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"><Send className="h-3 w-3" />Send</button>
                  </>
                )}
                {(inv.status === "sent" || inv.status === "overdue") && (
                  <button onClick={() => store.markInvoicePaid(inv.id, inv.balanceDue, userId)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"><CheckCircle2 className="h-3 w-3" />Mark Paid</button>
                )}
                <button onClick={() => handleDuplicate(inv)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors"><Copy className="h-3 w-3" />Duplicate</button>
                {inv.status !== "void" && inv.status !== "paid" && (
                  <button onClick={() => store.voidInvoice(inv.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors ml-auto"><Ban className="h-3 w-3" />Void</button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
