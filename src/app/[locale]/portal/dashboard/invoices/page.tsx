"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { usePortalStore } from "@/lib/portal-store"
import { SendDocumentModal } from "@/components/portal/send-document-modal"
import {
  Receipt, Clock, CheckCircle2, AlertTriangle, FileText,
  Send, Ban, Eye, Plus, Filter, Pencil, Copy, ArrowLeft,
} from "lucide-react"
import type { Invoice } from "@/types/portal"
import InvoiceForm from "./invoice-form"
import InvoiceDetail from "./invoice-detail"
import ClientInvoicesInbox from "./client-invoices-inbox"

type StatusFilter = "all" | "draft" | "sent" | "paid" | "overdue" | "void"
type RightPanel = { type: "none" } | { type: "view"; invoice: Invoice } | { type: "create" } | { type: "edit"; invoice: Invoice }

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
  const userId = session?.user?.id || ""
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [panel, setPanel] = useState<RightPanel>({ type: "none" })

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

  const filterCounts: Record<StatusFilter, number> = {
    all: store.invoices.length,
    draft: store.invoices.filter(i => i.status === "draft").length,
    sent: store.invoices.filter(i => i.status === "sent").length,
    paid: store.invoices.filter(i => i.status === "paid").length,
    overdue: store.invoices.filter(i => i.status === "overdue").length,
    void: store.invoices.filter(i => i.status === "void").length,
  }

  const handleSend = (inv: Invoice) => { store.sendInvoice(inv.id); setPanel({ type: "none" }) }
  const handlePay = (inv: Invoice) => { store.markInvoicePaid(inv.id, inv.balanceDue, userId); setPanel({ type: "none" }) }
  const handleVoid = (inv: Invoice) => { store.voidInvoice(inv.id); setPanel({ type: "none" }) }
  const handleDuplicate = (inv: Invoice) => {
    const invNum = `INV-VEREX-${new Date().getFullYear()}-${String(store.invoices.length + 1).padStart(4, "0")}`
    store.createInvoice({ ...inv, invoiceNumber: invNum, status: "draft", issueDate: new Date().toISOString().split("T")[0], dueDate: "", sentDate: undefined, paidDate: undefined, paidMethod: undefined })
  }

  // Send-to-contact modal state
  const [sendModal, setSendModal] = useState<{ open: boolean; docs: { type: string; title: string; fileUrl: string }[] }>({ open: false, docs: [] })
  const openSendTo = (inv: Invoice) => {
    setSendModal({ open: true, docs: [{ type: "invoice", title: `${inv.invoiceNumber} — ${inv.clientName}`, fileUrl: `/api/portal/invoices/${inv.id}/pdf` }] })
  }

  const panelOpen = panel.type !== "none"

  // On mobile, if panel is open, show only the panel with a back button

  // Role-based view: client sees inbox, admin sees management
  const userRole = (session?.user as any)?.role || 'client'
  
  if (userRole === 'client') {
    return <ClientInvoicesInbox clientId={userId} />
  }

  return (
    <div className="space-y-4">
      {/* Header + Stats — always visible */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Receipt className="h-6 w-6 text-blue-600" />Invoices</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{store.invoices.length} invoices · {fmt(totalInvoiced)} total</p>
        </div>
        <button onClick={() => setPanel({ type: "create" })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all">
          <Plus className="h-3.5 w-3.5" />New Invoice
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: "Total Invoiced", value: fmt(totalInvoiced), icon: Receipt, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/15" },
          { label: "Collected", value: fmt(totalCollected), icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15" },
          { label: "Outstanding", value: fmt(totalOutstanding), icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/15" },
          { label: `Overdue (${overdueCount})`, value: fmt(overdueAmount), icon: AlertTriangle, color: overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400", bg: overdueCount > 0 ? "bg-red-100 dark:bg-red-500/15" : "bg-emerald-100 dark:bg-emerald-500/15" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="p-3 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
              <div><p className="text-base font-bold text-slate-900 dark:text-white">{s.value}</p><p className="text-[10px] text-slate-500 dark:text-slate-400">{s.label}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Split panel layout */}
      <div className="flex gap-4" style={{ minHeight: "calc(100vh - 340px)" }}>

        {/* LEFT — Invoice List */}
        <div className={`${panelOpen ? "hidden lg:flex" : "flex"} flex-col flex-1 min-w-0`}>
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {(["all", "draft", "sent", "paid", "overdue", "void"] as StatusFilter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium capitalize whitespace-nowrap transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10"}`}>
                {f}{filterCounts[f] > 0 && <span className={`text-[9px] px-1 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-slate-200 dark:bg-slate-700"}`}>{filterCounts[f]}</span>}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto space-y-2.5">
            {filtered.length === 0 && (
              <div className="text-center py-16"><Receipt className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" /><p className="text-xs text-slate-500">No {filter === "all" ? "" : filter} invoices.</p></div>
            )}
            {filtered.map((inv, idx) => {
              const cfg = statusConfig[inv.status] || statusConfig.draft
              const StatusIcon = cfg.icon
              const isActive = (panel.type === "view" && panel.invoice.id === inv.id) || (panel.type === "edit" && panel.invoice.id === inv.id)
              return (
                <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                  onClick={() => setPanel({ type: "view", invoice: inv })}
                  className={`rounded-xl cursor-pointer transition-all border overflow-hidden ${isActive ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20" : "border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-blue-200 dark:hover:border-blue-800/30"} ${inv.status === "overdue" ? "border-red-200 dark:border-red-500/20" : ""}`}>

                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}><StatusIcon className={`h-4 w-4 ${cfg.color}`} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">{inv.invoiceNumber}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${cfg.bg} ${cfg.color}`}>{inv.status}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">{inv.clientName}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>Due: {inv.dueDate}</span><span>{inv.items.length} items</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">{fmt(inv.total)}</p>
                      {inv.depositPaid > 0 && inv.balanceDue < inv.total && <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">{fmt(inv.balanceDue)}</p>}
                    </div>
                  </div>

                  {/* Quick actions row */}
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {inv.status === "draft" && (
                      <>
                        <button onClick={() => setPanel({ type: "edit", invoice: inv })} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"><Pencil className="h-2.5 w-2.5" />Edit</button>
                        <button onClick={() => store.sendInvoice(inv.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700"><Send className="h-2.5 w-2.5" />Send</button>
                        <button onClick={() => openSendTo(inv)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-indigo-600 text-white hover:bg-indigo-700"><Eye className="h-2.5 w-2.5" />Send to…</button>
                      </>
                    )}
                    {(inv.status === "sent" || inv.status === "overdue") && (
                      <button onClick={() => store.markInvoicePaid(inv.id, inv.balanceDue, userId)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-emerald-600 text-white hover:bg-emerald-700"><CheckCircle2 className="h-2.5 w-2.5" />Paid</button>
                    )}
                    <button onClick={() => handleDuplicate(inv)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"><Copy className="h-2.5 w-2.5" />Copy</button>
                    {inv.status !== "void" && inv.status !== "paid" && (
                      <button onClick={() => store.voidInvoice(inv.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 ml-auto"><Ban className="h-2.5 w-2.5" />Void</button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — Detail / Form Panel */}
        {panelOpen && (
          <div className="flex flex-col w-full lg:w-[55%] xl:w-[60%] shrink-0 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 overflow-hidden">
            {/* Mobile back button */}
            <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
              <button onClick={() => setPanel({ type: "none" })} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium"><ArrowLeft className="h-3.5 w-3.5" />Back to list</button>
            </div>

            {panel.type === "view" && (
              <InvoiceDetail
                invoice={panel.invoice}
                onClose={() => setPanel({ type: "none" })}
                onSend={() => handleSend(panel.invoice)}
                onPay={() => handlePay(panel.invoice)}
                onVoid={() => handleVoid(panel.invoice)}
                onDownloadPdf={() => {}}
              />
            )}
            {panel.type === "create" && (
              <InvoiceForm onClose={() => setPanel({ type: "none" })} />
            )}
            {panel.type === "edit" && (
              <InvoiceForm onClose={() => setPanel({ type: "none" })} editInvoice={panel.invoice} />
            )}
          </div>
        )}
      </div>

      {/* Send-to-contact modal */}
      <SendDocumentModal
        open={sendModal.open}
        onClose={() => setSendModal({ open: false, docs: [] })}
        documents={sendModal.docs}
      />
    </div>
  )
}
