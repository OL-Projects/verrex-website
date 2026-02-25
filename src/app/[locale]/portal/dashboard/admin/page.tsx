"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { StatsCard } from "@/components/portal/stats-card"
import { PipelineStatus } from "@/components/portal/pipeline-status"
import { mockLeads, mockProjects, mockAppointments, mockOrders } from "@/lib/portal-data"
import { PIPELINE_STAGES } from "@/types/portal"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  UserPlus,
  FolderKanban,
  DollarSign,
  Clock,
  CalendarDays,
  AlertTriangle,
  ArrowRight,
  Building2,
  TrendingUp,
} from "lucide-react"

export default function AdminDashboard() {
  const { data: session } = useSession()

  const totalLeads = mockLeads.length
  const activeProjects = mockProjects.length
  const totalRevenue = mockProjects.reduce((sum, p) => sum + p.totalValue, 0)
  const pendingApprovals = mockLeads.filter(l => l.stage === "quote_prepared").length
  const upcomingAppts = mockAppointments.filter(a => a.status === "scheduled" || a.status === "confirmed")
  const urgentLeads = mockLeads.filter(l => l.priority === "urgent")

  // Pipeline distribution
  const pipelineCounts = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: mockLeads.filter(l => l.stage === stage.key).length + mockProjects.filter(p => p.stage === stage.key).length,
  }))

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s your business overview for today.
        </p>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Leads" value={totalLeads} change={12} icon={UserPlus} color="blue" delay={0.05} />
        <StatsCard title="Active Projects" value={activeProjects} change={8} icon={FolderKanban} color="green" delay={0.1} />
        <StatsCard title="Revenue Pipeline" value={`$${(totalRevenue / 1000).toFixed(1)}K`} change={15} icon={DollarSign} color="purple" delay={0.15} />
        <StatsCard title="Pending Approvals" value={pendingApprovals} icon={Clock} color="amber" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent / Priority Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Leads</h3>
            <IntlLink href="/portal/dashboard/leads" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </IntlLink>
          </div>
          <div className="space-y-3">
            {mockLeads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3 hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  lead.priority === "urgent" ? "bg-red-100 dark:bg-red-500/15" :
                  lead.priority === "high" ? "bg-amber-100 dark:bg-amber-500/15" :
                  "bg-blue-100 dark:bg-blue-500/15"
                }`}>
                  {lead.priority === "urgent" ? <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" /> :
                   <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{lead.clientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lead.address}, {lead.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    lead.source === "home_depot" ? "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400" :
                    lead.source === "website" ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400" :
                    "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400"
                  }`}>
                    {lead.source.replace("_", " ")}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{lead.stage.replace(/_/g, " ")}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pipeline Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pipeline Distribution</h3>
          <div className="space-y-2">
            {pipelineCounts.filter(p => p.count > 0).map((stage) => (
              <div key={stage.key} className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{stage.label}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{stage.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Appointments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            Upcoming Appointments
          </h3>
          <IntlLink href="/portal/dashboard/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </IntlLink>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcomingAppts.map((apt) => (
            <div key={apt.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium uppercase">
                  {apt.type}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  apt.status === "confirmed" ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" :
                  "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                }`}>{apt.status}</span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.clientName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{apt.date} at {apt.time}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">{apt.address}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
