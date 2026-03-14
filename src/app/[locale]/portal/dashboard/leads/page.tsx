"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, UserPlus, Download, Upload, Trash2, X,
  ChevronLeft, ChevronRight, ArrowUpDown, Phone, Mail,
  MapPin, Building2, MoreHorizontal, Database, ChevronDown,
  Target, Loader2, RefreshCw,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface Lead {
  id: string; name: string; email: string; phone: string | null; company: string | null
  source: string; type: string; status: string; priority: string; stage: string
  subject: string | null; message: string | null; notes: string | null
  projectType: string | null; budget: string | null; address: string | null
  city: string | null; postalCode: string | null; metadata: string | null
  assignedToId: string | null; assignedTo: { id: string; name: string } | null
  convertedAt: string | null; createdAt: string; updatedAt: string
}
interface Pagination { page: number; limit: number; total: number; totalPages: number }

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"]
const PRIORITIES = ["low", "medium", "high", "urgent"]
const SOURCES = ["website", "referral", "phone", "walk_in", "home_depot"]

const statusColors: Record<string, string> = {
  new: "bg-blue-500/8 text-blue-600 dark:text-blue-400",
  contacted: "bg-amber-500/8 text-amber-600 dark:text-amber-400",
  qualified: "bg-purple-500/8 text-purple-600 dark:text-purple-400",
  converted: "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400",
  lost: "bg-slate-500/8 text-slate-500",
}
const priorityColors: Record<string, string> = {
  urgent: "bg-red-500/8 text-red-600 dark:text-red-400",
  high: "bg-amber-500/8 text-amber-600 dark:text-amber-400",
  medium: "bg-blue-500/8 text-blue-600 dark:text-blue-400",
  low: "bg-slate-500/8 text-slate-500",
}
const avatarColors: Record<string, string> = {
  new: "from-blue-500 to-blue-600",
  contacted: "from-amber-500 to-amber-600",
  qualified: "from-purple-500 to-purple-600",
  converted: "from-emerald-500 to-emerald-600",
  lost: "from-slate-400 to-slate-500",
}
const kpiAccent: Record<string, string> = {
  new: "text-blue-600 dark:text-blue-400",
  contacted: "text-amber-600 dark:text-amber-400",
  qualified: "text-purple-600 dark:text-purple-400",
  converted: "text-emerald-600 dark:text-emerald-400",
  lost: "text-slate-500",
}
const ago = (d: string) => {
  const ms = Date.now() - new Date(d).getTime()
  if (ms < 60000) return "now"
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m`
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h`
  if (ms < 604800000) return `${Math.floor(ms / 86400000)}d`
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─── Main Component ─────────────────────────────────────
export default function LeadsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPriority, setFilterPriority] = useState("")
  const [filterSource, setFilterSource] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showCreate, setShowCreate] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [showImport, setShowImport] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchLeads = useCallback(async (p = pagination.page) => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(p), limit: "50",
      ...(search && { search }), ...(filterStatus && { status: filterStatus }),
      ...(filterPriority && { priority: filterPriority }), ...(filterSource && { source: filterSource }),
      sortBy, sortDir,
    })
    try {
      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads || [])
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 })
      if (data.counts) setCounts(data.counts)
    } catch { /* ignore */ }
    setLoading(false)
  }, [search, filterStatus, filterPriority, filterSource, sortBy, sortDir, pagination.page])

  useEffect(() => { fetchLeads(1) }, [filterStatus, filterPriority, filterSource, sortBy, sortDir])
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchLeads(1), 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search])

  const bulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} lead(s)?`)) return
    await fetch("/api/admin/leads", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: Array.from(selected) }) })
    setSelected(new Set()); fetchLeads()
  }

  const updateLeadStatus = async (id: string, status: string) => {
    await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
    fetchLeads(pagination.page)
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(field); setSortDir("desc") }
  }

  const toggleSelectAll = () => {
    if (selected.size === leads.length) setSelected(new Set())
    else setSelected(new Set(leads.map(l => l.id)))
  }

  if (!isAdmin) return <div className="text-center py-16"><p className="text-sm text-slate-500">Admin access required</p></div>

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-3 max-w-full">
      {/* ── Header Bar ──────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500" /> Leads
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{pagination.total.toLocaleString()} total in database</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/8 transition-colors">
            <Upload className="h-3 w-3" /> Import
          </button>
          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/60 dark:border-white/8 transition-colors">
              <Download className="h-3 w-3" /> Export <ChevronDown className="h-2.5 w-2.5" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-20 w-36 p-1 rounded-lg bg-white dark:bg-slate-900 shadow-xl border border-slate-200/60 dark:border-white/8">
              <a href="/api/admin/leads/export?format=csv" className="block px-3 py-1.5 rounded text-[11px] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300">Export CSV</a>
              <a href="/api/admin/leads/export?format=json" className="block px-3 py-1.5 rounded text-[11px] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300">Export JSON</a>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            <UserPlus className="h-3 w-3" /> New Lead
          </button>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}
        className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-slate-200/60 dark:bg-white/8 rounded-lg overflow-hidden border border-slate-200/60 dark:border-white/8">
        {[
          { label: "Total", value: totalAll, accent: "text-slate-700 dark:text-white" },
          { label: "New", value: counts.new || 0, accent: kpiAccent.new },
          { label: "Contacted", value: counts.contacted || 0, accent: kpiAccent.contacted },
          { label: "Qualified", value: counts.qualified || 0, accent: kpiAccent.qualified },
          { label: "Converted", value: counts.converted || 0, accent: kpiAccent.converted },
          { label: "Lost", value: counts.lost || 0, accent: kpiAccent.lost },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-slate-950 px-3 py-2">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-lg font-bold tabular-nums leading-tight ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Search + Filters ────────────────── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone, company, city…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/8 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { val: filterStatus, set: setFilterStatus, opts: STATUSES, placeholder: "Status" },
            { val: filterPriority, set: setFilterPriority, opts: PRIORITIES, placeholder: "Priority" },
            { val: filterSource, set: setFilterSource, opts: SOURCES, placeholder: "Source" },
          ].map(f => (
            <select key={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-white/8 text-[11px] text-slate-600 dark:text-slate-400">
              <option value="">All {f.placeholder}s</option>
              {f.opts.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          ))}
        </div>
      </motion.div>

      {/* ── Bulk Actions ────────────────────── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/5 border border-blue-200/40 dark:border-blue-500/10">
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">{selected.size} selected</span>
          <button onClick={bulkDelete} className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/8 text-red-600 dark:text-red-400 text-[10px] font-medium hover:bg-red-500/15">
            <Trash2 className="h-2.5 w-2.5" /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="text-[10px] text-slate-400 hover:underline ml-auto">Clear</button>
        </div>
      )}

      {/* ── Table ───────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-lg border border-slate-200/60 dark:border-white/8 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                <th className="px-3 py-2 w-8"><input type="checkbox" checked={selected.size === leads.length && leads.length > 0} onChange={toggleSelectAll} className="rounded" /></th>
                <th className="px-3 py-2 text-left"><button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Lead {sortBy === "name" && <ArrowUpDown className="h-2.5 w-2.5" />}</button></th>
                <th className="px-3 py-2 text-left hidden md:table-cell"><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Contact</span></th>
                <th className="px-3 py-2 text-left hidden lg:table-cell"><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Company</span></th>
                <th className="px-3 py-2 text-center"><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Status</span></th>
                <th className="px-3 py-2 text-center hidden sm:table-cell"><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Priority</span></th>
                <th className="px-3 py-2 text-center hidden lg:table-cell"><span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Source</span></th>
                <th className="px-3 py-2 text-right"><button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide ml-auto">Date {sortBy === "createdAt" && <ArrowUpDown className="h-2.5 w-2.5" />}</button></th>
              </tr>
            </thead>
            <tbody>
              {(showCreate || editingLead) && (
                <tr className="border-b border-blue-200/30 dark:border-blue-500/10">
                  <td colSpan={8} className="p-0">
                    <InlineLeadForm lead={editingLead}
                      onClose={() => { setShowCreate(false); setEditingLead(null) }}
                      onSaved={() => { setShowCreate(false); setEditingLead(null); fetchLeads(pagination.page) }} />
                  </td>
                </tr>
              )}
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400 mx-auto" />
                  <span className="text-[11px] text-slate-400 mt-1 block">Loading leads…</span>
                </td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-[11px] text-slate-400">No leads found. {search || filterStatus ? "Try adjusting filters." : "Create your first lead."}</td></tr>
              ) : leads.map((lead, i) => {
                const initials = lead.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                return (
                <tr key={lead.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors cursor-pointer ${i > 0 ? "border-t border-slate-50 dark:border-white/3" : ""}`}
                  onClick={() => setEditingLead(lead)}>
                  <td className="px-3 py-2 align-top" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(lead.id)}
                      onChange={() => { const s = new Set(selected); s.has(lead.id) ? s.delete(lead.id) : s.add(lead.id); setSelected(s) }} className="rounded mt-0.5" />
                  </td>
                  {/* Lead: Avatar + Name + Location + Tags + Notes */}
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-start gap-2">
                      <div className={`h-7 w-7 rounded-md bg-gradient-to-br ${avatarColors[lead.status] || "from-slate-400 to-slate-500"} flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-sm`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-900 dark:text-white leading-tight">{lead.name}</p>
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {lead.city && (
                            <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                              <MapPin className="h-2 w-2" />{lead.city}
                            </span>
                          )}
                          {lead.projectType && (
                            <span className="text-[8px] px-1 py-px rounded bg-indigo-500/8 text-indigo-600 dark:text-indigo-400 font-medium">{lead.projectType}</span>
                          )}
                          {lead.budget && (
                            <span className="text-[8px] px-1 py-px rounded bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 font-medium">{lead.budget}</span>
                          )}
                        </div>
                        {lead.notes && (
                          <p className="text-[9px] text-amber-600/80 dark:text-amber-400/80 leading-tight truncate max-w-[240px] mt-0.5" title={lead.notes}>
                            📝 {lead.notes.slice(0, 60)}{lead.notes.length > 60 ? "…" : ""}
                          </p>
                        )}
                        {!lead.notes && lead.message && (
                          <p className="text-[9px] text-slate-400 leading-tight truncate max-w-[240px] mt-0.5 italic" title={lead.message}>
                            💬 {lead.message.slice(0, 55)}{lead.message.length > 55 ? "…" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="px-3 py-2 hidden md:table-cell align-top">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <Mail className="h-2.5 w-2.5 text-slate-300 shrink-0" />
                      <span className="truncate max-w-[140px]">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Phone className="h-2 w-2 text-slate-300 shrink-0" />{lead.phone}
                      </div>
                    )}
                    {lead.assignedTo && (
                      <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400">
                        <span className="h-1 w-1 rounded-full bg-blue-400" />
                        {lead.assignedTo.name}
                      </div>
                    )}
                  </td>
                  {/* Company */}
                  <td className="px-3 py-2 hidden lg:table-cell align-top">
                    {lead.company ? (
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <Building2 className="h-2.5 w-2.5 text-slate-300 shrink-0" />{lead.company}
                      </div>
                    ) : <span className="text-[10px] text-slate-300">—</span>}
                  </td>
                  {/* Status */}
                  <td className="px-3 py-2 text-center align-top" onClick={e => e.stopPropagation()}>
                    <select value={lead.status} onChange={e => updateLeadStatus(lead.id, e.target.value)}
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border-0 cursor-pointer ${statusColors[lead.status] || ""}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  {/* Priority */}
                  <td className="px-3 py-2 text-center hidden sm:table-cell align-top">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${priorityColors[lead.priority] || ""}`}>{lead.priority}</span>
                  </td>
                  {/* Source */}
                  <td className="px-3 py-2 text-center hidden lg:table-cell align-top">
                    <span className="text-[10px] text-slate-500 capitalize">{lead.source.replace(/_/g, " ")}</span>
                  </td>
                  {/* Date */}
                  <td className="px-3 py-2 text-right align-top">
                    <p className="text-[10px] text-slate-500 tabular-nums">{ago(lead.createdAt)}</p>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] text-slate-400">Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} leads</span>
            <div className="flex gap-0.5">
              <button onClick={() => fetchLeads(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="h-3 w-3" /></button>
              <button onClick={() => fetchLeads(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30"><ChevronRight className="h-3 w-3" /></button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Footer ──────────────────────────── */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
        <span>{pagination.total} leads · {Object.keys(counts).length} statuses</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); fetchLeads(1) }} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Inline Lead Form ───────────────────────────────────
function InlineLeadForm({ lead, onClose, onSaved }: { lead: Lead | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!lead
  const [form, setForm] = useState({
    name: lead?.name || "", email: lead?.email || "", phone: lead?.phone || "",
    company: lead?.company || "", source: lead?.source || "website", type: lead?.type || "contact",
    status: lead?.status || "new", priority: lead?.priority || "medium", stage: lead?.stage || "lead_received",
    subject: lead?.subject || "", message: lead?.message || "", notes: lead?.notes || "",
    projectType: lead?.projectType || "", budget: lead?.budget || "",
    address: lead?.address || "", city: lead?.city || "", postalCode: lead?.postalCode || "",
  })
  const [submitting, setSubmitting] = useState(false)
  const update = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true)
    const method = isEdit ? "PATCH" : "POST"
    const body = isEdit ? { id: lead!.id, ...form } : form
    await fetch("/api/admin/leads", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setSubmitting(false); onSaved()
  }

  const iCls = "w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/8 text-[11px] focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
  const lCls = "block text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5"

  return (
    <div className="bg-blue-500/3 border-b border-blue-200/30 dark:border-blue-500/10">
      <form onSubmit={handleSubmit} className="px-3 py-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-3 w-3 text-blue-500" />
            <span className="text-[11px] font-semibold text-slate-700 dark:text-white">{isEdit ? "Edit Lead" : "New Lead"}</span>
            {isEdit && <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/8 text-amber-600 dark:text-amber-400 font-bold">EDITING</span>}
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-3 w-3" /></button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <div><label className={lCls}>Name</label><input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="John Smith" className={iCls} autoFocus /></div>
          <div><label className={lCls}>Email</label><input type="text" value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" className={iCls} /></div>
          <div><label className={lCls}>Phone</label><input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="(514) 555-1234" className={iCls} /></div>
          <div><label className={lCls}>Company</label><input type="text" value={form.company} onChange={e => update("company", e.target.value)} placeholder="Company" className={iCls} /></div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <div><label className={lCls}>Status</label><select value={form.status} onChange={e => update("status", e.target.value)} className={iCls}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/\b\w/g, c => c.toUpperCase())}</option>)}</select></div>
          <div><label className={lCls}>Priority</label><select value={form.priority} onChange={e => update("priority", e.target.value)} className={iCls}>{PRIORITIES.map(p => <option key={p} value={p}>{p.replace(/\b\w/g, c => c.toUpperCase())}</option>)}</select></div>
          <div><label className={lCls}>Source</label><select value={form.source} onChange={e => update("source", e.target.value)} className={iCls}>{SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}</select></div>
          <div><label className={lCls}>City</label><input type="text" value={form.city} onChange={e => update("city", e.target.value)} placeholder="Montreal" className={iCls} /></div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <div><label className={lCls}>Project Type</label><input type="text" value={form.projectType} onChange={e => update("projectType", e.target.value)} placeholder="Windows" className={iCls} /></div>
          <div><label className={lCls}>Budget</label><input type="text" value={form.budget} onChange={e => update("budget", e.target.value)} placeholder="$25,000" className={iCls} /></div>
          <div><label className={lCls}>Address</label><input type="text" value={form.address} onChange={e => update("address", e.target.value)} placeholder="123 Main St" className={iCls} /></div>
          <div><label className={lCls}>Postal Code</label><input type="text" value={form.postalCode} onChange={e => update("postalCode", e.target.value)} placeholder="H1A 1A1" className={iCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div><label className={lCls}>Notes</label><input type="text" value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Internal notes about this lead…" className={iCls} /></div>
          <div><label className={lCls}>Message</label><input type="text" value={form.message} onChange={e => update("message", e.target.value)} placeholder="Client's message…" className={iCls} /></div>
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" disabled={submitting}
            className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded text-[11px] font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors">
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Lead"}
          </button>
          <button type="button" onClick={onClose} className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-600">Cancel</button>
        </div>
      </form>
    </div>
  )
}

// ─── Import Modal ───────────────────────────────────────
function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split("\n").filter(l => l.trim())
    if (lines.length < 2) return []
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
    return lines.slice(1).map(line => {
      const values: string[] = []; let current = ""; let inQuotes = false
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes
        else if (char === "," && !inQuotes) { values.push(current.trim()); current = "" }
        else current += char
      }
      values.push(current.trim())
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { if (values[i]) obj[h] = values[i] })
      return obj
    })
  }

  const handleFile = async (f: File) => {
    setFile(f)
    const text = await f.text()
    if (f.name.endsWith(".json")) {
      try { const d = JSON.parse(text); setPreview((d.leads || (Array.isArray(d) ? d : [])).slice(0, 5)) } catch { setPreview([]) }
    } else setPreview(parseCSV(text).slice(0, 5))
  }

  const handleImport = async () => {
    if (!file) return; setImporting(true)
    const text = await file.text()
    let leads: Record<string, string>[]
    if (file.name.endsWith(".json")) { const d = JSON.parse(text); leads = d.leads || (Array.isArray(d) ? d : []) }
    else leads = parseCSV(text)
    const res = await fetch("/api/admin/leads/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leads }) })
    setResult(await res.json()); setImporting(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-lg bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/60 dark:border-white/8"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-[11px] font-semibold text-slate-700 dark:text-white flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-blue-500" /> Import Leads</h3>
          <button onClick={onClose}><X className="h-3.5 w-3.5 text-slate-400" /></button>
        </div>
        <div className="p-4 space-y-3">
          {result ? (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-200/40 dark:border-emerald-500/10">
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">✓ Imported {result.imported} leads ({result.skipped} skipped)</p>
              </div>
              {result.errors.length > 0 && (
                <div className="p-2 rounded-lg bg-red-500/5 text-[10px] text-red-600 space-y-0.5 max-h-24 overflow-y-auto">
                  {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              <button onClick={onImported} className="w-full py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[11px] font-medium">Done</button>
            </div>
          ) : (
            <>
              <div onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
                className={`p-6 rounded-lg border-2 border-dashed transition-all text-center ${dragOver ? "border-blue-500 bg-blue-500/5" : "border-slate-200/60 dark:border-white/8"}`}>
                <label className="cursor-pointer">
                  <input type="file" accept=".csv,.json" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} className="hidden" />
                  <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-[11px] text-slate-500 font-medium">{file ? file.name : "Drop CSV/JSON or click"}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Requires "name" and "email" columns</p>
                </label>
              </div>
              {preview.length > 0 && (
                <div className="overflow-x-auto rounded border border-slate-200/60 dark:border-white/8 max-h-28">
                  <table className="text-[9px] w-full">
                    <thead><tr className="bg-slate-50 dark:bg-white/2">{Object.keys(preview[0]).slice(0, 5).map(k => <th key={k} className="px-1.5 py-1 text-left text-slate-400 font-medium">{k}</th>)}</tr></thead>
                    <tbody>{preview.map((row, i) => <tr key={i} className="border-t border-slate-50 dark:border-white/3">{Object.keys(preview[0]).slice(0, 5).map(k => <td key={k} className="px-1.5 py-0.5 text-slate-500 truncate max-w-[100px]">{row[k] || ""}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-600">Cancel</button>
                <button onClick={handleImport} disabled={!file || importing}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[11px] font-medium disabled:opacity-50">
                  {importing ? "Importing…" : "Import"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
