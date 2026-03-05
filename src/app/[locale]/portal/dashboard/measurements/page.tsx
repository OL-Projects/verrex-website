"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Building2, Plus, Trash2, ChevronUp, ChevronDown, Ruler, Camera, FileText, Paperclip, MapPin, Maximize, X, GripVertical, ArrowUpDown, ImagePlus, Save, RotateCcw } from "lucide-react"
import { Building3DCanvas } from "@/components/portal/building-3d-canvas"
import type { BuildingFloor, PlacedWindow } from "@/components/portal/building-scene"
import { mockMeasurements } from "@/lib/portal-data"

const C = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-4",
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  inp: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition",
}

const FLOOR_COLORS = ["#e2e8f0", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#fbcfe8", "#fde68a", "#bbf7d0"]

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

function createFloor(name: string, idx: number): BuildingFloor {
  return { id: uid(), name, width: 10, depth: 8, ceilingHeight: 3, color: FLOOR_COLORS[idx % FLOOR_COLORS.length], windows: [] }
}

const DEFAULT_FLOORS: BuildingFloor[] = [
  { ...createFloor("Basement", 0), ceilingHeight: 2.5, color: "#cbd5e1" },
  { ...createFloor("Ground Floor", 1), color: "#bfdbfe" },
]

const STORAGE_KEY = "vx_measurements_v2"

export default function MeasurementsPage() {
  // ─── State ───
  const [projectName, setProjectName] = useState("New Project")
  const [projectAddr, setProjectAddr] = useState("")
  const [projectNotes, setProjectNotes] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [floors, setFloors] = useState<BuildingFloor[]>(DEFAULT_FLOORS)
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null)
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null)
  const measurements = mockMeasurements

  // Load from localStorage
  useEffect(() => {
    try {
      const d = localStorage.getItem(STORAGE_KEY)
      if (d) {
        const p = JSON.parse(d)
        if (p.projectName) setProjectName(p.projectName)
        if (p.projectAddr) setProjectAddr(p.projectAddr)
        if (p.projectNotes) setProjectNotes(p.projectNotes)
        if (p.photos) setPhotos(p.photos)
        if (p.floors?.length) setFloors(p.floors)
      }
    } catch {}
  }, [])

  // Save
  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectName, projectAddr, projectNotes, photos, floors }))
  }, [projectName, projectAddr, projectNotes, photos, floors])

  // Auto-save on change
  useEffect(() => { const t = setTimeout(save, 1500); return () => clearTimeout(t) }, [save])

  // ─── Floor CRUD ───
  const addFloor = useCallback(() => {
    setFloors(p => [...p, createFloor(`Floor ${p.length}`, p.length)])
  }, [])
  const removeFloor = useCallback((id: string) => {
    setFloors(p => p.length <= 1 ? p : p.filter(f => f.id !== id))
  }, [])
  const updateFloor = useCallback((id: string, patch: Partial<BuildingFloor>) => {
    setFloors(p => p.map(f => f.id === id ? { ...f, ...patch } : f))
  }, [])
  const moveFloor = useCallback((id: string, dir: -1 | 1) => {
    setFloors(p => {
      const i = p.findIndex(f => f.id === id)
      if (i < 0 || (dir === -1 && i === 0) || (dir === 1 && i === p.length - 1)) return p
      const n = [...p]; [n[i], n[i + dir]] = [n[i + dir], n[i]]; return n
    })
  }, [])

  // ─── Window placement ───
  const handleFaceClick = useCallback((floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => {
    if (!activeWindowId) return
    const m = measurements.find(x => x.id === activeWindowId)
    if (!m) return
    const pw: PlacedWindow = {
      id: uid(), face, posU: u, posV: v,
      measurementId: m.id,
      label: m.location,
      dims: `${m.widthExact}" × ${m.heightExact}"`,
    }
    setFloors(p => p.map(f => f.id === floorId ? { ...f, windows: [...f.windows, pw] } : f))
    setActiveWindowId(null)
  }, [activeWindowId, measurements])

  const removePlacedWindow = useCallback((pwId: string) => {
    setFloors(p => p.map(f => ({ ...f, windows: f.windows.filter(w => w.id !== pwId) })))
    setSelectedPlacedId(null)
  }, [])

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === "string") setPhotos(p => [...p, reader.result as string]) }
    reader.readAsDataURL(file)
  }, [])

  const reset = useCallback(() => {
    if (!confirm("Reset project? All data will be lost.")) return
    setProjectName("New Project"); setProjectAddr(""); setProjectNotes(""); setPhotos([]); setFloors(DEFAULT_FLOORS)
    setActiveWindowId(null); setSelectedPlacedId(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Measurements</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">3D Building Configurator — Place windows on building faces</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition"><Save className="h-4 w-4 text-emerald-500" /> Save</button>
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition"><RotateCcw className="h-4 w-4" /> Reset</button>
        </div>
      </motion.div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="w-full lg:w-80 lg:shrink-0 space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {/* Project Info */}
          <div className={C.card}>
            <p className={C.lbl}>Project Info</p>
            <input value={projectName} onChange={e => setProjectName(e.target.value)} className={`${C.inp} font-bold`} placeholder="Project Name" />
            <input value={projectAddr} onChange={e => setProjectAddr(e.target.value)} className={`${C.inp} mt-2`} placeholder="Address" />
            <textarea value={projectNotes} onChange={e => setProjectNotes(e.target.value)} rows={3} className={`${C.inp} mt-2 resize-none`} placeholder="Notes & description…" />
          </div>

          {/* Photos */}
          <div className={C.card}>
            <p className={C.lbl}>Photos & Attachments</p>
            <div className="flex flex-wrap gap-2">
              {photos.map((ph, i) => (
                <div key={i} className="relative group">
                  <img src={ph} alt="" className="h-16 w-16 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                  <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[8px] hidden group-hover:flex items-center justify-center"><X className="h-2.5 w-2.5" /></button>
                </div>
              ))}
              <label className="h-16 w-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition">
                <ImagePlus className="h-5 w-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>

          {/* Floor Controls */}
          <div className={C.card}>
            <div className="flex items-center justify-between mb-2">
              <p className={C.lbl + " mb-0"}>Building Floors ({floors.length})</p>
              <button onClick={addFloor} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"><Plus className="h-3 w-3" /> Add</button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {floors.map((f, i) => (
                <div key={f.id} className={`rounded-xl border p-2 text-xs ${expandedFloor === f.id ? "border-blue-400 bg-blue-50/50 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setExpandedFloor(p => p === f.id ? null : f.id)} className="text-slate-400 hover:text-slate-600"><GripVertical className="h-3 w-3" /></button>
                    <div className="h-3 w-3 rounded-sm" style={{ background: f.color }} />
                    <input value={f.name} onChange={e => updateFloor(f.id, { name: e.target.value })} className="flex-1 bg-transparent text-xs font-bold outline-none text-slate-900 dark:text-white" />
                    <button onClick={() => moveFloor(f.id, -1)} className="text-slate-400 hover:text-slate-600" title="Move down"><ChevronDown className="h-3 w-3" /></button>
                    <button onClick={() => moveFloor(f.id, 1)} className="text-slate-400 hover:text-slate-600" title="Move up"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={() => removeFloor(f.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  {expandedFloor === f.id && (
                    <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                      <div><label className={C.lbl}>W</label><input type="number" min={2} max={50} value={f.width} onChange={e => updateFloor(f.id, { width: +e.target.value })} className={C.inp + " text-xs"} /></div>
                      <div><label className={C.lbl}>D</label><input type="number" min={2} max={50} value={f.depth} onChange={e => updateFloor(f.id, { depth: +e.target.value })} className={C.inp + " text-xs"} /></div>
                      <div><label className={C.lbl}>H</label><input type="number" min={1} max={10} step={0.5} value={f.ceilingHeight} onChange={e => updateFloor(f.id, { ceilingHeight: +e.target.value })} className={C.inp + " text-xs"} /></div>
                    </div>
                  )}
                  {f.windows.length > 0 && (
                    <p className="text-[9px] text-blue-500 mt-1">📐 {f.windows.length} window{f.windows.length > 1 ? "s" : ""} placed</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Window Measurements (cards to pick from) */}
          <div className={C.card}>
            <p className={C.lbl}>Window Measurements ({measurements.length})</p>
            {activeWindowId && <p className="text-[10px] text-amber-600 font-bold mb-2 animate-pulse">🎯 Now click a building face to place this window</p>}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {measurements.map(m => {
                const isActive = activeWindowId === m.id
                return (
                  <button key={m.id} onClick={() => setActiveWindowId(p => p === m.id ? null : m.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition ${isActive ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-400/50" : "border-slate-200 dark:border-white/10 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isActive ? "bg-amber-100 dark:bg-amber-500/20" : "bg-purple-100 dark:bg-purple-500/15"}`}>
                        <Ruler className={`h-4 w-4 ${isActive ? "text-amber-600" : "text-purple-600 dark:text-purple-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{m.location}</p>
                        <p className="text-[9px] text-slate-500">{m.widthExact}" × {m.heightExact}" • {m.windowType.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: 3D VIEWER ═══ */}
        <div className="flex-1 min-w-0">
          <div className={`${C.card} p-0 overflow-hidden`}>
            <div className="h-[calc(100vh-12rem)] min-h-[500px]">
              <Building3DCanvas
                floors={floors}
                activeWindowId={activeWindowId}
                onFaceClick={handleFaceClick}
                onPlacedWindowClick={setSelectedPlacedId}
                selectedPlacedId={selectedPlacedId}
              />
            </div>
          </div>

          {/* Selected window detail bar */}
          {selectedPlacedId && (() => {
            const pw = floors.flatMap(f => f.windows).find(w => w.id === selectedPlacedId)
            if (!pw) return null
            const m = measurements.find(x => x.id === pw.measurementId)
            return (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`${C.card} mt-3 flex items-center justify-between flex-wrap gap-3`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
                    <Maximize className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pw.label} — {pw.dims}</p>
                    <p className="text-[10px] text-slate-500">Face: <span className="font-bold uppercase">{pw.face}</span> • {m?.color} / {m?.glassType} • {m?.windowType.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedPlacedId(null)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition">Deselect</button>
                  <button onClick={() => removePlacedWindow(selectedPlacedId)} className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs font-bold text-red-600 hover:bg-red-100 transition">Remove</button>
                </div>
              </motion.div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
