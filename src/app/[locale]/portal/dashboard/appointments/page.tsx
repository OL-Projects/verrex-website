"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { usePortalStore } from "@/lib/portal-store"
import {
  CalendarDays, MapPin, Clock, User, Wrench, Ruler, Search as SearchIcon,
  Eye, XCircle, CheckCircle2, List, CalendarRange, GanttChart,
  AlertTriangle, TrendingUp, Users, Settings, Pencil,
} from "lucide-react"
import type { Appointment } from "@/types/portal"
import AppointmentForm, { type EditRecord } from "./appointment-form"
import SettingsPanel, { loadSettings, type AppointmentSettings } from "./settings-panel"

const FullCalendarView = dynamic(() => import("./calendar-view"), { ssr: false,
  loading: () => <div className="h-[600px] flex items-center justify-center rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>,
})

type ViewTab = "list" | "calendar" | "gantt"

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  consultation: CalendarDays, measurement: Ruler, inspection: Eye,
  installation: Wrench, verification: SearchIcon, follow_up: CalendarDays,
}
const typeColors: Record<string, string> = {
  consultation: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  measurement: "bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400",
  inspection: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  installation: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  verification: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
  follow_up: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
}
const typeBgColors: Record<string, string> = {
  consultation: "#3b82f6", measurement: "#a855f7", inspection: "#6366f1",
  installation: "#f59e0b", verification: "#22c55e", follow_up: "#06b6d4",
}
const statusColors: Record<string, string> = {
  scheduled: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  completed: "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
}

function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  return { start: mon.toISOString().split("T")[0], end: sun.toISOString().split("T")[0] }
}

export default function AppointmentsPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const userId = session?.user?.id || "usr_admin_001"
  const [settings, setSettings] = useState<AppointmentSettings>(() => loadSettings())
  const [view, setView] = useState<ViewTab>(() => settings.defaultView)
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editingApt, setEditingApt] = useState<Appointment | null>(null)
  const [editHistoryMap, setEditHistoryMap] = useState<Record<string, EditRecord[]>>({})

  const upcoming = store.appointments.filter(a => a.status === "scheduled" || a.status === "confirmed")
  const past = store.appointments.filter(a => a.status === "completed" || a.status === "cancelled")
  const week = getWeekDates()
  const thisWeek = store.appointments.filter(a => a.date >= week.start && a.date <= week.end && a.status !== "cancelled")
  const today = new Date().toISOString().split("T")[0]
  const todayApts = store.appointments.filter(a => a.date === today && a.status !== "cancelled")
  const technicians = [...new Set(store.appointments.map(a => a.assignedName))].sort()

  // Conflict detection: same assignee, overlapping time
  const conflicts = useMemo(() => {
    const active = store.appointments.filter(a => a.status !== "cancelled" && a.status !== "completed")
    const found: string[] = []
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i], b = active[j]
        if (a.assignedTo === b.assignedTo && a.date === b.date) {
          const aStart = parseInt(a.time.replace(":", "")), bStart = parseInt(b.time.replace(":", ""))
          const aEnd = aStart + Math.floor(a.duration / 60) * 100 + (a.duration % 60)
          const bEnd = bStart + Math.floor(b.duration / 60) * 100 + (b.duration % 60)
          if (aStart < bEnd && bStart < aEnd) { found.push(a.id, b.id) }
        }
      }
    }
    return [...new Set(found)]
  }, [store.appointments])

  const tabs: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "list", label: "List", icon: List },
    { id: "calendar", label: "Calendar", icon: CalendarRange },
    { id: "gantt", label: "Timeline", icon: GanttChart },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
            <Settings className="h-4 w-4" />
          </button>
          <button onClick={() => { setEditingApt(null); setShowForm(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all">
            <CalendarDays className="h-3.5 w-3.5" />+ New
          </button>
          <div className="flex bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-xl border border-slate-200/60 dark:border-white/10 p-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === t.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
          </div>
        </div>
      </motion.div>

      {/* Create Form */}
      <AppointmentForm open={showForm && !editingApt} onClose={() => setShowForm(false)} userId={userId}
        checklistItems={settings.checklistItems} defaultDuration={settings.defaultDuration} defaultStatus={settings.defaultStatus} defaultStartTime={settings.defaultStartTime} />

      {/* Edit Form */}
      {editingApt && (
        <AppointmentForm key={editingApt.id} open={!!editingApt} onClose={() => setEditingApt(null)} userId={userId}
          mode="edit" appointment={editingApt} editHistory={editHistoryMap[editingApt.id] || []}
          checklistItems={settings.checklistItems} defaultDuration={settings.defaultDuration} defaultStatus={settings.defaultStatus} defaultStartTime={settings.defaultStartTime}
          onEditSave={(id, data, record) => {
            const apt = store.appointments.find(a => a.id === id)
            if (apt) {
              Object.assign(apt, data) // Update in store
              setEditHistoryMap(prev => ({ ...prev, [id]: [...(prev[id] || []), record] }))
            }
            setEditingApt(null)
          }} />
      )}

      {/* Settings */}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSave={setSettings} />

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "This Week", value: thisWeek.length, icon: CalendarRange, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/15" },
          { label: "Today", value: todayApts.length, icon: CalendarDays, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15" },
          { label: "Technicians", value: technicians.length, icon: Users, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/15" },
          { label: "Conflicts", value: conflicts.length > 0 ? Math.floor(conflicts.length / 2) : 0, icon: AlertTriangle, color: conflicts.length > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400", bg: conflicts.length > 0 ? "bg-red-100 dark:bg-red-500/15" : "bg-emerald-100 dark:bg-emerald-500/15" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p><p className="text-[11px] text-slate-500 dark:text-slate-400">{s.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEWS */}
      {view === "calendar" && (
        <FullCalendarView appointments={store.appointments} typeBgColors={typeBgColors} conflicts={conflicts}
          onEventClick={(id) => { const apt = store.appointments.find(a => a.id === id); if (apt) setEditingApt(apt) }} />
      )}

      {view === "gantt" && (
        <GanttView appointments={store.appointments} technicians={technicians} typeBgColors={typeBgColors} conflicts={conflicts}
          onEdit={(id) => { const apt = store.appointments.find(a => a.id === id); if (apt) setEditingApt(apt) }} />
      )}

      {view === "list" && (
        <ListView upcoming={upcoming} past={past} store={store} userId={userId} typeIcons={typeIcons} typeColors={typeColors} statusColors={statusColors} conflicts={conflicts}
          onEdit={(apt) => setEditingApt(apt)} />
      )}
    </div>
  )
}

/* ─── LIST VIEW ─── */
function ListView({ upcoming, past, store, userId, typeIcons, typeColors, statusColors, conflicts, onEdit }: {
  upcoming: Appointment[]; past: Appointment[]; store: ReturnType<typeof usePortalStore>; userId: string;
  typeIcons: Record<string, React.ComponentType<{ className?: string }>>; typeColors: Record<string, string>;
  statusColors: Record<string, string>; conflicts: string[]; onEdit: (apt: Appointment) => void;
}) {
  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((apt, idx) => {
              const TypeIcon = typeIcons[apt.type] || CalendarDays
              const hasConflict = conflicts.includes(apt.id)
              return (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className={`p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border ${hasConflict ? "border-red-400 dark:border-red-500/40 ring-1 ring-red-200 dark:ring-red-500/20" : "border-slate-200/60 dark:border-white/10"}`}>
                  {hasConflict && <div className="flex items-center gap-1.5 mb-2 text-xs text-red-600 dark:text-red-400 font-medium"><AlertTriangle className="h-3.5 w-3.5" />Scheduling conflict detected</div>}
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${typeColors[apt.type]}`}><TypeIcon className="h-5 w-5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{apt.clientName}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${typeColors[apt.type]}`}>{apt.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[apt.status]}`}>{apt.status}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{apt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time} ({apt.duration}m)</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.address}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{apt.assignedName}</span>
                      </div>
                      {apt.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">{apt.notes}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => onEdit(apt)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-colors"><Pencil className="h-3 w-3" />Edit</button>
                      <button onClick={() => store.completeAppointment(apt.id, userId)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors"><CheckCircle2 className="h-3 w-3" />Complete</button>
                      <button onClick={() => store.cancelAppointment(apt.id, userId)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors"><XCircle className="h-3 w-3" />Cancel</button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Past</h2>
          <div className="space-y-3 opacity-70">
            {past.map(apt => {
              const TypeIcon = typeIcons[apt.type] || CalendarDays
              return (
                <div key={apt.id} className="p-4 rounded-xl bg-white/40 dark:bg-white/3 border border-slate-200/40 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${typeColors[apt.type]}`}><TypeIcon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-700 dark:text-slate-300">{apt.clientName} — <span className="capitalize">{apt.type}</span></p><p className="text-xs text-slate-400">{apt.date} at {apt.time}</p></div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[apt.status]}`}>{apt.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── GANTT / TIMELINE VIEW ─── */
function GanttView({ appointments, technicians, typeBgColors, conflicts, onEdit }: {
  appointments: Appointment[]; technicians: string[]; typeBgColors: Record<string, string>; conflicts: string[];
  onEdit: (id: string) => void;
}) {
  const active = appointments.filter(a => a.status !== "cancelled")
  const dates = [...new Set(active.map(a => a.date))].sort()
  const visibleDates = dates.slice(-14) // Last 14 days with appointments

  return (
    <div className="rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 overflow-hidden">
      <div className="p-4 border-b border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2"><GanttChart className="h-4 w-4 text-blue-600" />Resource Timeline</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Technician schedules across dates</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200/40 dark:border-white/5">
              <th className="text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 p-3 w-40 sticky left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">Technician</th>
              {visibleDates.map(d => {
                const dt = new Date(d + "T12:00:00")
                return <th key={d} className="text-center text-[10px] text-slate-500 dark:text-slate-400 p-2 min-w-[100px]"><div className="font-medium">{dt.toLocaleDateString("en", { weekday: "short" })}</div><div className="text-slate-400 dark:text-slate-500">{dt.toLocaleDateString("en", { month: "short", day: "numeric" })}</div></th>
              })}
            </tr>
          </thead>
          <tbody>
            {technicians.map(tech => (
              <tr key={tech} className="border-b border-slate-100/60 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/3">
                <td className="p-3 text-xs font-medium text-slate-700 dark:text-slate-300 sticky left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10"><div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">{tech.split(" ").map(n=>n[0]).join("")}</div>{tech}</div></td>
                {visibleDates.map(d => {
                  const dayApts = active.filter(a => a.assignedName === tech && a.date === d)
                  return (
                    <td key={d} className="p-1.5 align-top">
                      {dayApts.map(apt => (
                        <div key={apt.id} onClick={() => onEdit(apt.id)}
                          className={`px-2 py-1 mb-1 rounded-md text-[10px] text-white font-medium truncate cursor-pointer hover:opacity-80 transition-opacity ${conflicts.includes(apt.id) ? "ring-2 ring-red-500" : ""}`}
                          style={{ backgroundColor: typeBgColors[apt.type] || "#3b82f6" }}
                          title={`Click to edit — ${apt.clientName} — ${apt.type} — ${apt.time} (${apt.duration}m)`}>
                          {apt.time} {apt.clientName.split(" ")[0]}
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
