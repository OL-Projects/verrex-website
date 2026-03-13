"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Camera, Paperclip, Plus, X, Send, Upload,
  FileText, Trash2,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface Annotation {
  id: string
  activityId: string
  position: string // "before" | "at" | "after"
  type: string // "note" | "photo" | "attachment"
  content: string | null
  attachmentUrls: string | null
  authorId: string
  createdAt: string
  author: { id: string; name: string; role: string }
}

type BulletPosition = "before" | "at" | "after"
type AnnotationType = "note" | "photo" | "attachment"

interface Props {
  activityIds: string[] // ordered list of activity IDs (matches the left timeline)
  annotations: Annotation[]
  projectId: string
  currentUserId: string
  onAnnotationAdded: () => void
}

const TYPE_OPTIONS: { type: AnnotationType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { type: "note", label: "Note", icon: MessageSquare, color: "text-blue-500 bg-blue-100 dark:bg-blue-500/15" },
  { type: "photo", label: "Photo", icon: Camera, color: "text-purple-500 bg-purple-100 dark:bg-purple-500/15" },
  { type: "attachment", label: "File", icon: Paperclip, color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-500/15" },
]

// ─── Main Rail ──────────────────────────────────────────
export default function ClientAnnotationRail({ activityIds, annotations, projectId, currentUserId, onAnnotationAdded }: Props) {
  const [activeForm, setActiveForm] = useState<{ activityId: string; position: BulletPosition } | null>(null)

  // Group annotations by activityId+position
  const annotationMap = new Map<string, Annotation[]>()
  annotations.forEach(a => {
    const key = `${a.activityId}:${a.position}`
    if (!annotationMap.has(key)) annotationMap.set(key, [])
    annotationMap.get(key)!.push(a)
  })

  return (
    <div className="relative flex flex-col">
      {/* Vertical line for client rail */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-300 via-teal-200 to-slate-200 dark:from-emerald-500/30 dark:via-teal-500/20 dark:to-slate-700" />

      {activityIds.map((activityId) => (
        <ActivityBullets
          key={activityId}
          activityId={activityId}
          annotationMap={annotationMap}
          projectId={projectId}
          currentUserId={currentUserId}
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          onAnnotationAdded={onAnnotationAdded}
        />
      ))}
    </div>
  )
}

// ─── Bullet Group for One Activity Card ─────────────────
function ActivityBullets({
  activityId, annotationMap, projectId, currentUserId, activeForm, setActiveForm, onAnnotationAdded,
}: {
  activityId: string
  annotationMap: Map<string, Annotation[]>
  projectId: string
  currentUserId: string
  activeForm: { activityId: string; position: BulletPosition } | null
  setActiveForm: (v: { activityId: string; position: BulletPosition } | null) => void
  onAnnotationAdded: () => void
}) {
  const positions: BulletPosition[] = ["before", "at", "after"]

  return (
    <div className="flex flex-col gap-1 py-2 min-h-[80px] justify-center">
      {positions.map(pos => {
        const key = `${activityId}:${pos}`
        const existing = annotationMap.get(key) || []
        const isActive = activeForm?.activityId === activityId && activeForm?.position === pos

        return (
          <div key={pos} className="relative flex items-start gap-2">
            {/* Bullet dot */}
            <button
              onClick={() => {
                if (isActive) setActiveForm(null)
                else setActiveForm({ activityId, position: pos })
              }}
              className={`relative z-10 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                existing.length > 0
                  ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                  : isActive
                    ? "bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20 scale-110"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-teal-400 dark:hover:border-teal-500 hover:scale-110"
              }`}
              title={`Add ${pos} annotation`}
            >
              {existing.length > 0 ? (
                <span className="text-[8px] font-bold">{existing.length}</span>
              ) : (
                <Plus className="h-2.5 w-2.5 text-slate-400" />
              )}
            </button>

            {/* Existing annotations + inline form */}
            <div className="flex-1 min-w-0">
              {/* Show existing annotations */}
              {existing.map(ann => (
                <AnnotationCard key={ann.id} annotation={ann} projectId={projectId} currentUserId={currentUserId} onDeleted={onAnnotationAdded} />
              ))}

              {/* Inline form */}
              <AnimatePresence>
                {isActive && (
                  <AnnotationForm
                    activityId={activityId}
                    position={pos}
                    projectId={projectId}
                    onCancel={() => setActiveForm(null)}
                    onPosted={() => { setActiveForm(null); onAnnotationAdded() }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Annotation Card (displayed when filled) ────────────
function AnnotationCard({ annotation, projectId, currentUserId, onDeleted }: {
  annotation: Annotation; projectId: string; currentUserId: string; onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const urls: string[] = annotation.attachmentUrls ? JSON.parse(annotation.attachmentUrls) : []
  const canDelete = annotation.authorId === currentUserId
  const typeCfg = TYPE_OPTIONS.find(t => t.type === annotation.type) || TYPE_OPTIONS[0]
  const TypeIcon = typeCfg.icon

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/portal/my-projects/${projectId}/annotations?annotationId=${annotation.id}`, { method: "DELETE" })
    onDeleted()
  }

  return (
    <div className="mb-1.5 p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-emerald-200/50 dark:border-emerald-500/10 backdrop-blur-sm group">
      <div className="flex items-start gap-2">
        <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${typeCfg.color}`}>
          <TypeIcon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          {annotation.content && (
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{annotation.content}</p>
          )}
          {urls.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {urls.map((url, i) => {
                const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
                return isImage ? (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </a>
                ) : (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-400 hover:bg-slate-200">
                    <FileText className="h-3 w-3" /> {url.split("/").pop()?.slice(0, 20)}
                  </a>
                )
              })}
            </div>
          )}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-slate-400">{annotation.author.name} • {new Date(annotation.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {canDelete && (
              <button onClick={handleDelete} disabled={deleting} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Annotation Form (inline mini-form) ─────────────────
function AnnotationForm({ activityId, position, projectId, onCancel, onPosted }: {
  activityId: string; position: BulletPosition; projectId: string; onCancel: () => void; onPosted: () => void
}) {
  const [step, setStep] = useState<"pick" | "fill">("pick")
  const [type, setType] = useState<AnnotationType>("note")
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    for (const file of Array.from(e.target.files)) {
      const form = new FormData()
      form.append("file", file)
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (res.ok) {
          const blob = await res.json()
          setFiles(prev => [...prev, { name: file.name, url: blob.url }])
        }
      } catch { /* ignore */ }
    }
    setUploading(false)
    e.target.value = ""
  }

  const submit = async () => {
    setSubmitting(true)
    await fetch(`/api/portal/my-projects/${projectId}/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId,
        position,
        type,
        content: content.trim() || null,
        attachmentUrls: files.length ? files.map(f => f.url) : null,
      }),
    })
    setSubmitting(false)
    onPosted()
  }

  const canSubmit = type === "note" ? content.trim().length > 0 : files.length > 0

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl bg-white dark:bg-slate-800/95 shadow-xl border border-teal-200/50 dark:border-teal-500/20 backdrop-blur-xl overflow-hidden">

      {step === "pick" ? (
        /* Step 1: Pick type */
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              {position === "before" ? "↑ Before" : position === "at" ? "→ About" : "↓ After"} this entry
            </span>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
          </div>
          <div className="flex gap-1.5">
            {TYPE_OPTIONS.map(opt => {
              const OptIcon = opt.icon
              return (
                <button key={opt.type} onClick={() => { setType(opt.type); setStep("fill") }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${opt.color}`}>
                    <OptIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Step 2: Fill content */
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep("pick")} className="text-[10px] text-teal-500 hover:underline">← back</button>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">{type}</span>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
          </div>

          {/* Note input */}
          {type === "note" && (
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Your note or question..." rows={2} autoFocus
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none" />
          )}

          {/* Photo upload */}
          {type === "photo" && (
            <>
              <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-600 bg-purple-50/30 dark:bg-purple-500/5 cursor-pointer hover:border-purple-400">
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                {uploading ? (
                  <span className="text-xs text-purple-500">Uploading...</span>
                ) : (
                  <><Camera className="h-5 w-5 text-purple-400" /><span className="text-xs text-purple-500">Upload photo(s)</span></>
                )}
              </label>
              {files.length > 0 && (
                <div className="flex gap-1.5">
                  {files.map((f, i) => (
                    <div key={i} className="relative h-10 w-10 rounded-lg overflow-hidden">
                      <img src={f.url} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-0 right-0 h-4 w-4 rounded-full bg-black/60 flex items-center justify-center">
                        <X className="h-2.5 w-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Caption (optional)..." rows={1}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none resize-none" />
            </>
          )}

          {/* Attachment upload */}
          {type === "attachment" && (
            <>
              <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-600 bg-indigo-50/30 dark:bg-indigo-500/5 cursor-pointer hover:border-indigo-400">
                <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip" onChange={handleFileUpload} className="hidden" />
                {uploading ? (
                  <span className="text-xs text-indigo-500">Uploading...</span>
                ) : (
                  <><Upload className="h-5 w-5 text-indigo-400" /><span className="text-xs text-indigo-500">Upload file(s)</span></>
                )}
              </label>
              {files.length > 0 && (
                <div className="space-y-1">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 text-xs">
                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="flex-1 truncate text-slate-600 dark:text-slate-400">{f.name}</span>
                      <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Note about this file (optional)..." rows={1}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none resize-none" />
            </>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-1.5">
            <button onClick={onCancel} className="px-2.5 py-1.5 text-[10px] text-slate-500">Cancel</button>
            <button onClick={submit} disabled={submitting || !canSubmit}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-lg text-[10px] font-medium transition-colors">
              <Send className="h-3 w-3" /> {submitting ? "..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
