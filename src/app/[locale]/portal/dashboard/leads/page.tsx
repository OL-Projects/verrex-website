"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Filter, UserPlus, Download, Upload, Trash2, X,
  ChevronLeft, ChevronRight, ArrowUpDown, Phone, Mail,
  MapPin, Building2, Calendar, AlertTriangle, CheckCircle2,
  Clock, Star, MoreHorizontal, FileText, Database,
  ChevronDown,
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
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  qualified: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  converted: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
}
const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
}
const avatarColors: Record<string, string> = {
  new: "from-blue-500 to-blue-600",
  contacted: "from-amber-500 to-amber-600",
  qualified: "from-purple-500 to-purple-600",
  converted: "from-emerald-500 to-emerald-600",
  lost: "from-slate-400 to-slate-500",
}
const ago = (d: string) => {
  const ms = Date.now() - new Date(d).getTime()
  if (ms < 60000) return "now"
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`
  if (ms < 604800000) return `${Math.floor(ms / 86400000)}d ago`
  return new Date(d).toLocaleDateString()
}

// ─── Main Component ─────────────────────────────────────
export default function LeadsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  const [leads, setLeads] = useState<Lead[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 })
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

  // Fetch leads
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
    } catch { /* ignore */ }
    setLoading(false)
  }, [search, filterStatus, filterPriority, filterSource, sortBy, sortDir, pagination.page])

  useEffect(() => { fetchLeads(1) }, [filterStatus, filterPriority, filterSource, sortBy, sortDir])

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchLeads(1), 400)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search])

  // Bulk delete
  const bulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} lead(s)?`)) return
    await fetch("/api/admin/leads", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    })
    setSelected(new Set())
    fetchLeads()
  }

  // Quick status update
  const updateLeadStatus = async (id: string, status: string) => {
    await fetch("/api/admin/leads", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    fetchLeads(pagination.page)
  }

  // Toggle sort
  const toggleSort = (field: string) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortBy(field); setSortDir("desc") }
  }

  // Select all visible
  const toggleSelectAll = () => {
    if (selected.size === leads.length) setSelected(new Set())
    else setSelected(new Set(leads.map(l => l.id)))
  }

  if (!isAdmin) return <div className="text-center py-16"><p className="text-slate-500">Admin access required</p></div>

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total.toLocaleString()} total leads in database</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5">
            <Upload className="h-4 w-4" /> Import
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5">
              <Download className="h-4 w-4" /> Export <ChevronDown className="h-3 w-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-20 w-40 p-1 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700">
              <a href="/api/admin/leads/export?format=csv" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Export CSV</a>
              <a href="/api/admin/leads/export?format=json" className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300">Export JSON (Backup)</a>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
            <UserPlus className="h-4 w-4" /> New Lead
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search leads by name, email, phone, company, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm">
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm">
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{selected.size} selected</span>
          <button onClick={bulkDelete} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 dark:bg-red-500/15 dark:text-red-400">
            <Trash2 className="h-3 w-3" /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-slate-500 hover:underline ml-auto">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                <th className="p-3 w-10"><input type="checkbox" checked={selected.size === leads.length && leads.length > 0} onChange={toggleSelectAll} className="rounded" /></th>
                <th className="p-3 text-left"><button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase">Name {sortBy === "name" && <ArrowUpDown className="h-3 w-3" />}</button></th>
                <th className="p-3 text-left hidden md:table-cell"><button onClick={() => toggleSort("email")} className="text-xs font-semibold text-slate-500 uppercase">Contact</button></th>
                <th className="p-3 text-left hidden lg:table-cell"><span className="text-xs font-semibold text-slate-500 uppercase">Company</span></th>
                <th className="p-3 text-center"><span className="text-xs font-semibold text-slate-500 uppercase">Status</span></th>
                <th className="p-3 text-center hidden sm:table-cell"><span className="text-xs font-semibold text-slate-500 uppercase">Priority</span></th>
                <th className="p-3 text-center hidden lg:table-cell"><span className="text-xs font-semibold text-slate-500 uppercase">Source</span></th>
                <th className="p-3 text-right"><button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase ml-auto">Date {sortBy === "createdAt" && <ArrowUpDown className="h-3 w-3" />}</button></th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {/* Inline form row — inside table under header */}
              {(showCreate || editingLead) && (
                <tr className="border-b border-blue-200/40 dark:border-blue-500/10">
                  <td colSpan={9} className="p-0">
                    <InlineLeadForm lead={editingLead}
                      onClose={() => { setShowCreate(false); setEditingLead(null) }}
                      onSaved={() => { setShowCreate(false); setEditingLead(null); fetchLeads(pagination.page) }} />
                  </td>
                </tr>
              )}
              {loading ? (
                <tr><td colSpan={9} className="p-12 text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" /></td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={9} className="p-12 text-center text-slate-500 dark:text-slate-400">No leads found. {search || filterStatus ? "Try adjusting filters." : "Create your first lead."}</td></tr>
              ) : leads.map(lead => {
                const initials = lead.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                const hasExtras = !!(lead.notes || lead.message || lead.projectType || lead.budget)
                return (
                <tr key={lead.id} className="border-b border-slate-100 dark:border-white/3 hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors cursor-pointer"
                  onClick={() => setEditingLead(lead)}>
                  <td className="p-3 align-top" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(lead.id)}
                      onChange={() => { const s = new Set(selected); s.has(lead.id) ? s.delete(lead.id) : s.add(lead.id); setSelected(s) }} className="rounded mt-1" />
                  </td>
                  {/* Avatar + Name + Location + Tags */}
                  <td className="p-3 align-top">
                    <div className="flex items-start gap-2.5">
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${avatarColors[lead.status] || "from-slate-400 to-slate-500"} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-[13px] leading-tight">{lead.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {lead.city && (
                            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                              <MapPin className="h-2.5 w-2.5" />{lead.city}{lead.postalCode ? `, ${lead.postalCode}` : ""}
                            </span>
                          )}
                          {lead.projectType && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">{lead.projectType}</span>
                          )}
                          {lead.budget && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">{lead.budget}</span>
                          )}
                        </div>
                        {/* Notes / Message preview */}
                        {hasExtras && (
                          <div className="mt-1 space-y-0.5">
                            {lead.notes && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-tight truncate max-w-[280px]" title={lead.notes}>
                                📝 {lead.notes.slice(0, 80)}{lead.notes.length > 80 ? "…" : ""}
                              </p>
                            )}
                            {lead.message && !lead.notes && (
                              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[280px] italic" title={lead.message}>
                                💬 {lead.message.slice(0, 70)}{lead.message.length > 70 ? "…" : ""}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="p-3 hidden md:table-cell align-top">
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <Mail className="h-3 w-3 text-slate-300 shrink-0" />
                      <span className="truncate max-w-[160px]">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Phone className="h-2.5 w-2.5 text-slate-300 shrink-0" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.assignedTo && (
                      <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        Assigned: <span className="font-medium text-slate-500 dark:text-slate-300">{lead.assignedTo.name}</span>
                      </div>
                    )}
                  </td>
                  {/* Company */}
                  <td className="p-3 hidden lg:table-cell align-top">
                    {lead.company ? (
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <Building2 className="h-3 w-3 text-slate-300 shrink-0" />
                        {lead.company}
                      </div>
                    ) : <span className="text-[10px] text-slate-300">—</span>}
                  </td>
                  {/* Status */}
                  <td className="p-3 text-center align-top" onClick={e => e.stopPropagation()}>
                    <select value={lead.status} onChange={e => updateLeadStatus(lead.id, e.target.value)}
                      className={`text-[10px] px-2 py-1 rounded-full font-bold border-0 cursor-pointer ${statusColors[lead.status] || ""}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  {/* Priority */}
                  <td className="p-3 text-center hidden sm:table-cell align-top">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${priorityColors[lead.priority] || ""}`}>{lead.priority}</span>
                  </td>
                  {/* Source */}
                  <td className="p-3 text-center hidden lg:table-cell align-top">
                    <span className="text-[10px] text-slate-500 capitalize">{lead.source.replace(/_/g, " ")}</span>
                  </td>
                  {/* Date */}
                  <td className="p-3 text-right align-top">
                    <p className="text-[10px] text-slate-500 whitespace-nowrap">{ago(lead.createdAt)}</p>
                    <p className="text-[9px] text-slate-300 mt-0.5">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-3 text-center align-top"><MoreHorizontal className="h-4 w-4 text-slate-300" /></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-white/5">
            <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages} ({pagination.total.toLocaleString()} leads)</span>
            <div className="flex gap-1">
              <button onClick={() => fetchLeads(pagination.page - 1)} disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => fetchLeads(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); fetchLeads(1) }} />}
      </AnimatePresence>
    </div>
  )
}

// ─── Inline Lead Create/Edit Form ───────────────────────
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

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const method = isEdit ? "PATCH" : "POST"
    const body = isEdit ? { id: lead!.id, ...form } : form
    await fetch("/api/admin/leads", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setSubmitting(false); onSaved()
  }

  const iCls = "w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
  const lCls = "block text-[10px] font-medium text-slate-400 mb-0.5"

  return (
    <div className="bg-blue-50/40 dark:bg-blue-500/5 border-b border-blue-200/40 dark:border-blue-500/10">
      <form onSubmit={handleSubmit} className="max-w-2xl px-4 py-3 space-y-2.5">
        {/* Header line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-white">{isEdit ? "Edit Lead" : "New Lead"}</span>
            {isEdit && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold">EDITING</span>}
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
        </div>

        {/* Row 1: Core — Name, Email, Phone, Company */}
        <div className="grid grid-cols-4 gap-2">
          <div><label className={lCls}>Name</label><input type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="John Smith" className={iCls} autoFocus /></div>
          <div><label className={lCls}>Email</label><input type="text" value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" className={iCls} /></div>
          <div><label className={lCls}>Phone</label><input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="(514) 555-1234" className={iCls} /></div>
          <div><label className={lCls}>Company</label><input type="text" value={form.company} onChange={e => update("company", e.target.value)} placeholder="Company" className={iCls} /></div>
        </div>

        {/* Row 2: Classification — Status, Priority, Source, City */}
        <div className="grid grid-cols-4 gap-2">
          <div><label className={lCls}>Status</label><select value={form.status} onChange={e => update("status", e.target.value)} className={iCls}>{STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
          <div><label className={lCls}>Priority</label><select value={form.priority} onChange={e => update("priority", e.target.value)} className={iCls}>{PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select></div>
          <div><label className={lCls}>Source</label><select value={form.source} onChange={e => update("source", e.target.value)} className={iCls}>{SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}</select></div>
          <div><label className={lCls}>City</label><input type="text" value={form.city} onChange={e => update("city", e.target.value)} placeholder="Montreal" className={iCls} /></div>
        </div>

        {/* Row 3: Extra — Address, Postal, Budget, Notes */}
        <div className="grid grid-cols-4 gap-2">
          <div><label className={lCls}>Address</label><input type="text" value={form.address} onChange={e => update("address", e.target.value)} placeholder="123 Main St" className={iCls} /></div>
          <div><label className={lCls}>Postal Code</label><input type="text" value={form.postalCode} onChange={e => update("postalCode", e.target.value)} placeholder="H1A 1A1" className={iCls} /></div>
          <div><label className={lCls}>Budget</label><input type="text" value={form.budget} onChange={e => update("budget", e.target.value)} placeholder="$25,000" className={iCls} /></div>
          <div><label className={lCls}>Notes</label><input type="text" value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Quick notes..." className={iCls} /></div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <button type="submit" disabled={submitting}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors">
            {submitting ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Cancel</button>
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
      const values: string[] = []
      let current = ""; let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes }
        else if (char === "," && !inQuotes) { values.push(current.trim()); current = "" }
        else { current += char }
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
      try {
        const data = JSON.parse(text)
        const leads = data.leads || (Array.isArray(data) ? data : [])
        setPreview(leads.slice(0, 5))
      } catch { setPreview([]) }
    } else {
      setPreview(parseCSV(text).slice(0, 5))
    }
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    const text = await file.text()
    let leads: Record<string, string>[]
    if (file.name.endsWith(".json")) {
      const data = JSON.parse(text)
      leads = data.leads || (Array.isArray(data) ? data : [])
    } else {
      leads = parseCSV(text)
    }
    const res = await fetch("/api/admin/leads/import", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leads }),
    })
    const data = await res.json()
    setResult(data)
    setImporting(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Database className="h-5 w-5 text-blue-500" /> Import Leads</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {result ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">✓ Imported {result.imported} leads ({result.skipped} skipped)</p>
              </div>
              {result.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              <button onClick={onImported} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium">Done</button>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)}
                className={`p-8 rounded-xl border-2 border-dashed transition-all text-center ${dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-300 dark:border-slate-600"}`}>
                <label className="cursor-pointer">
                  <input type="file" accept=".csv,.json" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} className="hidden" />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{file ? file.name : "Drag & drop or click to upload"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">CSV or JSON — must have "name" and "email" columns</p>
                </label>
              </div>
              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Preview (first {preview.length} rows):</p>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 max-h-40">
                    <table className="text-[10px] w-full">
                      <thead><tr className="bg-slate-50 dark:bg-white/3">{Object.keys(preview[0]).slice(0, 6).map(k => <th key={k} className="px-2 py-1 text-left text-slate-500 font-medium">{k}</th>)}</tr></thead>
                      <tbody>{preview.map((row, i) => <tr key={i} className="border-t border-slate-100 dark:border-white/3">{Object.keys(preview[0]).slice(0, 6).map(k => <td key={k} className="px-2 py-1 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{row[k] || ""}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                <button onClick={handleImport} disabled={!file || importing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                  {importing ? "Importing..." : "Import Leads"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
