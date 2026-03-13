"use client"

import { useState, useMemo } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { useClientDocuments } from "@/hooks/useClientDocuments"
import { FileText, ChevronLeft, Clock, CheckCircle2, XCircle, AlertCircle, ExternalLink, Inbox } from "lucide-react"
import type { Estimation } from "@/types/portal"
import RevisionRequestModal from "@/components/portal/revision-request-modal"

const statusConfig: Record<string, { cls: string; label: string }> = {
  sent: { cls: "bg-blue-100 text-blue-700", label: "Pending Review" },
  accepted: { cls: "bg-green-100 text-green-700", label: "Accepted" },
  rejected: { cls: "bg-red-100 text-red-700", label: "Declined" },
  revision_requested: { cls: "bg-amber-100 text-amber-700", label: "Changes Requested" },
  void: { cls: "bg-gray-200 text-gray-500", label: "Void" },
}

export default function ClientEstimationsInbox({ clientId }: { clientId: string }) {
  const store = usePortalStore()
  const { docs: apiDocs, markAsRead, unreadCount: apiUnread } = useClientDocuments("estimation")
  const [selected, setSelected] = useState<Estimation | null>(null)
  const [showRevision, setShowRevision] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null)

  const myEstimations = useMemo(() => {
    return store.estimations
      .filter(e => e.clientId === clientId && e.status !== "draft")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [store.estimations, clientId])

  const pendingCount = myEstimations.filter(e => e.status === "sent").length

  function openEstimation(e: Estimation) {
    setSelected(e)
    if (!e.readByClient) store.markDocumentRead("estimation", e.id)
  }

  function handleAccept() {
    if (!selected) return
    store.respondToDocument("estimation", selected.id, "accepted")
    setSelected({ ...selected, status: "accepted", clientResponse: "accepted" })
    setConfirmAction(null)
  }

  function handleReject() {
    if (!selected) return
    store.respondToDocument("estimation", selected.id, "rejected")
    setSelected({ ...selected, status: "rejected", clientResponse: "rejected" })
    setConfirmAction(null)
  }

  function handleRevision(notes: string) {
    if (!selected) return
    store.respondToDocument("estimation", selected.id, "revision_requested", notes)
    setShowRevision(false)
    setSelected({ ...selected, status: "revision_requested", clientResponse: "revision_requested", clientNotes: notes })
  }

  if (showRevision && selected) {
    return <RevisionRequestModal documentType="Estimate" documentNumber={selected.estimateNumber} onSubmit={handleRevision} onClose={() => setShowRevision(false)} />
  }

  if (confirmAction && selected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
          <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${confirmAction === "accept" ? "bg-green-100" : "bg-red-100"}`}>
            {confirmAction === "accept" ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <XCircle className="w-7 h-7 text-red-600" />}
          </div>
          <h3 className="text-lg font-semibold mb-2">{confirmAction === "accept" ? "Accept Estimate?" : "Decline Estimate?"}</h3>
          <p className="text-sm text-slate-500 mb-6">
            {confirmAction === "accept"
              ? `You are accepting estimate ${selected.estimateNumber} for $${selected.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}.`
              : `Are you sure you want to decline estimate ${selected.estimateNumber}?`}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={confirmAction === "accept" ? handleAccept : handleReject}
              className={`px-6 py-2 text-sm rounded-lg text-white ${confirmAction === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
              {confirmAction === "accept" ? "Accept" : "Decline"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selected) {
    const cfg = statusConfig[selected.status] || statusConfig.sent
    const rooms = [...new Set(selected.items.map(i => i.room))]
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {selected.status === "sent" && (
            <div className="flex gap-2">
              <button onClick={() => setShowRevision(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50">
                <AlertCircle className="w-3.5 h-3.5" /> Request Changes
              </button>
              <button onClick={() => setConfirmAction("reject")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 text-red-700 hover:bg-red-50">
                <XCircle className="w-3.5 h-3.5" /> Decline
              </button>
              <button onClick={() => setConfirmAction("accept")} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Accept Estimate
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-6">
          {/* Estimate Summary Document */}
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Verex Industries</h2>
                  <p className="text-blue-100 text-sm mt-1">Window & Door Specialists</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{selected.estimateNumber}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white`}>{cfg.label}</span>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400">Prepared For</p><p className="font-medium">{selected.clientName}</p><p className="text-slate-500">{selected.clientAddress}</p><p className="text-slate-500">{selected.clientCity}</p></div>
                <div className="text-right"><p className="text-slate-400">Date</p><p className="font-medium">{selected.createdAt}</p><p className="text-slate-400 mt-2">Valid Until</p><p className="font-medium">{selected.validUntil}</p></div>
              </div>
              {rooms.map(room => (
                <div key={room}>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 border-b pb-1">{room}</h3>
                  <table className="w-full text-sm">
                    <thead><tr className="text-slate-400"><th className="text-left py-1">Item</th><th className="text-center">Qty</th><th className="text-right">Unit</th><th className="text-right">Total</th></tr></thead>
                    <tbody>
                      {selected.items.filter(i => i.room === room).map(item => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="py-2"><p className="font-medium text-slate-800">{item.description}</p><p className="text-xs text-slate-400">{item.width}" × {item.height}" · {item.color} · {item.glassType}</p></td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-right">${item.unitPrice.toLocaleString()}</td>
                          <td className="text-right font-medium">${item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Products Subtotal</span><span>${selected.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Installation</span><span>${selected.installationCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Delivery & Materials</span><span>${selected.deliveryCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">GST (5%)</span><span>${selected.taxGST.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">QST (9.975%)</span><span>${selected.taxQST.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>${selected.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</span></div>
              </div>
              {selected.notes && <div className="bg-slate-50 rounded-lg p-4"><p className="text-xs font-medium text-slate-400 mb-1">Notes</p><p className="text-sm text-slate-600">{selected.notes}</p></div>}
              {selected.clientNotes && <div className="bg-amber-50 rounded-lg p-4 border border-amber-200"><p className="text-xs font-medium text-amber-600 mb-1">Your Revision Request</p><p className="text-sm text-amber-800">{selected.clientNotes}</p></div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Estimates</h1>
            <p className="text-sm text-slate-500">{myEstimations.length} estimate{myEstimations.length !== 1 ? "s" : ""}{pendingCount > 0 ? ` · ${pendingCount} pending review` : ""}</p>
          </div>
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
                onClick={() => { if (!doc.readAt) markAsRead(doc.id); if (isRealFile) window.open(doc.fileUrl, "_blank") }}
                className={`block w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${!doc.readAt ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-500/5 dark:border-indigo-500/20" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!doc.readAt && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white text-sm truncate">{doc.title}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${!doc.readAt ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
                        {!doc.readAt ? "New" : "Viewed"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">From: {doc.sender.name} · {new Date(doc.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</p>
                    {doc.description && <p className="text-xs text-slate-400 mt-1 truncate">{doc.description}</p>}
                    {!isRealFile && <p className="text-xs text-indigo-500 mt-1 font-medium">📄 Estimate available in your portal</p>}
                  </div>
                  {isRealFile ? <ExternalLink className="h-4 w-4 text-slate-400 shrink-0 mt-1" /> : <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-1" />}
                </div>
              </button>
              )
            })}
            {myEstimations.length > 0 && (
              <div className="flex items-center gap-2 px-1 pt-3 pb-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Generated Estimates ({myEstimations.length})</span>
              </div>
            )}
          </>
        )}

        {myEstimations.length === 0 && apiDocs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No estimates yet</p>
          </div>
        ) : myEstimations.map(est => {
          const cfg = statusConfig[est.status] || statusConfig.sent
          return (
            <button key={est.id} onClick={() => openEstimation(est)}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${est.status === "sent" && !est.readByClient ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-slate-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {est.status === "sent" && !est.readByClient && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                    <span className="font-semibold text-slate-900 text-sm">{est.estimateNumber}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-500">{est.items.length} items · Valid until {est.validUntil}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">${est.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400">{est.createdAt}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
