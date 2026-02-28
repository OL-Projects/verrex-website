"use client"

import { useState, useEffect } from "react"
import { X, Settings, Plus, RotateCcw, Trash2, Clock, Timer, Bookmark } from "lucide-react"
import type { AppointmentType } from "@/types/portal"

export interface AppointmentTemplate {
  name: string
  type: AppointmentType
  duration: number
  time: string
  status: "scheduled" | "confirmed"
}

export interface AppointmentSettings {
  defaultDuration: number
  defaultStatus: "scheduled" | "confirmed"
  defaultView: "calendar" | "list" | "gantt"
  defaultStartTime: string
  checklistItems: string[]
  durationOptions: { value: number; label: string }[]
  startTimeOptions: string[]
  templates: AppointmentTemplate[]
}

const DEFAULT_DURATIONS = [
  { value: 30, label: "30 min" }, { value: 60, label: "1 hour" },
  { value: 90, label: "1.5h" }, { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" }, { value: 240, label: "4 hours" },
  { value: 480, label: "Full Day" },
]

const DEFAULT_START_TIMES = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00"]

const DEFAULT_CHECKLIST = [
  "Bring laser measure", "Camera / photos needed", "Safety equipment",
  "Client signature form", "Sample materials", "Site access key/code",
]

const DEFAULT_SETTINGS: AppointmentSettings = {
  defaultDuration: 60,
  defaultStatus: "scheduled",
  defaultView: "calendar",
  defaultStartTime: "09:00",
  checklistItems: [...DEFAULT_CHECKLIST],
  durationOptions: [...DEFAULT_DURATIONS],
  startTimeOptions: [...DEFAULT_START_TIMES],
  templates: [],
}

const STORAGE_KEY = "verrex-appointment-settings"

export function loadSettings(): AppointmentSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

function saveSettings(s: AppointmentSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

interface Props {
  open: boolean
  onClose: () => void
  settings: AppointmentSettings
  onSave: (s: AppointmentSettings) => void
}

export default function SettingsPanel({ open, onClose, settings, onSave }: Props) {
  const [local, setLocal] = useState<AppointmentSettings>(settings)
  const [newItem, setNewItem] = useState("")
  const [newDurMin, setNewDurMin] = useState("")
  const [newDurLabel, setNewDurLabel] = useState("")
  const [newTime, setNewTime] = useState("")
  const [tplName, setTplName] = useState("")
  const [tplType, setTplType] = useState<AppointmentType>("consultation")
  const [tplDur, setTplDur] = useState(60)
  const [tplTime, setTplTime] = useState("09:00")
  const [tplStatus, setTplStatus] = useState<"scheduled" | "confirmed">("scheduled")
  const [showAddTpl, setShowAddTpl] = useState(false)

  useEffect(() => { setLocal(settings) }, [settings])

  const update = <K extends keyof AppointmentSettings>(key: K, val: AppointmentSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }))
  }

  // Checklist
  const addChecklistItem = () => { const t = newItem.trim(); if (!t || local.checklistItems.includes(t)) return; update("checklistItems", [...local.checklistItems, t]); setNewItem("") }
  const removeChecklistItem = (i: number) => update("checklistItems", local.checklistItems.filter((_, idx) => idx !== i))

  // Duration options
  const addDuration = () => {
    const min = parseInt(newDurMin)
    if (isNaN(min) || min < 1) return
    const label = newDurLabel.trim() || (min >= 60 ? `${min / 60}h` : `${min} min`)
    if (local.durationOptions.some(d => d.value === min)) return
    update("durationOptions", [...local.durationOptions, { value: min, label }].sort((a, b) => a.value - b.value))
    setNewDurMin(""); setNewDurLabel("")
  }
  const removeDuration = (i: number) => update("durationOptions", local.durationOptions.filter((_, idx) => idx !== i))

  // Start time options
  const addStartTime = () => {
    const t = newTime.trim()
    if (!/^\d{2}:\d{2}$/.test(t)) return
    if (local.startTimeOptions.includes(t)) return
    update("startTimeOptions", [...local.startTimeOptions, t].sort())
    setNewTime("")
  }
  const removeStartTime = (i: number) => update("startTimeOptions", local.startTimeOptions.filter((_, idx) => idx !== i))

  // Templates
  const addTemplate = () => {
    const n = tplName.trim()
    if (!n) return
    update("templates", [...local.templates, { name: n, type: tplType, duration: tplDur, time: tplTime, status: tplStatus }])
    setTplName(""); setShowAddTpl(false)
  }
  const removeTemplate = (i: number) => update("templates", local.templates.filter((_, idx) => idx !== i))

  const restoreAll = () => setLocal({ ...DEFAULT_SETTINGS })

  const handleSave = () => { saveSettings(local); onSave(local); onClose() }

  if (!open) return null

  const chipBtn = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 group"
  const delBtn = "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all shrink-0"
  const sectionLabel = "text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block"
  const inputCls = "h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto" style={{ animation: "slideInRight 0.3s ease-out forwards" }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"><Settings className="h-4 w-4 text-blue-600" />Settings</h2>
          <div className="flex items-center gap-2">
            <button onClick={restoreAll} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 transition-colors"><RotateCcw className="h-3 w-3" />Reset All</button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* ─── Defaults ─── */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Defaults</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={sectionLabel}>Duration</label>
                <select value={local.defaultDuration} onChange={e => update("defaultDuration", Number(e.target.value))} className={`w-full ${inputCls}`}>
                  {local.durationOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label className={sectionLabel}>Start Time</label>
                <select value={local.defaultStartTime} onChange={e => update("defaultStartTime", e.target.value)} className={`w-full ${inputCls}`}>
                  {local.startTimeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={sectionLabel}>Status</label>
                <div className="flex gap-1.5">
                  {(["scheduled", "confirmed"] as const).map(s => (
                    <button key={s} onClick={() => update("defaultStatus", s)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium capitalize border-2 transition-all ${local.defaultStatus === s ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={sectionLabel}>View</label>
                <div className="flex gap-1.5">
                  {(["calendar", "list", "gantt"] as const).map(v => (
                    <button key={v} onClick={() => update("defaultView", v)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium capitalize border-2 transition-all ${local.defaultView === v ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500"}`}>
                      {v === "gantt" ? "Timeline" : v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Duration Options ─── */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-3.5 w-3.5 text-purple-500" />
              <label className={`${sectionLabel} mb-0`}>Duration Options</label>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {local.durationOptions.map((d, i) => (
                <div key={i} className={chipBtn}>
                  <span>{d.label}</span>
                  <button onClick={() => removeDuration(i)} className={delBtn}><X className="h-3 w-3" /></button>
                </div>
              ))}
              {local.durationOptions.length === 0 && <p className="text-[10px] text-slate-400 italic">No durations. Add below.</p>}
            </div>
            <div className="flex gap-1.5">
              <input value={newDurMin} onChange={e => setNewDurMin(e.target.value)} placeholder="Minutes" type="number" className={`w-20 ${inputCls}`} />
              <input value={newDurLabel} onChange={e => setNewDurLabel(e.target.value)} placeholder="Label (optional)" className={`flex-1 ${inputCls}`}
                onKeyDown={e => e.key === "Enter" && addDuration()} />
              <button onClick={addDuration} className="h-9 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold"><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          {/* ─── Start Time Options ─── */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              <label className={`${sectionLabel} mb-0`}>Start Time Options</label>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {local.startTimeOptions.map((t, i) => (
                <div key={i} className={chipBtn}>
                  <span>{t}</span>
                  <button onClick={() => removeStartTime(i)} className={delBtn}><X className="h-3 w-3" /></button>
                </div>
              ))}
              {local.startTimeOptions.length === 0 && <p className="text-[10px] text-slate-400 italic">No times. Add below.</p>}
            </div>
            <div className="flex gap-1.5">
              <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="HH:MM (e.g. 06:30)" className={`flex-1 ${inputCls}`}
                onKeyDown={e => e.key === "Enter" && addStartTime()} />
              <button onClick={addStartTime} className="h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold"><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          {/* ─── Templates ─── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bookmark className="h-3.5 w-3.5 text-amber-500" />
                <label className={`${sectionLabel} mb-0`}>Quick Templates</label>
              </div>
              <button onClick={() => setShowAddTpl(!showAddTpl)} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">{showAddTpl ? "Cancel" : "+ Add"}</button>
            </div>
            {local.templates.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {local.templates.map((tpl, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{tpl.name}</p>
                      <p className="text-[10px] text-slate-400">{tpl.type} · {tpl.duration}m · {tpl.time} · {tpl.status}</p>
                    </div>
                    <button onClick={() => removeTemplate(i)} className={delBtn}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            {local.templates.length === 0 && !showAddTpl && <p className="text-[10px] text-slate-400 italic mb-2">No templates. Create one to quickly fill forms.</p>}
            {showAddTpl && (
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 space-y-2">
                <input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="Template name" className={`w-full ${inputCls}`} />
                <div className="grid grid-cols-2 gap-2">
                  <select value={tplType} onChange={e => setTplType(e.target.value as AppointmentType)} className={`w-full ${inputCls}`}>
                    <option value="consultation">Consultation</option><option value="measurement">Measurement</option>
                    <option value="inspection">Inspection</option><option value="installation">Installation</option>
                    <option value="verification">Verification</option><option value="follow_up">Follow-up</option>
                  </select>
                  <select value={tplDur} onChange={e => setTplDur(Number(e.target.value))} className={`w-full ${inputCls}`}>
                    {local.durationOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <select value={tplTime} onChange={e => setTplTime(e.target.value)} className={`w-full ${inputCls}`}>
                    {local.startTimeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={tplStatus} onChange={e => setTplStatus(e.target.value as "scheduled" | "confirmed")} className={`w-full ${inputCls}`}>
                    <option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option>
                  </select>
                </div>
                <button onClick={addTemplate} disabled={!tplName.trim()} className={`w-full h-8 rounded-lg text-[10px] font-semibold transition-all ${tplName.trim() ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>Save Template</button>
              </div>
            )}
          </div>

          {/* ─── Checklist ─── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`${sectionLabel} mb-0`}>Prep Checklist</label>
              <button onClick={() => update("checklistItems", [...DEFAULT_CHECKLIST])} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-600 transition-colors"><RotateCcw className="h-3 w-3" />Reset</button>
            </div>
            <div className="space-y-1 mb-2">
              {local.checklistItems.map((item, i) => (
                <div key={i} className={chipBtn}>
                  <span className="flex-1">{item}</span>
                  <button onClick={() => removeChecklistItem(i)} className={delBtn}><X className="h-3 w-3" /></button>
                </div>
              ))}
              {local.checklistItems.length === 0 && <p className="text-[10px] text-slate-400 italic">No items.</p>}
            </div>
            <div className="flex gap-1.5">
              <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && addChecklistItem()} placeholder="Add checklist item..." className={`flex-1 ${inputCls}`} />
              <button onClick={addChecklistItem} disabled={!newItem.trim()} className={`h-9 px-3 rounded-lg text-[10px] font-semibold transition-all ${newItem.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}><Plus className="h-3 w-3" /></button>
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
