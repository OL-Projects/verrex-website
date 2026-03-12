"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock, CheckCircle2, AlertTriangle, Plus, Send, Upload,
  FileText, Image as ImageIcon, Flag, Milestone as MilestoneIcon,
  DollarSign, FolderKanban, Paperclip, X, ChevronDown,
  ArrowUpDown, Calendar, Download, ExternalLink,
  AlertCircle, TrendingUp, Trophy, CreditCard, Banknote,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface Activity {
  id: string; type: string; content: string | null; metadata: string | null
  attachmentUrls: string | null; authorId: string; createdAt: string
  author: { id: string; name: string; role: string }
}

interface EntryTypeConfig {
  type: string; label: string; desc: string
  icon: React.ComponentType<{ className?: string }>; color: string
}

// ─── Constants ──────────────────────────────────────────
const ACTIVITY_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  note:           { icon: FileText,       color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-500/15" },
  photo:          { icon: ImageIcon,      color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/15" },
  document:       { icon: Paperclip,      color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-500/15" },
  status_change:  { icon: Flag,           color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-500/15" },
  task_completed: { icon: CheckCircle2,   color: "text-green-600 dark:text-green-400",   bg: "bg-green-100 dark:bg-green-500/15" },
  task_created:   { icon: Plus,           color: "text-sky-600 dark:text-sky-400",       bg: "bg-sky-100 dark:bg-sky-500/15" },
  issue:          { icon: AlertTriangle,  color: "text-red-600 dark:text-red-400",       bg: "bg-red-100 dark:bg-red-500/15" },
  resolved:       { icon: CheckCircle2,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15" },
  progress:       { icon: FolderKanban,   color: "text-cyan-600 dark:text-cyan-400",     bg: "bg-cyan-100 dark:bg-cyan-500/15" },
  milestone:      { icon: MilestoneIcon,  color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/15" },
  financial:      { icon: DollarSign,     color: "text-green-600 dark:text-green-400",   bg: "bg-green-100 dark:bg-green-500/15" },
  file_uploaded:  { icon: Upload,         color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-500/15" },
}

const ENTRY_TYPES: EntryTypeConfig[] = [
  { type: "note",      label: "Note",      desc: "Add a text note",         icon: FileText,      color: "bg-blue-100 dark:bg-blue-500/15 text-blue-600" },
  { type: "photo",     label: "Photo(s)",  desc: "Upload photos",           icon: ImageIcon,     color: "bg-purple-100 dark:bg-purple-500/15 text-purple-600" },
  { type: "document",  label: "Document",  desc: "Upload a file",           icon: Paperclip,     color: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600" },
  { type: "issue",     label: "Issue",     desc: "Report a problem",        icon: AlertTriangle, color: "bg-red-100 dark:bg-red-500/15 text-red-600" },
  { type: "resolved",  label: "Resolved",  desc: "Mark issue resolved",     icon: CheckCircle2,  color: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600" },
  { type: "progress",  label: "Progress",  desc: "Update progress",         icon: FolderKanban,  color: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600" },
  { type: "milestone", label: "Milestone", desc: "Mark a milestone",        icon: MilestoneIcon, color: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-600" },
  { type: "financial", label: "Financial", desc: "Payment / change order",  icon: DollarSign,    color: "bg-green-100 dark:bg-green-500/15 text-green-600" },
]

const SEVERITY_OPTIONS = [
  { value: "low",      label: "Low",      cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  { value: "medium",   label: "Medium",   cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400" },
  { value: "high",     label: "High",     cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400" },
  { value: "critical", label: "Critical", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
]

const FINANCIAL_TYPES = [
  { value: "payment",      label: "Payment Received", icon: Banknote },
  { value: "invoice",      label: "Invoice Sent",     icon: CreditCard },
  { value: "change_order", label: "Change Order",     icon: FileText },
]

// ─── Main Component ─────────────────────────────────────
export default function ActivityTimeline({
  activities, projectId, isAdmin, onRefresh,
}: {
  activities: Activity[]; projectId: string; isAdmin: boolean; onRefresh: () => void
}) {
  const [sortNewest, setSortNewest] = useState(true)
  const [showInlineAdd, setShowInlineAdd] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  // Sort activities
  const sorted = [...activities].sort((a, b) => {
    const da = new Date(a.createdAt).getTime()
    const db = new Date(b.createdAt).getTime()
    return sortNewest ? db - da : da - db
  })

  // Group by date
  const grouped: { date: string; entries: Activity[] }[] = []
  const seen = new Set<string>()
  sorted.forEach(a => {
    const date = new Date(a.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    if (!seen.has(date)) { seen.add(date); grouped.push({ date, entries: [] }) }
    grouped.find(g => g.date === date)!.entries.push(a)
  })

  // Get open issues for the resolved picker
  const openIssues = activities.filter(a => {
    if (a.type !== "issue") return false
    const meta = a.metadata ? JSON.parse(a.metadata) : {}
    // Check if any resolved entry references this issue
    const isResolved = activities.some(r => {
      if (r.type !== "resolved") return false
      const rm = r.metadata ? JSON.parse(r.metadata) : {}
      return rm.resolvedIssueId === a.id
    })
    return !isResolved
  })

  return (
    <div className="max-w-3xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>{activities.length} entries</span>
        </div>
        <button onClick={() => setSortNewest(!sortNewest)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-slate-700">
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortNewest ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Timeline */}
      {activities.length === 0 && !showInlineAdd ? (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No activity yet. Add your first entry to start the project timeline.</p>
          {isAdmin && (
            <button onClick={() => setShowInlineAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="h-4 w-4" /> Add First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 via-slate-200 to-slate-200 dark:from-blue-500/30 dark:via-slate-700 dark:to-slate-700" />

          {/* Inline Add Entry — at top if newest first */}
          {isAdmin && sortNewest && (
            <InlineAddEntry
              projectId={projectId}
              show={showInlineAdd}
              onToggle={() => setShowInlineAdd(!showInlineAdd)}
              onRefresh={onRefresh}
              openIssues={openIssues}
            />
          )}

          {/* Grouped entries */}
          {grouped.map(group => (
            <div key={group.date} className="mb-6">
              {/* Date header */}
              <div className="relative flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center z-10">
                  <Calendar className="h-4 w-4 text-slate-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{group.date}</span>
              </div>

              {/* Activity cards */}
              <div className="space-y-3 ml-5 pl-8">
                {group.entries.map(activity => (
                  <ActivityCard key={activity.id} activity={activity} onLightbox={setLightboxUrl} />
                ))}
              </div>
            </div>
          ))}

          {/* Inline Add Entry — at bottom if oldest first */}
          {isAdmin && !sortNewest && (
            <InlineAddEntry
              projectId={projectId}
              show={showInlineAdd}
              onToggle={() => setShowInlineAdd(!showInlineAdd)}
              onRefresh={onRefresh}
              openIssues={openIssues}
            />
          )}
        </div>
      )}

      {/* Photo Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}>
            <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setLightboxUrl(null)}>
              <X className="h-8 w-8" />
            </button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={lightboxUrl} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
              onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Inline Add Entry (inside timeline) ─────────────────
function InlineAddEntry({ projectId, show, onToggle, onRefresh, openIssues }: {
  projectId: string; show: boolean; onToggle: () => void; onRefresh: () => void; openIssues: Activity[]
}) {
  const [addType, setAddType] = useState<string | null>(null)
  const [showTypeMenu, setShowTypeMenu] = useState(false)

  const handleClose = () => { setAddType(null); setShowTypeMenu(false); onToggle() }
  const handlePosted = () => { setAddType(null); setShowTypeMenu(false); if (show) onToggle(); onRefresh() }

  return (
    <div className="relative mb-6">
      {/* The "Add Entry" button — styled as a timeline node */}
      {!show ? (
        <div className="relative flex items-center gap-3">
          <button onClick={onToggle}
            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-blue-400/50 flex items-center justify-center z-10 transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="h-5 w-5 text-white" />
          </button>
          <button onClick={onToggle} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Add Entry
          </button>
        </div>
      ) : !addType ? (
        /* Type selector — inline in timeline */
        <div className="relative flex gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 border-2 border-blue-400/50 flex items-center justify-center z-10 shrink-0 shadow-lg shadow-blue-600/20">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 shadow-xl border border-blue-200/60 dark:border-blue-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">What would you like to add?</h4>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ENTRY_TYPES.map(et => {
                  const EntryIcon = et.icon
                  return (
                    <button key={et.type} onClick={() => setAddType(et.type)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${et.color}`}>
                        <EntryIcon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{et.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Type-specific form — inline in timeline */
        <div className="relative flex gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 shrink-0 border-2 ${ENTRY_TYPES.find(e => e.type === addType)?.color || ""} border-current/20`}>
            {(() => { const cfg = ENTRY_TYPES.find(e => e.type === addType); if (!cfg) return null; const I = cfg.icon; return <I className="h-5 w-5" /> })()}
          </div>
          <div className="flex-1">
            <EntryForm type={addType} projectId={projectId} onCancel={() => setAddType(null)} onPosted={handlePosted} openIssues={openIssues} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Type-Specific Entry Forms ──────────────────────────
function EntryForm({ type, projectId, onCancel, onPosted, openIssues }: {
  type: string; projectId: string; onCancel: () => void; onPosted: () => void; openIssues: Activity[]
}) {
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; type: string }[]>([])
  const [uploading, setUploading] = useState(false)
  // Issue-specific
  const [severity, setSeverity] = useState("medium")
  // Resolved-specific
  const [resolvedIssueId, setResolvedIssueId] = useState("")
  // Progress-specific
  const [progressValue, setProgressValue] = useState(50)
  // Milestone-specific
  const [milestoneTitle, setMilestoneTitle] = useState("")
  // Financial-specific
  const [financialType, setFinancialType] = useState("payment")
  const [financialAmount, setFinancialAmount] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append("file", file)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (res.ok) {
          const blob = await res.json()
          setUploadedFiles(prev => [...prev, { name: file.name, url: blob.url, type: file.type }])
        }
      } catch { /* ignore */ }
    }
    setUploading(false)
    e.target.value = ""
  }

  const removeFile = (idx: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))

  const submit = async () => {
    setSubmitting(true)
    const metadata: Record<string, unknown> = {}
    const attachmentUrls = uploadedFiles.map(f => f.url)

    if (type === "issue") metadata.severity = severity
    if (type === "resolved") metadata.resolvedIssueId = resolvedIssueId
    if (type === "progress") metadata.progressValue = progressValue
    if (type === "milestone") metadata.milestoneTitle = milestoneTitle
    if (type === "financial") { metadata.financialType = financialType; metadata.amount = parseFloat(financialAmount) || 0 }

    await fetch(`/api/admin/projects/${projectId}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        content: content.trim() || null,
        metadata: Object.keys(metadata).length ? metadata : null,
        attachmentUrls: attachmentUrls.length ? attachmentUrls : null,
      }),
    })
    setSubmitting(false)
    onPosted()
  }

  const canSubmit = () => {
    if (type === "note" && !content.trim()) return false
    if (type === "photo" && uploadedFiles.length === 0) return false
    if (type === "document" && uploadedFiles.length === 0) return false
    if (type === "issue" && !content.trim()) return false
    if (type === "resolved" && !resolvedIssueId) return false
    if (type === "milestone" && !milestoneTitle.trim()) return false
    if (type === "financial" && !financialAmount) return false
    return true
  }

  const label = ENTRY_TYPES.find(e => e.type === type)?.label || type

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white dark:bg-slate-800/90 shadow-xl border border-blue-200/60 dark:border-blue-500/20 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-white/3 border-b border-slate-100 dark:border-white/5">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">New {label} Entry</h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="h-4 w-4" /></button>
      </div>

      <div className="p-5 space-y-4">
        {/* ─── Note Form ─── */}
        {type === "note" && (
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="Write your note..." rows={4}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
        )}

        {/* ─── Photo Form ─── */}
        {type === "photo" && (
          <>
            {/* Upload zone */}
            <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-400 cursor-pointer bg-purple-50/50 dark:bg-purple-500/5 transition-colors">
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              {uploading ? (
                <div className="flex items-center gap-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" /><span className="text-sm text-purple-600">Uploading...</span></div>
              ) : (
                <><ImageIcon className="h-8 w-8 text-purple-400" /><span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Click to upload photos</span><span className="text-[10px] text-slate-400">JPG, PNG, WebP — multiple allowed</span></>
              )}
            </label>
            {/* Preview grid */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                    <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
                    <button onClick={() => removeFile(i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3 text-white" /></button>
                  </div>
                ))}
              </div>
            )}
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Add a caption (optional)..." rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </>
        )}

        {/* ─── Document Form ─── */}
        {type === "document" && (
          <>
            <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 hover:border-indigo-400 cursor-pointer bg-indigo-50/50 dark:bg-indigo-500/5 transition-colors">
              <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" onChange={handleFileUpload} className="hidden" />
              {uploading ? (
                <div className="flex items-center gap-2"><div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /><span className="text-sm text-indigo-600">Uploading...</span></div>
              ) : (
                <><Paperclip className="h-8 w-8 text-indigo-400" /><span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Click to upload documents</span><span className="text-[10px] text-slate-400">PDF, DOC, XLS, TXT, CSV</span></>
              )}
            </label>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700">
                    <FileText className="h-6 w-6 text-indigo-500 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Add a note about these documents (optional)..." rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </>
        )}

        {/* ─── Issue Form ─── */}
        {type === "issue" && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Severity</label>
              <div className="flex gap-2">
                {SEVERITY_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setSeverity(s.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${severity === s.value ? s.cls + " ring-2 ring-current/20" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Describe the issue in detail..." rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-red-200 dark:border-red-500/20 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none" />
            {/* Optional photo upload for issue */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/3 cursor-pointer text-xs text-slate-500 transition-colors">
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              <ImageIcon className="h-4 w-4" /> Attach photos (optional)
            </label>
            {uploadedFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden">
                    <img src={f.url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removeFile(i)} className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/60 flex items-center justify-center"><X className="h-2.5 w-2.5 text-white" /></button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── Resolved Form ─── */}
        {type === "resolved" && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Which issue is resolved?</label>
              {openIssues.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-2">No open issues to resolve.</p>
              ) : (
                <select value={resolvedIssueId} onChange={e => setResolvedIssueId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm">
                  <option value="">Select an issue...</option>
                  {openIssues.map(issue => {
                    const meta = issue.metadata ? JSON.parse(issue.metadata) : {}
                    return (
                      <option key={issue.id} value={issue.id}>
                        [{meta.severity || "?"} ] {(issue.content || "").slice(0, 60)}...
                      </option>
                    )
                  })}
                </select>
              )}
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="How was this issue resolved?" rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-emerald-200 dark:border-emerald-500/20 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
          </>
        )}

        {/* ─── Progress Form ─── */}
        {type === "progress" && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Project Progress</label>
              <div className="flex items-center gap-4">
                <input type="range" min={0} max={100} value={progressValue} onChange={e => setProgressValue(parseInt(e.target.value))}
                  className="flex-1 accent-cyan-500" />
                <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400 w-14 text-right">{progressValue}%</span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${progressValue}%` }} />
              </div>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="What progress was made?" rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </>
        )}

        {/* ─── Milestone Form ─── */}
        {type === "milestone" && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Milestone Name</label>
              <input type="text" value={milestoneTitle} onChange={e => setMilestoneTitle(e.target.value)}
                placeholder="e.g. Windows delivered to site"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-yellow-200 dark:border-yellow-500/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500/30" />
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Additional details (optional)..." rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </>
        )}

        {/* ─── Financial Form ─── */}
        {type === "financial" && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Transaction Type</label>
              <div className="flex gap-2">
                {FINANCIAL_TYPES.map(ft => {
                  const FtIcon = ft.icon
                  return (
                    <button key={ft.value} onClick={() => setFinancialType(ft.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${financialType === ft.value ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 ring-2 ring-green-500/20" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                      <FtIcon className="h-3.5 w-3.5" /> {ft.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Amount ($)</label>
              <input type="number" value={financialAmount} onChange={e => setFinancialAmount(e.target.value)}
                placeholder="0.00" step="0.01"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-green-200 dark:border-green-500/20 text-lg font-bold text-green-700 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/30" />
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Notes about this transaction (optional)..." rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 dark:bg-white/3 border-t border-slate-100 dark:border-white/5">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
        <button onClick={submit} disabled={submitting || !canSubmit()}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
          <Send className="h-3.5 w-3.5" /> {submitting ? "Posting..." : "Post Entry"}
        </button>
      </div>
    </motion.div>
  )
}

// ─── Activity Card (enhanced per-type rendering) ────────
function ActivityCard({ activity, onLightbox }: { activity: Activity; onLightbox: (url: string) => void }) {
  const cfg = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.note
  const Icon = cfg.icon
  const urls: string[] = activity.attachmentUrls ? JSON.parse(activity.attachmentUrls) : []
  const meta: Record<string, unknown> = activity.metadata ? JSON.parse(activity.metadata) : {}
  const time = new Date(activity.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // ─── Issue Card ───
  if (activity.type === "issue") {
    const sev = (meta.severity as string) || "medium"
    const sevCfg = SEVERITY_OPTIONS.find(s => s.value === sev) || SEVERITY_OPTIONS[1]
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1 rounded-xl bg-red-50/80 dark:bg-red-500/5 border border-red-200/60 dark:border-red-500/15 overflow-hidden">
          <div className="px-4 py-2 bg-red-100/50 dark:bg-red-500/10 border-b border-red-200/40 dark:border-red-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase">Issue Report</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sevCfg.cls}`}>{sevCfg.label}</span>
            </div>
            <span className="text-[10px] text-red-400">{time}</span>
          </div>
          <div className="px-4 py-3">
            {activity.content && <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.content}</p>}
            {urls.length > 0 && <PhotoRow urls={urls} onLightbox={onLightbox} />}
            <p className="text-[10px] text-red-400/70 mt-2">— {activity.author.name}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── Resolved Card ───
  if (activity.type === "resolved") {
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1 rounded-xl bg-emerald-50/80 dark:bg-emerald-500/5 border border-emerald-200/60 dark:border-emerald-500/15 overflow-hidden">
          <div className="px-4 py-2 bg-emerald-100/50 dark:bg-emerald-500/10 border-b border-emerald-200/40 dark:border-emerald-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Issue Resolved</span>
            </div>
            <span className="text-[10px] text-emerald-400">{time}</span>
          </div>
          <div className="px-4 py-3">
            {activity.content && <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.content}</p>}
            <p className="text-[10px] text-emerald-400/70 mt-2">— {activity.author.name}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── Photo Card ───
  if (activity.type === "photo") {
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-purple-500 uppercase tracking-wide">Photos</span>
            <span className="text-[10px] text-slate-400">{time}</span>
          </div>
          {urls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
              {urls.map((url, i) => (
                <button key={i} onClick={() => onLightbox(url)}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group cursor-pointer">
                  <img src={url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>
          )}
          {activity.content && <p className="text-sm text-slate-600 dark:text-slate-400 italic">{activity.content}</p>}
          <p className="text-[10px] text-slate-400 mt-1">— {activity.author.name}</p>
        </div>
      </motion.div>
    )
  }

  // ─── Document Card ───
  if (activity.type === "document" || activity.type === "file_uploaded") {
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wide">Document</span>
            <span className="text-[10px] text-slate-400">{time}</span>
          </div>
          {urls.length > 0 && (
            <div className="space-y-2 mb-2">
              {urls.map((url, i) => {
                const name = url.split("/").pop() || "file"
                return (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200/40 dark:border-indigo-500/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                    <FileText className="h-6 w-6 text-indigo-500 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{name}</span>
                    <Download className="h-4 w-4 text-indigo-400" />
                  </a>
                )
              })}
            </div>
          )}
          {activity.content && <p className="text-sm text-slate-600 dark:text-slate-400">{activity.content}</p>}
          <p className="text-[10px] text-slate-400 mt-1">— {activity.author.name}</p>
        </div>
      </motion.div>
    )
  }

  // ─── Progress Card ───
  if (activity.type === "progress") {
    const pv = (meta.progressValue as number) || 0
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-cyan-500 uppercase tracking-wide">Progress Update</span>
            <span className="text-[10px] text-slate-400">{time}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${pv}%` }} />
            </div>
            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{pv}%</span>
          </div>
          {activity.content && <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.content}</p>}
          <p className="text-[10px] text-slate-400 mt-1">— {activity.author.name}</p>
        </div>
      </motion.div>
    )
  }

  // ─── Milestone Card ───
  if (activity.type === "milestone") {
    const mTitle = (meta.milestoneTitle as string) || ""
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50/50 dark:from-yellow-500/5 dark:to-amber-500/5 border border-yellow-200/60 dark:border-yellow-500/15 overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{mTitle || "Milestone reached"}</p>
              {activity.content && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.content}</p>}
            </div>
          </div>
          <div className="px-4 pb-2 flex items-center justify-between">
            <p className="text-[10px] text-yellow-500/70">— {activity.author.name}</p>
            <span className="text-[10px] text-yellow-400">{time}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── Financial Card ───
  if (activity.type === "financial") {
    const amt = (meta.amount as number) || 0
    const ft = (meta.financialType as string) || "payment"
    const ftCfg = FINANCIAL_TYPES.find(f => f.value === ft)
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
        <div className="flex-1 rounded-xl bg-green-50/80 dark:bg-green-500/5 border border-green-200/60 dark:border-green-500/15 overflow-hidden">
          <div className="px-4 py-2 bg-green-100/50 dark:bg-green-500/10 border-b border-green-200/40 dark:border-green-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase">{ftCfg?.label || ft}</span>
            </div>
            <span className="text-[10px] text-green-400">{time}</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            {activity.content && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{activity.content}</p>}
            <p className="text-[10px] text-green-400/70 mt-2">— {activity.author.name}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── Default Card (note, status_change, task_completed, etc.) ───
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="relative flex gap-3">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}><Icon className="h-4 w-4" /></div>
      <div className="flex-1 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{activity.type.replace(/_/g, " ")}</span>
          <span className="text-[10px] text-slate-400">{time}</span>
        </div>
        {activity.content && <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.content}</p>}
        {urls.length > 0 && <PhotoRow urls={urls} onLightbox={onLightbox} />}
        <p className="text-[10px] text-slate-400 mt-1">— {activity.author.name}</p>
      </div>
    </motion.div>
  )
}

// ─── Shared Photo Row ───────────────────────────────────
function PhotoRow({ urls, onLightbox }: { urls: string[]; onLightbox: (url: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url, i) => (
        <button key={i} onClick={() => onLightbox(url)}
          className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer hover:ring-2 hover:ring-blue-500/40 transition-all">
          <img src={url} alt="" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  )
}
