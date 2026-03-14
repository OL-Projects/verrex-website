"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, XCircle, ClipboardSignature } from "lucide-react"
import { useClientDocuments, type ClientDocument } from "@/hooks/useClientDocuments"
import DocumentSplitView, { type DocumentAction } from "@/components/portal/document-split-view"
import RevisionRequestModal from "@/components/portal/revision-request-modal"
import SignaturePad from "@/components/portal/signature-pad"

type SuccessBanner = { type: "accepted" | "signed" | "declined" | "revision"; title: string } | null

export default function ClientEstimationsInbox({ clientId }: { clientId: string }) {
  const { docs, loading, markAsRead, refetch } = useClientDocuments("estimation")
  const [selected, setSelected] = useState<ClientDocument | null>(null)
  const [showRevision, setShowRevision] = useState(false)
  const [showSign, setShowSign] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [success, setSuccess] = useState<SuccessBanner>(null)

  const showSuccess = (banner: SuccessBanner) => {
    setSuccess(banner)
    setTimeout(() => setSuccess(null), 5000)
  }

  const handleRevision = async (message: string) => {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/portal/documents/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revision", message }),
      })
      if (res.ok) {
        showSuccess({ type: "revision", title: selected.title })
        refetch()
      }
    } catch { /* silent */ } finally {
      setActionLoading(false)
      setShowRevision(false)
    }
  }

  const handleSign = async (signatureData: string) => {
    if (!selected) return
    setActionLoading(true)
    try {
      // Call sign-pdf API to burn signature onto PDF and upload signed copy
      const res = await fetch(`/api/portal/documents/${selected.id}/sign-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", signature: signatureData }),
      })
      if (res.ok) {
        const data = await res.json()
        setSelected({ ...selected, status: "accepted", signedFileUrl: data.signedFileUrl })
        showSuccess({ type: "accepted", title: selected.title })
        refetch()
      }
    } catch { /* silent */ } finally {
      setActionLoading(false)
      setShowSign(false)
    }
  }

  const handleDecline = async () => {
    if (!selected) return
    if (!confirm("Decline this estimate? You can still request changes instead.")) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/portal/documents/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })
      if (res.ok) {
        setSelected({ ...selected, status: "rejected" })
        showSuccess({ type: "declined", title: selected.title })
        refetch()
      }
    } catch { /* silent */ } finally {
      setActionLoading(false)
    }
  }

  // Actions for estimations: Accept & Sign, Request Changes, Decline
  const actions: DocumentAction[] = selected ? [
    {
      label: "Accept & Sign Estimate",
      icon: ClipboardSignature,
      onClick: () => setShowSign(true),
      variant: "success",
      show: ["sent", "viewed"].includes(selected.status),
    },
    {
      label: "Request Changes",
      icon: AlertCircle,
      onClick: () => setShowRevision(true),
      variant: "warning",
      show: ["sent", "viewed"].includes(selected.status),
    },
    {
      label: "Decline",
      icon: XCircle,
      onClick: handleDecline,
      variant: "danger",
      show: ["sent", "viewed"].includes(selected.status),
    },
  ] : []

  // Signing overlay
  if (showSign && selected) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50/80 dark:bg-slate-950/50">
        <SignaturePad
          onSign={handleSign}
          onCancel={() => setShowSign(false)}
        />
      </div>
    )
  }

  // Revision overlay
  if (showRevision && selected) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <RevisionRequestModal
          documentType="estimation"
          documentNumber={selected.title}
          onSubmit={handleRevision}
          onClose={() => setShowRevision(false)}
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] relative">
      {/* Success Banner */}
      {success && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          success.type === "accepted" || success.type === "signed"
            ? "bg-green-50 border-green-200 text-green-800"
            : success.type === "declined"
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {success.type === "accepted" && "Estimate Accepted & Signed"}
              {success.type === "signed" && "Estimate Signed"}
              {success.type === "declined" && "Estimate Declined"}
              {success.type === "revision" && "Revision Request Sent"}
            </p>
            <p className="text-xs opacity-80">{success.title} — Admin has been notified</p>
          </div>
          <button onClick={() => setSuccess(null)} className="ml-2 text-current opacity-50 hover:opacity-100">×</button>
        </div>
      )}

      <DocumentSplitView
        documents={docs}
        loading={loading}
        selected={selected}
        onSelect={setSelected}
        onMarkRead={markAsRead}
        docType="estimation"
        actions={actions}
        emptyMessage="No estimates received yet. When your admin sends an estimate, it will appear here for review."
      />
    </div>
  )
}
