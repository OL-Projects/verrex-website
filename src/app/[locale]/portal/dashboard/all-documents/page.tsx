"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { SendDocumentModal } from "@/components/portal/send-document-modal"
import {
  FileText, Receipt, ClipboardSignature, BarChart3, Search,
  Send, Eye, EyeOff, Clock, Check, Undo2, Filter, X,
  ChevronDown, AlertCircle, Loader2, CheckSquare, Square,
} from "lucide-react"

type DocType = "all" | "invoice" | "contract" | "estimation"
type DocStatus = "all" | "sent" | "viewed" | "signed" | "draft"

interface SentDoc {
  id: string
  type: string
  title: string
  description?: string
  fileUrl: string
  signedFileUrl?: string | null
  status: string
  projectId?: string
  senderId: string
  recipientId: string
  readAt: string | null
  recalledAt: string | null
  createdAt: string
  updatedAt: string
  sender: { id: string; name: string; role: string }
  recipient: { id: string; name: string; role: string; company?: string }
  project?: { id: string; title: string } | null
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  invoice: Receipt,
  contract: ClipboardSignature,
  estimation: BarChart3,
}

const TYPE_COLORS: Record<string, string> = {
  invoice: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  contract: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  estimation: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
}

const STATUS_BADGES: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300", icon: FileText },
  sent: { color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300", icon: Send },
  viewed: { color: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300", icon: Eye },
  signed: { color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", icon: Check },
}

export default function AllDocumentsPage() {
  const { data: session } = useSession()
  const [docs, setDocs] = useState<SentDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<DocType>("all")
  const [statusFilter, setStatusFilter] = useState<DocStatus>("all")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [unsendingId, setUnsendingId] = useState<string | null>(null)

  const isAdmin = (session?.user as any)?.role === "admin"

  const fetchDocs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      const res = await fetch(`/api/portal/documents?${params}`)
      if (res.ok) setDocs(await res.json())
    } catch {} finally { setLoading(false) }
  }, [typeFilter, statusFilter])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const filtered = useMemo(() => {
    if (!search.trim()) return docs
    const q = search.toLowerCase()
    return docs.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.recipient.name.toLowerCase().includes(q) ||
      (d.recipient.company || "").toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q)
    )
  }, [docs, search])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(d => d.id)))
  }

  const handleUnsend = async (id: string) => {
    setUnsendingId(id)
    try {
      const res = await fetch(`/api/portal/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsend" }),
      })
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== id))
        setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      }
    } catch {} finally { setUnsendingId(null) }
  }

  const canUnsend = (doc: SentDoc) => {
    const elapsed = Date.now() - new Date(doc.createdAt).getTime()
    return elapsed < 25 * 60 * 1000 && doc.status !== "draft"
  }

  const unsendTimeLeft = (doc: SentDoc) => {
    const ms = 25 * 60 * 1000 - (Date.now() - new Date(doc.createdAt).getTime())
    if (ms <= 0) return null
    const min = Math.floor(ms / 60000)
    const sec = Math.floor((ms % 60000) / 1000)
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  // Stats
  const stats = useMemo(() => ({
    total: docs.length,
    sent: docs.filter(d => d.status === "sent").length,
    viewed: docs.filter(d => d.status === "viewed").length,
    signed: docs.filter(d => d.status === "signed").length,
  }), [docs])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Admin access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Documents</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all sent estimates, contracts & invoices</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: stats.total, icon: FileText, color: "text-slate-600" },
          { label: "Pending", value: stats.sent, icon: Send, color: "text-blue-600" },
          { label: "Viewed", value: stats.viewed, icon: Eye, color: "text-green-600" },
          { label: "Signed", value: stats.signed, icon: Check, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type filter */}
        <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
          {(["all", "invoice", "contract", "estimation"] as DocType[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                typeFilter === t
                  ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
          {(["all", "sent", "viewed", "signed"] as DocStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === s
                  ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents or recipients..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl px-4 py-3"
          >
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedIds.size} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-white/50 dark:hover:bg-white/10"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const selectedDocs = filtered.filter(d => selectedIds.has(d.id) && canUnsend(d))
                  selectedDocs.forEach(d => handleUnsend(d.id))
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5"
              >
                <Undo2 className="h-3.5 w-3.5" /> Unsend Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Table */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_140px_100px_120px_100px_80px] gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <button onClick={toggleAll} className="flex items-center justify-center">
            {selectedIds.size === filtered.length && filtered.length > 0
              ? <CheckSquare className="h-4 w-4 text-blue-600" />
              : <Square className="h-4 w-4 text-slate-400" />
            }
          </button>
          <span>Document</span>
          <span>Recipient</span>
          <span>Type</span>
          <span>Status</span>
          <span>Sent</span>
          <span className="text-center">Actions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No documents found</p>
            <p className="text-xs text-slate-400 mt-1">Send documents from Invoices, Contracts, or Estimates pages</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {filtered.map(doc => {
              const Icon = TYPE_ICONS[doc.type] || FileText
              const statusBadge = STATUS_BADGES[doc.status] || STATUS_BADGES.sent
              const StatusIcon = statusBadge.icon
              const unsendable = canUnsend(doc)
              const timeLeft = unsendTimeLeft(doc)

              return (
                <div
                  key={doc.id}
                  className={`grid grid-cols-[40px_1fr_140px_100px_120px_100px_80px] gap-3 px-4 py-3 items-center hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors ${
                    selectedIds.has(doc.id) ? "bg-blue-50/50 dark:bg-blue-500/5" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(doc.id)} className="flex items-center justify-center">
                    {selectedIds.has(doc.id)
                      ? <CheckSquare className="h-4 w-4 text-blue-600" />
                      : <Square className="h-4 w-4 text-slate-300" />
                    }
                  </button>

                  {/* Document info */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.title}</p>
                    {doc.project && (
                      <p className="text-xs text-slate-400 truncate">{doc.project.title}</p>
                    )}
                  </div>

                  {/* Recipient */}
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{doc.recipient.name}</p>
                    {doc.recipient.company && (
                      <p className="text-xs text-slate-400 truncate">{doc.recipient.company}</p>
                    )}
                  </div>

                  {/* Type badge */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg w-fit ${TYPE_COLORS[doc.type] || ""}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                  </span>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${statusBadge.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    {doc.readAt && (
                      <span className="text-[10px] text-green-600 dark:text-green-400" title={`Viewed ${new Date(doc.readAt).toLocaleString()}`}>
                        👁
                      </span>
                    )}
                  </div>

                  {/* Sent date */}
                  <span className="text-xs text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1">
                    {unsendable && (
                      <button
                        onClick={() => handleUnsend(doc.id)}
                        disabled={unsendingId === doc.id}
                        title={timeLeft ? `Unsend (${timeLeft} left)` : "Unsend"}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        {unsendingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                      </button>
                    )}
                    <a
                      href={["signed", "accepted"].includes(doc.status) && doc.signedFileUrl ? doc.signedFileUrl : doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-1.5 rounded-lg transition-colors ${
                        ["signed", "accepted"].includes(doc.status) && doc.signedFileUrl
                          ? "text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"
                          : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      }`}
                      title={["signed", "accepted"].includes(doc.status) && doc.signedFileUrl ? "View Signed PDF" : "View PDF"}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Send modal (for future use via bulk action) */}
      <SendDocumentModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        documents={[]}
        onSent={() => fetchDocs()}
      />
    </div>
  )
}
