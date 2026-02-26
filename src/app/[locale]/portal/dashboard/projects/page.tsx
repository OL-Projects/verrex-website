"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { PipelineStatus } from "@/components/portal/pipeline-status"
import { usePortalStore } from "@/lib/portal-store"
import { Link as IntlLink } from "@/i18n/navigation"
import { MapPin, DollarSign, Package, FileText, ArrowRight } from "lucide-react"

export default function ProjectsPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const projects = store.projects

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{projects.length} active projects</p>
      </motion.div>

      {projects.map((project, idx) => (
        <motion.div key={project.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <IntlLink href={`/portal/dashboard/projects/${project.id}`} className="text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {project.clientName}
              </IntlLink>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="h-3.5 w-3.5" />{project.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium capitalize">
                {project.stage.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <PipelineStatus currentStage={project.stage} />

          <div className="grid grid-cols-3 gap-4 mt-5 p-4 rounded-xl bg-slate-50/50 dark:bg-white/3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Total</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">${project.totalValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Deposit</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">${project.depositPaid.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Balance</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">${project.balanceDue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2"><Package className="h-4 w-4" /> Products ({project.products.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.products.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50/50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{p.location} — {p.windowType.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-slate-400">{p.width}&quot;×{p.height}&quot; • {p.color} • {p.glassType} • ×{p.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">${(p.unitPrice * p.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
