"use client"

import { useState, useMemo } from "react"
import type { TimelineEvent, TimelineEventType } from "@/types/portal"
import { HorizontalMilestoneBar, MILESTONE_KEYS } from "./horizontal-milestone-bar"
import { TimelineEventCard } from "./timeline-event-card"
import { Layers, List } from "lucide-react"

interface HybridTimelineViewProps {
  events: TimelineEvent[]
  viewMode: "hybrid" | "vertical"
  onViewModeChange: (mode: "hybrid" | "vertical") => void
}

export function HybridTimelineView({ events, viewMode, onViewModeChange }: HybridTimelineViewProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<TimelineEventType | null>(null)

  // Events filtered by selected milestone window
  const filteredEvents = useMemo(() => {
    if (viewMode === "vertical" || !selectedMilestone) return events
    const milestoneIdx = MILESTONE_KEYS.findIndex(m => m.eventType === selectedMilestone)
    const nextType = milestoneIdx < MILESTONE_KEYS.length - 1 ? MILESTONE_KEYS[milestoneIdx + 1].eventType : null
    const milestoneEvt = events.find(e => e.eventType === selectedMilestone)
    if (!milestoneEvt) return events
    const mTime = new Date(milestoneEvt.timestamp).getTime()
    const nextEvt = nextType ? events.find(e => e.eventType === nextType) : null
    const nTime = nextEvt ? new Date(nextEvt.timestamp).getTime() : mTime + 7 * 86400000
    return events.filter(e => {
      const t = new Date(e.timestamp).getTime()
      return t >= mTime - 86400000 && t <= nTime
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [events, selectedMilestone, viewMode])

  return (
    <div className="space-y-4">
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
          <button
            onClick={() => { onViewModeChange("hybrid"); setSelectedMilestone(null) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "hybrid"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Hybrid
          </button>
          <button
            onClick={() => { onViewModeChange("vertical"); setSelectedMilestone(null) }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "vertical"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Full Feed
          </button>
        </div>
        <span className="text-xs text-slate-400">
          {filteredEvents.length} of {events.length} events
        </span>
      </div>

      {/* Horizontal milestone bar (hybrid mode only) */}
      {viewMode === "hybrid" && (
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10">
          <HorizontalMilestoneBar
            events={events}
            selectedMilestone={selectedMilestone}
            onSelectMilestone={setSelectedMilestone}
          />
        </div>
      )}

      {/* Vertical event list */}
      <div className="space-y-0">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {selectedMilestone ? "No events in this milestone window. Click another milestone or clear selection." : "No timeline events to display."}
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <TimelineEventCard key={event.id} event={event} userRole="admin" index={idx} isLast={idx === filteredEvents.length - 1} />
          ))
        )}
      </div>
    </div>
  )
}
