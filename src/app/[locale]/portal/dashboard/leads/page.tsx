"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { mockLeads } from "@/lib/portal-data"
import { useState } from "react"
import {
  UserPlus, Search, Filter, Building2, AlertTriangle,
  Phone, Mail, MapPin, ArrowUpDown,
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

export default function LeadsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSource, setFilterSource] = useState("all")

  const leads = mockLeads.filter(l => {
    const matchesSearch = l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSource = filterSource === "all" || l.source === filterSource
    return matchesSearch && matchesSource
  })

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{leads.length} leads in pipeline</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
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
          className="px-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
          <option value="all">All Sources</option>
          <option value="home_depot">Home Depot</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="phone">Phone</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {leads.map((lead, idx) => (
          <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 hover:border-blue-400/20 dark:hover:border-blue-400/15 transition-all">
            <div className="flex items-start gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                lead.priority === "urgent" ? "bg-red-100 dark:bg-red-500/15" : "bg-blue-100 dark:bg-blue-500/15"
              }`}>
                {lead.priority === "urgent" ? <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /> :
                 <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{lead.clientName}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[lead.priority]}`}>{lead.priority}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sourceColors[lead.source]}`}>{lead.source.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.address}, {lead.city}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.clientPhone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.clientEmail}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-1">{lead.notes}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium capitalize">
                  {lead.stage.replace(/_/g, " ")}
                </span>
                <p className="text-[10px] text-slate-400 mt-2">{lead.updatedAt}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
