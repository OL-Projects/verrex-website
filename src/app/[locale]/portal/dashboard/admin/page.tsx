"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link as IntlLink } from "@/i18n/navigation"
import {
  Users, FolderKanban, DollarSign, Target,
  CalendarDays, ArrowRight, TrendingUp, Inbox,
  FileText, Clock,
} from "lucide-react"

interface Stats {
  totalClients: number
  totalProjects: number
  activeProjects: number
  totalLeads: number
  newLeads: number
  totalAppointments: number
  upcomingAppointments: number
  totalInvoices: number
  paidInvoices: number
  totalRevenue: number
}

interface Client {
  id: string; name: string; email: string; phone: string | null
  company: string | null; createdAt: string
  _count: { projects: number; appointments: number; invoices: number }
}

interface Lead {
  id: string; name: string; email: string; phone: string | null
  type: string; status: string; source: string; subject: string | null
  projectType: string | null; createdAt: string
}

function StatCard({ title, value, icon: Icon, color, delay = 0 }: {
  title: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: string; delay?: number
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
    green: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    purple: "bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[color] || colors.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then(r => r.json()),
      fetch("/api/admin/clients").then(r => r.json()),
      fetch("/api/admin/leads").then(r => r.json()),
    ]).then(([s, c, l]) => {
      setStats(s)
      setClients(Array.isArray(c) ? c : [])
      setLeads(Array.isArray(l) ? l : [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  const s = stats || { totalClients: 0, totalProjects: 0, activeProjects: 0, totalLeads: 0, newLeads: 0, totalAppointments: 0, upcomingAppointments: 0, totalInvoices: 0, paidInvoices: 0, totalRevenue: 0 }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          VEREX Administration — Master Dashboard
        </p>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clients" value={s.totalClients} icon={Users} color="blue" delay={0.05} />
        <StatCard title="Active Projects" value={s.activeProjects} icon={FolderKanban} color="green" delay={0.1} />
        <StatCard title="New Leads" value={s.newLeads} icon={Target} color="amber" delay={0.15} />
        <StatCard title="Revenue" value={s.totalRevenue > 0 ? `$${(s.totalRevenue / 1000).toFixed(1)}K` : "$0"} icon={DollarSign} color="purple" delay={0.2} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{s.totalProjects}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total Projects</p>
        </div>
        <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{s.upcomingAppointments}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upcoming Appts</p>
        </div>
        <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{s.totalInvoices}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Invoices</p>
        </div>
        <div className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5 text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{s.totalLeads}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total Leads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="h-5 w-5 text-amber-500" /> Recent Leads
            </h3>
            <span className="text-xs text-slate-400">{leads.length} total</span>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No leads yet. Form submissions will appear here.</p>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    lead.status === "new" ? "bg-blue-100 dark:bg-blue-500/15" : "bg-slate-100 dark:bg-slate-500/15"
                  }`}>
                    <Target className={`h-4 w-4 ${lead.status === "new" ? "text-blue-600 dark:text-blue-400" : "text-slate-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{lead.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{lead.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      lead.type === "quote" ? "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400" :
                      lead.type === "appointment" ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" :
                      lead.type === "quick_quote" ? "bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400" :
                      "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400"
                    }`}>
                      {lead.type.replace(/_/g, " ")}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Client List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Clients
            </h3>
            <span className="text-xs text-slate-400">{clients.length} registered</span>
          </div>
          {clients.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No clients registered yet.</p>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 6).map((client) => (
                <div key={client.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{client.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{client.email}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{client._count.projects} proj</span>
                      <span>{client._count.invoices} inv</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Joined {new Date(client.createdAt).toLocaleDateString()}</p>
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
