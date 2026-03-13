"use client"

import { useState, useMemo } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { useClientDocuments } from "@/hooks/useClientDocuments"
import { Receipt, Eye, Download, Clock, CheckCircle2, AlertTriangle, Ban, ChevronLeft, Loader2, ExternalLink, Inbox } from "lucide-react"
import type { Invoice } from "@/types/portal"
import type { ClientDocument } from "@/hooks/useClientDocuments"
import InvoiceDetail from "./invoice-detail"
import DocumentViewer from "@/components/portal/document-viewer"

const statusConfig: Record<string, { cls: string; label: string; icon: typeof Receipt }> = {
  sent: { cls: "bg-blue-100 text-blue-700", label: "New", icon: Clock },
  paid: { cls: "bg-green-100 text-green-700", label: "Paid", icon: CheckCircle2 },
  overdue: { cls: "bg-red-100 text-red-700", label: "Overdue", icon: AlertTriangle },
  void: { cls: "bg-gray-200 text-gray-500", label: "Void", icon: Ban },
}

export default function ClientInvoicesInbox({ clientId }: { clientId: string }) {
  const store = usePortalStore()
  const { docs: apiDocs, loading: apiLoading, markAsRead, unreadCount: apiUnread } = useClientDocuments("invoice")
  const [selected, setSelected] = useState<Invoice | null>(null)
  const [selectedApiDoc, setSelectedApiDoc] = useState<ClientDocument | null>(null)
  const [filter, setFilter] = useState<string>("all")

  const myInvoices = useMemo(() => {
    return store.invoices
      .filter(inv => inv.clientId === clientId && inv.status !== "draft")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [store.invoices, clientId])

  const filtered = filter === "all" ? myInvoices : myInvoices.filter(i => i.status === filter)
  const unreadCount = myInvoices.filter(i => !i.readByClient).length

  function openInvoice(inv: Invoice) {
    setSelected(inv)
    if (!inv.readByClient) store.markDocumentRead("invoice", inv.id)
  }

  // ── API Document Detail View ──
  if (selectedApiDoc) {
    return <DocumentViewer doc={selectedApiDoc} onBack={() => setSelectedApiDoc(null)} onRequestRevision={() => {}} />
  }

  if (selected) {
    return (
      <div className="h-full flex flex-col">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:text-slate-900 border-b">
          <ChevronLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex-1 overflow-auto">
          <InvoiceDetail invoice={selected} onClose={() => setSelected(null)} onSend={() => {}} onPay={() => {}} onVoid={() => {}} onDownloadPdf={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Invoices</h1>
            <p className="text-sm text-slate-500">{myInvoices.length} invoice{myInvoices.length !== 1 ? "s" : ""}{unreadCount > 0 ? ` · ${unreadCount} new` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "sent", "paid", "overdue"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && ` (${myInvoices.filter(i => i.status === f).length})`}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {/* ── API Documents (sent via Send-To system) ── */}
        {apiDocs.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-1 pt-1 pb-2">
              <Inbox className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Received from Admin ({apiDocs.length})</span>
              {apiUnread > 0 && <span className="text-[10px] font-bold bg-indigo-600 text-white rounded-full px-1.5 py-0.5">{apiUnread} new</span>}
            </div>
            {apiDocs.map(doc => {
              const isRealFile = doc.fileUrl && !doc.fileUrl.startsWith("/api/portal/")
              return (
              <button key={doc.id}
                onClick={() => { if (!doc.readAt) markAsRead(doc.id); setSelectedApiDoc(doc) }}
                className={`block w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${!doc.readAt ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-500/5 dark:border-indigo-500/20" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!doc.readAt && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      <Receipt className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{doc.title}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${!doc.readAt ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                        {!doc.readAt ? "New" : "Viewed"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">From: {doc.sender.name} · {new Date(doc.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</p>
                    {doc.description && <p className="text-xs text-slate-400 mt-1 truncate">{doc.description}</p>}
                    {!isRealFile && <p className="text-xs text-indigo-500 mt-1 font-medium">📄 Document available in your portal</p>}
                  </div>
                  {isRealFile ? <ExternalLink className="h-4 w-4 text-slate-400 shrink-0 mt-1" /> : <Eye className="h-4 w-4 text-indigo-400 shrink-0 mt-1" />}
                </div>
              </button>
              )
            })}
            {filtered.length > 0 && (
              <div className="flex items-center gap-2 px-1 pt-3 pb-2">
                <Receipt className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Generated Invoices ({filtered.length})</span>
              </div>
            )}
          </>
        )}

        {filtered.length === 0 && apiDocs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No invoices yet</p>
          </div>
        ) : filtered.map(inv => {
          const cfg = statusConfig[inv.status] || statusConfig.sent
          return (
            <button key={inv.id} onClick={() => openInvoice(inv)}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${!inv.readByClient ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!inv.readByClient && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    <span className="font-semibold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">Due: {inv.dueDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">${inv.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400">{inv.status === "paid" ? "Paid" : `Balance: $${inv.balanceDue.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
