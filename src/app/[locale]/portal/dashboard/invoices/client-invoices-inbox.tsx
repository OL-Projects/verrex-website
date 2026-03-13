"use client"

import { useState } from "react"
import { AlertCircle, Download } from "lucide-react"
import { useClientDocuments, type ClientDocument } from "@/hooks/useClientDocuments"
import DocumentSplitView, { type DocumentAction } from "@/components/portal/document-split-view"
import RevisionRequestModal from "@/components/portal/revision-request-modal"

export default function ClientInvoicesInbox({ clientId }: { clientId: string }) {
  const { docs, loading, markAsRead } = useClientDocuments("invoice")
  const [selected, setSelected] = useState<ClientDocument | null>(null)
  const [showRevision, setShowRevision] = useState(false)

  const handleRevision = async (message: string) => {
    if (!selected) return
    // TODO: send revision request to API
    setShowRevision(false)
  }

  // Actions for invoices: Request Changes only (no sign/accept)
  const actions: DocumentAction[] = selected ? [
    {
      label: "Request Changes",
      icon: AlertCircle,
      onClick: () => setShowRevision(true),
      variant: "warning",
      show: selected.status === "sent",
    },
  ] : []

  if (showRevision && selected) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <RevisionRequestModal
          documentType="invoice"
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
        docType="invoice"
        actions={actions}
        emptyMessage="No invoices received yet. When your admin sends an invoice, it will appear here."
      />
    </div>
  )
}
