"use client"

import { useState, useCallback } from "react"
import { Plus, Search, Building2, MoreVertical, Copy, Trash2, Check, Loader2, PanelLeftOpen, PanelLeftClose, X, BookTemplate, Save, Download, ImagePlus, GripVertical, ChevronUp, ChevronDown, FolderOpen } from "lucide-react"
import type { MeasurementRecord, MeasurementTemplate, MeasurementProjectData, BasketWindow } from "@/lib/measurements-store"
import { createFloor } from "@/lib/measurements-store"
import type { BuildingFloor } from "@/components/portal/building-scene"

type SidebarTab = "history" | "templates" | "project"

const C = {
  lbl: "block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1",
  inp: "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition",
}

interface Props {
  records: MeasurementRecord[]
  activeId: string
  saveStatus: "saved" | "saving" | "idle"
  onNew: () => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  mobileOpen: boolean
  onMobileToggle: () => void
  templates: MeasurementTemplate[]
  onSaveAsTemplate: (name: string) => void
  onLoadTemplate: (id: string) => void
  onDeleteTemplate: (id: string) => void
  // Project tab props
  project: MeasurementProjectData
  onUpdateProject: (patch: Partial<MeasurementProjectData>) => void
  onAddFloor: () => void
  onRemoveFloor: (id: string) => void
  onUpdateFloor: (id: string, patch: Partial<BuildingFloor>) => void
  onMoveFloor: (id: string, dir: -1 | 1) => void
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: (idx: number) => void
  expandedFloor: string | null
  onToggleFloor: (id: string) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60000) return "Just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 172800000) return "Yesterday"
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
}

export function MeasurementsSidebar({
  records, activeId, saveStatus, onNew, onLoad, onDelete, onDuplicate,
  mobileOpen, onMobileToggle,
  templates, onSaveAsTemplate, onLoadTemplate, onDeleteTemplate,
  project, onUpdateProject, onAddFloor, onRemoveFloor, onUpdateFloor, onMoveFloor,
  onPhotoUpload, onRemovePhoto, expandedFloor, onToggleFloor,
}: Props) {
  const [search, setSearch] = useState("")
  const [menuId, setMenuId] = useState<string | null>(null)
  const [tab, setTab] = useState<SidebarTab>("project")
  const [tplMenuId, setTplMenuId] = useState<string | null>(null)
  const [showSaveTPL, setShowSaveTPL] = useState(false)
  const [tplName, setTplName] = useState("")
  const activeRecord = records.find(r => r.id === activeId)

  const filtered = records.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.projectName.toLowerCase().includes(q) || r.projectAddr.toLowerCase().includes(q)
  })

  const filteredTemplates = templates.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q)
  })

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 lg:rounded-t-xl border-b lg:border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Measurements</span>
          <div className="flex items-center gap-2">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-semibold"><Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving…</span>
            ) : (
              <span className="flex items-center gap-0.5 text-[9px] text-green-500 font-semibold"><Check className="h-2.5 w-2.5" /> Saved</span>
            )}
            <button onClick={onMobileToggle} className="lg:hidden text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
        </div>
        {tab === "history" ? (
          <button onClick={onNew} className="w-full py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-purple-500 transition">
            <Plus className="h-3 w-3" /> New Project
          </button>
        ) : tab === "templates" ? (
          <button onClick={() => setShowSaveTPL(true)} className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-500 transition">
            <Save className="h-3 w-3" /> Save as Template
          </button>
        ) : (
          <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 truncate">
            📐 {project.projectName || "Untitled"}
          </div>
        )}
      </div>

      {/* Tab bar — 3 tabs */}
      <div className="flex lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
        <button onClick={() => setTab("history")} className={`flex-1 py-1.5 text-[10px] font-bold text-center transition border-b-2 ${tab === "history" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <FolderOpen className="h-3 w-3 inline -mt-0.5 mr-0.5" /> History
        </button>
        <button onClick={() => setTab("templates")} className={`flex-1 py-1.5 text-[10px] font-bold text-center transition border-b-2 ${tab === "templates" ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <BookTemplate className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Templates
        </button>
        <button onClick={() => setTab("project")} className={`flex-1 py-1.5 text-[10px] font-bold text-center transition border-b-2 ${tab === "project" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          <Building2 className="h-3 w-3 inline -mt-0.5 mr-0.5" /> Project
        </button>
      </div>

      {/* Save Template Prompt */}
      {showSaveTPL && (
        <div className="px-2 py-2 lg:border-x border-slate-200 dark:border-white/10 bg-emerald-50 dark:bg-emerald-500/10">
          <input value={tplName} onChange={e => setTplName(e.target.value)} placeholder="Template name…" autoFocus
            className="w-full px-2 py-1 rounded-lg bg-white dark:bg-white/10 border border-emerald-200 dark:border-emerald-500/30 text-[10px] outline-none mb-1.5" />
          <div className="flex gap-1">
            <button onClick={() => { if (tplName.trim()) { onSaveAsTemplate(tplName.trim()); setTplName(""); setShowSaveTPL(false) } }}
              className="flex-1 py-1 rounded-lg bg-emerald-600 text-white text-[9px] font-bold hover:bg-emerald-500 transition">Save</button>
            <button onClick={() => { setShowSaveTPL(false); setTplName("") }}
              className="flex-1 py-1 rounded-lg border border-slate-200 dark:border-white/15 text-[9px] font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Search (History & Templates tabs) */}
      {tab !== "project" && (
        <div className="px-2 py-1.5 lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === "history" ? "Search projects…" : "Search templates…"}
              className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] outline-none" />
          </div>
        </div>
      )}

      {/* ═══ History Tab ═══ */}
      {tab === "history" && (
        <div className="flex-1 overflow-y-auto lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          {filtered.length === 0 ? (
            <div className="p-4 text-center">
              <Building2 className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400">No projects yet</p>
            </div>
          ) : filtered.map(r => (
            <div key={r.id}
              onClick={() => { onLoad(r.id); onMobileToggle(); setTab("project") }}
              className={`group relative px-2.5 py-2 cursor-pointer transition border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 ${r.id === activeId ? "bg-purple-50 dark:bg-purple-500/10 border-l-2 border-l-purple-500" : ""}`}>
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold truncate ${r.id === activeId ? "text-purple-700 dark:text-purple-300" : "text-slate-800 dark:text-slate-200"}`}>
                    {r.projectName || "Untitled"}
                  </p>
                  {r.projectAddr && <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{r.projectAddr}</p>}
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-slate-400">{timeAgo(r.savedAt)}</span>
                    <span className="text-[8px] text-slate-400">{r.floorCount}F · {r.windowCount}W · {r.basketCount}B</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); setMenuId(menuId === r.id ? null : r.id) }}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5">
                  <MoreVertical className="h-3 w-3" />
                </button>
              </div>
              {menuId === r.id && (
                <div className="absolute right-1 top-8 z-30 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-white/15 py-1 min-w-[100px]">
                  <button onClick={e => { e.stopPropagation(); onDuplicate(r.id); setMenuId(null) }}
                    className="w-full px-3 py-1.5 text-left text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-1.5">
                    <Copy className="h-3 w-3" /> Duplicate
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (confirm("Delete this project?")) { onDelete(r.id); setMenuId(null) } }}
                    className="w-full px-3 py-1.5 text-left text-[10px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ Templates Tab ═══ */}
      {tab === "templates" && (
        <div className="flex-1 overflow-y-auto lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
          {filteredTemplates.length === 0 ? (
            <div className="p-4 text-center">
              <BookTemplate className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400">{templates.length === 0 ? "No templates yet" : "No matches"}</p>
              {templates.length === 0 && <p className="text-[9px] text-slate-400 mt-1">Save your project as a reusable template</p>}
            </div>
          ) : filteredTemplates.map(t => (
            <div key={t.id}
              className="group relative px-2.5 py-2 cursor-pointer transition border-b border-slate-100 dark:border-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
              onClick={() => { if (confirm("Apply this template? Creates a new project from it.")) { onLoadTemplate(t.id); onMobileToggle(); setTab("project") } }}>
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate">{t.name}</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{t.data.projectName} — {t.data.floors.length} floors</p>
                  <span className="text-[9px] text-slate-400">{timeAgo(t.savedAt)}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); setTplMenuId(tplMenuId === t.id ? null : t.id) }}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition shrink-0 mt-0.5">
                  <MoreVertical className="h-3 w-3" />
                </button>
              </div>
              {tplMenuId === t.id && (
                <div className="absolute right-1 top-8 z-30 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-white/15 py-1 min-w-[100px]">
                  <button onClick={e => { e.stopPropagation(); onLoadTemplate(t.id); setTplMenuId(null); setTab("project") }}
                    className="w-full px-3 py-1.5 text-left text-[10px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-1.5">
                    <Download className="h-3 w-3" /> Apply
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (confirm("Delete this template?")) { onDeleteTemplate(t.id); setTplMenuId(null) } }}
                    className="w-full px-3 py-1.5 text-left text-[10px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ Project Tab ═══ */}
      {tab === "project" && (
        <div className="flex-1 overflow-y-auto lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-2 space-y-2.5">
          {/* Project Info */}
          <div>
            <p className={C.lbl}>Project Info</p>
            <input value={project.projectName} onChange={e => onUpdateProject({ projectName: e.target.value })}
              className={`${C.inp} font-bold text-xs`} placeholder="Project Name" />
            <input value={project.projectAddr} onChange={e => onUpdateProject({ projectAddr: e.target.value })}
              className={`${C.inp} mt-1.5 text-xs`} placeholder="Address" />
            <textarea value={project.projectNotes} onChange={e => onUpdateProject({ projectNotes: e.target.value })}
              rows={2} className={`${C.inp} mt-1.5 resize-none text-xs`} placeholder="Notes…" />
          </div>

          {/* Photos */}
          <div>
            <p className={C.lbl}>Photos ({project.photos.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {project.photos.map((ph, i) => (
                <div key={i} className="relative group">
                  <img src={ph} alt="" className="h-11 w-11 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                  <button onClick={() => onRemovePhoto(i)}
                    className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 text-white rounded-full text-[7px] hidden group-hover:flex items-center justify-center">
                    <X className="h-2 w-2" />
                  </button>
                </div>
              ))}
              <label className="h-11 w-11 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center text-slate-400 hover:border-blue-500 cursor-pointer transition">
                <ImagePlus className="h-3.5 w-3.5" />
                <input type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
              </label>
            </div>
          </div>

          {/* Floors */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className={C.lbl + " mb-0"}>Floors ({project.floors.length})</p>
              <button onClick={onAddFloor} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-1">
              {project.floors.map(f => (
                <div key={f.id} className={`rounded-xl border p-1.5 text-xs ${expandedFloor === f.id ? "border-blue-400 bg-blue-50/50 dark:bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onToggleFloor(f.id)} className="text-slate-400">
                      <GripVertical className="h-3 w-3" />
                    </button>
                    <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: f.color }} />
                    <input value={f.name} onChange={e => onUpdateFloor(f.id, { name: e.target.value })}
                      className="flex-1 bg-transparent text-[10px] font-bold outline-none text-slate-900 dark:text-white min-w-0" />
                    <button onClick={() => onMoveFloor(f.id, -1)} className="text-slate-400"><ChevronDown className="h-3 w-3" /></button>
                    <button onClick={() => onMoveFloor(f.id, 1)} className="text-slate-400"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={() => onRemoveFloor(f.id)} className="text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  {expandedFloor === f.id && (
                    <div className="grid grid-cols-3 gap-1 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-white/10">
                      <div><label className="text-[8px] font-bold text-slate-400">W</label><input type="number" min={2} max={50} value={f.width} onChange={e => onUpdateFloor(f.id, { width: +e.target.value })} className={`${C.inp} text-[10px] py-1 px-1.5`} /></div>
                      <div><label className="text-[8px] font-bold text-slate-400">D</label><input type="number" min={2} max={50} value={f.depth} onChange={e => onUpdateFloor(f.id, { depth: +e.target.value })} className={`${C.inp} text-[10px] py-1 px-1.5`} /></div>
                      <div><label className="text-[8px] font-bold text-slate-400">H</label><input type="number" min={1} max={10} step={0.5} value={f.ceilingHeight} onChange={e => onUpdateFloor(f.id, { ceilingHeight: +e.target.value })} className={`${C.inp} text-[10px] py-1 px-1.5`} /></div>
                    </div>
                  )}
                  {f.windows.length > 0 && <p className="text-[8px] text-blue-500 mt-0.5">📐 {f.windows.length} window{f.windows.length > 1 ? "s" : ""}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-100 dark:bg-slate-800 lg:rounded-b-xl border lg:border-t-0 border-slate-200 dark:border-white/10 px-3 py-1.5">
        <p className="text-[9px] text-slate-400 text-center">
          {tab === "history"
            ? `${records.length} project${records.length !== 1 ? "s" : ""} saved`
            : tab === "templates"
            ? `${templates.length} template${templates.length !== 1 ? "s" : ""} saved`
            : `${project.floors.length} floors · ${project.basket.length} in basket`}
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* ═══ MOBILE: Compact header bar ═══ */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 print:hidden">
        <button onClick={onMobileToggle} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition">
          {mobileOpen ? <PanelLeftClose className="h-4 w-4 text-purple-500" /> : <PanelLeftOpen className="h-4 w-4 text-slate-500" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{activeRecord?.projectName || "Untitled"}</p>
          <p className="text-[9px] text-slate-500 truncate">{activeRecord?.projectAddr || ""}</p>
        </div>
        <div className="shrink-0">
          {saveStatus === "saving" ? (
            <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-semibold"><Loader2 className="h-2.5 w-2.5 animate-spin" /></span>
          ) : (
            <span className="flex items-center gap-0.5 text-[9px] text-green-500 font-semibold"><Check className="h-2.5 w-2.5" /></span>
          )}
        </div>
        <button onClick={onNew} className="px-2 py-1 rounded-lg bg-purple-600 text-white text-[9px] font-bold shrink-0">
          <Plus className="h-3 w-3 inline -mt-0.5" /> New
        </button>
      </div>

      {/* ═══ MOBILE: Full-screen overlay ═══ */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 print:hidden">
          {sidebarContent}
        </div>
      )}

      {/* ═══ DESKTOP: Sticky side panel ═══ */}
      <div className="hidden lg:flex flex-col w-60 shrink-0 sticky top-0 h-[calc(100vh-4rem)] z-10 print:hidden">
        {sidebarContent}
      </div>
    </>
  )
}
