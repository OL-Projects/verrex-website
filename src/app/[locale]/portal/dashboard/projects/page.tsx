"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  FolderKanban, MapPin, DollarSign, Plus, Search,
  LayoutGrid, List, Clock, CheckCircle2, AlertTriangle,
  Image as ImageIcon, ListTodo, ArrowRight,
} from "lucide-react"

interface ProjectCard {
  id: string; title: string; description: string | null; status: string; type: string | null
  address: string | null; city: string | null; totalValue: number | null; progress: number
  priority: string; coverPhotoUrl: string | null; createdAt: string
  client: { id: string; name: string; email: string; phone: string | null }
  _count: { activities: number; tasks: number; attachments: number; appointments: number; invoices: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Pending", color: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400", icon: FolderKanban },
  completed: { label: "Completed", color: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400", icon: AlertTriangle },
}

const PRIORITY_DOT: Record<string, string> = {
  on_track: "bg-green-500", at_risk: "bg-amber-500", behind: "bg-red-500", on_hold: "bg-slate-400",
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"
  const [projects, setProjects] = useState<ProjectCard[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const url = isAdmin ? "/api/admin/projects" : "/api/portal/my-projects"
    fetch(url).then(r => r.json()).then(data => {
      setProjects(Array.isArray(data) ? data : [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [isAdmin])

  const filtered = projects.filter(p => {
    if (filter !== "all" && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.client?.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{projects.length} total projects</p>
        </motion.div>
        {isAdmin && (
          <IntlLink href="/portal/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Project
          </IntlLink>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search projects or clients..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "in_progress", "completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
              {f === "all" ? "All" : f.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white/60 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/10 p-1">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-md ${view === "grid" ? "bg-blue-600 text-white" : "text-slate-400"}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-md ${view === "list" ? "bg-blue-600 text-white" : "text-slate-400"}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FolderKanban className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No projects found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{search ? "Try a different search term" : "Create your first project to get started"}</p>
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, idx) => {
            const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending
            const StatusIcon = cfg.icon
            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <IntlLink href={`/portal/dashboard/projects/${project.id}`}
                  className="block p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all hover:shadow-lg group">
                  {/* Cover photo or placeholder */}
                  <div className="h-32 rounded-xl mb-4 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    {project.coverPhotoUrl ? (
                      <img src={project.coverPhotoUrl} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <FolderKanban className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>

                  {/* Title + Status */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{project.title}</h3>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${cfg.color}`}>
                      <StatusIcon className="h-3 w-3" /> {cfg.label}
                    </span>
                  </div>

                  {/* Client */}
                  {project.client && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">👤 {project.client.name}</p>
                  )}

                  {/* Address */}
                  {project.address && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" /> {project.address}{project.city ? `, ${project.city}` : ""}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><ListTodo className="h-3 w-3" /> {project._count?.tasks || 0}</span>
                      <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {project._count?.attachments || 0}</span>
                    </div>
                    {project.totalValue && (
                      <span className="font-medium text-slate-600 dark:text-slate-300">${project.totalValue.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Priority dot */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={`h-2 w-2 rounded-full ${PRIORITY_DOT[project.priority] || PRIORITY_DOT.on_track}`} />
                    <span className="text-[10px] text-slate-400 capitalize">{project.priority.replace(/_/g, " ")}</span>
                  </div>
                </IntlLink>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((project, idx) => {
            const cfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending
            const StatusIcon = cfg.icon
            return (
              <motion.div key={project.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                <IntlLink href={`/portal/dashboard/projects/${project.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all group">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${PRIORITY_DOT[project.priority] || PRIORITY_DOT.on_track}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 truncate">{project.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {project.client?.name}{project.city ? ` • ${project.city}` : ""}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{project._count?.tasks || 0} tasks</span>
                    <span>{project._count?.attachments || 0} files</span>
                  </div>
                  <div className="w-20">
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-0.5">{project.progress}%</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.color}`}>
                    <StatusIcon className="h-3 w-3" /> {cfg.label}
                  </span>
                  {project.totalValue && <span className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">${project.totalValue.toLocaleString()}</span>}
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                </IntlLink>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
