"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { type EstimateState, createBlankEstimate, calcTotals } from "./estimate-config"

// ── Types ───────────────────────────────────────
export interface EstimateRecord {
  id: string
  savedAt: string
  clientName: string
  estimateNumber: string
  total: number
  itemCount: number
}

// ── Template Types ──────────────────────────────
export interface EstimateTemplate {
  id: string
  name: string
  savedAt: string
  /** All estimate fields EXCEPT rooms (window/door items) */
  data: Omit<EstimateState, "rooms">
}

// We store records metadata separately from full estimate data
// Full data: VEREX_est_data_{id} — one key per estimate
// Records list: VEREX_est_records — array of EstimateRecord (metadata only)
// Active ID: VEREX_est_active_id

const RECORDS_KEY = "VEREX_est_records"
const ACTIVE_KEY = "VEREX_est_active_id"
const DATA_PREFIX = "VEREX_est_data_"
const TEMPLATES_KEY = "VEREX_est_templates"

function uid() { return `est_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}` }

function readLS<T>(key: string, fb: T): T {
  if (typeof window === "undefined") return fb
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb } catch { return fb }
}
function writeLS<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch { /* quota */ }
}

function readRecords(): EstimateRecord[] { return readLS(RECORDS_KEY, []) }
function writeRecords(r: EstimateRecord[]) { writeLS(RECORDS_KEY, r) }

function readEstData(id: string): EstimateState | null {
  return readLS<EstimateState | null>(DATA_PREFIX + id, null)
}
function writeEstData(id: string, est: EstimateState) {
  writeLS(DATA_PREFIX + id, est)
}
function deleteEstData(id: string) {
  try { localStorage.removeItem(DATA_PREFIX + id) } catch {}
}

function metaFromEst(id: string, est: EstimateState): EstimateRecord {
  // Read actual user settings so the stored total matches what's on screen
  const cfg = readLS<Record<string, unknown>>("VEREX_estimate_settings", {})
  const gstRate = (cfg.gstRate as number) ?? 5
  const qstRate = (cfg.qstRate as number) ?? 9.975
  const flags = {
    showInstallation: (cfg.showInstallation as boolean) ?? true,
    showDelivery: (cfg.showDelivery as boolean) ?? true,
    showGST: (cfg.showGST as boolean) ?? true,
    showQST: (cfg.showQST as boolean) ?? true,
  }
  const trimS = {
    trimUnit: (cfg.trimUnit as "in") ?? "in",
    flatTrimRate: (cfg.flatTrimRate as number) ?? 0.50,
    colonialTrimRate: (cfg.colonialTrimRate as number) ?? 0.75,
  }
  const installS = {
    installMethod: (cfg.installMethod as "per-unit") ?? "per-unit",
    installRate: (cfg.installRate as number) ?? 25,
  }
  const t = calcTotals(est, gstRate, qstRate, cfg as any, flags, trimS, installS)
  return {
    id,
    savedAt: new Date().toISOString(),
    clientName: est.clientName || est.estimateNumber || "Untitled",
    estimateNumber: est.estimateNumber,
    total: t.total,
    itemCount: t.items,
  }
}

// ── Hook ────────────────────────────────────────
export function useEstimateStore() {
  const [records, setRecords] = useState<EstimateRecord[]>(() => readRecords())
  const [activeId, setActiveId] = useState<string>(() => readLS(ACTIVE_KEY, ""))
  const [est, setEst] = useState<EstimateState>(() => {
    const id = readLS<string>(ACTIVE_KEY, "")
    if (id) { const d = readEstData(id); if (d) return d }
    // No saved estimate — create fresh
    const newId = uid()
    const blank = createBlankEstimate()
    writeEstData(newId, blank)
    const rec = metaFromEst(newId, blank)
    const recs = [rec, ...readRecords()]
    writeRecords(recs)
    writeLS(ACTIVE_KEY, newId)
    return blank
  })

  // Init activeId if empty
  useEffect(() => {
    if (!activeId && records.length > 0) {
      const id = records[0].id
      setActiveId(id)
      writeLS(ACTIVE_KEY, id)
      const d = readEstData(id)
      if (d) setEst(d)
    } else if (!activeId && records.length === 0) {
      const id = uid()
      const blank = createBlankEstimate()
      writeEstData(id, blank)
      const rec = metaFromEst(id, blank)
      setRecords([rec])
      writeRecords([rec])
      setActiveId(id)
      writeLS(ACTIVE_KEY, id)
      setEst(blank)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save (debounced 2s) ────────────────
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved")
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!activeId) return
    setSaveStatus("saving")
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      writeEstData(activeId, est)
      const meta = metaFromEst(activeId, est)
      setRecords(prev => {
        const next = prev.map(r => r.id === activeId ? meta : r)
        if (!next.find(r => r.id === activeId)) next.unshift(meta)
        writeRecords(next)
        return next
      })
      setSaveStatus("saved")
    }, 2000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [est, activeId])

  // ── Manual save (instant) ───────────────────
  const saveNow = useCallback(() => {
    if (!activeId) return
    writeEstData(activeId, est)
    const meta = metaFromEst(activeId, est)
    setRecords(prev => {
      const next = prev.map(r => r.id === activeId ? meta : r)
      if (!next.find(r => r.id === activeId)) next.unshift(meta)
      writeRecords(next)
      return next
    })
    setSaveStatus("saved")
  }, [activeId, est])

  // ── New estimate ────────────────────────────
  const newEstimate = useCallback(() => {
    // save current first
    if (activeId) { writeEstData(activeId, est) }
    const id = uid()
    const blank = createBlankEstimate()
    writeEstData(id, blank)
    const meta = metaFromEst(id, blank)
    setRecords(prev => { const next = [meta, ...prev]; writeRecords(next); return next })
    setActiveId(id); writeLS(ACTIVE_KEY, id)
    setEst(blank)
  }, [activeId, est])

  // ── Load estimate by id ─────────────────────
  const loadEstimate = useCallback((id: string) => {
    if (id === activeId) return
    // save current
    if (activeId) { writeEstData(activeId, est) }
    const d = readEstData(id)
    if (d) { setEst(d); setActiveId(id); writeLS(ACTIVE_KEY, id) }
  }, [activeId, est])

  // ── Delete estimate ─────────────────────────
  const deleteEstimate = useCallback((id: string) => {
    deleteEstData(id)
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id)
      writeRecords(next)
      // If we deleted the active one, switch to another or create new
      if (id === activeId) {
        if (next.length > 0) {
          const newActive = next[0]
          const d = readEstData(newActive.id)
          if (d) { setEst(d); setActiveId(newActive.id); writeLS(ACTIVE_KEY, newActive.id) }
        } else {
          const newId = uid()
          const blank = createBlankEstimate()
          writeEstData(newId, blank)
          const meta = metaFromEst(newId, blank)
          setRecords([meta]); writeRecords([meta])
          setActiveId(newId); writeLS(ACTIVE_KEY, newId); setEst(blank)
        }
      }
      return next
    })
  }, [activeId])

  // ── Duplicate estimate ──────────────────────
  const duplicateEstimate = useCallback((id: string) => {
    const d = readEstData(id)
    if (!d) return
    const newId = uid()
    const copy = { ...d, estimateNumber: d.estimateNumber + " (Copy)" }
    writeEstData(newId, copy)
    const meta = metaFromEst(newId, copy)
    setRecords(prev => { const next = [meta, ...prev]; writeRecords(next); return next })
  }, [])

  // ── Templates ───────────────────────────────
  const [templates, setTemplates] = useState<EstimateTemplate[]>(() => readLS(TEMPLATES_KEY, []))

  /** Save current estimate (minus rooms) as a named template */
  const saveAsTemplate = useCallback((name: string) => {
    const { rooms: _rooms, ...rest } = est
    const tpl: EstimateTemplate = {
      id: `tpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      name: name || est.clientName || "Untitled Template",
      savedAt: new Date().toISOString(),
      data: rest,
    }
    setTemplates(prev => {
      const next = [tpl, ...prev]
      writeLS(TEMPLATES_KEY, next)
      return next
    })
  }, [est])

  /** Apply a template to current estimate — preserves rooms (items) */
  const loadTemplate = useCallback((id: string) => {
    const tpl = templates.find(t => t.id === id)
    if (!tpl) return
    setEst(prev => ({ ...prev, ...tpl.data }))
  }, [templates])

  /** Delete a template */
  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const next = prev.filter(t => t.id !== id)
      writeLS(TEMPLATES_KEY, next)
      return next
    })
  }, [])

  /** Rename a template */
  const renameTemplate = useCallback((id: string, name: string) => {
    setTemplates(prev => {
      const next = prev.map(t => t.id === id ? { ...t, name } : t)
      writeLS(TEMPLATES_KEY, next)
      return next
    })
  }, [])

  return {
    est, setEst,
    records, activeId,
    saveStatus, saveNow,
    newEstimate, loadEstimate, deleteEstimate, duplicateEstimate,
    // Templates
    templates, saveAsTemplate, loadTemplate, deleteTemplate, renameTemplate,
  }
}
