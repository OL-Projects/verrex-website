"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Plus, Trash2, ChevronUp, ChevronDown, Ruler, Maximize, X, GripVertical, ImagePlus, Save, RotateCcw, Move, Eye, EyeOff, PanelLeftClose, PanelLeftOpen, Palette } from "lucide-react"
import { Building3DCanvas } from "@/components/portal/building-3d-canvas"
import type { BuildingFloor, PlacedWindow } from "@/components/portal/building-scene"

const C = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-4",
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  inp: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition",
  sel: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition appearance-none",
}
const FLOOR_COLORS = ["#e2e8f0", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#fbcfe8", "#fde68a", "#bbf7d0"]
const WINDOW_TYPES = ["Casement", "Fixed", "Sliding", "Awning", "Hopper", "Bay", "Picture", "Double Hung", "Single Hung"]
const PRODUCTS = ["uPVC", "Aluminum", "Hybrid Alu/PVC", "Wood"]
const COLORS = ["White", "Black", "Grey", "Brown", "Bronze", "Custom"]
const GLASS = ["Double", "Triple"]
const GLASS_TYPE = ["Clear", "Low-E", "Argon", "Tinted", "Frosted"]

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }
function createFloor(name: string, idx: number): BuildingFloor {
  return { id: uid(), name, width: 10, depth: 8, ceilingHeight: 3, color: FLOOR_COLORS[idx % FLOOR_COLORS.length], windows: [] }
}

interface BasketWindow {
  id: string; label: string; windowType: string; width: number; height: number
  product: string; extColor: string; intColor: string; glass: string; glassType: string; notes: string
}

const DEFAULT_FLOORS: BuildingFloor[] = [
  { ...createFloor("Basement", 0), ceilingHeight: 2.5, color: "#cbd5e1" },
  { ...createFloor("Ground Floor", 1), color: "#bfdbfe" },
]
const SK = "vx_measurements_v3"

export default function MeasurementsPage() {
  const [projectName, setProjectName] = useState("New Project")
  const [projectAddr, setProjectAddr] = useState("")
  const [projectNotes, setProjectNotes] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [floors, setFloors] = useState<BuildingFloor[]>(DEFAULT_FLOORS)
  const [basket, setBasket] = useState<BasketWindow[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null)
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null)
  const [moveMode, setMoveMode] = useState(false)
  const [solidMode, setSolidMode] = useState(false)
  const [showCreator, setShowCreator] = useState(false)
  // Creator form
  const [cLabel, setCLabel] = useState(""); const [cType, setCType] = useState("Casement")
  const [cW, setCW] = useState(48); const [cH, setCH] = useState(36)
  const [cProd, setCProd] = useState("uPVC"); const [cExtC, setCExtC] = useState("White")
  const [cIntC, setCIntC] = useState("White"); const [cGlass, setCGlass] = useState("Double")
  const [cGlassT, setCGlassT] = useState("Low-E"); const [cNotes, setCNotes] = useState("")

  useEffect(() => { try { const d = localStorage.getItem(SK); if (d) { const p = JSON.parse(d)
    if (p.projectName) setProjectName(p.projectName); if (p.projectAddr) setProjectAddr(p.projectAddr)
    if (p.projectNotes) setProjectNotes(p.projectNotes); if (p.photos) setPhotos(p.photos)
    if (p.floors?.length) setFloors(p.floors); if (p.basket?.length) setBasket(p.basket)
  } } catch {} }, [])

  const save = useCallback(() => {
    localStorage.setItem(SK, JSON.stringify({ projectName, projectAddr, projectNotes, photos, floors, basket }))
  }, [projectName, projectAddr, projectNotes, photos, floors, basket])
  useEffect(() => { const t = setTimeout(save, 1500); return () => clearTimeout(t) }, [save])

  const addFloor = useCallback(() => setFloors(p => [...p, createFloor(`Floor ${p.length}`, p.length)]), [])
  const removeFloor = useCallback((id: string) => setFloors(p => p.length <= 1 ? p : p.filter(f => f.id !== id)), [])
  const updateFloor = useCallback((id: string, patch: Partial<BuildingFloor>) => setFloors(p => p.map(f => f.id === id ? { ...f, ...patch } : f)), [])
  const moveFloor = useCallback((id: string, dir: -1 | 1) => setFloors(p => {
    const i = p.findIndex(f => f.id === id); if (i < 0 || (dir === -1 && i === 0) || (dir === 1 && i === p.length - 1)) return p
    const n = [...p]; [n[i], n[i + dir]] = [n[i + dir], n[i]]; return n
  }), [])

  const addToBasket = useCallback(() => {
    if (!cLabel.trim()) return
    setBasket(p => [...p, { id: uid(), label: cLabel, windowType: cType, width: cW, height: cH, product: cProd, extColor: cExtC, intColor: cIntC, glass: cGlass, glassType: cGlassT, notes: cNotes }])
    setCLabel(""); setCNotes(""); setShowCreator(false)
  }, [cLabel, cType, cW, cH, cProd, cExtC, cIntC, cGlass, cGlassT, cNotes])

  const handleFaceClick = useCallback((floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => {
    if (moveMode && selectedPlacedId) {
      setFloors(p => {
        const all = p.flatMap(f => f.windows); const pw = all.find(w => w.id === selectedPlacedId)
        if (!pw) return p
        const cleaned = p.map(f => ({ ...f, windows: f.windows.filter(w => w.id !== selectedPlacedId) }))
        return cleaned.map(f => f.id === floorId ? { ...f, windows: [...f.windows, { ...pw, face, posU: u, posV: v }] } : f)
      })
      setMoveMode(false); setSelectedPlacedId(null); return
    }
    if (!activeWindowId) return
    const bw = basket.find(x => x.id === activeWindowId)
    if (!bw) return
    const pw: PlacedWindow = { id: uid(), face, posU: u, posV: v, measurementId: bw.id, label: bw.label, dims: `${bw.width}" × ${bw.height}"`, windowType: bw.windowType }
    setFloors(p => p.map(f => f.id === floorId ? { ...f, windows: [...f.windows, pw] } : f))
    setActiveWindowId(null)
  }, [activeWindowId, moveMode, selectedPlacedId, basket])

  const removePlacedWindow = useCallback((pwId: string) => {
    setFloors(p => p.map(f => ({ ...f, windows: f.windows.filter(w => w.id !== pwId) }))); setSelectedPlacedId(null); setMoveMode(false)
  }, [])

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader(); r.onload = () => { if (typeof r.result === "string") setPhotos(p => [...p, r.result as string]) }; r.readAsDataURL(file)
  }, [])

  const reset = useCallback(() => {
    if (!confirm("Reset project?")) return
    setProjectName("New Project"); setProjectAddr(""); setProjectNotes(""); setPhotos([]); setFloors(DEFAULT_FLOORS); setBasket([])
    setActiveWindowId(null); setSelectedPlacedId(null); setMoveMode(false); localStorage.removeItem(SK)
  }, [])

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-purple-500" />
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Measurements</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">3D Building Configurator — Create windows → place on faces</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSolidMode(p => !p)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${solidMode ? "bg-slate-900 text-white border-slate-700" : "border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
            {solidMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {solidMode ? "Solid" : "Transparent"}
          </button>
          <button onClick={save} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition"><Save className="h-4 w-4 text-emerald-500" /> Save</button>
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition"><RotateCcw className="h-4 w-4" /> Reset</button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-80 lg:shrink-0 space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {/* Project Info */}
          <div className={C.card}>
            <p className={C.lbl}>Project Info</p>
            <input value={projectName} onChange={e => setProjectName(e.target.value)} className={`${C.inp} font-bold`} placeholder="Project Name" />
            <input value={projectAddr} onChange={e => setProjectAddr(e.target.value)} className={`${C.inp} mt-2`} placeholder="Address" />
            <textarea value={projectNotes} onChange={e => setProjectNotes(e.target.value)} rows={2} className={`${C.inp} mt-2 resize-none`} placeholder="Notes…" />
          </div>
          {/* Photos */}
          <div className={C.card}>
            <p className={C.lbl}>Photos</p>
            <div className="flex flex-wrap gap-2">
              {photos.map((ph, i) => (
                <div key={i} className="relative group"><img src={ph} alt="" className="h-14 w-14 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                  <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[8px] hidden group-hover:flex items-center justify-center"><X className="h-2.5 w-2.5" /></button></div>
              ))}
              <label className="h-14 w-14 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 hover:border-blue-500 cursor-pointer transition"><ImagePlus className="h-4 w-4" /><input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} /></label>
            </div>
          </div>
          {/* Floors */}
          <div className={C.card}>
            <div className="flex items-center justify-between mb-2"><p className={C.lbl + " mb-0"}>Floors ({floors.length})</p>
              <button onClick={addFloor} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"><Plus className="h-3 w-3" /> Add</button></div>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
              {floors.map(f => (
                <div key={f.id} className={`rounded-xl border p-2 text-xs ${expandedFloor === f.id ? "border-blue-400 bg-blue-50/50 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setExpandedFloor(p => p === f.id ? null : f.id)} className="text-slate-400 hover:text-slate-600"><GripVertical className="h-3 w-3" /></button>
                    <div className="h-3 w-3 rounded-sm" style={{ background: f.color }} />
                    <input value={f.name} onChange={e => updateFloor(f.id, { name: e.target.value })} className="flex-1 bg-transparent text-xs font-bold outline-none text-slate-900 dark:text-white" />
                    <button onClick={() => moveFloor(f.id, -1)} className="text-slate-400"><ChevronDown className="h-3 w-3" /></button>
                    <button onClick={() => moveFloor(f.id, 1)} className="text-slate-400"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={() => removeFloor(f.id)} className="text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  {expandedFloor === f.id && (
                    <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                      <div><label className={C.lbl}>W</label><input type="number" min={2} max={50} value={f.width} onChange={e => updateFloor(f.id, { width: +e.target.value })} className={C.inp + " text-xs"} /></div>
                      <div><label className={C.lbl}>D</label><input type="number" min={2} max={50} value={f.depth} onChange={e => updateFloor(f.id, { depth: +e.target.value })} className={C.inp + " text-xs"} /></div>
                      <div><label className={C.lbl}>H</label><input type="number" min={1} max={10} step={0.5} value={f.ceilingHeight} onChange={e => updateFloor(f.id, { ceilingHeight: +e.target.value })} className={C.inp + " text-xs"} /></div>
                    </div>)}
                  {f.windows.length > 0 && <p className="text-[9px] text-blue-500 mt-1">📐 {f.windows.length} window{f.windows.length > 1 ? "s" : ""}</p>}
                </div>))}
            </div>
          </div>

          {/* ─── Window Creator ─── */}
          <div className={C.card}>
            <div className="flex items-center justify-between mb-2">
              <p className={C.lbl + " mb-0"}>Window Creator</p>
              <button onClick={() => setShowCreator(p => !p)} className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                {showCreator ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeftOpen className="h-3 w-3" />} {showCreator ? "Close" : "Open"}
              </button>
            </div>
            <AnimatePresence>
              {showCreator && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    <input value={cLabel} onChange={e => setCLabel(e.target.value)} className={C.inp} placeholder="Label (e.g. Bedroom #1)" />
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={C.lbl}>Type</label><select value={cType} onChange={e => setCType(e.target.value)} className={C.sel}>{WINDOW_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                      <div><label className={C.lbl}>Product</label><select value={cProd} onChange={e => setCProd(e.target.value)} className={C.sel}>{PRODUCTS.map(t => <option key={t}>{t}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={C.lbl}>Width &quot;</label><input type="number" value={cW} onChange={e => setCW(+e.target.value)} min={6} max={120} className={C.inp} /></div>
                      <div><label className={C.lbl}>Height &quot;</label><input type="number" value={cH} onChange={e => setCH(+e.target.value)} min={6} max={120} className={C.inp} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={C.lbl}>Ext Color</label><select value={cExtC} onChange={e => setCExtC(e.target.value)} className={C.sel}>{COLORS.map(t => <option key={t}>{t}</option>)}</select></div>
                      <div><label className={C.lbl}>Int Color</label><select value={cIntC} onChange={e => setCIntC(e.target.value)} className={C.sel}>{COLORS.map(t => <option key={t}>{t}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={C.lbl}>Glass</label><select value={cGlass} onChange={e => setCGlass(e.target.value)} className={C.sel}>{GLASS.map(t => <option key={t}>{t}</option>)}</select></div>
                      <div><label className={C.lbl}>Glass Type</label><select value={cGlassT} onChange={e => setCGlassT(e.target.value)} className={C.sel}>{GLASS_TYPE.map(t => <option key={t}>{t}</option>)}</select></div>
                    </div>
                    {/* SVG Preview */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                      <svg viewBox="0 0 120 80" className="w-full max-w-[200px]">
                        <rect x="2" y="2" width="116" height="76" fill="#dbeafe" stroke="#1e3a5f" strokeWidth="3" rx="2" />
                        <line x1="60" y1="2" x2="60" y2="78" stroke="#1e3a5f" strokeWidth="1.5" />
                        <line x1="2" y1="40" x2="118" y2="40" stroke="#1e3a5f" strokeWidth="1.5" />
                        {cType === "Casement" && <><line x1="2" y1="2" x2="60" y2="40" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.5" /><line x1="60" y1="2" x2="118" y2="40" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.5" /></>}
                        <text x="60" y="72" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="bold">{cW}&quot; × {cH}&quot;</text>
                      </svg>
                    </div>
                    <input value={cNotes} onChange={e => setCNotes(e.target.value)} className={C.inp} placeholder="Notes (optional)" />
                    <button onClick={addToBasket} disabled={!cLabel.trim()} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition flex items-center justify-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add to Window Basket
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Window Basket ─── */}
          <div className={C.card}>
            <p className={C.lbl}>Window Basket ({basket.length})</p>
            {activeWindowId && <p className="text-[10px] text-amber-600 font-bold mb-2 animate-pulse">🎯 Click a building face to place</p>}
            {moveMode && <p className="text-[10px] text-purple-600 font-bold mb-2 animate-pulse">🔀 Click a face to relocate window</p>}
            {basket.length === 0 && <p className="text-[10px] text-slate-400 italic">Create windows above to fill the basket</p>}
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
              {basket.map(bw => {
                const isActive = activeWindowId === bw.id
                return (
                  <div key={bw.id} className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer ${isActive ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-400/50" : "border-slate-200 dark:border-white/10 hover:border-blue-400"}`}
                    onClick={() => { setMoveMode(false); setActiveWindowId(p => p === bw.id ? null : bw.id) }}>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-amber-100" : "bg-purple-100 dark:bg-purple-500/15"}`}>
                      <Ruler className={`h-4 w-4 ${isActive ? "text-amber-600" : "text-purple-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{bw.label}</p>
                      <p className="text-[9px] text-slate-500">{bw.width}&quot; × {bw.height}&quot; • {bw.windowType} • {bw.product}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setBasket(p => p.filter(x => x.id !== bw.id)) }} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: 3D VIEWER */}
        <div className="flex-1 min-w-0">
          <div className={`${C.card} p-0 overflow-hidden`}>
            <div className="h-[calc(100vh-12rem)] min-h-[500px]">
              <Building3DCanvas floors={floors} activeWindowId={activeWindowId} moveMode={moveMode}
                onFaceClick={handleFaceClick} onPlacedWindowClick={setSelectedPlacedId}
                selectedPlacedId={selectedPlacedId} solidMode={solidMode} />
            </div>
          </div>
          {selectedPlacedId && (() => {
            const pw = floors.flatMap(f => f.windows).find(w => w.id === selectedPlacedId)
            if (!pw) return null
            const bw = basket.find(x => x.id === pw.measurementId)
            return (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`${C.card} mt-3 flex items-center justify-between flex-wrap gap-3`}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center"><Maximize className="h-5 w-5 text-amber-600" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pw.label} — {pw.dims}</p>
                    <p className="text-[10px] text-slate-500">Face: <span className="font-bold uppercase">{pw.face}</span>{bw ? ` • ${bw.extColor} / ${bw.glassType} • ${bw.windowType}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setMoveMode(true); setActiveWindowId(null) }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${moveMode ? "bg-purple-600 text-white border-purple-600" : "border-slate-200 dark:border-white/10 hover:bg-purple-50 text-purple-600"}`}>
                    <Move className="h-3.5 w-3.5" /> {moveMode ? "Moving…" : "Move"}
                  </button>
                  <button onClick={() => { setSelectedPlacedId(null); setMoveMode(false) }} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition">Deselect</button>
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
