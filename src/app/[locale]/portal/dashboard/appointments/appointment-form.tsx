"use client"

import { useState, useMemo } from "react"
import { usePortalStore } from "@/lib/portal-store"
import type { AppointmentType } from "@/types/portal"
import {
  X, CalendarDays, Ruler, Eye, Wrench, Search as SearchIcon,
  Clock, MapPin, User, FileText, Paperclip, AlertTriangle,
  CheckCircle2, ChevronDown, History,
} from "lucide-react"
import type { Appointment } from "@/types/portal"
import type { AppointmentTemplate } from "./settings-panel"

export interface EditRecord {
  timestamp: string
  changedFields: string[]
  before: Partial<Appointment>
  after: Partial<Appointment>
}

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  mode?: "create" | "edit"
  appointment?: Appointment | null
  editHistory?: EditRecord[]
  onEditSave?: (id: string, data: Partial<Appointment>, history: EditRecord) => void
  checklistItems?: string[]
  defaultDuration?: number
  defaultStatus?: "scheduled" | "confirmed"
  defaultStartTime?: string
  durationOptions?: { value: number; label: string }[]
  startTimeOptions?: string[]
  templates?: AppointmentTemplate[]
}

const aptTypes: { id: AppointmentType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "consultation", label: "Consultation", icon: CalendarDays, color: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600" },
  { id: "measurement", label: "Measurement", icon: Ruler, color: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600" },
  { id: "inspection", label: "Inspection", icon: Eye, color: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600" },
  { id: "installation", label: "Installation", icon: Wrench, color: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-600" },
  { id: "verification", label: "Verification", icon: SearchIcon, color: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600" },
  { id: "follow_up", label: "Follow-up", icon: CalendarDays, color: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-600" },
]

const defaultDurations = [
  { value: 30, label: "30 min" }, { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" }, { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" }, { value: 240, label: "4 hours" },
  { value: 480, label: "Full Day (8h)" },
]

const defaultTimeSlots: string[] = []
for (let h = 7; h <= 18; h++) {
  defaultTimeSlots.push(`${String(h).padStart(2, "0")}:00`)
  if (h < 18) defaultTimeSlots.push(`${String(h).padStart(2, "0")}:30`)
}

const defaultChecklistItems = [
  "Bring laser measure", "Camera / photos needed", "Safety equipment",
  "Client signature form", "Sample materials", "Site access key/code",
]

export default function AppointmentForm({ open, onClose, userId, mode = "create", appointment, editHistory = [], onEditSave, checklistItems: customChecklist, defaultDuration = 60, defaultStatus = "scheduled", defaultStartTime = "09:00", durationOptions, startTimeOptions, templates = [] }: Props) {
  const store = usePortalStore()
  const isEdit = mode === "edit" && !!appointment
  const activeChecklist = customChecklist || defaultChecklistItems
  const activeDurations = durationOptions || defaultDurations
  const activeTimeSlots = startTimeOptions && startTimeOptions.length > 0 ? startTimeOptions : defaultTimeSlots

  // Form state — pre-populated in edit mode
  const [selectedLead, setSelectedLead] = useState("")
  const [clientName, setClientName] = useState(isEdit ? appointment.clientName : "")
  const [address, setAddress] = useState(isEdit ? appointment.address : "")
  const [aptType, setAptType] = useState<AppointmentType>(isEdit ? appointment.type : "consultation")
  const [date, setDate] = useState(isEdit ? appointment.date : "")
  const [time, setTime] = useState(isEdit ? appointment.time : defaultStartTime)
  const [duration, setDuration] = useState(isEdit ? appointment.duration : defaultDuration)
  const [assignedTo, setAssignedTo] = useState(isEdit ? appointment.assignedTo : "")
  const [assignedName, setAssignedName] = useState(isEdit ? appointment.assignedName : "")
  const [status, setStatus] = useState<"scheduled" | "confirmed">(isEdit ? (appointment.status === "confirmed" ? "confirmed" : "scheduled") : defaultStatus)
  const [notes, setNotes] = useState(isEdit ? appointment.notes : "")
  const [checklist, setChecklist] = useState<Set<string>>(new Set())
  const [attachments, setAttachments] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Auto-fill from lead selection
  const handleLeadSelect = (leadId: string) => {
    setSelectedLead(leadId)
    const lead = store.leads.find(l => l.id === leadId)
    if (lead) {
      setClientName(lead.clientName)
      setAddress(`${lead.address}, ${lead.city}`)
    }
  }

  // Staff for assignment
  const staff = useMemo(() => {
    const users = [
      { id: "usr_admin_001", name: "Sarah Mitchell" },
      { id: "usr_contractor_001", name: "Mike Thompson" },
      { id: "usr_inspector_001", name: "Robert Garcia" },
    ]
    return users
  }, [])

  // Conflict check
  const conflict = useMemo(() => {
    if (!assignedTo || !date || !time) return null
    const existing = store.appointments.filter(
      a => a.assignedTo === assignedTo && a.date === date && a.status !== "cancelled" && a.status !== "completed"
    )
    const newStart = parseInt(time.replace(":", ""))
    const newEnd = newStart + Math.floor(duration / 60) * 100 + (duration % 60)
    for (const a of existing) {
      const aStart = parseInt(a.time.replace(":", ""))
      const aEnd = aStart + Math.floor(a.duration / 60) * 100 + (a.duration % 60)
      if (newStart < aEnd && aStart < newEnd) return a
    }
    return null
  }, [assignedTo, date, time, duration, store.appointments])

  // Technician day load
  const dayLoad = useMemo(() => {
    if (!assignedTo || !date) return 0
    return store.appointments.filter(a => a.assignedTo === assignedTo && a.date === date && a.status !== "cancelled").length
  }, [assignedTo, date, store.appointments])

  const toggleChecklist = (item: string) => {
    setChecklist(prev => { const n = new Set(prev); n.has(item) ? n.delete(item) : n.add(item); return n })
  }

  const addAttachment = () => {
    const names = ["Site_Photos.zip", "Floor_Plan.pdf", "Window_Specs.xlsx", "Access_Instructions.docx", "Material_List.pdf"]
    const name = names[attachments.length % names.length]
    setAttachments(prev => [...prev, name])
  }

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }

  const isValid = clientName.trim() && address.trim() && date && time && assignedTo

  const handleSubmit = () => {
    if (!isValid) return
    const checkNotes = checklist.size > 0 ? `\nChecklist: ${[...checklist].join(", ")}` : ""
    const attachNotes = attachments.length > 0 ? `\nAttachments: ${attachments.join(", ")}` : ""

    if (isEdit && onEditSave) {
      const updated: Partial<Appointment> = { clientName: clientName.trim(), address: address.trim(), type: aptType, date, time, duration, assignedTo, assignedName, notes: (notes.trim() + checkNotes + attachNotes).trim(), status }
      const changedFields: string[] = []
      const before: Partial<Appointment> = {}
      const after: Partial<Appointment> = {}
      const fields: (keyof Appointment)[] = ["clientName", "address", "type", "date", "time", "duration", "assignedTo", "assignedName", "notes", "status"]
      for (const f of fields) {
        if (updated[f] !== appointment![f]) { changedFields.push(f); (before as Record<string, unknown>)[f] = appointment![f]; (after as Record<string, unknown>)[f] = updated[f] }
      }
      const record: EditRecord = { timestamp: new Date().toISOString(), changedFields, before, after }
      onEditSave(appointment!.id, updated, record)
    } else {
      const projectId = selectedLead ? store.leads.find(l => l.id === selectedLead)?.id || "" : ""
      store.createAppointment({ projectId, clientName: clientName.trim(), address: address.trim(), type: aptType, date, time, duration, assignedTo, assignedName, notes: (notes.trim() + checkNotes + attachNotes).trim(), status })
    }
    setSubmitted(true)
    setTimeout(() => { setSubmitted(false); onClose() }, 1200)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm drawer-backdrop" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto drawer-slide-in" style={{ animationName: "slide-in-right" }}>
        <style>{`@keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } } .drawer-slide-in { animation: slide-in-right 0.3s ease-out forwards; }`}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isEdit ? "Edit Appointment" : "New Appointment"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? "Appointment Updated!" : "Appointment Created!"}</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Template Selector */}
            {!isEdit && templates.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Apply Template</label>
                <select onChange={(e) => {
                  const tpl = templates.find(t => t.name === e.target.value)
                  if (tpl) { setAptType(tpl.type); setDuration(tpl.duration); setTime(tpl.time); setStatus(tpl.status) }
                }} defaultValue=""
                  className="w-full h-10 px-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 text-sm text-slate-900 dark:text-white">
                  <option value="">— Select a template —</option>
                  {templates.map(t => <option key={t.name} value={t.name}>{t.name} ({t.type}, {t.duration}m, {t.time})</option>)}
                </select>
              </div>
            )}

            {/* Lead Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Link to Lead (optional)</label>
              <select value={selectedLead} onChange={(e) => handleLeadSelect(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                <option value="">— Manual entry —</option>
                {store.leads.map(l => <option key={l.id} value={l.id}>{l.clientName} — {l.address}</option>)}
              </select>
            </div>

            {/* Client + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Client Name *</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Full name"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Address *</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Site address"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {aptTypes.map(t => (
                  <button key={t.id} onClick={() => setAptType(t.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center ${aptType === t.id ? t.color : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <t.icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Time + Duration */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Date *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Time *</label>
                <select value={time} onChange={e => setTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                  {activeTimeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Duration</label>
                <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                  {activeDurations.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>

            {/* Assign Technician */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Assign To *</label>
              <div className="space-y-1.5">
                {staff.map(s => (
                  <button key={s.id} onClick={() => { setAssignedTo(s.id); setAssignedName(s.name) }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all text-left ${assignedTo === s.id ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {s.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className={`text-sm font-medium ${assignedTo === s.id ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"}`}>{s.name}</span>
                    {assignedTo === s.id && <div className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
                  </button>
                ))}
              </div>
              {dayLoad > 0 && <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">⚠ {assignedName} has {dayLoad} appointment(s) on {date}</p>}
            </div>

            {/* Conflict Warning */}
            {conflict && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-red-700 dark:text-red-400">
                  <p className="font-semibold">Scheduling Conflict!</p>
                  <p>{conflict.clientName} — {conflict.type} at {conflict.time} ({conflict.duration}m)</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
              <div className="flex gap-2">
                {(["scheduled", "confirmed"] as const).map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border-2 transition-all ${status === s ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Notes & Instructions</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Access instructions, materials needed, special requirements..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white resize-none" />
            </div>

            {/* Checklist */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Prep Checklist</label>
              <div className="grid grid-cols-2 gap-1.5">
                {activeChecklist.map(item => (
                  <button key={item} onClick={() => toggleChecklist(item)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left ${checklist.has(item) ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400" : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}>
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${checklist.has(item) ? "bg-green-500 border-green-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                      {checklist.has(item) && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Attachments</label>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <FileText className="h-3 w-3" />{f}
                      <button onClick={() => removeAttachment(i)} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={addAttachment} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
                <Paperclip className="h-3.5 w-3.5" />Add Attachment
              </button>
            </div>

            {/* Edit History */}
            {isEdit && editHistory.length > 0 && (
              <div>
                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 hover:text-blue-600 transition-colors">
                  <History className="h-3.5 w-3.5" />Edit History ({editHistory.length}) {showHistory ? "▾" : "▸"}
                </button>
                {showHistory && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editHistory.map((h, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                        <p className="text-slate-500 dark:text-slate-400 mb-1">{new Date(h.timestamp).toLocaleString()}</p>
                        {h.changedFields.map(f => (
                          <div key={f} className="flex items-center gap-2 mt-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{f}:</span>
                            <span className="line-through text-red-500">{String((h.before as Record<string, unknown>)[f] ?? "")}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-green-600 dark:text-green-400">{String((h.after as Record<string, unknown>)[f] ?? "")}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!isValid}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${isValid ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>
              {isEdit ? "Save Changes" : "Create Appointment"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
