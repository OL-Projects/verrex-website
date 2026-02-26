"use client"

import { useState, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import type { TimelineContextType, TimelineEventType, TimelineEvent } from "@/types/portal"
import {
  getUniversalTimeline,
  getTimelineByLead,
  getTimelineByClient,
  getTimelineByProject,
} from "@/lib/portal-data"
import { TimelineContextSelector } from "@/components/portal/timeline-context-selector"
import { HybridTimelineView } from "@/components/portal/hybrid-timeline-view"
import {
  Clock, Filter, X, Calendar, User, Tag, Paperclip,
  Eye, ArrowUpDown, AlertTriangle,
} from "lucide-react"

// ── Category filter config ─────────────────────────
const EVENT_CATEGORIES: { key: string; label: string; types: TimelineEventType[] }[] = [
  { key: "lead", label: "Lead", types: ["lead_created", "contact_attempt"] },
  { key: "scheduling", label: "Scheduling", types: ["appointment_scheduled", "appointment_rescheduled", "appointment_completed", "install_scheduled"] },
  { key: "measurement", label: "Measurement", types: ["measurement_completed"] },
  { key: "quote", label: "Quote", types: ["quote_created", "quote_sent", "client_approved", "client_declined"] },
  { key: "order", label: "Order", types: ["order_placed", "supplier_confirmed"] },
  { key: "production", label: "Production", types: ["production_started", "production_update", "shipped", "delivered"] },
  { key: "install", label: "Installation", types: ["install_started", "install_completed"] },
  { key: "financial", label: "Financial", types: ["invoice_issued", "payment_received"] },
  { key: "verification", label: "Verification", types: ["verification_completed", "partner_verified"] },
  { key: "internal", label: "Internal", types: ["note_added", "assignment_changed", "stage_changed", "document_uploaded", "photo_uploaded", "issue_flagged", "system_event", "client_closeout"] },
]

const ACTOR_ROLES = [
  { key: "admin", label: "Admin" },
  { key: "contractor", label: "Contractor" },
  { key: "inspector", label: "Inspector" },
  { key: "supplier", label: "Supplier" },
  { key: "partner", label: "Partner" },
  { key: "client", label: "Client" },
  { key: "system", label: "System" },
]

export default function TimelinePage() {
  const { data: session } = useSession()
  const userRole = (session?.user?.role || "admin") as string

  // Context selection state
  const [contextType, setContextType] = useState<TimelineContextType | "all">("all")
  const [contextId, setContextId] = useState<string | null>(null)

  // View mode
  const [viewMode, setViewMode] = useState<"hybrid" | "vertical">("hybrid")

  // Filter panel
  const [showFilters, setShowFilters] = useState(false)
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set())
  const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set())
  const [stageChangesOnly, setStageChangesOnly] = useState(false)
  const [attachmentsOnly, setAttachmentsOnly] = useState(false)
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const hasActiveFilters = activeCategories.size > 0 || activeRoles.size > 0 || stageChangesOnly || attachmentsOnly || flaggedOnly || dateFrom || dateTo

  const clearAllFilters = useCallback(() => {
    setActiveCategories(new Set())
    setActiveRoles(new Set())
    setStageChangesOnly(false)
    setAttachmentsOnly(false)
    setFlaggedOnly(false)
    setDateFrom("")
    setDateTo("")
  }, [])

  // Raw events from data layer
  const rawEvents = useMemo((): TimelineEvent[] => {
    if (contextType === "all") return getUniversalTimeline(userRole)
    if (contextType === "lead" && contextId) return getTimelineByLead(contextId, userRole)
    if (contextType === "client" && contextId) return getTimelineByClient(contextId, userRole)
    if (contextType === "project" && contextId) return getTimelineByProject(contextId, userRole)
    if (!contextId) return []
    return getUniversalTimeline(userRole)
  }, [contextType, contextId, userRole])

  // Filtered events
  const events = useMemo(() => {
    let filtered = rawEvents

    // Category filter
    if (activeCategories.size > 0) {
      const allowedTypes = new Set<string>()
      EVENT_CATEGORIES.forEach(cat => {
        if (activeCategories.has(cat.key)) cat.types.forEach(t => allowedTypes.add(t))
      })
      filtered = filtered.filter(e => allowedTypes.has(e.eventType))
    }

    // Role filter
    if (activeRoles.size > 0) {
      filtered = filtered.filter(e => activeRoles.has(e.actorRole))
    }

    // Stage changes only
    if (stageChangesOnly) {
      filtered = filtered.filter(e => e.previousStage || e.newStage)
    }

    // Attachments only
    if (attachmentsOnly) {
      filtered = filtered.filter(e => e.attachments && e.attachments.length > 0)
    }

    // Flagged only
    if (flaggedOnly) {
      filtered = filtered.filter(e => e.flagged)
    }

    // Date range
    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      filtered = filtered.filter(e => new Date(e.timestamp).getTime() >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86400000
      filtered = filtered.filter(e => new Date(e.timestamp).getTime() < to)
    }

    return filtered
  }, [rawEvents, activeCategories, activeRoles, stageChangesOnly, attachmentsOnly, flaggedOnly, dateFrom, dateTo])

  const toggleCategory = (key: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleRole = (key: string) => {
    setActiveRoles(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ──────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Timeline</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Audit trail &amp; activity history across leads, clients, and projects</p>
            </div>
          </div>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
            showFilters || hasActiveFilters
              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
              : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/10"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-blue-600 text-[10px] text-white font-bold">
              {activeCategories.size + activeRoles.size + (stageChangesOnly ? 1 : 0) + (attachmentsOnly ? 1 : 0) + (flaggedOnly ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* ── Context Selector ────────────────── */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10">
        <TimelineContextSelector
          contextType={contextType}
          contextId={contextId}
          onContextTypeChange={setContextType}
          onContextIdChange={setContextId}
        />
      </div>

      {/* ── Advanced Filters Panel ──────────── */}
      {showFilters && (
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-[10px] text-red-500 hover:underline flex items-center gap-1">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Tag className="h-3 w-3" /> Category
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => toggleCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                    activeCategories.has(cat.key)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role pills */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <User className="h-3 w-3" /> Actor Role
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ACTOR_ROLES.map(r => (
                <button
                  key={r.key}
                  onClick={() => toggleRole(r.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                    activeRoles.has(r.key)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white/60 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Date Range
            </p>
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-xs text-slate-900 dark:text-white" />
              <span className="text-xs text-slate-400">to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-xs text-slate-900 dark:text-white" />
            </div>
          </div>

          {/* Toggle filters */}
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={stageChangesOnly} onChange={e => setStageChangesOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 dark:border-white/20 text-blue-600" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Stage changes only
              </span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={attachmentsOnly} onChange={e => setAttachmentsOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 dark:border-white/20 text-blue-600" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Paperclip className="h-3 w-3" /> With attachments
              </span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={flaggedOnly} onChange={e => setFlaggedOnly(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 dark:border-white/20 text-blue-600" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Flagged only
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ── Prompt to select (when context needs ID but none chosen) */}
      {contextType !== "all" && !contextId && (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Select a {contextType} above to view its timeline</p>
        </div>
      )}

      {/* ── Timeline Display ────────────────── */}
      {(contextType === "all" || contextId) && (
        <HybridTimelineView
          events={events}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
    </div>
  )
}
