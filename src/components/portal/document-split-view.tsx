"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Receipt, ClipboardSignature, Clock, CheckCircle2, AlertCircle,
  Download, User, Calendar, Building2, Eye, Search, ChevronRight,
  Loader2, MessageSquare,
} from "lucide-react"
import type { ClientDocument } from "@/hooks/useClientDocuments"
import UserAvatar from "@/components/portal/user-avatar"

// ─── Config ────────────────────────────────────────────
const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string; bg: string; gradient: string }> = {
  invoice:    { icon: Receipt,            color: "text-blue-600",   label: "Invoice",  bg: "bg-blue-100",   gradient: "from-blue-600 to-blue-700" },
  contract:   { icon: ClipboardSignature, color: "text-purple-600", label: "Contract", bg: "bg-purple-100", gradient: "from-purple-600 to-purple-700" },
  estimation: { icon: FileText,           color: "text-indigo-600", label: "Estimate", bg: "bg-indigo-100", gradient: "from-indigo-600 to-indigo-700" },
}

const statusConfig: Record<string, { color: string; label: string; icon: typeof Clock; listColor: string }> = {
  sent:     { color: "bg-blue-100 text-blue-700",   label: "Pending Review", icon: Clock,         listColor: "text-blue-600" },
  viewed:   { color: "bg-slate-100 text-slate-600", label: "Viewed",         icon: Eye,           listColor: "text-slate-500" },
  signed:   { color: "bg-green-100 text-green-700", label: "Signed",         icon: CheckCircle2,  listColor: "text-green-600" },
  accepted: { color: "bg-green-100 text-green-700", label: "Accepted",       icon: CheckCircle2,  listColor: "text-green-600" },
  rejected: { color: "bg-red-100 text-red-700",     label: "Declined",       icon: AlertCircle,   listColor: "text-red-500" },
}

// ─── Download helper ───────────────────────────────────
async function downloadFile(url: string, name?: string) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = name || decodeURIComponent(url.split("/").pop()?.split("?")[0] || "download")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch { window.open(url, "_blank") }
}

// ─── Props ─────────────────────────────────────────────
export interface DocumentAction {
  label: string
  icon: typeof FileText
  onClick: () => void
  variant: "primary" | "success" | "warning" | "danger" | "ghost"
  show?: boolean
}

interface Props {
  documents: ClientDocument[]
  loading: boolean
  selected: ClientDocument | null
  onSelect: (doc: ClientDocument) => void
  onMarkRead: (docId: string) => void
  docType: "invoice" | "contract" | "estimation"
  actions?: DocumentAction[]
  emptyMessage?: string
}

const variantClasses: Record<string, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  success: "bg-green-600 text-white hover:bg-green-700",
  warning: "border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10",
  danger:  "border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10",
  ghost:   "border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5",
}

// ═══════════════════════════════════════════════════════
// Document Split View (Inbox + Detail + PDF)
// ═══════════════════════════════════════════════════════
export default function DocumentSplitView({ documents, loading, selected, onSelect, onMarkRead, docType, actions, emptyMessage }: Props) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState(false)
  const iframeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const typeCfg = typeConfig[docType] || typeConfig.estimation
  const TypeIcon = typeCfg.icon

  // Reset loading state when selected document changes
  useEffect(() => {
    if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current)
    setPdfError(false)

    const url = selected?.fileUrl?.trim() || ""
    const looksLikePdf = url.toLowerCase().endsWith(".pdf")
    const looksLikeImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url)
    // Only load actual uploaded files (http/blob), NOT /api/ placeholder routes
    const isAccessible = (url.startsWith("http") || url.startsWith("blob:")) && !url.includes("/api/")
    const isLoadable = isAccessible && (looksLikePdf || looksLikeImage)

    if (selected && isLoadable) {
      setPdfLoading(true)
      // Fallback timeout — if iframe doesn't load in 8s, stop spinner
      iframeTimeoutRef.current = setTimeout(() => {
        setPdfLoading(false)
        setPdfError(true)
      }, 8000)
    } else {
      setPdfLoading(false)
    }

    return () => {
      if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current)
    }
  }, [selected?.id])

  // Filter documents
  const filtered = documents.filter(d => {
    if (filter !== "all" && d.status !== filter) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Status filter tabs
  const statuses = ["all", ...new Set(documents.map(d => d.status))]

  // File type detection — only real uploaded files (http URLs or blob URLs)
  // Exclude /api/ routes which are placeholders for non-existent PDF generators
    // Use signed PDF if available (signature burned on), otherwise original
    const rawFileUrl = selected?.fileUrl?.trim() || ""
    const signedUrl = (selected as any)?.signedFileUrl?.trim() || ""
    const isSigned = ["signed", "accepted"].includes(selected?.status || "") && signedUrl.length > 0
    const fileUrl = isSigned ? signedUrl : rawFileUrl
    const isUploadedFile = fileUrl.length > 0 && (fileUrl.startsWith("http") || fileUrl.startsWith("blob:")) && !fileUrl.includes("/api/")
    const isRealFile = isUploadedFile
    const isPdf = isUploadedFile && (fileUrl.toLowerCase().endsWith(".pdf") || /\/pdf(\?|$)/i.test(fileUrl))
    const isImage = isUploadedFile && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileUrl)

  const handleIframeLoad = () => {
    setPdfLoading(false)
    setPdfError(false)
    if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current)
  }

  const handleImageLoad = () => {
    setPdfLoading(false)
    setPdfError(false)
    if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current)
  }

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl">

      {/* ═══ LEFT: Document List ═══ */}
      <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 xl:w-96 border-r border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`h-8 w-8 rounded-lg ${typeCfg.bg} flex items-center justify-center`}>
              <TypeIcon className={`h-4 w-4 ${typeCfg.color}`} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{typeCfg.label}s</h2>
            {documents.filter(d => !d.readAt).length > 0 && (
              <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                {documents.filter(d => !d.readAt).length}
              </span>
            )}
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${typeCfg.label.toLowerCase()}s…`}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {statuses.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === s ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}>
                {s === "all" ? "All" : (statusConfig[s]?.label || s)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <TypeIcon className={`h-10 w-10 mx-auto ${typeCfg.color} opacity-30 mb-2`} />
              <p className="text-sm text-slate-400">{emptyMessage || `No ${typeCfg.label.toLowerCase()}s found`}</p>
            </div>
          ) : filtered.map(doc => {
            const stCfg = statusConfig[doc.status] || statusConfig.sent
            const isActive = selected?.id === doc.id
            const isUnread = !doc.readAt
            return (
              <button key={doc.id} onClick={() => { onSelect(doc); if (isUnread) onMarkRead(doc.id) }}
                className={`w-full text-left px-4 py-3.5 border-b border-slate-50 dark:border-white/5 transition-all ${
                  isActive ? "bg-blue-50 dark:bg-blue-500/10 border-l-3 border-l-blue-500" : "hover:bg-slate-50 dark:hover:bg-white/5"
                }`}>
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  <div className="mt-2 shrink-0">
                    {isUnread ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-500/50" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${isUnread ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(doc.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${stCfg.listColor}`}>
                        <stCfg.icon className="h-3 w-3" /> {stCfg.label}
                      </span>
                      {doc.project && <span className="text-[10px] text-slate-400 truncate">· {doc.project.title}</span>}
                    </div>
                    <p className={`text-xs mt-1 truncate ${isUnread ? "text-slate-600 dark:text-slate-400" : "text-slate-400"}`}>
                      From {doc.sender.name}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══ MIDDLE + RIGHT: Detail + PDF Split ═══ */}
      <div className={`${selected ? "flex" : "hidden lg:flex"} flex-1 min-w-0`}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <TypeIcon className={`h-16 w-16 mx-auto ${typeCfg.color} opacity-20 mb-3`} />
              <p className="text-lg font-semibold text-slate-400">Select a {typeCfg.label.toLowerCase()}</p>
              <p className="text-sm text-slate-400 mt-1">Choose from the list to view details and preview</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Detail Column ── */}
            <div className="w-full lg:w-[340px] xl:w-[380px] flex flex-col border-r border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0">
              {/* Back button (mobile) */}
              <div className="lg:hidden px-4 py-2 border-b border-slate-100 dark:border-white/5">
                <button onClick={() => onSelect(null as unknown as ClientDocument)} className="text-sm text-slate-500 flex items-center gap-1">
                  ← Back to list
                </button>
              </div>

              {/* Gradient header card */}
              <div className={`bg-gradient-to-br ${typeCfg.gradient} text-white p-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <TypeIcon className="h-4 w-4 text-white/70" />
                  <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">{typeCfg.label}</span>
                </div>
                <h2 className="text-lg font-bold leading-tight">{selected.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/20 text-white">
                    {(() => { const S = (statusConfig[selected.status] || statusConfig.sent); return <><S.icon className="h-3 w-3" /> {S.label}</> })()}
                  </span>
                </div>
              </div>

              {/* Detail content — scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Description */}
                {selected.description && (
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}

                {/* Metadata grid */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar image={selected.sender.image} name={selected.sender.name} size="md" className="rounded-lg" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Sent By</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.sender.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{selected.sender.role}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Date Sent</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {new Date(selected.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {selected.project && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">Project</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.project.title}</p>
                      </div>
                    </div>
                  )}

                  {/* Read status */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs">
                      {selected.readAt ? (
                        <><Eye className="h-3.5 w-3.5 text-green-500" /><span className="text-slate-500">Viewed {new Date(selected.readAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span></>
                      ) : (
                        <><Clock className="h-3.5 w-3.5 text-blue-500" /><span className="text-blue-600 font-medium">New — First time viewing</span></>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {actions && actions.filter(a => a.show !== false).length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Actions</p>
                    <div className="space-y-2">
                      {actions.filter(a => a.show !== false).map((action, i) => (
                        <button key={i} onClick={action.onClick}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${variantClasses[action.variant]}`}>
                          <action.icon className="h-4 w-4" /> {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download */}
                {isRealFile && (
                  <button onClick={() => downloadFile(selected.fileUrl, selected.title)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <Download className="h-4 w-4" /> Save to Desktop
                  </button>
                )}
              </div>
            </div>

            {/* ── PDF Viewer Column (own scroll) ── */}
            <div className="hidden lg:flex flex-1 flex-col bg-slate-50 dark:bg-slate-950/30 min-w-0">
              {isRealFile ? (
                <>
                  {/* PDF header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className={`h-4 w-4 ${typeCfg.color} shrink-0`} />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                        {decodeURIComponent(fileUrl.split("/").pop()?.split("?")[0] || "Document")}
                      </span>
                      {isSigned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-[10px] font-bold shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> Signed Copy
                        </span>
                      )}
                    </div>
                    <button onClick={() => downloadFile(fileUrl, isSigned ? `Signed-${selected.title}` : selected.title)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors" title="Download">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* PDF render */}
                  <div className="flex-1 relative">
                    {pdfLoading && !pdfError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950/50 z-10">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">Loading document…</p>
                        </div>
                      </div>
                    )}
                    {pdfError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950/50 z-20">
                        <div className="text-center">
                          <FileText className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Document preview unavailable</p>
                          <p className="text-xs text-slate-400 mb-4 max-w-[240px] mx-auto">The file could not be loaded. Review the details on the left panel.</p>
                          <button onClick={() => downloadFile(selected.fileUrl, selected.title)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
                            <Download className="h-4 w-4" /> Try Download
                          </button>
                        </div>
                      </div>
                    )}
                    {isPdf ? (
                      <iframe
                        key={`${selected.id}-${isSigned ? "signed" : "original"}`}
                        src={fileUrl}
                        className="w-full h-full"
                        title={selected.title}
                        onLoad={handleIframeLoad}
                        onError={() => { setPdfLoading(false); setPdfError(true) }}
                      />
                    ) : isImage ? (
                      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
                        <img src={fileUrl} alt={selected.title} className="max-w-full rounded-xl shadow-lg" onLoad={handleImageLoad} onError={() => { setPdfLoading(false); setPdfError(true) }} />
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-8">
                        <div className="text-center">
                          <FileText className="h-16 w-16 mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                            {decodeURIComponent(selected.fileUrl.split("/").pop()?.split("?")[0] || "File")}
                          </p>
                          <p className="text-xs text-slate-400 mb-4">Preview not available</p>
                          <button onClick={() => downloadFile(selected.fileUrl, selected.title)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
                            <Download className="h-4 w-4" /> Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* ── Rich Document Preview (no PDF attached) ── */
                <div className="flex-1 overflow-y-auto">
                  {/* Simulated document header */}
                  <div className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-white/5 px-8 py-6">
                    <div className="max-w-xl mx-auto">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-12 w-12 rounded-xl ${typeCfg.bg} flex items-center justify-center`}>
                          <TypeIcon className={`h-6 w-6 ${typeCfg.color}`} />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{typeCfg.label}</p>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selected.title}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">From</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selected.sender.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">Date</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(selected.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                        {selected.project && (
                          <div className="col-span-2">
                            <p className="text-[10px] text-slate-400 uppercase font-medium">Project</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{selected.project.title}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Document body */}
                  <div className="px-8 py-6">
                    <div className="max-w-xl mx-auto">
                      {selected.description ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <TypeIcon className={`h-12 w-12 mx-auto ${typeCfg.color} opacity-20 mb-3`} />
                          <p className="text-sm text-slate-400">No additional details provided.</p>
                          <p className="text-xs text-slate-400 mt-1">Review the summary on the left panel.</p>
                        </div>
                      )}
                      {/* Status bar */}
                      <div className="mt-8 pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Status: <span className="font-semibold capitalize">{(statusConfig[selected.status] || statusConfig.sent).label}</span></span>
                          {selected.readAt && <span>Viewed {new Date(selected.readAt).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
