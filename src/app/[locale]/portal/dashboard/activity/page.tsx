"use client"

import { motion } from "framer-motion"
import {
  Activity,
  UserPlus,
  FolderKanban,
  CalendarDays,
  Ruler,
  Package,
  Truck,
  Receipt,
  CheckCircle2,
  MessageSquare,
  FileText,
  Settings,
  Shield,
  Clock,
  Filter,
} from "lucide-react"
import { useState } from "react"

/* ── icon map ──────────────────────────────────────────────── */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lead: UserPlus,
  project: FolderKanban,
  appointment: CalendarDays,
  measurement: Ruler,
  order: Package,
  shipping: Truck,
  invoice: Receipt,
  completion: CheckCircle2,
  message: MessageSquare,
  document: FileText,
  settings: Settings,
  security: Shield,
}

/* ── color map ─────────────────────────────────────────────── */
const colorMap: Record<string, string> = {
  lead: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  project: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  appointment: "bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400",
  measurement: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  order: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  shipping: "bg-teal-100 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400",
  invoice: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
  completion: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  message: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400",
  document: "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400",
  settings: "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400",
  security: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",
}

/* ── mock activity data ────────────────────────────────────── */
const activities = [
  { id: 1, type: "lead", user: "Sarah Mitchell", action: "Created new lead", detail: "Sophie Martin — 89 Avenue du Parc, Montreal", time: "2 min ago", date: "Today" },
  { id: 2, type: "appointment", user: "Sarah Mitchell", action: "Scheduled measurement visit", detail: "Sophie Martin — Feb 28, 2026 at 10:00 AM", time: "15 min ago", date: "Today" },
  { id: 3, type: "order", user: "System", action: "Order status updated", detail: "ORD-002 → Production (Verrex Factory)", time: "1 hr ago", date: "Today" },
  { id: 4, type: "message", user: "Jean-Pierre Tremblay", action: "Sent a message", detail: "\"When can I expect the delivery for my kitchen windows?\"", time: "2 hrs ago", date: "Today" },
  { id: 5, type: "invoice", user: "Sarah Mitchell", action: "Generated invoice", detail: "INV-001 — Jean-Pierre Tremblay — $27,025", time: "3 hrs ago", date: "Today" },
  { id: 6, type: "shipping", user: "Verrex Factory", action: "Shipment tracking updated", detail: "ORD-001 — Tracking: VRX-2026-0315, ETA: Mar 10", time: "5 hrs ago", date: "Today" },
  { id: 7, type: "measurement", user: "Marc Bouchard", action: "Uploaded measurement data", detail: "4 rooms measured — Jean-Pierre project", time: "Yesterday", date: "Yesterday" },
  { id: 8, type: "project", user: "Sarah Mitchell", action: "Converted lead to project", detail: "Jean-Pierre Tremblay → Project #PRJ-001", time: "Yesterday", date: "Yesterday" },
  { id: 9, type: "lead", user: "Home Depot API", action: "Lead imported from partner", detail: "Jean-Pierre Tremblay — Source: Home Depot Laval", time: "Yesterday", date: "Yesterday" },
  { id: 10, type: "completion", user: "Sarah Mitchell", action: "Marked project verified", detail: "Marie Dubois — Final inspection passed", time: "2 days ago", date: "Feb 23" },
  { id: 11, type: "security", user: "System", action: "Login from new device", detail: "Sarah Mitchell — Chrome on Windows, Montreal IP", time: "2 days ago", date: "Feb 23" },
  { id: 12, type: "document", user: "Marc Bouchard", action: "Uploaded attachment", detail: "measurement_kitchen_photos.zip — Jean-Pierre project", time: "3 days ago", date: "Feb 22" },
  { id: 13, type: "settings", user: "Sarah Mitchell", action: "Updated notification preferences", detail: "Email notifications enabled for order updates", time: "3 days ago", date: "Feb 22" },
  { id: 14, type: "lead", user: "Sarah Mitchell", action: "Created new lead", detail: "Robert Lavoie — 456 Chemin du Lac, Sherbrooke", time: "4 days ago", date: "Feb 21" },
  { id: 15, type: "appointment", user: "Sarah Mitchell", action: "Scheduled consultation", detail: "Marie Dubois — Mar 1, 2026 at 2:00 PM", time: "5 days ago", date: "Feb 20" },
]

const filterOptions = ["All", "lead", "project", "appointment", "measurement", "order", "shipping", "invoice", "message", "security"]

/* ── component ─────────────────────────────────────────────── */
export default function ActivityPage() {
  const [filter, setFilter] = useState("All")
  const filtered = filter === "All" ? activities : activities.filter(a => a.type === filter)

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof activities>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = []
    acc[a.date].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete audit trail — who changed what, when</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{activities.length} events</span>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400 mr-1" />
        {filterOptions.map(opt => (
          <button key={opt} onClick={() => setFilter(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              filter === opt
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}>
            {opt}
          </button>
        ))}
      </motion.div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([date, events], gi) => (
          <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + gi * 0.05 }}>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{date}</h3>
            <div className="relative pl-8">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />

              <div className="space-y-4">
                {events.map((event, i) => {
                  const Icon = iconMap[event.type] || Activity
                  const colors = colorMap[event.type] || colorMap.document
                  return (
                    <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + gi * 0.05 + i * 0.03 }}
                      className="relative flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`absolute -left-8 mt-1 p-1.5 rounded-lg ${colors} z-10`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {event.action}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {event.detail}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-3">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-medium">
                            {event.user}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${colors}`}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
