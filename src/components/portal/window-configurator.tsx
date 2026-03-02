"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { EstimateWindowSVG } from "./estimate-window-svg"
import { WINDOW_TYPES, isDoorType, describeCustomLayout, type EstimateItem } from "@/lib/estimate-config"
import { Pencil, Plus, X, Check, RotateCcw } from "lucide-react"

const WINDOW_MODULE_TYPES = ["FIX", "CAS-L", "CAS-R", "TT-L", "TT-R", "AWNING", "SLIDE"] as const
const MAX_PANELS = 6

interface Props {
  item: EstimateItem
  onSave: (modules: string[]) => void
  onClear: () => void
  editTrigger?: number
  onSwingChange?: (swingInside: boolean) => void
}

export function WindowConfigurator({ item, onSave, onClear, editTrigger, onSwingChange }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftModules, setDraftModules] = useState<string[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number>(-1)

  const isDoor = isDoorType(item.type)
  const defaultModules = WINDOW_TYPES[item.type]?.modules ?? ["FIX"]
  const hasCustom = !!item.customModules?.length
  const activeModules = isEditing ? draftModules : (item.customModules ?? undefined)

  // ── Actions ──
  const startEditing = useCallback(() => {
    setDraftModules([...(item.customModules ?? defaultModules)])
    setSelectedIdx(-1)
    setIsEditing(true)
  }, [item.customModules, defaultModules])

  const cancel = useCallback(() => {
    setIsEditing(false)
    setSelectedIdx(-1)
  }, [])

  const save = useCallback(() => {
    onSave([...draftModules])
    setIsEditing(false)
    setSelectedIdx(-1)
  }, [draftModules, onSave])

  const addPanel = useCallback(() => {
    if (draftModules.length >= MAX_PANELS) return
    setDraftModules(prev => [...prev, "FIX"])
  }, [draftModules.length])

  const removePanel = useCallback(() => {
    if (draftModules.length <= 1 || selectedIdx < 0) return
    setDraftModules(prev => prev.filter((_, i) => i !== selectedIdx))
    setSelectedIdx(-1)
  }, [draftModules.length, selectedIdx])

  const changeType = useCallback((newType: string) => {
    if (selectedIdx < 0 || selectedIdx >= draftModules.length) return
    setDraftModules(prev => prev.map((m, i) => i === selectedIdx ? newType : m))
  }, [selectedIdx, draftModules.length])

  const handlePanelClick = useCallback((idx: number) => {
    setSelectedIdx(prev => prev === idx ? -1 : idx)
  }, [])

  const resetToDefault = useCallback(() => {
    onClear()
  }, [onClear])

  // External trigger to start editing (from parent bottom strip)
  const prevTrigger = useRef(editTrigger ?? 0)
  useEffect(() => {
    if (editTrigger !== undefined && editTrigger !== prevTrigger.current) {
      prevTrigger.current = editTrigger
      if (!isEditing) startEditing()
    }
  }, [editTrigger, isEditing, startEditing])

  // Check if current modules have operable panels (for swing control)
  const currentModules = activeModules ?? defaultModules
  const hasOperable = currentModules.some(m => m.startsWith("CAS") || m.startsWith("TT") || m === "AWNING")

  // ── Doors: render SVG directly, no configurator ──
  if (isDoor) {
    return (
      <EstimateWindowSVG
        width={item.width} height={item.height} type={item.type}
        flipH={item.hingeLeft ?? false} swingIn={item.swingInside ?? true}
      />
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* CUSTOM badge */}
      {hasCustom && !isEditing && (
        <span className="mb-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
          Custom Layout
        </span>
      )}

      {/* Edit mode toolbar */}
      {isEditing && (
        <div className="flex items-center gap-1.5 mb-1.5 w-full">
          <button onClick={addPanel} disabled={draftModules.length >= MAX_PANELS}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed">
            <Plus className="w-3 h-3" /> Panel
          </button>
          <span className="text-[9px] font-bold text-slate-400 tabular-nums">{draftModules.length} panel{draftModules.length !== 1 ? "s" : ""}</span>
          {hasOperable && onSwingChange && (
            <div className="flex items-center gap-0.5 ml-2">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">Swing</span>
              <button onClick={() => onSwingChange(true)}
                className={`px-2 py-1 rounded-l-lg text-[9px] font-bold transition ${(item.swingInside ?? true) ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}>In</button>
              <button onClick={() => onSwingChange(false)}
                className={`px-2 py-1 rounded-r-lg text-[9px] font-bold transition ${!(item.swingInside ?? true) ? "bg-green-600 text-white shadow-sm" : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"}`}>Out</button>
            </div>
          )}
          <div className="flex-1" />
          <button onClick={cancel}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition">
            <X className="w-3 h-3" /> Cancel
          </button>
          <button onClick={save}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm">
            <Check className="w-3 h-3" /> Save
          </button>
        </div>
      )}

      {/* SVG render area */}
      <EstimateWindowSVG
        width={item.width} height={item.height} type={item.type}
        flipH={item.hingeLeft ?? false} swingIn={item.swingInside ?? true}
        customModules={activeModules}
        onPanelClick={isEditing ? handlePanelClick : undefined}
        selectedPanelIdx={isEditing ? selectedIdx : undefined}
      />

      {/* Live description preview (edit mode) */}
      {isEditing && draftModules.length > 0 && (
        <p className="mt-1 px-2 py-0.5 rounded-md text-[9px] font-semibold text-center text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 w-full truncate">
          {describeCustomLayout(draftModules, item.hingeLeft ?? false, item.swingInside ?? true)}
        </p>
      )}

      {/* Panel type selector strip (edit mode, when a panel is selected) */}
      {isEditing && selectedIdx >= 0 && selectedIdx < draftModules.length && (
        <div className="mt-1.5 w-full">
          <div className="flex flex-wrap gap-1 justify-center">
            {WINDOW_MODULE_TYPES.map(mt => (
              <button key={mt} onClick={() => changeType(mt)}
                className={`px-2 py-1 rounded-md text-[9px] font-bold transition ${
                  draftModules[selectedIdx] === mt
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}>
                {mt}
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-1">
            <button onClick={removePanel} disabled={draftModules.length <= 1}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed">
              <X className="w-2.5 h-2.5" /> Remove Panel
            </button>
          </div>
        </div>
      )}

      {/* Bottom controls: Customize / Reset */}
      {!isEditing && (
        <div className="flex items-center gap-2 mt-1">
          <button onClick={startEditing}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-semibold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition">
            <Pencil className="w-2.5 h-2.5" /> Customize Layout
          </button>
          {hasCustom && (
            <button onClick={resetToDefault}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-semibold text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition">
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          )}
        </div>
      )}
    </div>
  )
}
