"use client"

import { useState, useEffect } from "react"
import { X, Settings, Plus, RotateCcw, Trash2 } from "lucide-react"

export interface AppointmentSettings {
  defaultDuration: number
  defaultStatus: "scheduled" | "confirmed"
  defaultView: "calendar" | "list" | "gantt"
  defaultStartTime: string
  checklistItems: string[]
}

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
}

const STORAGE_KEY = "verrex-appointment-settings"

export function loadSettings(): AppointmentSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
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

const durations = [
  { value: 30, label: "30 min" }, { value: 60, label: "1 hour" },
  { value: 90, label: "1.5h" }, { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" }, { value: 240, label: "4 hours" },
  { value: 480, label: "Full Day" },
]

const startTimes = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00"]

export default function SettingsPanel({ open, onClose, settings, onSave }: Props) {
  const [local, setLocal] = useState<AppointmentSettings>(settings)
  const [newItem, setNewItem] = useState("")

  useEffect(() => { setLocal(settings) }, [settings])

  const update = <K extends keyof AppointmentSettings>(key: K, val: AppointmentSettings[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }))
  }

  const addChecklistItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed || local.checklistItems.includes(trimmed)) return
    update("checklistItems", [...local.checklistItems, trimmed])
    setNewItem("")
  }

  const removeChecklistItem = (idx: number) => {
    update("checklistItems", local.checklistItems.filter((_, i) => i !== idx))
  }

  const restoreDefaults = () => {
    update("checklistItems", [...DEFAULT_CHECKLIST])
  }

  const handleSave = () => {
    saveSettings(local)
    onSave(local)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto" style={{ animation: "slideInRight 0.3s ease-out forwards" }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><Settings className="h-5 w-5 text-blue-600" />Appointment Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Presets */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Default Presets</h3>

            {/* Default Duration */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Default Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {durations.map(d => (
                  <button key={d.value} onClick={() => update("defaultDuration", d.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${local.defaultDuration === d.value ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Status */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Default Status</label>
              <div className="flex gap-2">
                {(["scheduled", "confirmed"] as const).map(s => (
                  <button key={s} onClick={() => update("defaultStatus", s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border-2 transition-all ${local.defaultStatus === s ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Default View */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Default View</label>
              <div className="flex gap-2">
                {(["calendar", "list", "gantt"] as const).map(v => (
                  <button key={v} onClick={() => update("defaultView", v)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border-2 transition-all ${local.defaultView === v ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-transparent bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"}`}>
                    {v === "gantt" ? "Timeline" : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Start Time */}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Default Start Time</label>
              <select value={local.defaultStartTime} onChange={e => update("defaultStartTime", e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white">
                {startTimes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Checklist Manager */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Prep Checklist</h3>
              <button onClick={restoreDefaults} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition-colors">
                <RotateCcw className="h-3 w-3" />Restore Defaults
              </button>
            </div>

            {/* Current Items */}
            <div className="space-y-1.5 mb-3">
              {local.checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 group">
                  <div className="h-4 w-4 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex-1">{item}</span>
                  <button onClick={() => removeChecklistItem(idx)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {local.checklistItems.length === 0 && (
                <p className="text-xs text-slate-400 italic py-3 text-center">No checklist items. Add some below.</p>
              )}
            </div>

            {/* Add New Item */}
            <div className="flex gap-2">
              <input value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addChecklistItem()}
                placeholder="Add custom checklist item..."
                className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
              <button onClick={addChecklistItem} disabled={!newItem.trim()}
                className={`h-10 px-4 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${newItem.trim() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}>
                <Plus className="h-3.5 w-3.5" />Add
              </button>
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
