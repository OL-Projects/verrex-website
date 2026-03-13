const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');

function write(relPath, content) {
  const full = path.join(BASE, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('✅ Created:', relPath);
}

// ─────────────────────────────────────────────
// 1. Shared: Signature Pad
// ─────────────────────────────────────────────
write('src/components/portal/signature-pad.tsx', `"use client"

import { useRef, useState, useEffect } from "react"

interface SignaturePadProps {
  onSign: (dataUrl: string) => void
  onCancel: () => void
}

export default function SignaturePad({ onSign, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    setDrawing(true)
    setHasDrawn(true)
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function stopDraw() { setDrawing(false) }

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  function submit() {
    if (!canvasRef.current || !hasDrawn || !agreed) return
    onSign(canvasRef.current.toDataURL("image/png"))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Sign Document</h3>
      <p className="text-sm text-slate-500 mb-4">Draw your signature below</p>
      <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef} width={460} height={160}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="rounded border-slate-300" />
        <label htmlFor="agree" className="text-sm text-slate-600">I have read and agree to the terms and conditions of this document</label>
      </div>
      <div className="flex gap-3">
        <button onClick={clear} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Clear</button>
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={submit} disabled={!hasDrawn || !agreed}
          className="px-6 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto">
          Sign & Submit
        </button>
      </div>
    </div>
  )
}
`);

// ─────────────────────────────────────────────
// 2. Shared: Revision Request Modal
// ─────────────────────────────────────────────
write('src/components/portal/revision-request-modal.tsx', `"use client"

import { useState } from "react"
import { X, Send } from "lucide-react"

interface RevisionRequestModalProps {
  documentType: string
  documentNumber: string
  onSubmit: (notes: string) => void
  onClose: () => void
}

export default function RevisionRequestModal({ documentType, documentNumber, onSubmit, onClose }: RevisionRequestModalProps) {
  const [notes, setNotes] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Request Revision</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Describe the changes you&apos;d like made to <strong>{documentType} {documentNumber}</strong>.
          The Verex team will review and update the document.
        </p>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          rows={5} placeholder="Please describe the changes you'd like..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={() => { if (notes.trim()) onSubmit(notes.trim()) }} disabled={!notes.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
            <Send className="w-4 h-4" /> Send Request
          </button>
        </div>
      </div>
    </div>
  )
}
`);

// ─────────────────────────────────────────────
// 3. Client Invoices Inbox
// ─────────────────────────────────────────────
write('src/app/[locale]/portal/dashboard/invoices/client-invoices-inbox.tsx', `"use client"

import { useState, useMemo } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { Receipt, Eye, Download, Clock, CheckCircle2, AlertTriangle, Ban, ChevronLeft } from "lucide-react"
import type { Invoice } from "@/types/portal"
import InvoiceDetail from "./invoice-detail"

const statusConfig: Record<string, { cls: string; label: string; icon: typeof Receipt }> = {
  sent: { cls: "bg-blue-100 text-blue-700", label: "New", icon: Clock },
  paid: { cls: "bg-green-100 text-green-700", label: "Paid", icon: CheckCircle2 },
  overdue: { cls: "bg-red-100 text-red-700", label: "Overdue", icon: AlertTriangle },
  void: { cls: "bg-gray-200 text-gray-500", label: "Void", icon: Ban },
}

export default function ClientInvoicesInbox({ clientId }: { clientId: string }) {
  const store = usePortalStore()
  const [selected, setSelected] = useState<Invoice | null>(null)
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

  if (selected) {
    return (
      <div className="h-full flex flex-col">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:text-slate-900 border-b">
          <ChevronLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex-1 overflow-auto">
          <InvoiceDetail invoice={selected} onAction={(action) => {
            if (action === "acknowledge") store.respondToDocument("invoice", selected.id, "acknowledged")
          }} />
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
            <p className="text-sm text-slate-500">{myInvoices.length} invoice{myInvoices.length !== 1 ? "s" : ""}{unreadCount > 0 ? \` · \${unreadCount} new\` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "sent", "paid", "overdue"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={\`px-3 py-1.5 text-xs font-medium rounded-full transition-all \${filter === f ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}\`}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && \` (\${myInvoices.filter(i => i.status === f).length})\`}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No invoices yet</p>
          </div>
        ) : filtered.map(inv => {
          const cfg = statusConfig[inv.status] || statusConfig.sent
          return (
            <button key={inv.id} onClick={() => openInvoice(inv)}
              className={\`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md \${!inv.readByClient ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200"}\`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!inv.readByClient && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    <span className="font-semibold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                    <span className={\`px-2 py-0.5 text-xs font-medium rounded-full \${cfg.cls}\`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">Due: {inv.dueDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">\${inv.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400">{inv.status === "paid" ? "Paid" : \`Balance: \$\${inv.balanceDue.toLocaleString("en-CA", { minimumFractionDigits: 2 })}\`}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
`);

// ─────────────────────────────────────────────
// 4. Client Contracts Inbox
// ─────────────────────────────────────────────
write('src/app/[locale]/portal/dashboard/contracts/client-contracts-inbox.tsx', `"use client"

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
          <ContractDetail contract={selected} onAction={() => {}} />
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
            <p className="text-sm text-slate-500">{myContracts.length} contract{myContracts.length !== 1 ? "s" : ""}{needsSignature > 0 ? \` · \${needsSignature} needs signature\` : ""}</p>
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
              className={\`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md \${c.status === "sent" && !c.readByClient ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-200"}\`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {c.status === "sent" && !c.readByClient && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                    <span className="font-semibold text-slate-900 text-sm">{c.contractNumber}</span>
                    <span className={\`px-2 py-0.5 text-xs font-medium rounded-full \${cfg.cls}\`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-500">{c.startDate} — {c.completionDate}</p>
                  {c.clientResponse === "revision_requested" && <p className="text-xs text-amber-600 mt-1">⚠ Revision requested</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">\${c.totalValue.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</p>
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
`);

// ─────────────────────────────────────────────
// 5. Client Estimations Inbox
// ─────────────────────────────────────────────
write('src/app/[locale]/portal/dashboard/estimates/client-estimations-inbox.tsx', `"use client"

import { useState, useMemo } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { FileText, ChevronLeft, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
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
          <div className={\`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center \${confirmAction === "accept" ? "bg-green-100" : "bg-red-100"}\`}>
            {confirmAction === "accept" ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <XCircle className="w-7 h-7 text-red-600" />}
          </div>
          <h3 className="text-lg font-semibold mb-2">{confirmAction === "accept" ? "Accept Estimate?" : "Decline Estimate?"}</h3>
          <p className="text-sm text-slate-500 mb-6">
            {confirmAction === "accept"
              ? \`You are accepting estimate \${selected.estimateNumber} for \$\${selected.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}.\`
              : \`Are you sure you want to decline estimate \${selected.estimateNumber}?\`}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={confirmAction === "accept" ? handleAccept : handleReject}
              className={\`px-6 py-2 text-sm rounded-lg text-white \${confirmAction === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}\`}>
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
                  <span className={\`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-white/20 text-white\`}>{cfg.label}</span>
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
                          <td className="text-right">\${item.unitPrice.toLocaleString()}</td>
                          <td className="text-right font-medium">\${item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <div className="border-t pt-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Products Subtotal</span><span>\${selected.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Installation</span><span>\${selected.installationCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Delivery & Materials</span><span>\${selected.deliveryCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">GST (5%)</span><span>\${selected.taxGST.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">QST (9.975%)</span><span>\${selected.taxQST.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total</span><span>\${selected.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</span></div>
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
            <p className="text-sm text-slate-500">{myEstimations.length} estimate{myEstimations.length !== 1 ? "s" : ""}{pendingCount > 0 ? \` · \${pendingCount} pending review\` : ""}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {myEstimations.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No estimates yet</p>
          </div>
        ) : myEstimations.map(est => {
          const cfg = statusConfig[est.status] || statusConfig.sent
          return (
            <button key={est.id} onClick={() => openEstimation(est)}
              className={\`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md \${est.status === "sent" && !est.readByClient ? "bg-indigo-50/50 border-indigo-200" : "bg-white border-slate-200"}\`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {est.status === "sent" && !est.readByClient && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                    <span className="font-semibold text-slate-900 text-sm">{est.estimateNumber}</span>
                    <span className={\`px-2 py-0.5 text-xs font-medium rounded-full \${cfg.cls}\`}>{cfg.label}</span>
                  </div>
                  <p className="text-sm text-slate-500">{est.items.length} items · Valid until {est.validUntil}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">\${est.total.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</p>
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
`);

console.log('\n✅ All client portal files created successfully!');
