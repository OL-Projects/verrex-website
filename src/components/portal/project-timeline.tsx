"use client"

import { motion } from "framer-motion"
import type { TimelineEvent, TimelineEventType } from "@/types/portal"
import {
  UserPlus, Phone, CalendarDays, Ruler, FileText, Send,
  CheckCircle2, XCircle, Package, Factory, Truck, MapPin,
  Wrench, Shield, Receipt, DollarSign, Flag, Settings,
  Upload, MessageSquare, Clock, Lock,
} from "lucide-react"

const eventIconMap: Record<TimelineEventType, React.ComponentType<{ className?: string }>> = {
  lead_created: UserPlus,
  contact_attempt: Phone,
  appointment_scheduled: CalendarDays,
  appointment_rescheduled: CalendarDays,
  appointment_completed: CheckCircle2,
  measurement_completed: Ruler,
  quote_created: FileText,
  quote_sent: Send,
  client_approved: CheckCircle2,
  client_declined: XCircle,
  order_placed: Package,
  supplier_confirmed: Factory,
  production_started: Factory,
  production_update: Settings,
  shipped: Truck,
  delivered: MapPin,
  install_scheduled: CalendarDays,
  install_started: Wrench,
  install_completed: CheckCircle2,
  verification_completed: Shield,
  invoice_issued: Receipt,
  payment_received: DollarSign,
  client_closeout: Flag,
  assignment_changed: Settings,
  stage_changed: Flag,
  note_added: MessageSquare,
  document_uploaded: Upload,
  system_event: Clock,
}

const eventColorMap: Record<TimelineEventType, string> = {
  lead_created: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  contact_attempt: "bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400",
  appointment_scheduled: "bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400",
  appointment_rescheduled: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  appointment_completed: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
  measurement_completed: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  quote_created: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400",
  quote_sent: "bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  client_approved: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  client_declined: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",
  order_placed: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  supplier_confirmed: "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400",
  production_started: "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400",
  production_update: "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  shipped: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  delivered: "bg-teal-100 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400",
  install_scheduled: "bg-lime-100 dark:bg-lime-500/15 text-lime-600 dark:text-lime-400",
  install_started: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  install_completed: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
  verification_completed: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  invoice_issued: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  payment_received: "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400",
  client_closeout: "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300",
  assignment_changed: "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400",
  stage_changed: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  note_added: "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400",
  document_uploaded: "bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400",
  system_event: "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400",
}

function formatDate(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
}
function formatTime(ts: string) {
  const d = new Date(ts)
  return d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })
}

const roleBadge: Record<string, string> = {
  admin: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  client: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  contractor: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  supplier: "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
  partner: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
  inspector: "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  system: "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400",
}

export function ProjectTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No timeline events yet.</p>
      </div>
    )
  }

  return (
    <div className="relative pl-8">
      <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />
      <div className="space-y-4">
        {events.map((event, i) => {
          const Icon = eventIconMap[event.eventType] || Clock
          const colors = eventColorMap[event.eventType] || eventColorMap.system_event
          return (
            <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }} className="relative flex items-start gap-4">
              <div className={`absolute -left-8 mt-1 p-1.5 rounded-lg ${colors} z-10`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className={`flex-1 p-4 rounded-xl border transition-colors ${
                event.isInternal
                  ? "bg-amber-50/60 dark:bg-amber-500/5 border-amber-200/50 dark:border-amber-500/15"
                  : "bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.isInternal && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold uppercase">
                          <Lock className="h-2.5 w-2.5" /> Internal
                        </span>
                      )}
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
                    </div>
                    {event.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{event.notes}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleBadge[event.actorRole] || roleBadge.system}`}>
                    {event.actorName}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDate(event.timestamp)}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
