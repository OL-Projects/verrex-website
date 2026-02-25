"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { StatsCard } from "@/components/portal/stats-card"
import { PipelineStatus } from "@/components/portal/pipeline-status"
import { getLeadsByRole, getProjectsByRole, getCommissionsByPartner, mockPartners } from "@/lib/portal-data"
import {
  UserPlus,
  FolderKanban,
  DollarSign,
  BadgeDollarSign,
  TrendingUp,
  ArrowRight,
  Building2,
} from "lucide-react"

export default function PartnerDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""

  const leads = getLeadsByRole(userId, "partner")
  const projects = getProjectsByRole(userId, "partner")
  const commissions = getCommissionsByPartner(userId)
  const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const totalProjectValue = projects.reduce((sum, p) => sum + p.totalValue, 0)
  const completedProjects = projects.filter(p => ["completion_verified", "payment_received", "closed"].includes(p.stage))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Partner Dashboard 🤝
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track your referred leads, project statuses, and commission earnings.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Leads Submitted" value={leads.length} change={20} icon={UserPlus} color="blue" delay={0.05} />
        <StatsCard title="Active Projects" value={projects.length} icon={FolderKanban} color="green" delay={0.1} />
        <StatsCard title="Project Value" value={`$${(totalProjectValue / 1000).toFixed(1)}K`} icon={DollarSign} color="purple" delay={0.15} />
        <StatsCard title="Commission Earned" value={`$${totalCommission.toLocaleString()}`} change={15} icon={BadgeDollarSign} color="amber" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Referred Leads</h3>
          <div className="space-y-3">
            {leads.map(lead => (
              <div key={lead.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
                <div className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{lead.clientName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lead.address}, {lead.city}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium capitalize shrink-0">
                  {lead.stage.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Commission Tracking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Commission Tracking</h3>
          <div className="space-y-3">
            {commissions.map(comm => (
              <div key={comm.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Project {comm.projectId}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    comm.status === "paid" ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" :
                    comm.status === "verified" ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400" :
                    "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }`}>{comm.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Project Total</p>
                    <p className="font-bold text-slate-900 dark:text-white">${comm.projectTotal.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Rate</p>
                    <p className="font-bold text-slate-900 dark:text-white">{(comm.commissionRate * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Commission</p>
                    <p className="font-bold text-green-600 dark:text-green-400">${comm.commissionAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/5 dark:to-emerald-500/5 border border-green-200 dark:border-green-500/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Total Commissions</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">${totalCommission.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400/50" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Project Status */}
      {projects.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Progress</h3>
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="p-4 rounded-xl bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{project.clientName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{project.address} • ${project.totalValue.toLocaleString()}</p>
                  </div>
                </div>
                <PipelineStatus currentStage={project.stage} compact />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
