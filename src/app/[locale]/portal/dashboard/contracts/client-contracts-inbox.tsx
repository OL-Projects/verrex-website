"use client"

import { useState } from "react"
import { AlertCircle, ClipboardSignature, CheckCircle2 } from "lucide-react"
import { useClientDocuments, type ClientDocument } from "@/hooks/useClientDocuments"
import DocumentSplitView, { type DocumentAction } from "@/components/portal/document-split-view"
import RevisionRequestModal from "@/components/portal/revision-request-modal"
import SignaturePad from "@/components/portal/signature-pad"

type SuccessBanner = { type: "signed" | "revision"; title: string } | null

export default function ClientContractsInbox({ clientId }: { clientId: string }) {
  const { docs, loading, markAsRead, refetch } = useClientDocuments("contract")
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
         body: JSON.stringify({ action: "sign", signature: signatureData }),
       })
       if (res.ok) {
         const data = await res.json()
         setSelected({ ...selected, status: "signed", signedFileUrl: data.signedFileUrl })
         showSuccess({ type: "signed", title: selected.title })
         refetch()
       }
     } catch { /* silent */ } finally {
       setActionLoading(false)
       setShowSign(false)
     }
   }

  // Actions for contracts: Sign + Request Changes
  const actions: DocumentAction[] = selected ? [
    {
      label: "Sign Contract",
      icon: ClipboardSignature,
      onClick: () => setShowSign(true),
      variant: "primary",
      show: ["sent", "viewed"].includes(selected.status),
    },
    {
      label: "Request Changes",
      icon: AlertCircle,
      onClick: () => setShowRevision(true),
      variant: "warning",
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
          documentType="contract"
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
          success.type === "signed"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {success.type === "signed" && "Contract Signed Successfully"}
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
        docType="contract"
        actions={actions}
        emptyMessage="No contracts received yet. When your admin sends a contract, it will appear here for review and signing."
      />
    </div>
  )
}
