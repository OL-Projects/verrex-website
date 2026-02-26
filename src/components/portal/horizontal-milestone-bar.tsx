"use client"

import { useMemo } from "react"
import type { TimelineEvent, TimelineEventType } from "@/types/portal"
import { Check, Circle, Loader2 } from "lucide-react"

const MILESTONE_KEYS: { eventType: TimelineEventType; label: string; color: string }[] = [
  { eventType: "lead_created", label: "Lead", color: "bg-gray-400" },
  { eventType: "contact_attempt", label: "Contact", color: "bg-blue-400" },
  { eventType: "appointment_completed", label: "Measured", color: "bg-indigo-500" },
  { eventType: "quote_sent", label: "Quoted", color: "bg-purple-500" },
  { eventType: "client_approved", label: "Approved", color: "bg-violet-500" },
  { eventType: "order_placed", label: "Ordered", color: "bg-amber-500" },
  { eventType: "production_started", label: "Production", color: "bg-orange-500" },
  { eventType: "shipped", label: "Shipped", color: "bg-cyan-500" },
  { eventType: "delivered", label: "Delivered", color: "bg-teal-500" },
  { eventType: "install_completed", label: "Installed", color: "bg-green-500" },
  { eventType: "payment_received", label: "Paid", color: "bg-emerald-600" },
  { eventType: "client_closeout", label: "Closed", color: "bg-green-700" },
]

interface HorizontalMilestoneBarProps {
  events: TimelineEvent[]
  selectedMilestone: TimelineEventType | null
  onSelectMilestone: (type: TimelineEventType | null) => void
}

export function HorizontalMilestoneBar({ events, selectedMilestone, onSelectMilestone }: HorizontalMilestoneBarProps) {
  const milestoneStatus = useMemo(() => {
    const evtTypes = new Set(events.map(e => e.eventType))
    let lastFound = -1
    return MILESTONE_KEYS.map((m, idx) => {
      const exists = evtTypes.has(m.eventType)
      if (exists) lastFound = idx
      return { ...m, exists, isCurrent: false, idx }
    }).map((m, idx) => ({
      ...m,
      isCurrent: idx === lastFound + 1 && !m.exists && lastFound >= 0,
    }))
  }, [events])

  const eventsForMilestone = useMemo(() => {
    if (!selectedMilestone) return null
    const milestoneIdx = MILESTONE_KEYS.findIndex(m => m.eventType === selectedMilestone)
    const nextMilestoneType = milestoneIdx < MILESTONE_KEYS.length - 1 ? MILESTONE_KEYS[milestoneIdx + 1].eventType : null
    const milestoneEvt = events.find(e => e.eventType === selectedMilestone)
    if (!milestoneEvt) return null
    const milestoneTime = new Date(milestoneEvt.timestamp).getTime()
    const nextEvt = nextMilestoneType ? events.find(e => e.eventType === nextMilestoneType) : null
    const nextTime = nextEvt ? new Date(nextEvt.timestamp).getTime() : milestoneTime + 7 * 86400000
    return events.filter(e => {
      const t = new Date(e.timestamp).getTime()
      return t >= milestoneTime - 86400000 && t <= nextTime
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [events, selectedMilestone])

  return (
    <div className="space-y-0">
      {/* Horizontal track */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex items-center min-w-max px-2 py-3">
          {milestoneStatus.map((m, i) => (
            <div key={m.eventType} className="flex items-center">
              {/* Connector line */}
              {i > 0 && (
                <div className={`h-0.5 w-8 sm:w-12 transition-colors ${m.exists || milestoneStatus[i - 1].exists ? "bg-blue-400/60" : "bg-slate-200 dark:bg-white/10"}`} />
              )}
              {/* Milestone dot */}
              <button
                onClick={() => onSelectMilestone(selectedMilestone === m.eventType ? null : m.eventType)}
                className={`group relative flex flex-col items-center gap-1.5 transition-all ${
                  selectedMilestone === m.eventType ? "scale-110" : "hover:scale-105"
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ring-2 ${
                  m.exists
                    ? `${m.color} text-white ring-transparent shadow-sm`
                    : m.isCurrent
                      ? "bg-blue-100 dark:bg-blue-500/20 text-blue-500 ring-blue-400 animate-pulse"
                      : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 ring-slate-200 dark:ring-white/10"
                } ${selectedMilestone === m.eventType ? "ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}`}>
                  {m.exists ? <Check className="h-3.5 w-3.5" /> : m.isCurrent ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Circle className="h-3 w-3" />}
                </div>
                <span className={`text-[9px] font-medium whitespace-nowrap transition-colors ${
                  m.exists ? "text-slate-700 dark:text-slate-300" : m.isCurrent ? "text-blue-500" : "text-slate-400 dark:text-slate-600"
                } ${selectedMilestone === m.eventType ? "text-blue-600 dark:text-blue-400 font-bold" : ""}`}>
                  {m.label}
                </span>
                {/* Event count badge */}
                {m.exists && (
                  <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 flex items-center justify-center px-0.5 rounded-full bg-blue-600 text-[8px] text-white font-bold">
                    {events.filter(e => e.eventType === m.eventType).length}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded detail count */}
      {selectedMilestone && eventsForMilestone && (
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400">
          <div className="h-1 w-1 rounded-full bg-blue-500" />
          <span className="font-medium">
            {eventsForMilestone.length} events near "{MILESTONE_KEYS.find(m => m.eventType === selectedMilestone)?.label}"
          </span>
          <button onClick={() => onSelectMilestone(null)} className="ml-auto text-[10px] hover:underline text-slate-400">
            Clear selection
          </button>
        </div>
      )}
    </div>
  )
}

export { MILESTONE_KEYS }
