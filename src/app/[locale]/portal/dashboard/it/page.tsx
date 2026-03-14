"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Monitor, Server, Database, Plug, Users, Shield, Bug, RefreshCw,
  Loader2, CheckCircle2, XCircle, AlertTriangle, Trash2, KeyRound,
  Copy, Search, ChevronDown, ChevronUp, HardDrive, Cpu, MemoryStick,
  Clock, Eye, EyeOff, Activity, Wifi, WifiOff, Info,
  Pencil, X, Ban, UserCheck, Save, Camera, ImageOff,
  Mail, Phone, Building2, MapPin, FileText, MessageSquare,
} from "lucide-react"

/* ═══════════════════════════════════════════════════════════
   Types for API responses
   ═══════════════════════════════════════════════════════════ */
interface SystemInfo {
  runtime: { nodeVersion: string; platform: string; arch: string; pid: number; uptime: number; uptimeFormatted: string }
  memory: { rss: string; heapUsed: string; heapTotal: string; external: string; rssRaw: number; heapUsedRaw: number; heapTotalRaw: number }
  system: { hostname: string; osType: string; osRelease: string; cpuModel: string; cpuCores: number; cpuUsagePercent: number; totalMemory: string; freeMemory: string; usedMemoryPercent: number }
  environment: { key: string; set: boolean; preview: string }[]
  framework: { nextjs: string; prisma: string; typescript: string }
  timestamp: string
}
interface DbStats {
  connected: boolean; pingMs: number; provider: string; version: string
  tables: Record<string, number>; totalRows: number
  usersByRole: { role: string; count: number }[]
  recentUsers: number; recentlyUpdated: number; error?: string
}
interface ServiceCheck { name: string; status: string; latencyMs: number; details: string }
interface ServicesData { overall: string; services: ServiceCheck[] }
interface ITUser {
  id: string; name: string; email: string; role: string; company: string | null
  phone: string | null; isDemo: boolean; createdAt: string; updatedAt: string
  relatedData: { projects: number; appointments: number; invoices: number; messages: number; leads: number }
}

/* ═══════════════════════════════════════════════════════════
   Helper components
   ═══════════════════════════════════════════════════════════ */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 ${className}`}>
    {children}
  </div>
)

const StatBadge = ({ value, label, icon: Icon, color = "blue" }: { value: string | number; label: string; icon: React.ComponentType<{ className?: string }>; color?: string }) => {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-blue-600", green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600", purple: "from-purple-500 to-purple-600",
    cyan: "from-cyan-500 to-cyan-600", red: "from-red-500 to-red-600",
  }
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-white/3 border border-slate-100 dark:border-white/5">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

const StatusDot = ({ status }: { status: string }) => {
  const c = status === "connected" || status === "healthy" ? "bg-green-500" : status === "degraded" || status === "partial" ? "bg-amber-500" : status === "not_configured" ? "bg-slate-400" : "bg-red-500"
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${c} ${status === "connected" ? "animate-pulse" : ""}`} />
}

const RoleBadge = ({ role }: { role: string }) => {
  const c: Record<string, string> = {
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    client: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    contractor: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    supplier: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
    partner: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  }
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${c[role] || "bg-slate-100 text-slate-600"}`}>{role}</span>
}

/* ═══════════════════════════════════════════════════════════
   Main IT Dashboard Page
   ═══════════════════════════════════════════════════════════ */
export default function ITDashboardPage() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null)
  const [dbStats, setDbStats] = useState<DbStats | null>(null)
  const [services, setServices] = useState<ServicesData | null>(null)
  const [users, setUsers] = useState<ITUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [resetResult, setResetResult] = useState<{ userId: string; password: string } | null>(null)
  const [showTempPw, setShowTempPw] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // ── Edit User Modal State ──
  const [editUser, setEditUser] = useState<Record<string, unknown> | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editSaving, setEditSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [sysRes, dbRes, svcRes, usrRes] = await Promise.all([
        fetch("/api/admin/it/system-info"), fetch("/api/admin/it/database-stats"),
        fetch("/api/admin/it/services"), fetch("/api/admin/it/users"),
      ])
      if (sysRes.ok) setSysInfo(await sysRes.json())
      if (dbRes.ok) setDbStats(await dbRes.json())
      if (svcRes.ok) setServices(await svcRes.json())
      if (usrRes.ok) { const d = await usrRes.json(); setUsers(d.users || []) }
    } catch (e) { console.error("IT fetch error:", e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { if (actionMsg) { const t = setTimeout(() => setActionMsg(null), 6000); return () => clearTimeout(t) } }, [actionMsg])

  const refresh = () => { setRefreshing(true); fetchAll() }

  const handleDeleteUser = async (id: string) => {
    setActionLoading(id); setActionMsg(null)
    try {
      const res = await fetch(`/api/admin/it/users/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setActionMsg({ type: "success", text: data.message })
      setDeleteConfirm(null)
    } catch (e) { setActionMsg({ type: "error", text: e instanceof Error ? e.message : "Delete failed" }) }
    finally { setActionLoading(null) }
  }

  const handleResetPassword = async (id: string) => {
    setActionLoading(id); setActionMsg(null)
    try {
      const res = await fetch(`/api/admin/it/users/${id}/reset-password`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResetResult({ userId: id, password: data.temporaryPassword })
      setShowTempPw(false)
      setActionMsg({ type: "success", text: data.message })
    } catch (e) { setActionMsg({ type: "error", text: e instanceof Error ? e.message : "Reset failed" }) }
    finally { setActionLoading(null) }
  }

  // ── Edit User Handlers ──
  const openEditUser = async (userId: string) => {
    setEditLoading(true); setEditUser(null)
    try {
      const res = await fetch(`/api/admin/it/users/${userId}`)
      if (!res.ok) throw new Error("Failed to fetch user details")
      const data = await res.json()
      const u = data.user
      setEditUser(u)
      setEditForm({
        name: u.name || "", displayName: u.displayName || "", displayEmail: u.displayEmail || "",
        phone: u.phone || "", company: u.company || "", address: u.address || "",
        city: u.city || "", postalCode: u.postalCode || "", role: u.role || "client",
        notes: u.notes || "", status: u.status || "active",
      })
    } catch (e) { setActionMsg({ type: "error", text: e instanceof Error ? e.message : "Failed to load user" }) }
    finally { setEditLoading(false) }
  }

  const saveEditUser = async () => {
    if (!editUser) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/admin/it/users/${(editUser as { id: string }).id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      // Update local users list
      setUsers(prev => prev.map(u => u.id === (editUser as { id: string }).id
        ? { ...u, name: data.user.name, email: data.user.email, role: data.user.role, company: data.user.company, phone: data.user.phone }
        : u
      ))
      setActionMsg({ type: "success", text: `User "${data.user.name}" updated successfully` })
      setEditUser(null)
    } catch (e) { setActionMsg({ type: "error", text: e instanceof Error ? e.message : "Update failed" }) }
    finally { setEditSaving(false) }
  }

  const handleClearPhoto = async () => {
    if (!editUser) return
    try {
      await fetch(`/api/admin/it/users/${(editUser as { id: string }).id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: null }),
      })
      setEditUser(prev => prev ? { ...prev, image: null } : prev)
      setActionMsg({ type: "success", text: "Profile photo cleared" })
    } catch { setActionMsg({ type: "error", text: "Failed to clear photo" }) }
  }

  const handleToggleStatus = async () => {
    if (!editUser) return
    const newStatus = editForm.status === "active" ? "suspended" : "active"
    setEditForm(f => ({ ...f, status: newStatus }))
    try {
      await fetch(`/api/admin/it/users/${(editUser as { id: string }).id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }),
      })
      setEditUser(prev => prev ? { ...prev, status: newStatus } : prev)
      setUsers(prev => prev.map(u => u.id === (editUser as { id: string }).id ? { ...u } : u))
      setActionMsg({ type: "success", text: `Account ${newStatus === "suspended" ? "suspended" : "reactivated"}` })
    } catch { setActionMsg({ type: "error", text: "Failed to update status" }) }
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  )

  const toggle = (s: string) => setExpandedSection(expandedSection === s ? null : s)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-3 text-slate-500">Loading IT diagnostics…</span>
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor className="h-6 w-6 text-blue-500" /> IT Operations Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live system diagnostics, services, database & account management
          </p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-50 cursor-pointer">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh All"}
        </button>
      </motion.div>

      {/* Action messages */}
      {actionMsg && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
            actionMsg.type === "success" ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400"
              : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"}`}>
          {actionMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {actionMsg.text}
        </motion.div>
      )}

      {/* ── Overview Stats ─────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatBadge icon={Clock} value={sysInfo?.runtime.uptimeFormatted || "—"} label="Server Uptime" color="blue" />
        <StatBadge icon={MemoryStick} value={sysInfo?.memory.heapUsed || "—"} label="Heap Used" color="purple" />
        <StatBadge icon={Cpu} value={`${sysInfo?.system.cpuUsagePercent ?? 0}%`} label="CPU Usage" color="amber" />
        <StatBadge icon={Database} value={dbStats?.connected ? `${dbStats.pingMs}ms` : "DOWN"} label="DB Latency" color={dbStats?.connected ? "green" : "red"} />
        <StatBadge icon={Users} value={users.length} label="Total Users" color="cyan" />
        <StatBadge icon={HardDrive} value={dbStats?.totalRows ?? 0} label="Total DB Rows" color="green" />
      </motion.div>

      {/* ── 1. Server & Runtime ─────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <button onClick={() => toggle("server")} className="w-full flex items-center justify-between cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" /> Server & Environment
            </h3>
            {expandedSection === "server" ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          {expandedSection === "server" && sysInfo && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  ["Node.js", sysInfo.runtime.nodeVersion], ["Next.js", sysInfo.framework.nextjs], ["Prisma", sysInfo.framework.prisma],
                  ["TypeScript", sysInfo.framework.typescript], ["Platform", `${sysInfo.system.osType} ${sysInfo.runtime.arch}`],
                  ["Hostname", sysInfo.system.hostname], ["CPU", `${sysInfo.system.cpuModel.slice(0, 40)}`], ["Cores", `${sysInfo.system.cpuCores}`],
                  ["Total RAM", sysInfo.system.totalMemory], ["Free RAM", sysInfo.system.freeMemory], ["RSS Memory", sysInfo.memory.rss],
                  ["Heap Used/Total", `${sysInfo.memory.heapUsed} / ${sysInfo.memory.heapTotal}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-white/3 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-white text-xs">{val}</span>
                  </div>
                ))}
              </div>
              {/* Env vars audit */}
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Environment Variables</p>
                <div className="space-y-1">
                  {sysInfo.environment.map((env) => (
                    <div key={env.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/3 text-xs">
                      <div className="flex items-center gap-2">
                        {env.set ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                        <code className="font-mono text-slate-700 dark:text-slate-300">{env.key}</code>
                      </div>
                      <span className={`font-mono ${env.set ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>{env.preview}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* ── 2. Database Dashboard ────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <button onClick={() => toggle("database")} className="w-full flex items-center justify-between cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" /> Database Dashboard
              <StatusDot status={dbStats?.connected ? "connected" : "disconnected"} />
            </h3>
            {expandedSection === "database" ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          {expandedSection === "database" && dbStats && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dbStats.pingMs}ms</p>
                  <p className="text-[11px] text-slate-500">Ping Latency</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{dbStats.provider}</p>
                  <p className="text-[11px] text-slate-500">Provider</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dbStats.totalRows}</p>
                  <p className="text-[11px] text-slate-500">Total Rows</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Object.keys(dbStats.tables).length}</p>
                  <p className="text-[11px] text-slate-500">Tables</p>
                </div>
              </div>
              {/* Table row counts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(dbStats.tables).map(([table, count]) => (
                  <div key={table} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 dark:bg-white/3 text-xs">
                    <span className="text-slate-500 capitalize">{table.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
              {dbStats.version && (
                <p className="text-[11px] text-slate-400 font-mono truncate">DB: {dbStats.version.slice(0, 80)}</p>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* ── 3. Connected Services ────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <button onClick={() => toggle("services")} className="w-full flex items-center justify-between cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Plug className="h-5 w-5 text-cyan-500" /> Connected Services
              {services && <StatusDot status={services.overall} />}
            </h3>
            {expandedSection === "services" ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          {expandedSection === "services" && services && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-2">
              {services.services.map((svc) => (
                <div key={svc.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    {svc.status === "connected" ? <Wifi className="h-4 w-4 text-green-500" /> :
                      svc.status === "not_configured" ? <Info className="h-4 w-4 text-slate-400" /> :
                        <WifiOff className="h-4 w-4 text-red-500" />}
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{svc.name}</p>
                      <p className="text-[11px] text-slate-400">{svc.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {svc.latencyMs >= 0 && (
                      <span className="text-[11px] font-mono text-slate-500">{svc.latencyMs}ms</span>
                    )}
                    <StatusDot status={svc.status} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* ── 4. Security Overview ─────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <button onClick={() => toggle("security")} className="w-full flex items-center justify-between cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" /> Security Overview
            </h3>
            {expandedSection === "security" ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          {expandedSection === "security" && dbStats && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dbStats.usersByRole.map((r) => (
                  <div key={r.role} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/3">
                    <RoleBadge role={r.role} />
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{r.count}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">New accounts (7 days)</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{dbStats.recentUsers}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Updated accounts (7 days)</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">{dbStats.recentlyUpdated}</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 space-y-1">
                {[
                  ["Authentication", "NextAuth v5 (Credentials)", sysInfo?.environment.find(e => e.key === "AUTH_SECRET")?.set],
                  ["Password Hashing", "bcrypt (12 rounds)", true],
                  ["Session Strategy", "JWT (HTTP-only cookies)", true],
                  ["Admin Role Check", "All IT routes require admin role", true],
                ].map(([label, val, ok]) => (
                  <div key={label as string} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-500">{label as string}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{val as string}</span>
                      {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* ── 5. Account Management ────────────────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" /> Account Management
              <span className="text-xs font-normal text-slate-400">({users.length} users)</span>
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users…" className="pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </div>
          </div>

          {/* Temp password result */}
          {resetResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">🔑 Temporary Password Generated</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-white dark:bg-black/30 px-3 py-1.5 rounded-lg text-slate-800 dark:text-white">
                  {showTempPw ? resetResult.password : "•".repeat(12)}
                </code>
                <button onClick={() => setShowTempPw(!showTempPw)} className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 cursor-pointer">
                  {showTempPw ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-amber-600" />}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(resetResult.password); setActionMsg({ type: "success", text: "Password copied!" }) }}
                  className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 cursor-pointer">
                  <Copy className="h-4 w-4 text-amber-600" />
                </button>
              </div>
              <p className="text-[11px] text-amber-500 mt-1">Share securely. User should change upon next login.</p>
            </motion.div>
          )}

          {/* Users table */}
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-left">
                  <th className="pb-2 text-slate-500 font-medium text-xs">User</th>
                  <th className="pb-2 text-slate-500 font-medium text-xs">Role</th>
                  <th className="pb-2 text-slate-500 font-medium text-xs hidden sm:table-cell">Data</th>
                  <th className="pb-2 text-slate-500 font-medium text-xs hidden md:table-cell">Joined</th>
                  <th className="pb-2 text-slate-500 font-medium text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5"><RoleBadge role={u.role} /></td>
                    <td className="py-2.5 hidden sm:table-cell">
                      <div className="flex gap-2 text-[10px] text-slate-400">
                        {u.relatedData.projects > 0 && <span>{u.relatedData.projects} proj</span>}
                        {u.relatedData.invoices > 0 && <span>{u.relatedData.invoices} inv</span>}
                        {u.relatedData.leads > 0 && <span>{u.relatedData.leads} leads</span>}
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {deleteConfirm === u.id ? (
                          <>
                            <button onClick={() => handleDeleteUser(u.id)} disabled={actionLoading === u.id}
                              className="text-[11px] px-2 py-1 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer">
                              {actionLoading === u.id ? "…" : "Confirm"}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-[11px] px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => openEditUser(u.id)} disabled={!!actionLoading || editLoading}
                              title="Edit User Profile"
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors disabled:opacity-30 cursor-pointer">
                              {editLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => handleResetPassword(u.id)} disabled={!!actionLoading}
                              title="Reset Password"
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors disabled:opacity-30 cursor-pointer">
                              {actionLoading === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => setDeleteConfirm(u.id)} disabled={!!actionLoading}
                              title="Delete Account"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30 cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-8">No users match your search</p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* ── 6. Diagnostics & Quick Actions ───────── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Bug className="h-5 w-5 text-red-500" /> Diagnostics & Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button onClick={refresh} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-left hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-colors cursor-pointer">
              <Activity className="h-5 w-5 text-blue-500 mb-1" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Run Full Diagnostics</p>
              <p className="text-[11px] text-blue-500/70">Re-check all systems, DB, services</p>
            </button>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
              <Server className="h-5 w-5 text-slate-400 mb-1" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Build Version</p>
              <p className="text-[11px] text-slate-400 font-mono">v1.0 — Phase 1 • Next.js {sysInfo?.framework.nextjs}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
              <Clock className="h-5 w-5 text-slate-400 mb-1" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Refreshed</p>
              <p className="text-[11px] text-slate-400 font-mono">{sysInfo?.timestamp ? new Date(sysInfo.timestamp).toLocaleString() : "—"}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ══════════════════════════════════════════════
          EDIT USER MODAL — Full Profile Editor
          ══════════════════════════════════════════════ */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditUser(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {((editUser as Record<string, string>).name || "?").charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit User Profile</h2>
                  <p className="text-xs text-slate-400">{(editUser as Record<string, string>).email} • ID: {((editUser as Record<string, string>).id || "").slice(0, 8)}…</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Status toggle */}
                <button onClick={handleToggleStatus}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    editForm.status === "active"
                      ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                      : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20"
                  }`}>
                  {editForm.status === "active" ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                  {editForm.status === "active" ? "Active" : "Suspended"}
                </button>
                <button onClick={() => setEditUser(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Photo & Quick Actions */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  {(editUser as Record<string, string>).image ? (
                    <img src={(editUser as Record<string, string>).image} alt="" className="h-16 w-16 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-lg" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {((editUser as Record<string, string>).name || "?").charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-slate-500">Profile Photo</p>
                  <div className="flex gap-2">
                    <button onClick={handleClearPhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer">
                      <ImageOff className="h-3.5 w-3.5" /> Clear Photo
                    </button>
                  </div>
                </div>
                {/* Activity Summary */}
                <div className="text-right space-y-0.5">
                  {(() => {
                    const counts = (editUser as Record<string, Record<string, number>>)?._count
                    if (!counts) return null
                    return (
                      <>
                        <p className="text-[10px] text-slate-400">{counts.projects || 0} projects</p>
                        <p className="text-[10px] text-slate-400">{counts.invoices || 0} invoices</p>
                        <p className="text-[10px] text-slate-400">{counts.sentMessages || 0} messages</p>
                        <p className="text-[10px] text-slate-400">{counts.receivedDocuments || 0} documents</p>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Identity Fields */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Identity</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">Full Name (auth)</label>
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">Display Name <span className="text-blue-500">(override)</span></label>
                    <input value={editForm.displayName} onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                      placeholder="Shows in portal instead of auth name"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">Auth Email <span className="text-slate-400">(read-only login)</span></label>
                    <input value={(editUser as Record<string, string>).email || ""} disabled
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/3 border border-slate-200 dark:border-white/10 text-sm text-slate-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block flex items-center gap-1"><Mail className="h-3 w-3" /> Display Email <span className="text-blue-500">(cosmetic fix)</span></label>
                    <input value={editForm.displayEmail} onChange={e => setEditForm(f => ({ ...f, displayEmail: e.target.value }))}
                      placeholder="e.g. john@gmail.com (clean version)"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                </div>
              </div>

              {/* Contact Fields */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Contact & Company</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block flex items-center gap-1"><Building2 className="h-3 w-3" /> Company</label>
                    <input value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                </div>
              </div>

              {/* Address Fields */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} placeholder="City"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <input value={editForm.postalCode} onChange={e => setEditForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="Postal code"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                  </div>
                  <div>
                    <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                      {["admin", "client", "contractor", "partner", "supplier", "inspector"].map(r => (
                        <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Internal Notes <span className="text-[10px] text-slate-400">(admin only)</span></p>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Private notes about this client…"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none" />
              </div>

              {/* Account Info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
                <span>Created: {(editUser as Record<string, string>).createdAt ? new Date((editUser as Record<string, string>).createdAt).toLocaleDateString() : "—"}</span>
                <span>Updated: {(editUser as Record<string, string>).updatedAt ? new Date((editUser as Record<string, string>).updatedAt).toLocaleDateString() : "—"}</span>
                <span>Last login: {(editUser as Record<string, string>).lastLoginAt ? new Date((editUser as Record<string, string>).lastLoginAt).toLocaleDateString() : "Never"}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-between p-5 border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-b-2xl">
              <button onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer">
                Cancel
              </button>
              <button onClick={saveEditUser} disabled={editSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all disabled:opacity-50 cursor-pointer">
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
