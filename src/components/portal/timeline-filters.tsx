"use client"

import { useState } from "react"
import { Filter, Eye, EyeOff, Lock, Shield, ChevronDown } from "lucide-react"
import type { TimelineVisibility } from "@/types/portal"

export type EventCategory = 'all' | 'scheduling' | 'measurements' | 'orders' | 'financials' | 'notes' | 'milestones'

const CATEGORIES: { key: EventCategory; label: string }[] = [
  { key: 'all', label: 'All Events' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'scheduling', label: 'Scheduling' },
  { key: 'measurements', label: 'Measurements' },
  { key: 'orders', label: 'Orders & Production' },
  { key: 'financials', label: 'Financials' },
  { key: 'notes', label: 'Notes & Flags' },
]

export const CATEGORY_EVENT_TYPES: Record<EventCategory, string[]> = {
  all: [],
  milestones: ['stage_changed', 'client_approved', 'client_declined', 'install_completed', 'verification_completed', 'client_closeout', 'partner_verified'],
  scheduling: ['appointment_scheduled', 'appointment_rescheduled', 'appointment_completed', 'install_scheduled', 'install_started'],
  measurements: ['measurement_completed', 'photo_uploaded', 'document_uploaded'],
  orders: ['order_placed', 'supplier_confirmed', 'production_started', 'production_update', 'shipped', 'delivered'],
  financials: ['quote_created', 'quote_sent', 'invoice_issued', 'payment_received'],
  notes: ['note_added', 'issue_flagged', 'assignment_changed', 'lead_created', 'contact_attempt'],
}

interface TimelineFiltersProps {
  category: EventCategory
  onCategoryChange: (cat: EventCategory) => void
  showInternal: boolean
  onToggleInternal: () => void
  showAdminOnly: boolean
  onToggleAdminOnly: () => void
  eventCount: number
  totalCount: number
}

export function TimelineFilters({
  category, onCategoryChange,
  showInternal, onToggleInternal,
  showAdminOnly, onToggleAdminOnly,
  eventCount, totalCount,
}: TimelineFiltersProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4 space-y-2">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing {eventCount} of {totalCount} events
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <Shield className="h-3.5 w-3.5" />
          Filters
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Filter panel */}
      {open && (
        <div className="p-3 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 space-y-3">
          {/* Category pills */}
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1.5">Event Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => onCategoryChange(c.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                    category === c.key
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility toggles */}
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1.5">Visibility Level</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onToggleInternal}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                  showInternal
                    ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    : "bg-slate-100 dark:bg-white/5 text-slate-400 line-through"
                }`}
              >
                {showInternal ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                Internal Events
              </button>
              <button
                onClick={onToggleAdminOnly}
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                  showAdminOnly
                    ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400"
                    : "bg-slate-100 dark:bg-white/5 text-slate-400 line-through"
                }`}
              >
                {showAdminOnly ? <Lock className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                Admin-Only Events
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
