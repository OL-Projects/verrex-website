"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { BuildingFloor, PlacedWindow } from "@/components/portal/building-scene"

// ── Types ───────────────────────────────────────
export interface BasketWindow {
  id: string; label: string; typeKey: string; width: number; height: number
  product: string; extColor: string; intColor: string; glass: string; glassType: string
  hingeLeft: boolean; swingIn: boolean; notes: string
  // Full glass spec fields (matching estimate creator)
  lowE?: string           // "1 Side" | "2 Sides"
  glassThicknessSpec?: string // "5mm" | "6mm"
  argonGas?: string       // "18mm" | "24mm"
  glassFinish?: string    // "Clear" | "Frosted"
  screen?: string         // "Not Included" | "Included"
  // Trim
  trimInstall?: boolean
  trimStyle?: "flat" | "colonial"
  // Location context (set from placed position)
  location?: string
}

type FaceKey = "front" | "back" | "left" | "right"

export interface MeasurementProjectData {
  projectName: string
  projectAddr: string
  projectNotes: string
  photos: string[]
  floors: BuildingFloor[]
  basket: BasketWindow[]
  facePhotos: Record<FaceKey, string[]>
}

export interface MeasurementRecord {
  id: string
  savedAt: string
  projectName: string
  projectAddr: string
  floorCount: number
  windowCount: number
  basketCount: number
}

export interface MeasurementTemplate {
  id: string
  name: string
  savedAt: string
  data: MeasurementProjectData
}

// ── Storage keys ────────────────────────────────
const RECORDS_KEY = "vx_meas_records"
const ACTIVE_KEY = "vx_meas_active_id"
const DATA_PREFIX = "vx_meas_data_"
const TEMPLATES_KEY = "vx_meas_templates"
const LEGACY_KEY = "vx_measurements_v4"

function uid() { return `meas_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}` }

const FLOOR_COLORS = ["#e2e8f0", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#fbcfe8", "#fde68a", "#bbf7d0"]

export function createFloor(name: string, idx: number): BuildingFloor {
  return { id: uid(), name, width: 50, depth: 75, ceilingHeight: 15, color: FLOOR_COLORS[idx % FLOOR_COLORS.length], windows: [] }
}

export function createBlankProject(): MeasurementProjectData {
  return {
    projectName: "New Project",
    projectAddr: "",
    projectNotes: "",
    photos: [],
    floors: [
      { ...createFloor("Basement", 0), ceilingHeight: 10, color: "#cbd5e1" },
      { ...createFloor("Ground Floor", 1), color: "#bfdbfe" },
    ],
    basket: [],
    facePhotos: { front: [], back: [], left: [], right: [] },
  }
}

// ── LocalStorage helpers ────────────────────────
function readLS<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb } catch { return fb }
}
function writeLS<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* quota */ }
}

function readRecords(): MeasurementRecord[] { return readLS(RECORDS_KEY, []) }
function writeRecords(r: MeasurementRecord[]) { writeLS(RECORDS_KEY, r) }

function readProjectData(id: string): MeasurementProjectData | null {
  return readLS<MeasurementProjectData | null>(DATA_PREFIX + id, null)
}
function writeProjectData(id: string, data: MeasurementProjectData) {
  writeLS(DATA_PREFIX + id, data)
}
function deleteProjectData(id: string) {
  try { localStorage.removeItem(DATA_PREFIX + id) } catch {}
}

function metaFromProject(id: string, p: MeasurementProjectData): MeasurementRecord {
  return {
    id,
    savedAt: new Date().toISOString(),
    projectName: p.projectName || "Untitled",
    projectAddr: p.projectAddr || "",
    floorCount: p.floors.length,
    windowCount: p.floors.reduce((s, f) => s + f.windows.length, 0),
    basketCount: p.basket.length,
  }
}

// ── Migrate legacy single-project data ──────────
function migrateLegacy(): { id: string; data: MeasurementProjectData } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const legacy = JSON.parse(raw)
    const data: MeasurementProjectData = {
      projectName: legacy.projectName || "Migrated Project",
      projectAddr: legacy.projectAddr || "",
      projectNotes: legacy.projectNotes || "",
      photos: legacy.photos || [],
      floors: legacy.floors || createBlankProject().floors,
      basket: legacy.basket || [],
      facePhotos: { front: [], back: [], left: [], right: [] },
    }
    const id = uid()
    writeProjectData(id, data)
    const rec = metaFromProject(id, data)
    writeRecords([rec])
    writeLS(ACTIVE_KEY, id)
    localStorage.removeItem(LEGACY_KEY)
    return { id, data }
  } catch { return null }
}

// ── Hook ────────────────────────────────────────
export function useMeasurementStore() {
  const [records, setRecords] = useState<MeasurementRecord[]>(() => readRecords())
  const [activeId, setActiveId] = useState<string>(() => readLS(ACTIVE_KEY, ""))
  const [project, setProject] = useState<MeasurementProjectData>(() => {
    // Try legacy migration first
    const legacy = migrateLegacy()
    if (legacy) return legacy.data

    const id = readLS<string>(ACTIVE_KEY, "")
    if (id) { const d = readProjectData(id); if (d) return d }
    // No saved data — create fresh
    const newId = uid()
    const blank = createBlankProject()
    writeProjectData(newId, blank)
    const rec = metaFromProject(newId, blank)
    const recs = [rec, ...readRecords()]
    writeRecords(recs)
    writeLS(ACTIVE_KEY, newId)
    return blank
  })

  // Init activeId if empty
  useEffect(() => {
    if (!activeId && records.length > 0) {
      const id = records[0].id
      setActiveId(id); writeLS(ACTIVE_KEY, id)
      const d = readProjectData(id); if (d) setProject(d)
    } else if (!activeId && records.length === 0) {
      const id = uid()
      const blank = createBlankProject()
      writeProjectData(id, blank)
      const rec = metaFromProject(id, blank)
      setRecords([rec]); writeRecords([rec])
      setActiveId(id); writeLS(ACTIVE_KEY, id); setProject(blank)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save (debounced 1.5s) ────────────────
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved")
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!activeId) return
    setSaveStatus("saving")
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      writeProjectData(activeId, project)
      const meta = metaFromProject(activeId, project)
      setRecords(prev => {
        const next = prev.map(r => r.id === activeId ? meta : r)
        if (!next.find(r => r.id === activeId)) next.unshift(meta)
        writeRecords(next)
        return next
      })
      setSaveStatus("saved")
    }, 1500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [project, activeId])

  // ── Manual save ─────────────────────────────
  const saveNow = useCallback(() => {
    if (!activeId) return
    writeProjectData(activeId, project)
    const meta = metaFromProject(activeId, project)
    setRecords(prev => {
      const next = prev.map(r => r.id === activeId ? meta : r)
      if (!next.find(r => r.id === activeId)) next.unshift(meta)
      writeRecords(next)
      return next
    })
    setSaveStatus("saved")
  }, [activeId, project])

  // ── New project ─────────────────────────────
  const newProject = useCallback(() => {
    if (activeId) writeProjectData(activeId, project)
    const id = uid()
    const blank = createBlankProject()
    writeProjectData(id, blank)
    const meta = metaFromProject(id, blank)
    setRecords(prev => { const next = [meta, ...prev]; writeRecords(next); return next })
    setActiveId(id); writeLS(ACTIVE_KEY, id); setProject(blank)
  }, [activeId, project])

  // ── Load project ────────────────────────────
  const loadProject = useCallback((id: string) => {
    if (id === activeId) return
    if (activeId) writeProjectData(activeId, project)
    const d = readProjectData(id)
    if (d) { setProject(d); setActiveId(id); writeLS(ACTIVE_KEY, id) }
  }, [activeId, project])

  // ── Delete project ──────────────────────────
  const deleteProject = useCallback((id: string) => {
    deleteProjectData(id)
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id)
      writeRecords(next)
      if (id === activeId) {
        if (next.length > 0) {
          const d = readProjectData(next[0].id)
          if (d) { setProject(d); setActiveId(next[0].id); writeLS(ACTIVE_KEY, next[0].id) }
        } else {
          const newId = uid()
          const blank = createBlankProject()
          writeProjectData(newId, blank)
          const meta = metaFromProject(newId, blank)
          setRecords([meta]); writeRecords([meta])
          setActiveId(newId); writeLS(ACTIVE_KEY, newId); setProject(blank)
        }
      }
      return next
    })
  }, [activeId])

  // ── Duplicate project ───────────────────────
  const duplicateProject = useCallback((id: string) => {
    const d = readProjectData(id)
    if (!d) return
    const newId = uid()
    const copy = { ...d, projectName: d.projectName + " (Copy)" }
    writeProjectData(newId, copy)
    const meta = metaFromProject(newId, copy)
    setRecords(prev => { const next = [meta, ...prev]; writeRecords(next); return next })
  }, [])

  // ── Templates ───────────────────────────────
  const [templates, setTemplates] = useState<MeasurementTemplate[]>(() => readLS(TEMPLATES_KEY, []))

  const saveAsTemplate = useCallback((name: string) => {
    const tpl: MeasurementTemplate = {
      id: `mtpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name: name || project.projectName || "Untitled Template",
      savedAt: new Date().toISOString(),
      data: { ...project },
    }
    setTemplates(prev => { const next = [tpl, ...prev]; writeLS(TEMPLATES_KEY, next); return next })
  }, [project])

  const loadTemplate = useCallback((id: string) => {
    const tpl = templates.find(t => t.id === id)
    if (!tpl) return
    // Save current first, then create new project from template
    if (activeId) writeProjectData(activeId, project)
    const newId = uid()
    const data = { ...tpl.data, projectName: tpl.data.projectName + " (from template)" }
    writeProjectData(newId, data)
    const meta = metaFromProject(newId, data)
    setRecords(prev => { const next = [meta, ...prev]; writeRecords(next); return next })
    setActiveId(newId); writeLS(ACTIVE_KEY, newId); setProject(data)
  }, [templates, activeId, project])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => { const next = prev.filter(t => t.id !== id); writeLS(TEMPLATES_KEY, next); return next })
  }, [])

  return {
    project, setProject,
    records, activeId,
    saveStatus, saveNow,
    newProject, loadProject, deleteProject, duplicateProject,
    templates, saveAsTemplate, loadTemplate, deleteTemplate,
  }
}

// ── Export to Estimate ──────────────────────────
// Creates a new estimate in localStorage from measurements basket + floors
export function exportToEstimate(proj: MeasurementProjectData): string | null {
  try {
    const estId = `est_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

    // Map BasketWindow → EstimateItem, organized by floor
    function mapItem(bw: BasketWindow, face?: string, floorName?: string): Record<string, unknown> {
      return {
        id: `itm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        type: bw.typeKey, product: bw.product,
        extColor: bw.extColor, intColor: bw.intColor,
        width: bw.width, height: bw.height, depth: 5.75, thickness: 4,
        customLabel: bw.label,
        location: face ? `${face.toUpperCase()} face${floorName ? ` — ${floorName}` : ""}` : bw.location || "",
        qty: 1, unitPrice: 0, notes: bw.notes, attachmentNames: [],
        hingeLeft: bw.hingeLeft, swingInside: bw.swingIn,
        trimInstall: bw.trimInstall || false, trimStyle: bw.trimStyle || "flat", trimPrice: 0,
        installOverride: false, installPrice: 0,
        thermal: bw.glass || "Double",
        lowE: bw.lowE || "1 Side",
        glassThickness: bw.glassThicknessSpec || "5mm",
        argonGas: bw.argonGas || "18mm",
        glassType: bw.glassType || "Ultra Clear",
        glassFinish: bw.glassFinish || "Clear",
        screen: bw.screen || "Not Included",
      }
    }

    // Group placed windows by floor
    const placedIds = new Set<string>()
    const rooms: { id: string; name: string; items: Record<string, unknown>[] }[] = []

    for (const floor of proj.floors) {
      if (floor.windows.length === 0) continue
      const items = floor.windows.map(pw => {
        placedIds.add(pw.measurementId)
        const bw = proj.basket.find(b => b.id === pw.measurementId)
        if (!bw) return mapItem({ id: pw.id, label: pw.label, typeKey: pw.typeKey || "FIX", width: pw.wInches || 48, height: pw.hInches || 48, product: "double-tempered", extColor: "White", intColor: "White", glass: "Double", glassType: "Clear", hingeLeft: false, swingIn: true, notes: "" }, pw.face, floor.name)
        return mapItem(bw, pw.face, floor.name)
      })
      rooms.push({ id: `rm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, name: floor.name, items })
    }

    // Unplaced basket items
    const unplaced = proj.basket.filter(bw => !placedIds.has(bw.id))
    if (unplaced.length > 0) {
      rooms.push({
        id: `rm_${Date.now().toString(36)}_unp`,
        name: "Unplaced Windows",
        items: unplaced.map(bw => mapItem(bw)),
      })
    }

    // If no rooms at all, create one default room
    if (rooms.length === 0) {
      rooms.push({ id: `rm_${Date.now().toString(36)}_def`, name: "GROUND FLOOR", items: [] })
    }

    // Build EstimateState
    const estState = {
      company: { name: "VEREX", tagline: "WINDOWS & DOORS — FENÊTRES & PORTES", address: "", city: "", phone: "", email: "", website: "VEREX-website.vercel.app", logoUrl: "" },
      estimateNumber: `VX-${new Date().getFullYear()}-MEAS`,
      date: new Date().toISOString().slice(0, 10),
      validUntil: "", requiredBy: "",
      soldToLabel: "Sold To",
      clientName: proj.projectName || "Measurements Export",
      clientAddress: proj.projectAddr || "", clientCity: "", clientPhone: "", clientEmail: "",
      shipToLabel: "Ship To", shipMethod: "PICKUP", shipAddress: "", shipPhone: "",
      repName: "", repRef: "",
      rooms,
      installPerUnit: 275, delivery: 850, depositPct: 30,
      termsText: "",
    }

    // Write to localStorage (same format as estimate-store)
    writeLS(`VEREX_est_data_${estId}`, estState)

    // Add to estimate records
    const totalItems = rooms.reduce((s, r) => s + r.items.length, 0)
    const estRecord = {
      id: estId,
      savedAt: new Date().toISOString(),
      clientName: proj.projectName || "Measurements Export",
      estimateNumber: estState.estimateNumber,
      total: 0,
      itemCount: totalItems,
    }
    const existingRecords = readLS<unknown[]>("VEREX_est_records", [])
    writeLS("VEREX_est_records", [estRecord, ...existingRecords])

    // Set as active estimate
    writeLS("VEREX_est_active_id", estId)

    return estId
  } catch (e) {
    console.error("Export to estimate failed:", e)
    return null
  }
}
