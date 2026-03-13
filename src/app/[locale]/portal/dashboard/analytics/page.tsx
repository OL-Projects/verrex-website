"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  BarChart3, TrendingUp, DollarSign, Users, Target, Percent,
  Loader2, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight,
  FolderKanban, CalendarDays, Package, Briefcase, Activity, CheckCircle2,
} from "lucide-react"

interface AnalyticsData {
  kpi: {
    revenueMTD: number; totalRevenue: number; newLeadsMTD: number; totalLeads: number
    conversionRate: number; avgProjectValue: number; totalClients: number
    completedProjects: number; cancellationRate: number; totalProjects: number; totalAppointments: number
  }
  revenueMonths: { month: string; revenue: number }[]
  leadSources: { source: string; count: number }[]
  conversionFunnel: { stage: string; count: number }[]
  projectStages: { stage: string; count: number }[]
  appointmentTypes: { type: string; count: number }[]
}

const sourceLabels: Record<string, string> = {
  home_depot: "Home Depot", website: "Website", referral: "Referral", phone: "Phone", walk_in: "Walk-in",
}
const sourceColors: Record<string, string> = {
  home_depot: "bg-orange-500", website: "bg-blue-500", referral: "bg-green-500", phone: "bg-purple-500", walk_in: "bg-cyan-500",
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/analytics")
      if (!res.ok) throw new Error("Failed to fetch analytics")
      setData(await res.json())
      setError("")
    } catch (e) { setError(e instanceof Error ? e.message : "Failed") }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  const refresh = () => { setRefreshing(true); fetchData() }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-3 text-slate-500">Loading analytics…</span>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-sm text-red-500">{error || "No data"}</p>
      <button onClick={refresh} className="text-sm text-blue-600 hover:underline">Retry</button>
    </div>
  )

  const { kpi } = data
  const maxRevenue = Math.max(...data.revenueMonths.map(m => m.revenue), 1)
  const funnelMax = data.conversionFunnel[0]?.count || 1

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" /> Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time business metrics from your database</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Revenue MTD", value: `$${(kpi.revenueMTD / 1000).toFixed(1)}K`, sub: `$${(kpi.totalRevenue / 1000).toFixed(0)}K total`, icon: DollarSign, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/15" },
          { label: "New Leads MTD", value: kpi.newLeadsMTD, sub: `${kpi.totalLeads} total leads`, icon: Target, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/15" },
          { label: "Conversion Rate", value: `${kpi.conversionRate}%`, sub: `${kpi.completedProjects} completed`, icon: Percent, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/15" },
          { label: "Avg Project Value", value: `$${(kpi.avgProjectValue / 1000).toFixed(1)}K`, sub: `${kpi.totalProjects} projects`, icon: Briefcase, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/15" },
        ].map((c, i) => (
          <div key={c.label} className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.label}</p>
                <p className="text-[10px] text-slate-400">{c.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Revenue Chart + Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" /> Revenue (Last 6 Months)
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.revenueMonths.map((m) => {
              const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {m.revenue > 0 ? `$${(m.revenue / 1000).toFixed(1)}K` : "—"}
                  </span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-700"
                    style={{ height: `${Math.max(pct, 2)}%`, minHeight: "4px" }} />
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Lead Sources */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" /> Lead Sources
          </h3>
          <div className="space-y-3">
            {data.leadSources.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No leads yet</p>
            ) : (
              data.leadSources.map((s) => {
                const total = data.leadSources.reduce((sum, x) => sum + x.count, 0)
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                return (
                  <div key={s.source}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{sourceLabels[s.source] || s.source}</span>
                      <span className="text-slate-500">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full ${sourceColors[s.source] || "bg-slate-400"} transition-all duration-700`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Conversion Funnel + Project Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Funnel */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" /> Conversion Funnel
          </h3>
          <div className="space-y-2">
            {data.conversionFunnel.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No pipeline data yet</p>
            ) : (
              data.conversionFunnel.map((f, i) => {
                const pct = (f.count / funnelMax) * 100
                const colors = ["bg-blue-500", "bg-blue-400", "bg-indigo-500", "bg-indigo-400", "bg-purple-500", "bg-purple-400", "bg-violet-500", "bg-green-500", "bg-emerald-500", "bg-emerald-600"]
                return (
                  <div key={f.stage} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-28 text-right truncate">{f.stage}</span>
                    <div className="flex-1 h-7 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden relative">
                      <div className={`h-full rounded-lg ${colors[i % colors.length]} transition-all duration-700 flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max(pct, 5)}%` }}>
                        <span className="text-[10px] font-bold text-white">{f.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Project Stages */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-amber-500" /> Project Distribution
          </h3>
          <div className="space-y-2">
            {data.projectStages.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No projects yet</p>
            ) : (
              data.projectStages.map((s) => {
                const max = Math.max(...data.projectStages.map(x => x.count), 1)
                const pct = (s.count / max) * 100
                const label = s.stage.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
                return (
                  <div key={s.stage} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-32 text-right truncate">{label}</span>
                    <div className="flex-1 h-6 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden">
                      <div className="h-full rounded-lg bg-amber-500 transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(pct, 8)}%` }}>
                        <span className="text-[10px] font-bold text-white">{s.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Clients", value: kpi.totalClients, icon: Users, color: "blue" },
          { label: "Completed Projects", value: kpi.completedProjects, icon: CheckCircle2, color: "green" },
          { label: "Cancellation Rate", value: `${kpi.cancellationRate}%`, icon: AlertCircle, color: kpi.cancellationRate > 10 ? "red" : "green" },
          { label: "Total Appointments", value: kpi.totalAppointments, icon: CalendarDays, color: "purple" },
        ].map(s => {
          const colors: Record<string, string> = {
            blue: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
            green: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
            red: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",
            purple: "bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400",
          }
          return (
            <div key={s.label} className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 text-center">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${colors[s.color]}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Data source badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live data from PostgreSQL database
        </span>
      </div>
    </div>
  )
}
