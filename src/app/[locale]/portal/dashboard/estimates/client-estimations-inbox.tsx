"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { useClientDocuments, type ClientDocument } from "@/hooks/useClientDocuments"
import DocumentSplitView, { type DocumentAction } from "@/components/portal/document-split-view"
import RevisionRequestModal from "@/components/portal/revision-request-modal"

export default function ClientEstimationsInbox({ clientId }: { clientId: string }) {
  const { docs, loading, markAsRead, refetch } = useClientDocuments("estimation")
  const [selected, setSelected] = useState<ClientDocument | null>(null)
  const [showRevision, setShowRevision] = useState(false)

  const handleRevision = async (message: string) => {
    if (!selected) return
    // TODO: send revision request to API
    setShowRevision(false)
  }

  const handleAccept = async () => {
    if (!selected) return
    if (!confirm("Accept this estimate? This confirms you agree with the pricing and scope.")) return
    try {
      await fetch(`/api/portal/documents/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      })
      setSelected({ ...selected, status: "accepted" })
      refetch()
    } catch { /* silent */ }
  }

  const handleDecline = async () => {
    if (!selected) return
    if (!confirm("Decline this estimate? You can still request changes instead.")) return
    try {
      await fetch(`/api/portal/documents/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })
      setSelected({ ...selected, status: "rejected" })
      refetch()
    } catch { /* silent */ }
  }

  // Actions for estimations: Accept, Decline, Request Changes
  const actions: DocumentAction[] = selected ? [
    {
      label: "Accept Estimate",
      icon: CheckCircle2,
      onClick: handleAccept,
      variant: "success",
      show: selected.status === "sent",
    },
    {
      label: "Request Changes",
      icon: AlertCircle,
      onClick: () => setShowRevision(true),
      variant: "warning",
      show: selected.status === "sent",
    },
    {
      label: "Decline",
      icon: XCircle,
      onClick: handleDecline,
      variant: "danger",
      show: selected.status === "sent",
    },
  ] : []

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
    <div className="h-[calc(100vh-8rem)]">
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
