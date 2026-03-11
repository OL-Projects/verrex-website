"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  FolderKanban, CalendarDays, FileText, MessageSquare,
  Clock, CheckCircle2, AlertCircle, ArrowRight,
} from "lucide-react"

interface Project {
  id: string; title: string; status: string; type: string | null
  description: string | null; address: string | null; city: string | null
  startDate: string | null; totalValue: number | null; createdAt: string
  _count: { appointments: number; invoices: number }
}

interface Appointment {
  id: string; title: string; type: string; status: string
  date: string; time: string | null; location: string | null
  project: { id: string; title: string } | null
}

interface Invoice {
  id: string; number: string; amount: number; total: number
  status: string; dueDate: string | null; description: string | null
  project: { id: string; title: string } | null
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Pending", color: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400", icon: FolderKanban },
  completed: { label: "Completed", color: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400", icon: AlertCircle },
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/my-projects").then(r => r.json()),
      fetch("/api/portal/my-appointments").then(r => r.json()),
      fetch("/api/portal/my-invoices").then(r => r.json()),
    ]).then(([p, a, i]) => {
      setProjects(Array.isArray(p) ? p : [])
      setAppointments(Array.isArray(a) ? a : [])
      setInvoices(Array.isArray(i) ? i : [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  const activeProjects = projects.filter(p => p.status === "in_progress")
  const upcomingAppts = appointments.filter(a => a.status === "scheduled" || a.status === "confirmed")
  const unpaidInvoices = invoices.filter(i => i.status === "sent" || i.status === "overdue")

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your VEREX client portal — track projects, appointments, and invoices.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-500/15">
              <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">My Projects</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">{activeProjects.length} active</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-500/15">
              <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Appointments</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{appointments.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">{upcomingAppts.length} upcoming</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-500/15">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Invoices</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{invoices.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">{unpaidInvoices.length} pending</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-500/15">
              <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Messages</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
          <p className="text-[11px] text-slate-400 mt-1">Coming soon</p>
        </motion.div>
      </div>

      {/* Projects */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-blue-500" /> My Projects
        </h3>
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">No projects yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Once VEREX assigns a project to your account, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const cfg = statusConfig[project.status] || statusConfig.pending
              const StatusIcon = cfg.icon
              return (
                <div key={project.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">{project.title}</h4>
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      <StatusIcon className="h-3 w-3" /> {cfg.label}
                    </span>
                  </div>
                  {project.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{project.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {project.type && <span className="capitalize">{project.type.replace(/_/g, " ")}</span>}
                    {project.address && <span>{project.address}{project.city ? `, ${project.city}` : ""}</span>}
                    <span>{project._count.appointments} appts</span>
                    <span>{project._count.invoices} invoices</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Appointments + Invoices side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-green-500" /> My Appointments
          </h3>
          {appointments.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">No appointments scheduled.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      apt.status === "confirmed" ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" :
                      apt.status === "completed" ? "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400" :
                      "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    }`}>{apt.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(apt.date).toLocaleDateString()}{apt.time ? ` at ${apt.time}` : ""}
                  </p>
                  {apt.project && <p className="text-[11px] text-slate-400 mt-1">Project: {apt.project.title}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Invoices */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" /> My Invoices
          </h3>
          {invoices.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">No invoices yet.</p>
          ) : (
            <div className="space-y-3">
              {invoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">#{inv.number}</p>
                    {inv.description && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{inv.description}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">${inv.total.toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      inv.status === "paid" ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" :
                      inv.status === "overdue" ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400" :
                      "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    }`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
