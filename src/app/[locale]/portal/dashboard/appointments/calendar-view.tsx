"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"
import type { Appointment } from "@/types/portal"

interface Props {
  appointments: Appointment[]
  typeBgColors: Record<string, string>
  conflicts: string[]
  onEventClick?: (appointmentId: string) => void
}

export default function CalendarView({ appointments, typeBgColors, conflicts, onEventClick }: Props) {
  const events = appointments
    .filter(a => a.status !== "cancelled")
    .map(apt => {
      const [h, m] = apt.time.split(":").map(Number)
      const start = new Date(`${apt.date}T${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}:00`)
      const end = new Date(start.getTime() + apt.duration * 60000)
      const isConflict = conflicts.includes(apt.id)
      return {
        id: apt.id,
        title: `${apt.clientName} — ${apt.type}`,
        start,
        end,
        backgroundColor: isConflict ? "#ef4444" : (typeBgColors[apt.type] || "#3b82f6"),
        borderColor: isConflict ? "#dc2626" : (typeBgColors[apt.type] || "#3b82f6"),
        textColor: "#ffffff",
        extendedProps: { ...apt, isConflict },
      }
    })

  return (
    <div className="rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-4 fc-portal-wrapper">
      <style>{`
        .fc-portal-wrapper .fc {
          --fc-border-color: rgba(148, 163, 184, 0.2);
          --fc-today-bg-color: rgba(59, 130, 246, 0.06);
          --fc-neutral-bg-color: transparent;
          --fc-page-bg-color: transparent;
          --fc-list-event-hover-bg-color: rgba(59, 130, 246, 0.08);
          font-family: inherit;
        }
        .dark .fc-portal-wrapper .fc {
          --fc-border-color: rgba(255, 255, 255, 0.08);
          --fc-today-bg-color: rgba(59, 130, 246, 0.1);
          --fc-list-event-hover-bg-color: rgba(59, 130, 246, 0.15);
        }
        .fc-portal-wrapper .fc-toolbar-title {
          font-size: 1rem !important;
          font-weight: 700 !important;
        }
        .dark .fc-portal-wrapper .fc-toolbar-title {
          color: #f1f5f9 !important;
        }
        .fc-portal-wrapper .fc-button {
          background: rgba(148, 163, 184, 0.1) !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
          color: #64748b !important;
          font-size: 0.75rem !important;
          padding: 0.25rem 0.6rem !important;
          border-radius: 0.5rem !important;
          font-weight: 500 !important;
          text-transform: capitalize !important;
        }
        .dark .fc-portal-wrapper .fc-button {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #94a3b8 !important;
        }
        .fc-portal-wrapper .fc-button-active,
        .fc-portal-wrapper .fc-button:hover {
          background: rgba(59, 130, 246, 0.15) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
          color: #3b82f6 !important;
        }
        .dark .fc-portal-wrapper .fc-button-active,
        .dark .fc-portal-wrapper .fc-button:hover {
          background: rgba(59, 130, 246, 0.2) !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
          color: #60a5fa !important;
        }
        .fc-portal-wrapper .fc-col-header-cell {
          font-size: 0.7rem !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 0.5rem 0 !important;
        }
        .dark .fc-portal-wrapper .fc-col-header-cell-cushion {
          color: #94a3b8 !important;
        }
        .fc-portal-wrapper .fc-daygrid-day-number {
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          padding: 0.35rem 0.5rem !important;
        }
        .dark .fc-portal-wrapper .fc-daygrid-day-number {
          color: #cbd5e1 !important;
        }
        .fc-portal-wrapper .fc-event {
          border-radius: 0.375rem !important;
          font-size: 0.65rem !important;
          font-weight: 500 !important;
          padding: 1px 4px !important;
          cursor: pointer;
        }
        .fc-portal-wrapper .fc-daygrid-event-dot {
          display: none !important;
        }
        .fc-portal-wrapper .fc-timegrid-slot {
          height: 2.5rem !important;
        }
        .dark .fc-portal-wrapper .fc-timegrid-slot-label {
          color: #64748b !important;
          font-size: 0.65rem !important;
        }
        .fc-portal-wrapper .fc-scrollgrid {
          border: none !important;
        }
        .fc-portal-wrapper .fc-scrollgrid td,
        .fc-portal-wrapper .fc-scrollgrid th {
          border-color: var(--fc-border-color) !important;
        }
        .dark .fc-portal-wrapper .fc-list-event-title a,
        .dark .fc-portal-wrapper .fc-list-event-time {
          color: #e2e8f0 !important;
        }
        .dark .fc-portal-wrapper .fc-list-day-cushion {
          background: rgba(30, 41, 59, 0.5) !important;
        }
        .dark .fc-portal-wrapper .fc-list-day-text,
        .dark .fc-portal-wrapper .fc-list-day-side-text {
          color: #94a3b8 !important;
        }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        height="auto"
        contentHeight={560}
        editable={false}
        selectable={true}
        eventClick={(info) => { if (onEventClick) onEventClick(info.event.id) }}
        dayMaxEvents={3}
        nowIndicator={true}
        eventDisplay="block"
        firstDay={1}
      />
    </div>
  )
}
