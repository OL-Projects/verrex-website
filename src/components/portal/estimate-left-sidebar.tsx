"use client"

import { useState } from "react"
import { Plus, Search, FileText, MoreVertical, Copy, Trash2, Check, Loader2, PanelLeftOpen, PanelLeftClose, X } from "lucide-react"
import { type EstimateRecord } from "@/lib/estimate-store"
import { fmt } from "@/lib/estimate-config"

interface Props {
  records: EstimateRecord[]
  activeId: string
  saveStatus: "saved" | "saving" | "idle"
  onNew: () => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  mobileOpen: boolean
  onMobileToggle: () => void
}

function timeAgo(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = now - d.getTime()
  if (diff < 60000) return "Just now"
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 172800000) return "Yesterday"
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" })
}

export function EstimateLeftSidebar({ records, activeId, saveStatus, onNew, onLoad, onDelete, onDuplicate, mobileOpen, onMobileToggle }: Props) {
  const [search, setSearch] = useState("")
  const [menuId, setMenuId] = useState<string | null>(null)
  const activeRecord = records.find(r => r.id === activeId)

  const filtered = records.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.clientName.toLowerCase().includes(q) || r.estimateNumber.toLowerCase().includes(q)
  })

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 lg:rounded-t-xl border-b lg:border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Estimates</span>
          <div className="flex items-center gap-2">
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-semibold"><Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving…</span>
            ) : (
              <span className="flex items-center gap-0.5 text-[9px] text-green-500 font-semibold"><Check className="h-2.5 w-2.5" /> Saved</span>
            )}
            <button onClick={onMobileToggle} className="lg:hidden text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <button onClick={onNew}
          className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-blue-500 transition">
          <Plus className="h-3 w-3" /> New Estimate
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] outline-none" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto lg:border-x border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
        {filtered.length === 0 ? (
          <div className="p-4 text-center">
            <FileText className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
            <p className="text-[10px] text-slate-400">No estimates yet</p>
          </div>
        ) : filtered.map(r => (
          <div key={r.id}
            onClick={() => { onLoad(r.id); onMobileToggle() }}
            className={`group relative px-2.5 py-2 cursor-pointer transition border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 ${r.id === activeId ? "bg-blue-50 dark:bg-blue-500/10 border-l-2 border-l-blue-500" : ""}`}>
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold truncate ${r.id === activeId ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"}`}>
                  {r.clientName || "Untitled"}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">{r.estimateNumber}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px] text-slate-400">{timeAgo(r.savedAt)}</span>
                  <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">{fmt(r.total)}</span>
                </div>
                <span className="text-[8px] text-slate-400">{r.itemCount} item{r.itemCount !== 1 ? "s" : ""}</span>
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
                <button onClick={e => { e.stopPropagation(); if (confirm("Delete this estimate?")) { onDelete(r.id); setMenuId(null) } }}
                  className="w-full px-3 py-1.5 text-left text-[10px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-slate-100 dark:bg-slate-800 lg:rounded-b-xl border lg:border-t-0 border-slate-200 dark:border-white/10 px-3 py-1.5">
        <p className="text-[9px] text-slate-400 text-center">{records.length} estimate{records.length !== 1 ? "s" : ""} saved</p>
      </div>
    </>
  )

  return (
    <>
      {/* ═══ MOBILE: Compact header bar (always visible) ═══ */}
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 print:hidden">
        <button onClick={onMobileToggle} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition">
          {mobileOpen ? <PanelLeftClose className="h-4 w-4 text-blue-500" /> : <PanelLeftOpen className="h-4 w-4 text-slate-500" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{activeRecord?.clientName || "Untitled"}</p>
          <p className="text-[9px] text-slate-500 font-mono truncate">{activeRecord?.estimateNumber || ""}</p>
        </div>
        <div className="shrink-0">
          {saveStatus === "saving" ? (
            <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-semibold"><Loader2 className="h-2.5 w-2.5 animate-spin" /></span>
          ) : (
            <span className="flex items-center gap-0.5 text-[9px] text-green-500 font-semibold"><Check className="h-2.5 w-2.5" /></span>
          )}
        </div>
        <button onClick={onNew} className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[9px] font-bold shrink-0">
          <Plus className="h-3 w-3 inline -mt-0.5" /> New
        </button>
      </div>

      {/* ═══ MOBILE: Full-screen overlay when expanded ═══ */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900 print:hidden">
          {sidebarContent}
        </div>
      )}

      {/* ═══ DESKTOP: Sticky side panel (always visible) ═══ */}
      <div className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-[calc(100vh-4rem)] z-10 print:hidden">
        {sidebarContent}
      </div>
    </>
  )
}
