"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { TimelineEvent, TimelineEventType, TimelineVisibility, UserRole, TimelineAttachment } from "@/types/portal"
import { CLIENT_EVENT_LABELS, PIPELINE_STAGES } from "@/types/portal"
import {
  UserPlus, Phone, CalendarDays, Ruler, FileText, Send,
  CheckCircle2, XCircle, Package, Factory, Truck, MapPin,
  Wrench, Shield, Receipt, DollarSign, Flag, Settings,
  Upload, MessageSquare, Clock, Lock, ChevronDown, ChevronUp,
  Paperclip, Image, FileVideo, FileAudio, File, AlertTriangle,
  ExternalLink, Eye, Camera, BadgeCheck,
} from "lucide-react"

// --- Icon + Color maps ---
const eventIconMap: Record<TimelineEventType, React.ComponentType<{ className?: string }>> = {
  lead_created: UserPlus, contact_attempt: Phone, appointment_scheduled: CalendarDays,
  appointment_rescheduled: CalendarDays, appointment_completed: CheckCircle2,
  measurement_completed: Ruler, quote_created: FileText, quote_sent: Send,
  client_approved: CheckCircle2, client_declined: XCircle, order_placed: Package,
  supplier_confirmed: Factory, production_started: Factory, production_update: Settings,
  shipped: Truck, delivered: MapPin, install_scheduled: CalendarDays,
  install_started: Wrench, install_completed: CheckCircle2, verification_completed: Shield,
  invoice_issued: Receipt, payment_received: DollarSign, client_closeout: Flag,
  assignment_changed: Settings, stage_changed: Flag, note_added: MessageSquare,
  document_uploaded: Upload, photo_uploaded: Camera, issue_flagged: AlertTriangle,
  partner_verified: BadgeCheck, system_event: Clock,
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
  photo_uploaded: "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  issue_flagged: "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400",
  partner_verified: "bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400",
  system_event: "bg-gray-100 dark:bg-gray-500/15 text-gray-600 dark:text-gray-400",
}

const visibilityBadge: Record<TimelineVisibility, { label: string; color: string }> = {
  all: { label: "Visible to all", color: "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400" },
  client_hidden: { label: "Client hidden", color: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  internal: { label: "Internal", color: "bg-amber-200/60 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  admin_contractor: { label: "Admin + Contractor", color: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  admin_only: { label: "Admin only", color: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" },
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

const attachmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  photo: Image, video: FileVideo, audio: FileAudio,
  pdf: FileText, document: File, receipt: Receipt, signature: FileText,
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
}
function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })
}
function getStageName(stage: string): string {
  return PIPELINE_STAGES.find(s => s.key === stage)?.label || stage
}

export interface TimelineEventCardProps {
  event: TimelineEvent
  index: number
  userRole: UserRole
  isLast?: boolean
  showVisibility?: boolean
}

export function TimelineEventCard({ event, index, userRole, isLast = false, showVisibility = false }: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const hasExpandable = !!(event.expandedNotes || event.previousStage || event.flagReason || (event.attachments && event.attachments.length > 0) || event.linkedRecordType)
  const Icon = eventIconMap[event.eventType] || Clock
  const colors = eventColorMap[event.eventType] || eventColorMap.system_event
  const isClient = userRole === "client"
  const displayTitle = isClient ? (CLIENT_EVENT_LABELS[event.eventType] || event.title) : event.title
  const displayActor = isClient && event.actorRole !== "client" ? "VEREX Team" : event.actorName

  // Card border/bg by visibility level
  const borderStyle = event.visibility === "admin_only"
    ? "border-red-200/50 dark:border-red-500/20 bg-red-50/40 dark:bg-red-500/5"
    : event.visibility === "internal" || event.visibility === "admin_contractor"
      ? "bg-amber-50/60 dark:bg-amber-500/5 border-amber-200/50 dark:border-amber-500/15"
      : event.flagged
        ? "bg-red-50/40 dark:bg-red-500/5 border-red-300/50 dark:border-red-500/20"
        : "bg-white/60 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/10"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="flex gap-0 group"
    >
      {/* ── LEFT: Timeline spine ────────────── */}
      <div className="flex flex-col items-center w-11 shrink-0">
        {/* Icon dot */}
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${colors} shadow-sm ring-2 ring-white dark:ring-slate-900 transition-transform group-hover:scale-110`}>
          <Icon className="h-4 w-4" />
        </div>
        {/* Connector line to next event */}
        {!isLast && (
          <div className="w-0.5 flex-1 mt-0.5 min-h-[1.25rem] bg-gradient-to-b from-slate-300/80 via-slate-200/50 to-slate-200/30 dark:from-white/15 dark:via-white/8 dark:to-white/5 rounded-full" />
        )}
      </div>

      {/* ── RIGHT: Card content ─────────────── */}
      <div className="flex-1 min-w-0 pb-4 pl-3">
        <div
          className={`rounded-xl border transition-all duration-200 ${borderStyle} ${hasExpandable ? "cursor-pointer hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-white/5" : ""}`}
          onClick={() => hasExpandable && setExpanded(!expanded)}
        >
          {/* Collapsed header */}
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {showVisibility && event.visibility !== "all" && (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${visibilityBadge[event.visibility].color}`}>
                      <Lock className="h-2.5 w-2.5" />
                      {visibilityBadge[event.visibility].label}
                    </span>
                  )}
                  {event.flagged && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-red-200/70 dark:bg-red-500/20 text-red-700 dark:text-red-400 font-semibold uppercase">
                      <AlertTriangle className="h-2.5 w-2.5" /> Flagged
                    </span>
                  )}
                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug">{displayTitle}</p>
                </div>
                {event.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{event.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                {event.attachments && event.attachments.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                    <Paperclip className="h-3 w-3" /> {event.attachments.length}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {formatTime(event.timestamp)}
                </span>
                {hasExpandable && (
                  expanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                )}
              </div>
            </div>
            {/* Actor + date */}
            <div className="flex items-center gap-2 mt-2.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleBadge[event.actorRole] || roleBadge.system}`}>
                {displayActor}
              </span>
              <span className="text-[10px] text-slate-400">{formatDate(event.timestamp)}</span>
            </div>
          </div>

          {/* Expanded section */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3.5 pb-3.5 pt-0 space-y-3 border-t border-slate-200/40 dark:border-white/5">
                  {event.expandedNotes && (
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1">Full Details</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{event.expandedNotes}</p>
                    </div>
                  )}
                  {event.previousStage && event.newStage && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1">Stage Change</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">{getStageName(event.previousStage)}</span>
                        <span className="text-slate-400">→</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">{getStageName(event.newStage)}</span>
                      </div>
                    </div>
                  )}
                  {event.flagged && event.flagReason && (
                    <div className="mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                      <p className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400 mb-1">⚠ Flag Reason</p>
                      <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{event.flagReason}</p>
                    </div>
                  )}
                  {event.attachments && event.attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mb-1.5">Attachments ({event.attachments.length})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {event.attachments.map((att: TimelineAttachment) => {
                          const AttIcon = attachmentIcons[att.type] || File
                          return (
                            <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-xs">
                              <AttIcon className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="truncate flex-1 text-slate-600 dark:text-slate-300">{att.name}</span>
                              {att.visibility !== "all" && userRole === "admin" && (
                                <span className="text-[8px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">{att.visibility}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {event.linkedRecordType && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="font-medium capitalize">View {event.linkedRecordType} →</span>
                      <span className="text-slate-400 text-[10px]">{event.linkedRecordId}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
