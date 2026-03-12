"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  ArrowLeft, FolderKanban, MapPin, User, Phone, Mail,
  Clock, CheckCircle2, Plus, Upload,
  FileText, Image as ImageIcon, CheckSquare, Square, ListTodo,
  Users, Receipt, Paperclip,
} from "lucide-react"
import ActivityTimeline from "@/components/portal/ActivityTimeline"

// ─── Types ──────────────────────────────────────────────
interface ProjectDetail {
  id: string; title: string; description: string | null; status: string; type: string | null
  address: string | null; city: string | null; postalCode: string | null; totalValue: number | null
  progress: number; priority: string; coverPhotoUrl: string | null; notes: string | null
  startDate: string | null; endDate: string | null; createdAt: string
  client: { id: string; name: string; email: string; phone: string | null; company: string | null; address: string | null; city: string | null }
  teamMembers: { id: string; role: string; user: { id: string; name: string; email: string; role: string } }[]
  _count: { activities: number; tasks: number; attachments: number; appointments: number; invoices: number }
}
interface Activity { id: string; type: string; content: string | null; metadata: string | null; attachmentUrls: string | null; authorId: string; createdAt: string; author: { id: string; name: string; role: string } }
interface Task { id: string; title: string; description: string | null; status: string; priority: string; category: string; dueDate: string | null; completedAt: string | null; assignee: { id: string; name: string } | null; createdAt: string }
interface Attachment { id: string; fileName: string; fileUrl: string; fileSize: number | null; fileType: string | null; category: string; caption: string | null; createdAt: string; uploadedBy: { id: string; name: string } }

type TabKey = "overview" | "activity" | "tasks" | "files" | "team" | "invoices"

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: FolderKanban },
  { key: "activity", label: "Activity", icon: Clock },
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "files", label: "Files", icon: Paperclip },
  { key: "team", label: "Team", icon: Users },
  { key: "invoices", label: "Invoices", icon: Receipt },
]


// ─── Main Component ─────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [files, setFiles] = useState<Attachment[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [loading, setLoading] = useState(true)

  const loadProject = useCallback(() => {
    fetch(`/api/admin/projects/${id}`).then(r => r.json()).then(setProject).catch(console.error)
  }, [id])

  const loadActivities = useCallback(() => {
    fetch(`/api/admin/projects/${id}/activity`).then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : [])).catch(console.error)
  }, [id])

  const loadTasks = useCallback(() => {
    fetch(`/api/admin/projects/${id}/tasks`).then(r => r.json()).then(d => setTasks(Array.isArray(d) ? d : [])).catch(console.error)
  }, [id])

  const loadFiles = useCallback(() => {
    fetch(`/api/admin/projects/${id}/files`).then(r => r.json()).then(d => setFiles(Array.isArray(d) ? d : [])).catch(console.error)
  }, [id])

  useEffect(() => {
    Promise.all([loadProject(), loadActivities(), loadTasks(), loadFiles()])
      .finally(() => setLoading(false))
  }, [loadProject, loadActivities, loadTasks, loadFiles])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /></div>
  if (!project) return <div className="text-center py-16"><h2 className="text-lg text-slate-500">Project not found</h2></div>

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <IntlLink href="/portal/dashboard/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </IntlLink>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{project.client?.name}{project.city ? ` • ${project.city}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{project.progress}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5"}`}>
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeTab === "overview" && <OverviewTab project={project} tasks={tasks} files={files} />}
          {activeTab === "activity" && <ActivityTimeline activities={activities} projectId={id} isAdmin={isAdmin} onRefresh={() => { loadActivities(); loadProject() }} />}
          {activeTab === "tasks" && <TasksTab tasks={tasks} projectId={id} isAdmin={isAdmin} onRefresh={() => { loadTasks(); loadActivities() }} />}
          {activeTab === "files" && <FilesTab files={files} projectId={id} isAdmin={isAdmin} onRefresh={() => { loadFiles(); loadActivities() }} />}
          {activeTab === "team" && <TeamTab project={project} />}
          {activeTab === "invoices" && <InvoicesTab projectId={id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Overview Tab ───────────────────────────────────────
function OverviewTab({ project, tasks, files }: { project: ProjectDetail; tasks: Task[]; files: Attachment[] }) {
  const doneTasks = tasks.filter(t => t.status === "done").length
  const photos = files.filter(f => f.category === "photo")
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Info Card */}
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Project Details</h3>
          {project.description && <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500 dark:text-slate-400">Type</span><p className="font-medium text-slate-900 dark:text-white capitalize mt-0.5">{project.type?.replace(/_/g, " ") || "—"}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Status</span><p className="font-medium text-slate-900 dark:text-white capitalize mt-0.5">{project.status.replace(/_/g, " ")}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Address</span><p className="font-medium text-slate-900 dark:text-white mt-0.5">{project.address || "—"}{project.city ? `, ${project.city}` : ""}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Value</span><p className="font-medium text-slate-900 dark:text-white mt-0.5">{project.totalValue ? `$${project.totalValue.toLocaleString()}` : "—"}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">Start Date</span><p className="font-medium text-slate-900 dark:text-white mt-0.5">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</p></div>
            <div><span className="text-slate-500 dark:text-slate-400">End Date</span><p className="font-medium text-slate-900 dark:text-white mt-0.5">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}</p></div>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{doneTasks}/{tasks.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Tasks Done</p>
          </div>
          <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{photos.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Photos</p>
          </div>
          <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{project._count.activities}</p>
            <p className="text-[11px] text-slate-500 mt-1">Activity Entries</p>
          </div>
          <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{project._count.invoices}</p>
            <p className="text-[11px] text-slate-500 mt-1">Invoices</p>
          </div>
        </div>
      </div>
      {/* Client Card */}
      <div className="space-y-4">
        <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><User className="h-4 w-4 text-blue-500" /> Client</h3>
          <div className="space-y-3 text-sm">
            <p className="font-medium text-slate-900 dark:text-white">{project.client.name}</p>
            {project.client.company && <p className="text-slate-500">{project.client.company}</p>}
            {project.client.email && <p className="flex items-center gap-2 text-slate-500"><Mail className="h-3.5 w-3.5" />{project.client.email}</p>}
            {project.client.phone && <p className="flex items-center gap-2 text-slate-500"><Phone className="h-3.5 w-3.5" />{project.client.phone}</p>}
            {project.client.address && <p className="flex items-center gap-2 text-slate-500"><MapPin className="h-3.5 w-3.5" />{project.client.address}</p>}
          </div>
        </div>
        {project.teamMembers.length > 0 && (
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-green-500" /> Team</h3>
            <div className="space-y-2">
              {project.teamMembers.map(tm => (
                <div key={tm.id} className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">{tm.user.name.charAt(0)}</div>
                  <div><p className="text-xs font-medium text-slate-900 dark:text-white">{tm.user.name}</p><p className="text-[10px] text-slate-400 capitalize">{tm.role.replace(/_/g, " ")}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tasks Tab ──────────────────────────────────────────
function TasksTab({ tasks, projectId, isAdmin, onRefresh }: { tasks: Task[]; projectId: string; isAdmin: boolean; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("medium")
  const [category, setCategory] = useState("other")
  const [submitting, setSubmitting] = useState(false)

  const addTask = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    await fetch(`/api/admin/projects/${projectId}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), priority, category }),
    })
    setTitle(""); setShowAdd(false); setSubmitting(false); onRefresh()
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done"
    await fetch(`/api/admin/projects/${projectId}/tasks`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: newStatus }),
    })
    onRefresh()
  }

  const todoTasks = tasks.filter(t => t.status !== "done")
  const doneTasks = tasks.filter(t => t.status === "done")

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          <span className="text-slate-500">All {tasks.length}</span>
          <span className="text-amber-600">{todoTasks.length} to do</span>
          <span className="text-green-600">{doneTasks.length} done</span>
        </div>
        {isAdmin && <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"><Plus className="h-4 w-4" /> New Task</button>}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-blue-200 dark:border-blue-500/20">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title..."
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          <div className="flex gap-2 mb-3">
            {["low", "medium", "high", "urgent"].map(p => (
              <button key={p} onClick={() => setPriority(p)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${priority === p ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>{p}</button>
            ))}
          </div>
          <div className="flex justify-between">
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-2 py-1 rounded-md text-xs bg-slate-100 dark:bg-slate-700 border-0">
              {["measurement", "delivery", "installation", "inspection", "punch_list", "admin", "other"].map(c => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-500">Cancel</button>
              <button onClick={addTask} disabled={submitting} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">{submitting ? "Adding..." : "Add Task"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12"><ListTodo className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-500">No tasks yet</p></div>
      ) : (
        <div className="space-y-2">
          {[...todoTasks, ...doneTasks].map(task => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${task.status === "done" ? "bg-slate-50/50 dark:bg-white/2 border-slate-100 dark:border-white/3 opacity-60" : "bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10"}`}>
              <button onClick={() => isAdmin && toggleTask(task.id, task.status)} className="shrink-0">
                {task.status === "done" ? <CheckSquare className="h-5 w-5 text-green-500" /> : <Square className="h-5 w-5 text-slate-300 dark:text-slate-600 hover:text-blue-500" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${task.priority === "urgent" ? "bg-red-100 text-red-700" : task.priority === "high" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{task.priority}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{task.category.replace(/_/g, " ")}</span>
                  {task.assignee && <span className="text-[10px] text-slate-400">• {task.assignee.name}</span>}
                </div>
              </div>
              {task.dueDate && <span className="text-[10px] text-slate-400 shrink-0">{new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Files Tab ──────────────────────────────────────────
function FilesTab({ files, projectId, isAdmin, onRefresh }: { files: Attachment[]; projectId: string; isAdmin: boolean; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = async (fileList: File[]) => {
    if (!fileList.length) return
    setUploading(true); setUploadError("")
    let successCount = 0

    for (const file of fileList) {
      try {
        const form = new FormData()
        form.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }))
          throw new Error(err.error || `Upload failed (${res.status})`)
        }
        const blob = await res.json()
        const isImage = file.type.startsWith("image/")
        await fetch(`/api/admin/projects/${projectId}/files`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileUrl: blob.url, fileSize: file.size, fileType: file.type, category: isImage ? "photo" : "document" }),
        })
        successCount++
      } catch (err) {
        console.error("Upload error:", err)
        setUploadError(err instanceof Error ? err.message : "Upload failed")
      }
    }
    setUploading(false)
    if (successCount > 0) onRefresh()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    await uploadFiles(Array.from(e.target.files))
    e.target.value = ""
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length) await uploadFiles(droppedFiles)
  }

  const photos = files.filter(f => f.fileType?.startsWith("image/"))
  const docs = files.filter(f => !f.fileType?.startsWith("image/"))

  return (
    <div className="space-y-6">
      {isAdmin && (
        <>
          <label
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`flex items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all bg-white/30 dark:bg-white/2 ${dragOver ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.01]" : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"}`}>
            <input type="file" multiple onChange={handleUpload} className="hidden" accept="image/*,.pdf,.doc,.docx,.xlsx,.zip" />
            {uploading ? (
              <><div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /><span className="text-sm text-blue-600">Uploading...</span></>
            ) : dragOver ? (
              <><Upload className="h-6 w-6 text-blue-500" /><span className="text-sm text-blue-600 font-medium">Drop files here</span></>
            ) : (
              <><Upload className="h-6 w-6 text-slate-400" /><span className="text-sm text-slate-500">Click or drag & drop to upload (photos, PDFs, documents)</span></>
            )}
          </label>
          {uploadError && (
            <div className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
              <span>⚠ {uploadError}</span>
              <button onClick={() => setUploadError("")} className="text-red-400 hover:text-red-600 text-xs ml-2">dismiss</button>
            </div>
          )}
        </>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-purple-500" /> Photos ({photos.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map(photo => (
              <a key={photo.id} href={photo.fileUrl} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group relative">
                <img src={photo.fileUrl} alt={photo.fileName} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{photo.fileName}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {docs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500" /> Documents ({docs.length})</h3>
          <div className="space-y-2">
            {docs.map(doc => (
              <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-blue-300 transition-all">
                <FileText className="h-8 w-8 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.fileName}</p>
                  <p className="text-[10px] text-slate-400">{doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ""} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !uploading && (
        <div className="text-center py-12"><Paperclip className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-500">No files uploaded yet</p></div>
      )}
    </div>
  )
}

// ─── Team Tab ───────────────────────────────────────────
function TeamTab({ project }: { project: ProjectDetail }) {
  return (
    <div className="max-w-2xl">
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Team Members</h3>
        {project.teamMembers.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No team members assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {project.teamMembers.map(tm => (
              <div key={tm.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">{tm.user.name.charAt(0)}</div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-900 dark:text-white">{tm.user.name}</p><p className="text-xs text-slate-500 capitalize">{tm.role.replace(/_/g, " ")} • {tm.user.email}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Invoices Tab ───────────────────────────────────────
function InvoicesTab({ projectId }: { projectId: string }) {
  const [invoices, setInvoices] = useState<{ id: string; number: string; total: number; status: string; dueDate: string | null; createdAt: string }[]>([])
  useEffect(() => {
    fetch(`/api/admin/projects`).then(r => r.json()).then(() => {
      // For now, show placeholder — invoices are linked via project relation
    }).catch(console.error)
  }, [projectId])

  return (
    <div className="max-w-2xl">
      <div className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Receipt className="h-4 w-4 text-purple-500" /> Project Invoices</h3>
        <p className="text-sm text-slate-500 py-6 text-center">Invoice management for this project — coming soon.</p>
      </div>
    </div>
  )
}
