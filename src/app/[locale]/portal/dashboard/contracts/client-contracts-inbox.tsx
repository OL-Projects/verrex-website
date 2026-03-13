"use client"

import { useState } from "react"
import { AlertCircle, ClipboardSignature } from "lucide-react"
import { useClientDocuments, type ClientDocument } from "@/hooks/useClientDocuments"
import DocumentSplitView, { type DocumentAction } from "@/components/portal/document-split-view"
import RevisionRequestModal from "@/components/portal/revision-request-modal"
import SignaturePad from "@/components/portal/signature-pad"

export default function ClientContractsInbox({ clientId }: { clientId: string }) {
  const { docs, loading, markAsRead, refetch } = useClientDocuments("contract")
  const [selected, setSelected] = useState<ClientDocument | null>(null)
  const [showRevision, setShowRevision] = useState(false)
  const [showSign, setShowSign] = useState(false)

  const handleRevision = async (message: string) => {
    if (!selected) return
    // TODO: send revision request to API
    setShowRevision(false)
  }

  const handleSign = async (signatureData: string) => {
    if (!selected) return
    try {
      await fetch(`/api/portal/documents/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign", signature: signatureData }),
      })
      setSelected({ ...selected, status: "signed" })
      setShowSign(false)
      refetch()
    } catch { /* silent */ }
  }

  // Actions for contracts: Sign + Request Changes
  const actions: DocumentAction[] = selected ? [
    {
      label: "Sign Contract",
      icon: ClipboardSignature,
      onClick: () => setShowSign(true),
      variant: "primary",
      show: selected.status === "sent",
    },
    {
      label: "Request Changes",
      icon: AlertCircle,
      onClick: () => setShowRevision(true),
      variant: "warning",
      show: selected.status === "sent",
    },
  ] : []

  // Signing overlay
  if (showSign && selected) {
    return (
      <div className="h-[calc(100vh-8rem)]">
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
    <div className="h-[calc(100vh-8rem)]">
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
