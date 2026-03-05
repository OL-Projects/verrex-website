"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Plus, Trash2, ChevronUp, ChevronDown, Ruler, Maximize, X, GripVertical, ImagePlus, Save, RotateCcw, Move, Eye, EyeOff, PanelLeftClose, PanelLeftOpen, Layers, ArrowLeftRight, RotateCw, Scaling, Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react"
import { Building3DCanvas } from "@/components/portal/building-3d-canvas"
import type { BuildingFloor, PlacedWindow } from "@/components/portal/building-scene"
import { EstimateWindowSVG } from "@/components/portal/estimate-window-svg"
import { WINDOW_TYPES, getTypeGroups, isDoorType, PRODUCTS as EST_PRODUCTS, DEFAULT_EXT_COLORS, DEFAULT_INT_COLORS } from "@/lib/estimate-config"

const C = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-4",
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  inp: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition",
  sel: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition appearance-none",
  btn: "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition",
}
const FLOOR_COLORS = ["#e2e8f0", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#fbcfe8", "#fde68a", "#bbf7d0"]
const GLASS_OPTS = ["Double", "Triple"]
const GLASS_TYPES = ["Clear", "Low-E", "Argon", "Tinted", "Frosted"]

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }
function createFloor(name: string, idx: number): BuildingFloor {
  return { id: uid(), name, width: 10, depth: 8, ceilingHeight: 3, color: FLOOR_COLORS[idx % FLOOR_COLORS.length], windows: [] }
}

interface BasketWindow {
  id: string; label: string; typeKey: string; width: number; height: number
  product: string; extColor: string; intColor: string; glass: string; glassType: string
  hingeLeft: boolean; swingIn: boolean; notes: string
}

const DEFAULT_FLOORS: BuildingFloor[] = [
  { ...createFloor("Basement", 0), ceilingHeight: 2.5, color: "#cbd5e1" },
  { ...createFloor("Ground Floor", 1), color: "#bfdbfe" },
]
const SK = "vx_measurements_v4"

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
  const [compileMode, setCompileMode] = useState(false)
  const [showCreator, setShowCreator] = useState(false)
  const [unit, setUnit] = useState<"ft" | "m">("ft")
  const [showScale, setShowScale] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Creator form
  const [cLabel, setCLabel] = useState("")
  const [cTypeKey, setCTypeKey] = useState("CAS-L+FIX")
  const [cW, setCW] = useState(48); const [cH, setCH] = useState(48)
  const [cProd, setCProd] = useState("double-tempered")
  const [cExtC, setCExtC] = useState("White"); const [cIntC, setCIntC] = useState("White")
  const [cGlass, setCGlass] = useState("Double"); const [cGlassT, setCGlassT] = useState("Low-E")
  const [cHingeL, setCHingeL] = useState(false); const [cSwingIn, setCSwingIn] = useState(true)
  const [cNotes, setCNotes] = useState("")

  const typeGroups = useMemo(() => getTypeGroups(), [])
  const cIsDoor = isDoorType(cTypeKey)

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
    const cfg = WINDOW_TYPES[cTypeKey]
    setBasket(p => [...p, { id: uid(), label: cLabel, typeKey: cTypeKey, width: cW, height: cH,
      product: cProd, extColor: cExtC, intColor: cIntC, glass: cGlass, glassType: cGlassT,
      hingeLeft: cHingeL, swingIn: cSwingIn, notes: cNotes }])
    setCLabel(""); setCNotes(""); setShowCreator(false)
  }, [cLabel, cTypeKey, cW, cH, cProd, cExtC, cIntC, cGlass, cGlassT, cHingeL, cSwingIn, cNotes])

  const handleFaceClick = useCallback((floorId: string, face: "front" | "back" | "left" | "right", u: number, v: number) => {
    if (moveMode && selectedPlacedId) {
      setFloors(p => {
        const pw = p.flatMap(f => f.windows).find(w => w.id === selectedPlacedId)
        if (!pw) return p
        const cleaned = p.map(f => ({ ...f, windows: f.windows.filter(w => w.id !== selectedPlacedId) }))
        return cleaned.map(f => f.id === floorId ? { ...f, windows: [...f.windows, { ...pw, face, posU: u, posV: v }] } : f)
      })
      setSelectedPlacedId(null); return
    }
    if (!activeWindowId) return
    const bw = basket.find(x => x.id === activeWindowId)
    if (!bw) return
    const cfg = WINDOW_TYPES[bw.typeKey]
    const pw: PlacedWindow = { id: uid(), face, posU: u, posV: v, measurementId: bw.id,
      label: bw.label, dims: `${bw.width}" × ${bw.height}"`, windowType: cfg?.label || bw.typeKey,
      typeKey: bw.typeKey, wInches: bw.width, hInches: bw.height }
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
    setActiveWindowId(null); setSelectedPlacedId(null); setMoveMode(false); setCompileMode(false); localStorage.removeItem(SK)
  }, [])

  // ─── Compile mode detail popup ───
  const compileDetail = useMemo(() => {
    if (!compileMode || !selectedPlacedId) return null
    const pw = floors.flatMap(f => f.windows).find(w => w.id === selectedPlacedId)
    if (!pw) return null
    const bw = basket.find(x => x.id === pw.measurementId)
    const floorName = floors.find(f => f.windows.some(w => w.id === selectedPlacedId))?.name || "—"
    return { pw, bw, floorName }
  }, [compileMode, selectedPlacedId, floors, basket])

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-purple-500" />
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Measurements</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{compileMode ? "Installer View — Tap windows for details" : "3D Building Configurator"}</p></div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setCompileMode(p => !p); if (!compileMode) { setMoveMode(false); setActiveWindowId(null) } }}
            className={`${C.btn} ${compileMode ? "bg-emerald-600 text-white border-emerald-700" : "border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
            <Layers className="h-4 w-4" /> {compileMode ? "Exit Compile" : "Compile"}
          </button>
          {!compileMode && <>
            <button onClick={() => { setMoveMode(p => !p); if (moveMode) setSelectedPlacedId(null) }}
              className={`${C.btn} ${moveMode ? "bg-purple-600 text-white border-purple-700" : "border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
              {moveMode ? <><Unlock className="h-4 w-4" /> Reposition</> : <><Lock className="h-4 w-4" /> Locked</>}
            </button>
            <button onClick={() => setSolidMode(p => !p)} className={`${C.btn} ${solidMode ? "bg-slate-900 text-white border-slate-700" : "border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
              {solidMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {solidMode ? "Solid" : "Transparent"}
            </button>
            <button onClick={save} className={`${C.btn} border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10`}><Save className="h-4 w-4 text-emerald-500" /> Save</button>
            <button onClick={reset} className={`${C.btn} border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10`}><RotateCcw className="h-4 w-4" /> Reset</button>
          </>}
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT PANEL — hidden in compile mode */}
        {!compileMode && (
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
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {floors.map(f => (
                  <div key={f.id} className={`rounded-xl border p-2 text-xs ${expandedFloor === f.id ? "border-blue-400 bg-blue-50/50 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setExpandedFloor(p => p === f.id ? null : f.id)} className="text-slate-400"><GripVertical className="h-3 w-3" /></button>
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

            {/* Scale / Real Dimensions */}
            <div className={C.card}>
              <div className="flex items-center justify-between mb-2">
                <p className={C.lbl + " mb-0"}>Scale & Dimensions</p>
                <button onClick={() => setShowScale(p => !p)} className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                  <Scaling className="h-3 w-3" /> {showScale ? "Hide" : "Setup"}
                </button>
              </div>
              <AnimatePresence>
                {showScale && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                      <div>
                        <label className={C.lbl}>Unit</label>
                        <div className="flex gap-1">
                          <button onClick={() => setUnit("ft")} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${unit === "ft" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>Feet (ft)</button>
                          <button onClick={() => setUnit("m")} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${unit === "m" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>Meters (m)</button>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400">Set floor W×D×H in {unit === "ft" ? "feet" : "meters"}. Windows use their inch measurements for proportional sizing.</p>
                      {floors.map(f => (
                        <div key={f.id} className="rounded-lg bg-slate-50 dark:bg-white/3 border border-slate-200/50 dark:border-white/5 p-2">
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">{f.name}</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div><label className={C.lbl}>W ({unit})</label><input type="number" min={2} max={100} step={0.5} value={f.width} onChange={e => updateFloor(f.id, { width: +e.target.value })} className={C.inp + " text-xs"} /></div>
                            <div><label className={C.lbl}>D ({unit})</label><input type="number" min={2} max={100} step={0.5} value={f.depth} onChange={e => updateFloor(f.id, { depth: +e.target.value })} className={C.inp + " text-xs"} /></div>
                            <div><label className={C.lbl}>H ({unit})</label><input type="number" min={1} max={20} step={0.5} value={f.ceilingHeight} onChange={e => updateFloor(f.id, { ceilingHeight: +e.target.value })} className={C.inp + " text-xs"} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!showScale && <p className="text-[9px] text-slate-400">1 unit = 1 {unit} • Click Setup to configure</p>}
            </div>

            {/* Window Creator */}
            <div className={C.card}>
              <div className="flex items-center justify-between mb-2">
                <p className={C.lbl + " mb-0"}>Window / Door Creator</p>
                <button onClick={() => setShowCreator(p => !p)} className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                  {showCreator ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeftOpen className="h-3 w-3" />} {showCreator ? "Close" : "Open"}
                </button>
              </div>
              <AnimatePresence>
                {showCreator && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-white/10">
                      <input value={cLabel} onChange={e => setCLabel(e.target.value)} className={C.inp} placeholder="Label (e.g. Bedroom #1)" />
                      {/* Type — grouped like estimate */}
                      <div><label className={C.lbl}>Type</label>
                        <select value={cTypeKey} onChange={e => setCTypeKey(e.target.value)} className={C.sel}>
                          {typeGroups.map(g => (
                            <optgroup key={g.group} label={g.group}>
                              {g.types.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className={C.lbl}>Width &quot;</label><input type="number" value={cW} onChange={e => setCW(+e.target.value)} min={6} max={200} className={C.inp} /></div>
                        <div><label className={C.lbl}>Height &quot;</label><input type="number" value={cH} onChange={e => setCH(+e.target.value)} min={6} max={200} className={C.inp} /></div>
                      </div>
                      <div><label className={C.lbl}>Product</label>
                        <select value={cProd} onChange={e => setCProd(e.target.value)} className={C.sel}>
                          {EST_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className={C.lbl}>Ext Color</label><select value={cExtC} onChange={e => setCExtC(e.target.value)} className={C.sel}>{DEFAULT_EXT_COLORS.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div><label className={C.lbl}>Int Color</label><select value={cIntC} onChange={e => setCIntC(e.target.value)} className={C.sel}>{DEFAULT_INT_COLORS.map(c => <option key={c}>{c}</option>)}</select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className={C.lbl}>Glass</label><select value={cGlass} onChange={e => setCGlass(e.target.value)} className={C.sel}>{GLASS_OPTS.map(t => <option key={t}>{t}</option>)}</select></div>
                        <div><label className={C.lbl}>Glass Type</label><select value={cGlassT} onChange={e => setCGlassT(e.target.value)} className={C.sel}>{GLASS_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                      </div>
                      {/* Hinge / Swing toggles */}
                      <div className="flex gap-2">
                        <button onClick={() => setCHingeL(p => !p)} className={`flex-1 ${C.btn} justify-center text-[10px] border-slate-200 dark:border-white/10`}>
                          <ArrowLeftRight className="h-3 w-3" /> Hinge: {cHingeL ? "Left" : "Right"}
                        </button>
                        {cIsDoor && <button onClick={() => setCSwingIn(p => !p)} className={`flex-1 ${C.btn} justify-center text-[10px] border-slate-200 dark:border-white/10`}>
                          <RotateCw className="h-3 w-3" /> {cSwingIn ? "Inswing" : "Outswing"}
                        </button>}
                      </div>
                      {/* Live SVG Preview */}
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <EstimateWindowSVG width={cW} height={cH} type={cTypeKey} flipH={cHingeL} swingIn={cSwingIn} />
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

            {/* Window Basket */}
            <div className={C.card}>
              <p className={C.lbl}>Window Basket ({basket.length})</p>
              {activeWindowId && <p className="text-[10px] text-amber-600 font-bold mb-2 animate-pulse">🎯 Click a building face to place</p>}
              {moveMode && <p className="text-[10px] text-purple-600 font-bold mb-2 animate-pulse">🔀 Click a face to relocate window</p>}
              {basket.length === 0 && <p className="text-[10px] text-slate-400 italic">Open the creator above to add windows</p>}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {basket.map(bw => {
                  const isActive = activeWindowId === bw.id
                  const cfg = WINDOW_TYPES[bw.typeKey]
                  return (
                    <div key={bw.id} className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer ${isActive ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-400/50" : "border-slate-200 dark:border-white/10 hover:border-blue-400"}`}
                      onClick={() => { setMoveMode(false); setActiveWindowId(p => p === bw.id ? null : bw.id) }}>
                      {/* Mini SVG preview */}
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden p-0.5">
                        <EstimateWindowSVG width={bw.width} height={bw.height} type={bw.typeKey} flipH={bw.hingeLeft} swingIn={bw.swingIn} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{bw.label}</p>
                        <p className="text-[9px] text-slate-500">{bw.width}&quot; × {bw.height}&quot; • {cfg?.label || bw.typeKey}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setBasket(p => p.filter(x => x.id !== bw.id)) }} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* CENTER: 3D VIEWER */}
        <div className="flex-1 min-w-0">
          <div className={`${C.card} p-0 overflow-hidden relative`}>
            {/* Left panel collapse toggle (non-compile) */}
            {!compileMode && (
              <button onClick={() => setLeftPanelOpen(p => !p)}
                className="absolute top-3 left-3 z-10 h-7 w-7 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-sm transition lg:hidden">
                {leftPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            {/* Compile right panel toggle */}
            {compileMode && (
              <button onClick={() => setRightPanelOpen(p => !p)}
                className="absolute top-3 right-3 z-10 h-7 w-7 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-emerald-600 shadow-sm transition">
                {rightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
            <div className={compileMode ? "h-[calc(100vh-10rem)] min-h-[600px]" : "h-[calc(100vh-12rem)] min-h-[500px]"}>
              <Building3DCanvas floors={floors} activeWindowId={activeWindowId} moveMode={moveMode} compileMode={compileMode}
                onFaceClick={handleFaceClick} onPlacedWindowClick={setSelectedPlacedId}
                selectedPlacedId={selectedPlacedId} solidMode={solidMode} unit={unit} />
            </div>
          </div>

          {/* Detail bar — edit mode */}
          {!compileMode && selectedPlacedId && (() => {
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
                    <p className="text-[10px] text-slate-500">Face: <span className="font-bold uppercase">{pw.face}</span>{bw ? ` • ${bw.extColor} / ${bw.glassType} • ${WINDOW_TYPES[bw.typeKey]?.label || bw.typeKey}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {moveMode && <p className="text-[10px] text-purple-600 font-bold animate-pulse self-center mr-1">🔀 Tap a face to drop</p>}
                  <button onClick={() => setSelectedPlacedId(null)} className={`${C.btn} border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5`}>Deselect</button>
                  <button onClick={() => removePlacedWindow(selectedPlacedId)} className={`${C.btn} bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600`}><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                </div>
              </motion.div>
            )
          })()}

          {/* Compile mode detail popup */}
          {compileMode && compileDetail && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`${C.card} mt-3`}>
              <div className="flex items-start gap-4">
                {compileDetail.bw && (
                  <div className="w-24 shrink-0 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-2">
                    <EstimateWindowSVG width={compileDetail.bw.width} height={compileDetail.bw.height}
                      type={compileDetail.bw.typeKey} flipH={compileDetail.bw.hingeLeft} swingIn={compileDetail.bw.swingIn} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{compileDetail.pw.label}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{compileDetail.pw.dims} — {compileDetail.pw.windowType}</p>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div><span className="text-slate-400">Face:</span> <span className="font-bold uppercase">{compileDetail.pw.face}</span></div>
                    <div><span className="text-slate-400">Floor:</span> <span className="font-bold">{compileDetail.floorName}</span></div>
                    {compileDetail.bw && <>
                      <div><span className="text-slate-400">Product:</span> <span className="font-bold">{EST_PRODUCTS.find(p => p.id === compileDetail.bw!.product)?.label || compileDetail.bw!.product}</span></div>
                      <div><span className="text-slate-400">Ext:</span> <span className="font-bold">{compileDetail.bw!.extColor}</span></div>
                      <div><span className="text-slate-400">Int:</span> <span className="font-bold">{compileDetail.bw!.intColor}</span></div>
                      <div><span className="text-slate-400">Glass:</span> <span className="font-bold">{compileDetail.bw!.glass} — {compileDetail.bw!.glassType}</span></div>
                    </>}
                  </div>
                  {compileDetail.bw?.notes && <p className="text-[10px] text-slate-500 mt-2 italic">📝 {compileDetail.bw.notes}</p>}
                </div>
                <button onClick={() => setSelectedPlacedId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT PANEL — compile mode window dashboard */}
        <AnimatePresence>
          {compileMode && rightPanelOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="hidden lg:block lg:shrink-0 overflow-hidden">
              <div className="w-80 space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                <div className={C.card}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={C.lbl + " mb-0"}>Window Dashboard</p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {floors.reduce((s, f) => s + f.windows.length, 0)} placed
                    </span>
                  </div>
                  {floors.map(f => (
                    <div key={f.id} className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm" style={{ background: f.color }} />
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{f.name}</p>
                        <span className="text-[9px] text-slate-400 ml-auto">{f.windows.length}</span>
                      </div>
                      {f.windows.length === 0 && <p className="text-[9px] text-slate-400 italic ml-4">No windows</p>}
                      <div className="space-y-1">
                        {f.windows.map(pw => {
                          const isSelected = pw.id === selectedPlacedId
                          const bw = basket.find(x => x.id === pw.measurementId)
                          return (
                            <div key={pw.id}
                              onClick={() => setSelectedPlacedId(pw.id)}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer ${isSelected ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-400/50" : "border-slate-200 dark:border-white/10 hover:border-emerald-300"}`}>
                              {bw && (
                                <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden p-0.5">
                                  <EstimateWindowSVG width={bw.width} height={bw.height} type={bw.typeKey} flipH={bw.hingeLeft} swingIn={bw.swingIn} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{pw.label}</p>
                                <p className="text-[8px] text-slate-500">{pw.dims} • <span className="uppercase">{pw.face}</span></p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Summary stats */}
                <div className={C.card}>
                  <p className={C.lbl}>Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-slate-50 dark:bg-white/3 rounded-lg p-2 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{floors.length}</p>
                      <p className="text-slate-500">Floors</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/3 rounded-lg p-2 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{floors.reduce((s, f) => s + f.windows.length, 0)}</p>
                      <p className="text-slate-500">Windows</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/3 rounded-lg p-2 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{basket.length}</p>
                      <p className="text-slate-500">In Basket</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/3 rounded-lg p-2 text-center">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{new Set(floors.flatMap(f => f.windows.map(w => w.face))).size}</p>
                      <p className="text-slate-500">Faces Used</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
