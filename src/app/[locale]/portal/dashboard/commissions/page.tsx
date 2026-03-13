"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { getCommissionsByPartner, mockPartners, mockProjects } from "@/lib/portal-data"
import { BadgeDollarSign, TrendingUp, Clock, CheckCircle2, Building2, Percent } from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  verified: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  paid: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
}

export default function CommissionsPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""
  const role = session?.user?.role || "admin"

  // Admin sees all commissions, partner sees their own
  const commissions = role === "admin"
    ? mockPartners.flatMap(p => {
        const comms = getCommissionsByPartner(userId)
        return comms
      })
    : getCommissionsByPartner(userId)

  const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const pendingAmount = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commissionAmount, 0)
  const paidAmount = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.commissionAmount, 0)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Commissions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {role === "admin" ? "Partner commission tracking" : "Your commission earnings"}
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <BadgeDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Commissions</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalCommissions.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">${pendingAmount.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid Out</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${paidAmount.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Partner Info (for admin view) */}
      {role === "admin" && mockPartners.map(partner => (
        <motion.div key={partner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{partner.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{partner.contactName} • {partner.contactEmail}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-bold text-slate-900 dark:text-white">
                <Percent className="h-4 w-4 text-blue-500" />
                {(partner.commissionRate * 100).toFixed(0)}%
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Commission Rate</p>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Commission Entries */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Commission Records</h2>
        {commissions.map((comm, idx) => {
          const project = mockProjects.find(p => p.id === comm.projectId)
          return (
            <motion.div key={comm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.05 }}
              className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {project?.clientName || "Unknown"} — {project?.address || ""}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>Project Total: ${comm.projectTotal.toLocaleString()}</span>
                      <span>Rate: {(comm.commissionRate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">${comm.commissionAmount.toLocaleString()}</p>
                  <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${statusColors[comm.status]}`}>
                    {comm.status}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {commissions.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-12 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-center">
          <BadgeDollarSign className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-900 dark:text-white">No commissions yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Commission records will appear as projects complete.</p>
        </motion.div>
      )}
    </div>
  )
}
