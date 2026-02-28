"use client"

import { useState, useMemo } from "react"
import { usePortalStore } from "@/lib/portal-store"
import { Plus, Search, ClipboardSignature, Send, CheckCircle2, Ban, Play, Flag } from "lucide-react"
import type { Contract } from "@/types/portal"
import ContractDetail from "./contract-detail"
import ContractForm from "./contract-form"

const statusBadge: Record<string, { cls: string; label: string }> = {
  draft: { cls: "bg-slate-200 text-slate-700", label: "Draft" },
  sent: { cls: "bg-blue-100 text-blue-700", label: "Sent" },
  signed: { cls: "bg-purple-100 text-purple-700", label: "Signed" },
  active: { cls: "bg-emerald-100 text-emerald-700", label: "Active" },
  completed: { cls: "bg-green-100 text-green-700", label: "Completed" },
  void: { cls: "bg-gray-200 text-gray-500", label: "Void" },
}

export default function ContractsPage() {
  const store = usePortalStore()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selected, setSelected] = useState<Contract | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editContract, setEditContract] = useState<Contract | null>(null)

  const filtered = useMemo(() => {
    let list = store.contracts
    if (filterStatus !== "all") list = list.filter(c => c.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.clientName.toLowerCase().includes(q) || c.contractNumber.toLowerCase().includes(q))
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [store.contracts, filterStatus, search])

  const fmt = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const handleSend = () => {
    if (!selected) return
    store.updateContract(selected.id, { status: "sent" })
    setSelected({ ...selected, status: "sent" })
  }
  const handleSign = () => {
    if (!selected) return
    const signedDate = new Date().toISOString().split("T")[0]
    store.updateContract(selected.id, { status: "signed", signedDate })
    setSelected({ ...selected, status: "signed", signedDate })
  }
  const handleActivate = () => {
    if (!selected) return
    store.updateContract(selected.id, { status: "active" })
    setSelected({ ...selected, status: "active" })
  }
  const handleComplete = () => {
    if (!selected) return
    store.updateContract(selected.id, { status: "completed" })
    setSelected({ ...selected, status: "completed" })
  }
  const handleVoid = () => {
    if (!selected) return
    store.updateContract(selected.id, { status: "void" })
    setSelected({ ...selected, status: "void" })
  }

  // Right panel content
  const rightPanel = showForm ? (
    <ContractForm
      editContract={editContract}
      onClose={() => { setShowForm(false); setEditContract(null) }}
    />
  ) : selected ? (
    <ContractDetail
      contract={selected}
      onClose={() => setSelected(null)}
      onSend={handleSend}
      onSign={handleSign}
      onActivate={handleActivate}
      onComplete={handleComplete}
      onVoid={handleVoid}
    />
  ) : (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
      <ClipboardSignature className="h-12 w-12 text-slate-200 dark:text-slate-700" />
      <p className="text-sm font-medium">Select a contract or create a new one</p>
    </div>
  )

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left — Contract List */}
      <div className="w-full lg:w-[40%] xl:w-[35%] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardSignature className="h-5 w-5 text-blue-600" />Contracts
              <span className="text-xs font-normal text-slate-400 ml-1">{store.contracts.length}</span>
            </h1>
            <button onClick={() => { setShowForm(true); setEditContract(null); setSelected(null) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shadow-sm">
              <Plus className="h-3 w-3" />New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contracts..." className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs" />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {["all", "draft", "sent", "signed", "active", "completed", "void"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition ${filterStatus === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"}`}>
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <ClipboardSignature className="h-8 w-8 mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No contracts found</p>
            </div>
          ) : filtered.map(c => (
            <button key={c.id} onClick={() => { setSelected(c); setShowForm(false) }}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${selected?.id === c.id ? "bg-blue-50 dark:bg-blue-500/10 border-l-2 border-l-blue-500" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{c.contractNumber}</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${statusBadge[c.status]?.cls}`}>
                  {statusBadge[c.status]?.label}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{c.clientName}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-400 truncate">{c.clientAddress}</p>
                <p className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">{fmt(c.totalValue)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — Detail / Form */}
      <div className="hidden lg:flex lg:flex-1 flex-col bg-slate-50 dark:bg-slate-950">
        {rightPanel}
      </div>
    </div>
  )
}
