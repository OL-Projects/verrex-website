"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Plus, Trash2, ChevronUp, ChevronDown, Ruler, Maximize, X, GripVertical, ImagePlus, Save, RotateCcw, Move, Eye, EyeOff, PanelLeftClose, PanelLeftOpen, Layers, ArrowLeftRight, RotateCw, Scaling, Lock, Unlock, ChevronLeft, ChevronRight, Undo2, Redo2, Camera, Brain, Loader2 } from "lucide-react"
import { Building3DCanvas } from "@/components/portal/building-3d-canvas"
import type { BuildingFloor, PlacedWindow } from "@/components/portal/building-scene"
import { EstimateWindowSVG } from "@/components/portal/estimate-window-svg"
import { WINDOW_TYPES, getTypeGroups, isDoorType, PRODUCTS as EST_PRODUCTS, DEFAULT_EXT_COLORS, DEFAULT_INT_COLORS } from "@/lib/estimate-config"
import { useMeasurementStore, createFloor, type BasketWindow } from "@/lib/measurements-store"
import { MeasurementsSidebar } from "@/components/portal/measurements-sidebar"

const C = {
  card: "rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-4",
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  inp: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition",
  sel: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition appearance-none",
  btn: "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition",
}
const GLASS_OPTS = ["Double", "Triple"]
const GLASS_TYPES = ["Clear", "Low-E", "Argon", "Tinted", "Frosted"]

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7) }

export default function MeasurementsPage() {
  // ─── Store (multi-project + templates) ───
  const store = useMeasurementStore()
  const { project, setProject, records, activeId, saveStatus, saveNow, newProject, loadProject, deleteProject, duplicateProject, templates, saveAsTemplate, loadTemplate, deleteTemplate } = store
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Convenience aliases & wrappers matching old API
  const projectName = project.projectName
  const projectAddr = project.projectAddr
  const projectNotes = project.projectNotes
  const photos = project.photos
  const floors = project.floors
  const basket = project.basket
  const facePhotos = project.facePhotos

  const setFloors = useCallback((fn: (prev: BuildingFloor[]) => BuildingFloor[]) => {
    setProject(p => ({ ...p, floors: fn(p.floors) }))
  }, [setProject])
  const setBasket = useCallback((fn: (prev: BasketWindow[]) => BasketWindow[]) => {
    setProject(p => ({ ...p, basket: fn(p.basket) }))
  }, [setProject])
  const setPhotos = useCallback((fn: (prev: string[]) => string[]) => {
    setProject(p => ({ ...p, photos: fn(p.photos) }))
  }, [setProject])
  type FaceKey = "front" | "back" | "left" | "right"
  const setFacePhotos = useCallback((fn: (prev: Record<FaceKey, string[]>) => Record<FaceKey, string[]>) => {
    setProject(p => ({ ...p, facePhotos: fn(p.facePhotos) }))
  }, [setProject])

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

  // Undo/Redo
  const [history, setHistory] = useState<BuildingFloor[][]>([])
  const [future, setFuture] = useState<BuildingFloor[][]>([])
  const pushHistory = useCallback((prev: BuildingFloor[]) => {
    setHistory(h => [...h.slice(-30), prev]); setFuture([])
  }, [])
  const undo = useCallback(() => {
    setHistory(h => { if (h.length === 0) return h; const prev = h[h.length - 1]; setFuture(f => [...f, floors]); setFloors(() => prev); return h.slice(0, -1) })
  }, [floors])
  const redo = useCallback(() => {
    setFuture(f => { if (f.length === 0) return f; const next = f[f.length - 1]; setHistory(h => [...h, floors]); setFloors(() => next); return f.slice(0, -1) })
  }, [floors])

  const [activeFace, setActiveFace] = useState<FaceKey | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleFacePhotoUpload = useCallback((face: FaceKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader(); r.onload = () => { if (typeof r.result === "string") setFacePhotos(p => ({ ...p, [face]: [...p[face], r.result as string] })) }; r.readAsDataURL(file)
  }, [])

  const analyzeFacade = useCallback(async (face: FaceKey) => {
    const imgs = facePhotos[face]; if (imgs.length === 0) return
    const aiCfg = localStorage.getItem("vx_ai_config"); if (!aiCfg) { alert("Set up AI in Settings → AI Settings first"); return }
    const { provider, apiKey, model } = JSON.parse(aiCfg)
    if (!apiKey) { alert("No API key configured"); return }
    setAnalyzing(true)
    try {
      const res = await fetch("/api/portal/analyze-facade", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imgs[0], provider, apiKey, model, face }),
      })
      const data = await res.json()
      if (data.error) { alert(`AI Error: ${data.error}`); return }
      if (data.suggestions?.length > 0) {
        const confirmed = confirm(`AI detected ${data.suggestions.length} window(s)/door(s). Add to basket & place on ${face} face?`)
        if (confirmed) {
          const TYPE_MAP: Record<string, string> = { "casement-left": "CAS-L", "casement-right": "CAS-R", "fixed": "FIX", "awning": "AWN", "sliding": "SLD-2", "double-hung": "DH", "picture": "PIC", "entry-door": "ENTRY", "patio-door": "PATIO-SLD", "french-door": "FRENCH" }
          const firstFloor = floors[floors.length > 1 ? 1 : 0]
          pushHistory(floors)
          data.suggestions.forEach((s: any) => {
            const tk = TYPE_MAP[s.type] || "FIX"
            const bw: BasketWindow = { id: uid(), label: s.label || `AI ${s.type}`, typeKey: tk, width: s.estimatedWidth || 36, height: s.estimatedHeight || 48, product: "double-tempered", extColor: "White", intColor: "White", glass: "Double", glassType: "Low-E", hingeLeft: s.type.includes("left"), swingIn: true, notes: `AI detected (${Math.round(s.confidence * 100)}% confidence)` }
            setBasket(p => [...p, bw])
            const cfg = WINDOW_TYPES[tk]
            const pw: PlacedWindow = { id: uid(), face, posU: s.positionU || 0.5, posV: s.positionV || 0.5, measurementId: bw.id, label: bw.label, dims: `${bw.width}" × ${bw.height}"`, windowType: cfg?.label || tk, typeKey: tk, wInches: bw.width, hInches: bw.height }
            setFloors(p => p.map(f => f.id === firstFloor.id ? { ...f, windows: [...f.windows, pw] } : f))
          })
        }
      } else { alert("No windows/doors detected in this photo.") }
    } catch (e: any) { alert(`Analysis failed: ${e.message}`) }
    finally { setAnalyzing(false) }
  }, [facePhotos, floors, pushHistory])

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


  const addFloor = useCallback(() => setFloors(p => {
    const last = p[p.length - 1]
    const nf = createFloor(`Floor ${p.length}`, p.length)
    if (last) { nf.width = last.width; nf.depth = last.depth; nf.ceilingHeight = last.ceilingHeight }
    return [...p, nf]
  }), [])
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
    if (!confirm("Create a new empty project?")) return
    newProject()
    setActiveWindowId(null); setSelectedPlacedId(null); setMoveMode(false); setCompileMode(false)
  }, [newProject])

  // ─── Drag & Drop for face photos ───
  const [dragOverFace, setDragOverFace] = useState<FaceKey | null>(null)
  const handleFaceDrop = useCallback((face: FaceKey, e: React.DragEvent) => {
    e.preventDefault(); setDragOverFace(null)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    files.forEach(file => {
      const r = new FileReader()
      r.onload = () => { if (typeof r.result === "string") setFacePhotos(p => ({ ...p, [face]: [...p[face], r.result as string] })) }
      r.readAsDataURL(file)
    })
  }, [setFacePhotos])

  const FACE_META: { key: FaceKey; label: string; color: string; border: string; bg: string }[] = [
    { key: "front", label: "Front", color: "#3b82f6", border: "border-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { key: "back", label: "Back", color: "#8b5cf6", border: "border-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { key: "left", label: "Left", color: "#10b981", border: "border-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { key: "right", label: "Right", color: "#f59e0b", border: "border-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
  ]

  // ─── Active window config for ghost preview ───
  const activeWindowConfig = useMemo(() => {
    if (!activeWindowId) return null
    const bw = basket.find(x => x.id === activeWindowId)
    if (!bw) return null
    return { typeKey: bw.typeKey, wInches: bw.width, hInches: bw.height, label: bw.label }
  }, [activeWindowId, basket])

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
    <div className="lg:flex gap-4 items-start">
      {/* ═══ LEFT SIDEBAR (History / Templates / Project) ═══ */}
      <MeasurementsSidebar
        records={records} activeId={activeId} saveStatus={saveStatus}
        onNew={newProject} onLoad={loadProject} onDelete={deleteProject} onDuplicate={duplicateProject}
        mobileOpen={sidebarOpen} onMobileToggle={() => setSidebarOpen(p => !p)}
        templates={templates} onSaveAsTemplate={saveAsTemplate} onLoadTemplate={loadTemplate} onDeleteTemplate={deleteTemplate}
        project={project}
        onUpdateProject={(patch) => setProject(p => ({ ...p, ...patch }))}
        onAddFloor={addFloor} onRemoveFloor={removeFloor} onUpdateFloor={updateFloor} onMoveFloor={moveFloor}
        onPhotoUpload={handlePhotoUpload} onRemovePhoto={(idx) => setPhotos(p => p.filter((_, j) => j !== idx))}
        expandedFloor={expandedFloor} onToggleFloor={(id) => setExpandedFloor(p => p === id ? null : id)}
      />
    <div className="flex-1 min-w-0 space-y-4">
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
          {/* Undo / Redo */}
          <button onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)"
            className={`${C.btn} border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30`}>
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)"
            className={`${C.btn} border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30`}>
            <Redo2 className="h-4 w-4" />
          </button>
          {!compileMode && <>
            <button onClick={() => { setMoveMode(p => !p); setSelectedPlacedId(null) }}
              className={`${C.btn} ${moveMode ? "bg-purple-600 text-white border-purple-700" : "border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
              {moveMode ? <><Unlock className="h-4 w-4" /> Reposition</> : <><Lock className="h-4 w-4" /> Locked</>}
            </button>
            <button onClick={() => setSolidMode(p => !p)} className={`${C.btn} ${solidMode ? "bg-slate-900 text-white border-slate-700" : "border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10"}`}>
              {solidMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {solidMode ? "Solid" : "Transparent"}
            </button>
            <button onClick={saveNow} className={`${C.btn} border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10`}><Save className="h-4 w-4 text-emerald-500" /> Save</button>
            <button onClick={reset} className={`${C.btn} border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10`}><RotateCcw className="h-4 w-4" /> Reset</button>
          </>}
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT PANEL — hidden in compile mode */}
        {!compileMode && (
          <div className="w-full lg:w-96 lg:shrink-0 space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
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
                      {/* Type — visual cards like estimate creator */}
                      <div>
                        <label className={C.lbl}>Type</label>
                        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                          {typeGroups.map(g => (
                            <div key={g.group}>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{g.group}</p>
                              <div className="grid grid-cols-3 gap-1.5">
                                {g.types.map(([k, v]) => {
                                  const sel = cTypeKey === k
                                  return (
                                    <button key={k} type="button" onClick={() => setCTypeKey(k)}
                                      className={`flex flex-col items-center p-1.5 rounded-xl border-2 transition text-center ${sel ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-400/50" : "border-slate-200 dark:border-white/10 hover:border-blue-300"}`}>
                                      <div className="w-full aspect-square rounded-lg bg-slate-50 dark:bg-white/5 p-1 mb-1 overflow-hidden">
                                        <EstimateWindowSVG width={48} height={48} type={k} flipH={false} swingIn={true} />
                                      </div>
                                      <span className="text-[8px] font-bold leading-tight text-slate-700 dark:text-slate-300 line-clamp-2">{v.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
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

        {/* CENTER: FACE PHOTO CARDS (above) + 3D VIEWER */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* ── Face Photo Drop Cards (horizontal row above canvas) ── */}
          <div className="hidden lg:flex flex-row gap-2.5 shrink-0">
            {FACE_META.map(fm => {
              const count = facePhotos[fm.key].length
              const isActive = activeFace === fm.key
              const isDragOver = dragOverFace === fm.key
              const thumb = count > 0 ? facePhotos[fm.key][0] : null
              return (
                <div key={fm.key} className="relative group">
                  <label
                    className={`relative w-[88px] h-[88px] rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all
                      ${isDragOver ? `border-dashed ${fm.border} ring-2 ring-offset-1 scale-105 ${fm.bg}` : isActive ? `${fm.border} ring-2 ring-offset-1 ${fm.bg}` : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white/60 dark:bg-white/3"}
                    `}
                    onClick={e => { e.preventDefault(); setActiveFace(p => p === fm.key ? null : fm.key) }}
                    onDragOver={e => { e.preventDefault(); setDragOverFace(fm.key) }}
                    onDragLeave={() => setDragOverFace(null)}
                    onDrop={e => handleFaceDrop(fm.key, e)}
                  >
                    {thumb ? (
                      <img src={thumb} alt={fm.label} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60" />
                    ) : (
                      <Camera className="h-6 w-6 mb-1" style={{ color: fm.color }} />
                    )}
                    <span className="relative text-[11px] font-black uppercase tracking-wide" style={{ color: fm.color }}>{fm.label}</span>
                    {!thumb && <span className="relative text-[8px] text-slate-400 mt-0.5">Drop photo</span>}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleFacePhotoUpload(fm.key, e)} />
                  </label>
                  {/* Photo count badge */}
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-sm"
                      style={{ background: fm.color }}>{count}</span>
                  )}
                  {/* Expanded photo strip when active */}
                  <AnimatePresence>
                    {isActive && count > 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-1.5">
                        <div className="flex flex-col gap-1">
                          {facePhotos[fm.key].map((ph, i) => (
                            <div key={i} className="relative group/ph">
                              <img src={ph} alt="" className="w-[88px] h-14 rounded-xl object-cover border border-slate-200 dark:border-white/10" />
                              <button onClick={() => setFacePhotos(p => ({ ...p, [fm.key]: p[fm.key].filter((_, j) => j !== i) }))}
                                className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[8px] hidden group-hover/ph:flex items-center justify-center"><X className="h-2.5 w-2.5" /></button>
                            </div>
                          ))}
                          {count > 0 && (
                            <button onClick={() => analyzeFacade(fm.key)} disabled={analyzing}
                              className="w-[88px] py-1.5 rounded-xl text-[9px] font-bold flex items-center justify-center gap-1 text-white transition"
                              style={{ background: fm.color }}>
                              {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3" />}
                              AI
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* ── 3D Canvas ── */}
          <div className="flex-1 min-w-0">
            <div className={`${C.card} p-0 overflow-hidden relative`}>
              {!compileMode && (
                <button onClick={() => setLeftPanelOpen(p => !p)}
                  className="absolute top-3 left-3 z-10 h-7 w-7 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-sm transition lg:hidden">
                  {leftPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              )}
              {(compileMode || (!compileMode && selectedPlacedId)) && (
                <button onClick={() => setRightPanelOpen(p => !p)}
                  className="absolute top-3 right-3 z-10 h-7 w-7 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-emerald-600 shadow-sm transition">
                  {rightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
              )}
              <div className={compileMode ? "h-[calc(100vh-10rem)] min-h-[600px]" : "h-[calc(100vh-12rem)] min-h-[500px]"}>
                <Building3DCanvas floors={floors} activeWindowId={activeWindowId} activeWindowConfig={activeWindowConfig}
                  moveMode={moveMode} compileMode={compileMode}
                  onFaceClick={handleFaceClick} onPlacedWindowClick={setSelectedPlacedId}
                  selectedPlacedId={selectedPlacedId} solidMode={solidMode} unit={unit} />
              </div>
            </div>
          </div>
        </div>

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

        {/* RIGHT PANEL — edit detail OR compile dashboard */}
        <AnimatePresence>
          {/* Edit mode: selected window detail */}
          {!compileMode && selectedPlacedId && rightPanelOpen && (() => {
            const pw = floors.flatMap(f => f.windows).find(w => w.id === selectedPlacedId)
            if (!pw) return null
            const bw = basket.find(x => x.id === pw.measurementId)
            const floorName = floors.find(f => f.windows.some(w => w.id === selectedPlacedId))?.name || "—"
            return (
              <motion.div key="edit-panel" initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                className="hidden lg:block lg:shrink-0 overflow-hidden">
                <div className="w-80 space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                  <div className={C.card}>
                    <div className="flex items-center justify-between mb-3">
                      <p className={C.lbl + " mb-0"}>Selected Window</p>
                      <button onClick={() => setSelectedPlacedId(null)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                    </div>
                    {bw && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-3">
                        <EstimateWindowSVG width={bw.width} height={bw.height} type={bw.typeKey} flipH={bw.hingeLeft} swingIn={bw.swingIn} />
                      </div>
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pw.label}</h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{pw.dims} — {pw.windowType}</p>
                    <div className="mt-3 space-y-1.5 text-[11px]">
                      <div className="flex justify-between"><span className="text-slate-400">Face</span><span className="font-bold uppercase">{pw.face}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Floor</span><span className="font-bold">{floorName}</span></div>
                      {bw && <>
                        <div className="flex justify-between"><span className="text-slate-400">Product</span><span className="font-bold">{EST_PRODUCTS.find(p => p.id === bw.product)?.label || bw.product}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Ext Color</span><span className="font-bold">{bw.extColor}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Int Color</span><span className="font-bold">{bw.intColor}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Glass</span><span className="font-bold">{bw.glass} — {bw.glassType}</span></div>
                      </>}
                    </div>
                    {bw?.notes && <p className="text-[10px] text-slate-500 mt-2 italic border-t border-slate-200 dark:border-white/10 pt-2">📝 {bw.notes}</p>}
                    {moveMode && <p className="text-[10px] text-purple-600 font-bold mt-3 animate-pulse">🔀 Tap a face to drop this window</p>}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setSelectedPlacedId(null)} className={`flex-1 ${C.btn} justify-center border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5`}>Deselect</button>
                      <button onClick={() => removePlacedWindow(selectedPlacedId)} className={`flex-1 ${C.btn} justify-center bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600`}><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}
          {/* Compile mode: window dashboard */}
          {compileMode && rightPanelOpen && (
            <motion.div key="compile-panel" initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
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
    </div>
  )
}
