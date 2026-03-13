"use client"

import { useState, useMemo } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { ClipboardSignature, ChevronLeft, Clock, CheckCircle2, Play, PenLine, AlertCircle, Ban } from "lucide-react"
import type { Contract } from "@/types/portal"
import ContractDetail from "./contract-detail"
import SignaturePad from "@/components/portal/signature-pad"
import RevisionRequestModal from "@/components/portal/revision-request-modal"

const statusConfig: Record<string, { cls: string; label: string }> = {
  sent: { cls: "bg-amber-100 text-amber-700", label: "Needs Signature" },
  signed: { cls: "bg-purple-100 text-purple-700", label: "Signed" },
  active: { cls: "bg-emerald-100 text-emerald-700", label: "Active" },
  completed: { cls: "bg-green-100 text-green-700", label: "Completed" },
  void: { cls: "bg-gray-200 text-gray-500", label: "Void" },
}

export default function ClientContractsInbox({ clientId }: { clientId: string }) {
  const store = usePortalStore()
  const [selected, setSelected] = useState<Contract | null>(null)
  const [showSign, setShowSign] = useState(false)
  const [showRevision, setShowRevision] = useState(false)

  const myContracts = useMemo(() => {
    return store.contracts
      .filter(c => c.clientId === clientId && c.status !== "draft")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [store.contracts, clientId])

  const needsSignature = myContracts.filter(c => c.status === "sent").length

  function openContract(c: Contract) {
    setSelected(c)
    if (!c.readByClient) store.markDocumentRead("contract", c.id)
  }

  function handleSign(signature: string) {
    if (!selected) return
    store.signContract(selected.id, signature)
    setShowSign(false)
    setSelected({ ...selected, status: "signed", clientSignature: signature, clientSignedDate: new Date().toISOString().slice(0, 10) })
  }

  function handleRevision(notes: string) {
    if (!selected) return
    store.respondToDocument("contract", selected.id, "revision_requested", notes)
    setShowRevision(false)
    setSelected({ ...selected, clientResponse: "revision_requested", clientNotes: notes })
  }

  if (showSign && selected) {
    return <SignaturePad onSign={handleSign} onCancel={() => setShowSign(false)} />
  }

  if (showRevision && selected) {
    return <RevisionRequestModal documentType="Contract" documentNumber={selected.contractNumber} onSubmit={handleRevision} onClose={() => setShowRevision(false)} />
  }

  if (selected) {
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
              <button onClick={() => setShowSign(true)} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                <PenLine className="w-3.5 h-3.5" /> Sign Contract
              </button>
            </div>
          )}
          {selected.clientResponse === "revision_requested" && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Revision Requested</span>
          )}
        </div>
        <div className="flex-1 overflow-auto">
          <ContractDetail contract={selected} onClose={() => setSelected(null)} onSend={() => {}} onSign={() => setShowSign(true)} onActivate={() => {}} onComplete={() => {}} onVoid={() => {}} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <ClipboardSignature className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Contracts</h1>
            <p className="text-sm text-slate-500">{myContracts.length} contract{myContracts.length !== 1 ? "s" : ""}{needsSignature > 0 ? ` · ${needsSignature} needs signature` : ""}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {myContracts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ClipboardSignature className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No contracts yet</p>
          </div>
        ) : myContracts.map(c => {
          const cfg = statusConfig[c.status] || statusConfig.sent
          return (
            <button key={c.id} onClick={() => openContract(c)}
              className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${c.status === "sent" && !c.readByClient ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-200"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {c.status === "sent" && !c.readByClient && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    <span className="font-semibold text-slate-900 text-sm">{c.contractNumber}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cfg.cls}`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-500">{c.startDate} — {c.completionDate}</p>
                  {c.clientResponse === "revision_requested" && <p className="text-xs text-amber-600 mt-1">⚠ Revision requested</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">${c.totalValue.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400">{c.scopeItems.length} items</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
