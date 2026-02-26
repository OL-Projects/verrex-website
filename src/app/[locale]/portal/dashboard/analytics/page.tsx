"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Clock,
  Percent,
} from "lucide-react"

/* ── mock analytics data ──────────────────────────────────── */
const revenueMonths = [
  { month: "Sep", value: 18200 },
  { month: "Oct", value: 22400 },
  { month: "Nov", value: 19800 },
  { month: "Dec", value: 28500 },
  { month: "Jan", value: 31200 },
  { month: "Feb", value: 27025 },
]
const maxRevenue = Math.max(...revenueMonths.map(m => m.value))

const conversionFunnel = [
  { stage: "Leads Received", count: 42, pct: 100, color: "bg-blue-500" },
  { stage: "Contacted", count: 38, pct: 90, color: "bg-indigo-500" },
  { stage: "Appointment Set", count: 28, pct: 67, color: "bg-purple-500" },
  { stage: "Quote Sent", count: 22, pct: 52, color: "bg-violet-500" },
  { stage: "Approved", count: 15, pct: 36, color: "bg-fuchsia-500" },
  { stage: "Completed", count: 11, pct: 26, color: "bg-pink-500" },
]

const leadSources = [
  { source: "Home Depot", count: 18, pct: 43, color: "bg-orange-500" },
  { source: "Website", count: 12, pct: 29, color: "bg-blue-500" },
  { source: "Referral", count: 8, pct: 19, color: "bg-green-500" },
  { source: "Walk-in", count: 4, pct: 9, color: "bg-slate-400" },
]

const topProducts = [
  { name: "Casement Windows", units: 34, revenue: 40800 },
  { name: "Bay Windows", units: 12, revenue: 54000 },
  { name: "Patio Doors", units: 18, revenue: 68400 },
  { name: "Fixed Picture", units: 22, revenue: 17600 },
  { name: "Awning Windows", units: 15, revenue: 12000 },
]
const maxUnits = Math.max(...topProducts.map(p => p.units))

const kpiCards = [
  { label: "Revenue (MTD)", value: "$27,025", change: "+12%", up: true, icon: DollarSign, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
  { label: "New Leads", value: "42", change: "+8%", up: true, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { label: "Conversion Rate", value: "26%", change: "-3%", up: false, icon: Target, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
  { label: "Avg Project Value", value: "$24.5K", change: "+15%", up: true, icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
]

/* ── component ────────────────────────────────────────────── */
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Business intelligence &amp; performance metrics</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}><Icon className={`h-5 w-5 ${kpi.color}`} /></div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${kpi.up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                  {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{kpi.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Chart + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend (bar chart via divs) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="h-3 w-3" />Last 6 Months</span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {revenueMonths.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">${(m.value / 1000).toFixed(0)}K</span>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(m.value / maxRevenue) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 min-h-[8px]"
                />
                <span className="text-[10px] text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Conversion Funnel</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1"><Percent className="h-3 w-3" />Lead → Close</span>
          </div>
          <div className="space-y-3">
            {conversionFunnel.map((step, i) => (
              <motion.div key={step.stage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{step.stage}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{step.count} ({step.pct}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${step.pct}%` }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.6 }}
                    className={`h-full rounded-full ${step.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Lead Sources + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Lead Sources</h3>
          <div className="space-y-4">
            {leadSources.map((src, i) => (
              <div key={src.source} className="flex items-center gap-4">
                <div className={`h-3 w-3 rounded-full ${src.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{src.source}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{src.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${src.pct}%` }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
                      className={`h-full rounded-full ${src.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((prod, i) => (
              <div key={prod.name} className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{prod.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{prod.units} units • ${(prod.revenue / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(prod.units / maxUnits) * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">11</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Completed Projects</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">14 days</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg Lead → Close Time</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
            <TrendingDown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">4.2%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cancellation Rate</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
