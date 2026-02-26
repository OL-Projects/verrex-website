"use client"

import { useState, useMemo } from "react"
import type { TimelineContextType } from "@/types/portal"
import { getSearchableLeads, getSearchableClients, getSearchableProjects } from "@/lib/portal-data"
import { UserPlus, User, FolderKanban, Search, ChevronRight, Globe } from "lucide-react"

const CONTEXT_TABS: { key: TimelineContextType | "all"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all", label: "All Activity", icon: Globe },
  { key: "lead", label: "Lead", icon: UserPlus },
  { key: "client", label: "Client", icon: User },
  { key: "project", label: "Project", icon: FolderKanban },
]

interface TimelineContextSelectorProps {
  contextType: TimelineContextType | "all"
  contextId: string | null
  onContextTypeChange: (type: TimelineContextType | "all") => void
  onContextIdChange: (id: string | null) => void
}

export function TimelineContextSelector({ contextType, contextId, onContextTypeChange, onContextIdChange }: TimelineContextSelectorProps) {
  const [search, setSearch] = useState("")

  const leads = useMemo(() => getSearchableLeads(), [])
  const clients = useMemo(() => getSearchableClients(), [])
  const projects = useMemo(() => getSearchableProjects(), [])

  const items = useMemo(() => {
    if (contextType === "all") return []
    const list = contextType === "lead" ? leads : contextType === "client" ? clients : projects
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(i => i.label.toLowerCase().includes(q) || ("email" in i && (i as { email?: string }).email?.toLowerCase().includes(q)))
  }, [contextType, search, leads, clients, projects])

  const selectedLabel = useMemo(() => {
    if (!contextId || contextType === "all") return null
    const list = contextType === "lead" ? leads : contextType === "client" ? clients : projects
    return list.find(i => i.id === contextId)?.label || contextId
  }, [contextType, contextId, leads, clients, projects])

  return (
    <div className="space-y-3">
      {/* Context type tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {CONTEXT_TABS.map(tab => {
          const Icon = tab.icon
          const active = contextType === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => { onContextTypeChange(tab.key); onContextIdChange(null); setSearch("") }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Entity selector (not shown for "all") */}
      {contextType !== "all" && (
        <div className="space-y-2">
          {/* Selected entity display */}
          {contextId && selectedLabel && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20">
              <div className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{selectedLabel}</span>
              </div>
              <button onClick={() => { onContextIdChange(null); setSearch("") }} className="text-xs text-blue-500 hover:underline">
                Change
              </button>
            </div>
          )}

          {/* Search + results (shown when no selection) */}
          {!contextId && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${contextType}s...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 divide-y divide-slate-100 dark:divide-white/5">
                {items.length === 0 ? (
                  <p className="p-3 text-xs text-slate-400 text-center">No {contextType}s found</p>
                ) : (
                  items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onContextIdChange(item.id); setSearch("") }}
                      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.label}</p>
                        {"stage" in item && (
                          <p className="text-[10px] text-slate-400 capitalize mt-0.5">{(item as { stage: string }).stage.replace(/_/g, " ")}</p>
                        )}
                        {"email" in item && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{(item as { email: string }).email}</p>
                        )}
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
