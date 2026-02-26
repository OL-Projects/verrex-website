"use client"

import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { usePortalStore } from "@/lib/portal-store"
import { useState } from "react"
import { PIPELINE_STAGES } from "@/types/portal"
import type { LeadSource, LeadPriority, PipelineStage } from "@/types/portal"
import {
  UserPlus, Search, Filter, Building2, AlertTriangle,
  Phone, Mail, MapPin, X, Pencil, ArrowRightCircle,
  ChevronDown, Check, Briefcase,
} from "lucide-react"

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  high: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  medium: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  low: "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400",
}
const sourceColors: Record<string, string> = {
  home_depot: "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400",
  website: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  referral: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  phone: "bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400",
  walk_in: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
}
const LEAD_STAGES = PIPELINE_STAGES.filter(s => ["lead_received", "contacted", "appointment_scheduled", "measured", "quote_prepared", "client_approved", "client_declined"].includes(s.key))

const emptyForm = { clientName: "", clientEmail: "", clientPhone: "", address: "", city: "", postalCode: "", source: "website" as LeadSource, priority: "medium" as LeadPriority, notes: "", partnerId: "" }

export default function LeadsPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const userId = session?.user?.id || "usr_admin_001"

  const [searchQuery, setSearchQuery] = useState("")
  const [filterSource, setFilterSource] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [stageDropdown, setStageDropdown] = useState<string | null>(null)

  const leads = store.leads.filter(l => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = l.clientName.toLowerCase().includes(q) || l.address.toLowerCase().includes(q) || l.clientEmail.toLowerCase().includes(q)
    const matchesSource = filterSource === "all" || l.source === filterSource
    return matchesSearch && matchesSource
  })

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (id: string) => {
    const lead = store.leads.find(l => l.id === id)
    if (!lead) return
    setEditingId(id)
    setForm({ clientName: lead.clientName, clientEmail: lead.clientEmail, clientPhone: lead.clientPhone, address: lead.address, city: lead.city, postalCode: lead.postalCode || "", source: lead.source, priority: lead.priority, notes: lead.notes || "", partnerId: lead.partnerId || "" })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.clientName.trim() || !form.address.trim()) return
    if (editingId) {
      store.updateLead(editingId, { clientName: form.clientName, clientEmail: form.clientEmail, clientPhone: form.clientPhone, address: form.address, city: form.city, postalCode: form.postalCode, source: form.source, priority: form.priority, notes: form.notes, partnerId: form.partnerId })
    } else {
      store.createLead({ clientName: form.clientName, clientEmail: form.clientEmail, clientPhone: form.clientPhone, address: form.address, city: form.city, postalCode: form.postalCode, source: form.source, priority: form.priority, notes: form.notes, partnerId: form.partnerId })
    }
    setShowModal(false)
  }

  const handleConvert = (id: string) => {
    if (confirm("Convert this lead to a project?")) {
      store.convertLeadToProject(id, userId)
    }
  }

  const handleStageChange = (leadId: string, stage: PipelineStage) => {
    store.changeLeadStage(leadId, stage, userId)
    setStageDropdown(null)
  }

  const f = (key: keyof typeof form, val: string) => setForm(p => ({ ...p, [key]: val }))

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{leads.length} leads in pipeline</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
          <UserPlus className="h-4 w-4" /> New Lead
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm">
          <option value="all">All Sources</option>
          <option value="home_depot">Home Depot</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="phone">Phone</option>
          <option value="walk_in">Walk-in</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {leads.map((lead, idx) => (
          <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
            className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 hover:border-blue-400/20 dark:hover:border-blue-400/15 transition-all group">
            <div className="flex items-start gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${lead.priority === "urgent" ? "bg-red-100 dark:bg-red-500/15" : "bg-blue-100 dark:bg-blue-500/15"}`}>
                {lead.priority === "urgent" ? <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /> : <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{lead.clientName}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[lead.priority]}`}>{lead.priority}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sourceColors[lead.source]}`}>{lead.source.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.address}, {lead.city}</span>
                  {lead.clientPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.clientPhone}</span>}
                  {lead.clientEmail && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.clientEmail}</span>}
                </div>
                {lead.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-1">{lead.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Stage dropdown */}
                <div className="relative">
                  <button onClick={() => setStageDropdown(stageDropdown === lead.id ? null : lead.id)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium capitalize inline-flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-500/25 transition-colors">
                    {lead.stage.replace(/_/g, " ")} <ChevronDown className="h-3 w-3" />
                  </button>
                  {stageDropdown === lead.id && (
                    <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl py-1 max-h-60 overflow-y-auto">
                      {LEAD_STAGES.map(s => (
                        <button key={s.key} onClick={() => handleStageChange(lead.id, s.key)}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 ${lead.stage === s.key ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
                          {lead.stage === s.key && <Check className="h-3 w-3" />}
                          <span className={lead.stage === s.key ? "" : "pl-5"}>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(lead.id)} title="Edit Lead" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleConvert(lead.id)} title="Convert to Project" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-green-500">
                    <ArrowRightCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">{lead.updatedAt}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {leads.length === 0 && (
          <div className="py-16 text-center">
            <Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No leads match your search.</p>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingId ? "Edit Lead" : "New Lead"}</h2>
                <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Client Name *</label>
                    <input value={form.clientName} onChange={e => f("clientName", e.target.value)} placeholder="John Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                    <input value={form.clientEmail} onChange={e => f("clientEmail", e.target.value)} type="email" placeholder="john@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Phone</label>
                    <input value={form.clientPhone} onChange={e => f("clientPhone", e.target.value)} placeholder="(514) 555-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Address *</label>
                    <input value={form.address} onChange={e => f("address", e.target.value)} placeholder="123 Main Street"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">City</label>
                    <input value={form.city} onChange={e => f("city", e.target.value)} placeholder="Montreal"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Postal Code</label>
                    <input value={form.postalCode} onChange={e => f("postalCode", e.target.value)} placeholder="H2X 1Y4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/40 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Source</label>
                    <select value={form.source} onChange={e => f("source", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none">
                      <option value="website">Website</option>
                      <option value="home_depot">Home Depot</option>
                      <option value="referral">Referral</option>
                      <option value="phone">Phone</option>
                      <option value="walk_in">Walk-in</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Priority</label>
                    <select value={form.priority} onChange={e => f("priority", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 focus:outline-none">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Notes</label>
                    <textarea value={form.notes} onChange={e => f("notes", e.target.value)} rows={3} placeholder="Additional notes..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500/40 focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-white/10">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">Cancel</button>
                <button onClick={handleSubmit} disabled={!form.clientName.trim() || !form.address.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingId ? "Save Changes" : "Create Lead"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
