"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  Users, FolderKanban, DollarSign, Target, CalendarDays, ArrowRight,
  TrendingUp, FileText, Clock, RefreshCw, Loader2, Plus, Send,
  UserPlus, BarChart3, Monitor, MessageSquare, Calculator,
  CheckCircle2, AlertTriangle, Eye, PenTool,
} from "lucide-react"

/* ═══════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════ */
interface DashStats {
  totalClients: number; totalProjects: number; activeProjects: number
  pendingProjects: number; completedProjects: number
  totalLeads: number; newLeads: number; contactedLeads: number
  qualifiedLeads: number; convertedLeads: number
  totalAppointments: number; upcomingAppointments: number
  totalInvoices: number; paidInvoices: number; pendingInvoices: number; overdueInvoices: number
  totalRevenue: number; paidRevenue: number; pendingRevenue: number; overdueRevenue: number
  totalDocuments: number; signedDocuments: number; viewedDocuments: number
  totalMessages: number
  recentClients: { id: string; name: string; email: string; company: string | null; image: string | null; createdAt: string; _count: { projects: number; invoices: number; appointments: number } }[]
  recentLeads: { id: string; name: string; email: string; status: string; source: string; projectType: string | null; createdAt: string }[]
  upcomingApptDetails: { id: string; title: string; date: string; status: string; type: string; client: { name: string } }[]
  recentActivity: { id: string; type: string; content: string | null; createdAt: string; author: { name: string } | null; project: { title: string } }[]
  leadSources: { source: string; count: number }[]
}

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */
const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`
const fmtFull = (n: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n)
const ago = (d: string) => {
  const ms = Date.now() - new Date(d).getTime()
  if (ms < 60000) return "now"
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`
  return `${Math.floor(ms / 86400000)}d`
}
const pct = (v: number, t: number) => t === 0 ? 0 : Math.round((v / t) * 100)

const statusColors: Record<string, string> = {
  new: "text-blue-600 dark:text-blue-400 bg-blue-500/8",
  contacted: "text-amber-600 dark:text-amber-400 bg-amber-500/8",
  qualified: "text-purple-600 dark:text-purple-400 bg-purple-500/8",
  converted: "text-green-600 dark:text-green-400 bg-green-500/8",
  lost: "text-slate-500 bg-slate-500/8",
}

/* ═══════════════════════════════════════════════════════════
   Admin Dashboard — Enterprise CRM Grade
   ═══════════════════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) setStats(await res.json())
    } catch (e) { console.error("Stats fetch error:", e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])
  const refresh = () => { setRefreshing(true); fetchStats() }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      <span className="ml-2 text-sm text-slate-500">Loading dashboard…</span>
    </div>
  )
  if (!stats) return <div className="text-sm text-slate-500 py-10 text-center">Failed to load dashboard data.</div>

  const d = stats
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  return (
    <div className="space-y-3 max-w-full">
      {/* ── Header Bar ──────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">
            Welcome back, {session?.user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <IntlLink href="/portal/dashboard/it"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/8 transition-colors">
            <Monitor className="h-3 w-3" /> IT Ops
          </IntlLink>
          <button onClick={refresh} disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer">
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}
        className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-slate-200/60 dark:bg-white/8 rounded-lg overflow-hidden border border-slate-200/60 dark:border-white/8">
        {[
          { label: "Revenue", value: fmt(d.totalRevenue), sub: `${fmt(d.paidRevenue)} collected`, icon: DollarSign, accent: "text-emerald-600 dark:text-emerald-400" },
          { label: "Projects", value: d.totalProjects, sub: `${d.activeProjects} active`, icon: FolderKanban, accent: "text-blue-600 dark:text-blue-400" },
          { label: "Leads", value: d.totalLeads, sub: `${d.newLeads} new`, icon: Target, accent: "text-purple-600 dark:text-purple-400" },
          { label: "Invoices", value: d.totalInvoices, sub: `${d.pendingInvoices} pending`, icon: FileText, accent: "text-amber-600 dark:text-amber-400" },
          { label: "Appointments", value: d.upcomingAppointments, sub: `upcoming`, icon: CalendarDays, accent: "text-cyan-600 dark:text-cyan-400" },
          { label: "Clients", value: d.totalClients, sub: `total`, icon: Users, accent: "text-slate-600 dark:text-slate-300" },
        ].map((kpi, i) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-950 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <kpi.icon className={`h-3 w-3 ${kpi.accent}`} />
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{kpi.label}</span>
            </div>
            <p className={`text-lg font-bold tabular-nums leading-tight ${kpi.accent}`}>{kpi.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Row 2: Revenue + Pipeline + Lead Funnel ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Revenue Breakdown */}
        <div className="rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <DollarSign className="h-3 w-3" /> Revenue
          </h3>
          <div className="space-y-2">
            {[
              { label: "Collected", val: d.paidRevenue, color: "bg-emerald-500", total: d.totalRevenue },
              { label: "Pending", val: d.pendingRevenue, color: "bg-amber-500", total: d.totalRevenue },
              { label: "Overdue", val: d.overdueRevenue, color: "bg-red-500", total: d.totalRevenue },
            ].map(r => (
              <div key={r.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-slate-500">{r.label}</span>
                  <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">{fmtFull(r.val)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full transition-all`} style={{ width: `${pct(r.val, r.total)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between">
            <span className="text-[10px] text-slate-400">Total</span>
            <span className="text-xs font-bold tabular-nums text-slate-800 dark:text-white">{fmtFull(d.totalRevenue)}</span>
          </div>
        </div>

        {/* Project Pipeline */}
        <div className="rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <FolderKanban className="h-3 w-3" /> Project Pipeline
          </h3>
          <div className="space-y-1.5">
            {[
              { label: "Active", count: d.activeProjects, color: "bg-blue-500", pct: pct(d.activeProjects, d.totalProjects) },
              { label: "Pending", count: d.pendingProjects, color: "bg-amber-500", pct: pct(d.pendingProjects, d.totalProjects) },
              { label: "Completed", count: d.completedProjects, color: "bg-emerald-500", pct: pct(d.completedProjects, d.totalProjects) },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-16">{p.label}</span>
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
                <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200 w-6 text-right">{p.count}</span>
              </div>
            ))}
          </div>
          <IntlLink href="/portal/dashboard/projects"
            className="mt-3 flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
            View all projects <ArrowRight className="h-3 w-3" />
          </IntlLink>
        </div>

        {/* Lead Funnel */}
        <div className="rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Lead Funnel
          </h3>
          <div className="space-y-1">
            {[
              { label: "New", count: d.newLeads, color: "bg-blue-500" },
              { label: "Contacted", count: d.contactedLeads, color: "bg-amber-500" },
              { label: "Qualified", count: d.qualifiedLeads, color: "bg-purple-500" },
              { label: "Converted", count: d.convertedLeads, color: "bg-emerald-500" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                <span className="text-[11px] text-slate-500 flex-1">{s.label}</span>
                <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">{s.count}</span>
              </div>
            ))}
          </div>
          {d.leadSources.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
              <p className="text-[10px] text-slate-400 mb-1">Top Sources</p>
              <div className="flex flex-wrap gap-1">
                {d.leadSources.slice(0, 4).map(s => (
                  <span key={s.source} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium">
                    {s.source} ({s.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Row 3: Quick Actions ────────────── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {[
          { label: "New Project", href: "/portal/dashboard/projects", icon: Plus, color: "text-blue-600 dark:text-blue-400" },
          { label: "Add Lead", href: "/portal/dashboard/leads", icon: UserPlus, color: "text-purple-600 dark:text-purple-400" },
          { label: "Send Doc", href: "/portal/dashboard/documents", icon: Send, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Schedule", href: "/portal/dashboard/appointments", icon: CalendarDays, color: "text-cyan-600 dark:text-cyan-400" },
          { label: "Messages", href: "/portal/dashboard/messages", icon: MessageSquare, color: "text-amber-600 dark:text-amber-400" },
          { label: "Estimates", href: "/portal/dashboard/estimates", icon: Calculator, color: "text-orange-600 dark:text-orange-400" },
          { label: "Analytics", href: "/portal/dashboard/analytics", icon: BarChart3, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "IT Ops", href: "/portal/dashboard/it", icon: Monitor, color: "text-slate-600 dark:text-slate-400" },
        ].map(a => (
          <IntlLink key={a.label} href={a.href}
            className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors group">
            <a.icon className={`h-4 w-4 ${a.color} group-hover:scale-110 transition-transform`} />
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 text-center leading-tight">{a.label}</span>
          </IntlLink>
        ))}
      </motion.div>

      {/* ── Row 4: Activity + Appointments ───── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Activity Feed — 3 cols */}
        <div className="lg:col-span-3 rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Recent Activity
          </h3>
          {d.recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-0">
              {d.recentActivity.map((a, i) => (
                <div key={a.id} className={`flex items-start gap-2 py-1.5 ${i > 0 ? "border-t border-slate-50 dark:border-white/3" : ""}`}>
                  <div className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                    a.type === "status_change" ? "bg-blue-500" : a.type === "comment" ? "bg-amber-500" : a.type === "file_upload" ? "bg-emerald-500" : "bg-slate-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight truncate">
                      <span className="font-medium">{a.author?.name || "System"}</span>
                      {" — "}{a.content?.slice(0, 80) || a.type}
                    </p>
                    <p className="text-[10px] text-slate-400">{a.project?.title} · {ago(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments — 2 cols */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3" /> Upcoming
          </h3>
          {d.upcomingApptDetails.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No upcoming appointments</p>
          ) : (
            <div className="space-y-0">
              {d.upcomingApptDetails.map((a, i) => (
                <div key={a.id} className={`flex items-center gap-2 py-1.5 ${i > 0 ? "border-t border-slate-50 dark:border-white/3" : ""}`}>
                  <div className="text-center shrink-0 w-10">
                    <p className="text-[10px] font-semibold text-slate-800 dark:text-white leading-none">
                      {new Date(a.date).toLocaleDateString("en-US", { month: "short" })}
                    </p>
                    <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white leading-tight">
                      {new Date(a.date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{a.title}</p>
                    <p className="text-[10px] text-slate-400">{a.client?.name} · {a.type}</p>
                  </div>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                    a.status === "confirmed" ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/8 text-blue-600 dark:text-blue-400"
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
          <IntlLink href="/portal/dashboard/appointments"
            className="mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
            All appointments <ArrowRight className="h-3 w-3" />
          </IntlLink>
        </div>
      </motion.div>

      {/* ── Row 5: Document Stats + Clients ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Document Stats — 2 cols */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <FileText className="h-3 w-3" /> Documents
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total", val: d.totalDocuments, icon: FileText, color: "text-slate-600 dark:text-slate-300" },
              { label: "Viewed", val: d.viewedDocuments, icon: Eye, color: "text-blue-600 dark:text-blue-400" },
              { label: "Signed", val: d.signedDocuments, icon: PenTool, color: "text-emerald-600 dark:text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="text-center py-2 rounded-md bg-slate-50/80 dark:bg-white/3">
                <s.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${s.color}`} />
                <p className="text-base font-bold tabular-nums text-slate-800 dark:text-white">{s.val}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-amber-500/5 border border-amber-200/40 dark:border-amber-500/10">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <div>
                <p className="text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-400">{d.overdueInvoices}</p>
                <p className="text-[9px] text-amber-500">Overdue invoices</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-500/5 border border-emerald-200/40 dark:border-emerald-500/10">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{d.paidInvoices}</p>
                <p className="text-[9px] text-emerald-500">Paid invoices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Clients — 3 cols */}
        <div className="lg:col-span-3 rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Recent Clients
            </h3>
            <IntlLink href="/portal/dashboard/leads"
              className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5">
              View all <ArrowRight className="h-2.5 w-2.5" />
            </IntlLink>
          </div>
          <div className="overflow-x-auto -mx-3 px-3">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="pb-1.5 text-left font-medium text-slate-400">Client</th>
                  <th className="pb-1.5 text-left font-medium text-slate-400 hidden sm:table-cell">Company</th>
                  <th className="pb-1.5 text-center font-medium text-slate-400">Proj</th>
                  <th className="pb-1.5 text-center font-medium text-slate-400">Inv</th>
                  <th className="pb-1.5 text-right font-medium text-slate-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {d.recentClients.map(c => (
                  <tr key={c.id} className="border-b border-slate-50 dark:border-white/3 last:border-0">
                    <td className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        {c.image ? (
                          <img src={c.image} alt="" className="h-5 w-5 rounded object-cover" />
                        ) : (
                          <div className="h-5 w-5 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-slate-400">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-1.5 text-slate-400 hidden sm:table-cell truncate max-w-[100px]">{c.company || "—"}</td>
                    <td className="py-1.5 text-center tabular-nums text-slate-600 dark:text-slate-300">{c._count.projects}</td>
                    <td className="py-1.5 text-center tabular-nums text-slate-600 dark:text-slate-300">{c._count.invoices}</td>
                    <td className="py-1.5 text-right text-slate-400">{ago(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Row 6: Recent Leads ─────────────── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Recent Leads
          </h3>
          <IntlLink href="/portal/dashboard/leads"
            className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5">
            Manage leads <ArrowRight className="h-2.5 w-2.5" />
          </IntlLink>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5">
          {d.recentLeads.map(l => (
            <div key={l.id} className="flex items-center gap-2 p-2 rounded-md bg-slate-50/80 dark:bg-white/2 border border-slate-100/60 dark:border-white/5">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">{l.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{l.source} · {l.projectType || "General"}</p>
              </div>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusColors[l.status] || "bg-slate-100 text-slate-500"}`}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Footer Stats ────────────────────── */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
        <span>Total messages: {d.totalMessages} · Documents: {d.totalDocuments}</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )
}
