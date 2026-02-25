"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { StatsCard } from "@/components/portal/stats-card"
import { PipelineStatus } from "@/components/portal/pipeline-status"
import { getProjectsByRole, getAppointmentsByRole, mockMeasurements } from "@/lib/portal-data"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  Wrench,
  CalendarDays,
  Ruler,
  FolderKanban,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

export default function ContractorDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""

  const projects = getProjectsByRole(userId, "contractor")
  const appointments = getAppointmentsByRole(userId, "contractor")
  const upcomingAppts = appointments.filter(a => a.status === "scheduled" || a.status === "confirmed")
  const completedAppts = appointments.filter(a => a.status === "completed")
  const measurements = mockMeasurements.filter(m => m.measuredBy === userId)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Hey, {session?.user?.name?.split(" ")[0]} 🔧
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here are your assigned jobs and upcoming schedule.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Assigned Projects" value={projects.length} icon={FolderKanban} color="blue" delay={0.05} />
        <StatsCard title="Upcoming Visits" value={upcomingAppts.length} icon={CalendarDays} color="green" delay={0.1} />
        <StatsCard title="Measurements Done" value={measurements.length} icon={Ruler} color="purple" delay={0.15} />
        <StatsCard title="Completed Visits" value={completedAppts.length} icon={CheckCircle2} color="cyan" delay={0.2} />
      </div>

      {/* Today's Schedule */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-500" /> Upcoming Schedule
        </h3>
        {upcomingAppts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcomingAppts.map(apt => (
              <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                  apt.type === "installation" ? "bg-amber-100 dark:bg-amber-500/15" :
                  apt.type === "measurement" ? "bg-purple-100 dark:bg-purple-500/15" :
                  "bg-blue-100 dark:bg-blue-500/15"
                }`}>
                  {apt.type === "installation" ? <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" /> :
                   apt.type === "measurement" ? <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" /> :
                   <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.clientName}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium uppercase">{apt.type}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{apt.date} at {apt.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.address}</span>
                  </div>
                  {apt.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">{apt.notes}</p>}
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  apt.status === "confirmed" ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" :
                  "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                }`}>{apt.status}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Assigned Projects */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Projects</h3>
          <IntlLink href="/portal/dashboard/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </IntlLink>
        </div>
        <div className="space-y-3">
          {projects.map(project => (
            <div key={project.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{project.clientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />{project.address}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium capitalize">
                  {project.stage.replace(/_/g, " ")}
                </span>
              </div>
              <PipelineStatus currentStage={project.stage} compact />
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{project.products.length} products</span>
                <span>${project.totalValue.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
