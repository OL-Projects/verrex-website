"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { usePortalStore } from "@/lib/portal-store"
import { CalendarDays, MapPin, Clock, User, Wrench, Ruler, Search as SearchIcon, Eye, XCircle, CheckCircle2 } from "lucide-react"

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
const statusColors: Record<string, string> = {
  scheduled: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  confirmed: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400",
  completed: "bg-slate-100 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400",
  cancelled: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
}

export default function AppointmentsPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const userId = session?.user?.id || "usr_admin_001"

  const upcoming = store.appointments.filter(a => a.status === "scheduled" || a.status === "confirmed")
  const past = store.appointments.filter(a => a.status === "completed" || a.status === "cancelled")

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{upcoming.length} upcoming, {past.length} completed</p>
      </motion.div>

      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((apt, idx) => {
              const TypeIcon = typeIcons[apt.type] || CalendarDays
              return (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${typeColors[apt.type]}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{apt.clientName}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${typeColors[apt.type]}`}>{apt.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[apt.status]}`}>{apt.status}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{apt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time} ({apt.duration} min)</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{apt.address}</span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{apt.assignedName}</span>
                      </div>
                      {apt.notes && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">{apt.notes}</p>}
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => store.completeAppointment(apt.id, userId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/20 transition-colors">
                        <CheckCircle2 className="h-3 w-3" /> Complete
                      </button>
                      <button onClick={() => store.cancelAppointment(apt.id, userId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors">
                        <XCircle className="h-3 w-3" /> Cancel
                      </button>
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
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${typeColors[apt.type]}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{apt.clientName} — <span className="capitalize">{apt.type}</span></p>
                      <p className="text-xs text-slate-400">{apt.date} at {apt.time}</p>
                    </div>
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
