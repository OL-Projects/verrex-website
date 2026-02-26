"use client"

import { useState, useMemo } from "react"
import type { TimelineEvent, UserRole } from "@/types/portal"
import { TimelineEventCard } from "./timeline-event-card"
import { TimelineFilters, CATEGORY_EVENT_TYPES, type EventCategory } from "./timeline-filters"
import { Clock, Shield, Users, Briefcase, Package, BadgeCheck, Eye } from "lucide-react"

// Role-specific header descriptions
const ROLE_HEADERS: Record<UserRole, { icon: React.ComponentType<{ className?: string }>; label: string; description: string }> = {
  admin: { icon: Shield, label: "Master Timeline", description: "Full audit trail — all events, all visibility levels" },
  client: { icon: Eye, label: "Your Project Progress", description: "Every milestone and update on your project" },
  contractor: { icon: Briefcase, label: "Execution Timeline", description: "Tasks, measurements, installations, and updates" },
  inspector: { icon: Eye, label: "Quality Control Timeline", description: "Measurements, inspections, flags, and verifications" },
  supplier: { icon: Package, label: "Order Timeline", description: "Order confirmations, production, and delivery updates" },
  partner: { icon: BadgeCheck, label: "Partner Progress", description: "Milestones, verifications, and commission checkpoints" },
}

interface ProjectTimelineProps {
  events: TimelineEvent[]
  userRole: UserRole
}

export function ProjectTimeline({ events, userRole }: ProjectTimelineProps) {
  const isAdmin = userRole === "admin"
  const [category, setCategory] = useState<EventCategory>("all")
  const [showInternal, setShowInternal] = useState(true)
  const [showAdminOnly, setShowAdminOnly] = useState(true)

  // Filter events based on admin controls
  const filteredEvents = useMemo(() => {
    let result = events

    // Admin visibility toggles
    if (isAdmin) {
      if (!showInternal) {
        result = result.filter(e => e.visibility !== "internal" && e.visibility !== "admin_contractor")
      }
      if (!showAdminOnly) {
        result = result.filter(e => e.visibility !== "admin_only")
      }
    }

    // Category filter
    if (category !== "all") {
      const allowedTypes = CATEGORY_EVENT_TYPES[category]
      if (allowedTypes.length > 0) {
        result = result.filter(e => allowedTypes.includes(e.eventType))
      }
    }

    return result
  }, [events, category, showInternal, showAdminOnly, isAdmin])

  const roleHeader = ROLE_HEADERS[userRole]
  const RoleIcon = roleHeader.icon

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No timeline events yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Role-specific header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10">
          <RoleIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{roleHeader.label}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{roleHeader.description}</p>
        </div>
        <div className="ml-auto text-[10px] text-slate-400 font-medium">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Admin-only: Filter panel */}
      {isAdmin && (
        <TimelineFilters
          category={category}
          onCategoryChange={setCategory}
          showInternal={showInternal}
          onToggleInternal={() => setShowInternal(!showInternal)}
          showAdminOnly={showAdminOnly}
          onToggleAdminOnly={() => setShowAdminOnly(!showAdminOnly)}
          eventCount={filteredEvents.length}
          totalCount={events.length}
        />
      )}

      {/* Timeline feed */}
      <div className="relative pl-8">
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />
        <div className="space-y-4">
          {filteredEvents.map((event, i) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              index={i}
              userRole={userRole}
              showVisibility={isAdmin}
            />
          ))}
        </div>
      </div>

      {/* Empty state for filtered */}
      {filteredEvents.length === 0 && events.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">No events match the current filters.</p>
          <button
            onClick={() => { setCategory("all"); setShowInternal(true); setShowAdminOnly(true) }}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
