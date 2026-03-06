"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { StatsCard } from "@/components/portal/stats-card"
import { PipelineStatus } from "@/components/portal/pipeline-status"
import { getProjectsByRole, getAppointmentsByRole, getInvoicesByRole, getThreadsByRole } from "@/lib/portal-data"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  FolderKanban,
  CalendarDays,
  Receipt,
  MessageSquare,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react"

export default function ClientDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""

  const projects = getProjectsByRole(userId, "client")
  const appointments = getAppointmentsByRole(userId, "client")
  const invoices = getInvoicesByRole(userId, "client")
  const threads = getThreadsByRole(userId, "client")
  const upcomingAppts = appointments.filter(a => a.status === "scheduled" || a.status === "confirmed")
  const unreadMessages = threads.reduce((sum, t) => sum + t.unreadCount, 0)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track your window &amp; door projects and stay updated.
        </p>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Projects" value={projects.length} icon={FolderKanban} color="blue" delay={0.05} />
        <StatsCard title="Upcoming Appointments" value={upcomingAppts.length} icon={CalendarDays} color="green" delay={0.1} />
        <StatsCard title="Invoices" value={invoices.length} icon={Receipt} color="purple" delay={0.15} />
        <StatsCard title="Unread Messages" value={unreadMessages} icon={MessageSquare} color="amber" delay={0.2} />
      </div>

      {/* Projects */}
      {projects.map((project, idx) => (
        <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + idx * 0.1 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{project.address}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {project.products.length} products • ${project.totalValue.toLocaleString()} total
              </p>
            </div>
            <IntlLink href="/portal/dashboard/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Details <ArrowRight className="h-3.5 w-3.5" />
            </IntlLink>
          </div>

          {/* Pipeline Progress */}
          <div className="mb-4">
            <PipelineStatus currentStage={project.stage} compact />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 capitalize">
              Current: <span className="font-medium text-blue-600 dark:text-blue-400">{project.stage.replace(/_/g, " ")}</span>
            </p>
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-white/3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Value</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">${project.totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deposit Paid</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">${project.depositPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Balance Due</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">${project.balanceDue.toLocaleString()}</p>
            </div>
          </div>

          {/* Products in project */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Products</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.products.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{p.location} — {p.windowType.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-slate-400">{p.width}&quot;×{p.height}&quot; • {p.color} • {p.glassType}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">×{p.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Upcoming Appointments */}
      {upcomingAppts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-500" /> Upcoming Appointments
          </h3>
          <div className="space-y-3">
            {upcomingAppts.map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{apt.type} Visit</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{apt.date} at {apt.time} • {apt.assignedName}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 font-medium">
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
