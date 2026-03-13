"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Send, Check, User, Building2, Loader2 } from "lucide-react"

interface DocumentToSend {
  type: string
  title: string
  description?: string
  fileUrl: string
  projectId?: string
}

interface Recipient {
  id: string
  name: string
  role: string
  company?: string | null
  email?: string
}

interface Props {
  open: boolean
  onClose: () => void
  documents: DocumentToSend[]
  onSent?: (count: number) => void
}

export function SendDocumentModal({ open, onClose, documents, onSent }: Props) {
  const [users, setUsers] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sent, setSent] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  // Fetch users list
  useEffect(() => {
    if (!open) return
    setLoading(true)
    setSent(false)
    setSelected(new Set())
    setSearch("")
    fetch("/api/portal/users?role=all")
      .then(r => r.ok ? r.json() : [])
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [open])

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.company || "").toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  }, [users, search])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(u => u.id)))
    }
  }

  const handleSend = async () => {
    if (!selected.size || !documents.length) return
    setSending(true)
    try {
      const res = await fetch("/api/portal/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents,
          recipientIds: Array.from(selected),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setSentCount(data.sent || 0)
        setSent(true)
        onSent?.(data.sent || 0)
        setTimeout(() => { onClose(); setSent(false) }, 2000)
      }
    } catch {
      // handle error silently
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Documents</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {documents.length} document{documents.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Document chips */}
          <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-slate-100 dark:border-white/5">
            {documents.slice(0, 5).map((doc, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                {doc.type === "invoice" ? "🧾" : doc.type === "contract" ? "📋" : "📊"} {doc.title}
              </span>
            ))}
            {documents.length > 5 && (
              <span className="text-xs text-slate-400">+{documents.length - 5} more</span>
            )}
          </div>

          {/* Sent success state */}
          {sent ? (
            <div className="px-5 py-12 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-500/10 mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">Sent Successfully!</p>
              <p className="text-sm text-slate-500 mt-1">{sentCount} document copies delivered</p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="px-5 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {filtered.length > 1 && (
                  <button onClick={selectAll} className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    {selected.size === filtered.length ? "Deselect all" : `Select all (${filtered.length})`}
                  </button>
                )}
              </div>

              {/* User list */}
              <div className="px-5 pb-3 max-h-64 overflow-y-auto space-y-1">
                {loading ? (
                  <div className="py-8 text-center text-slate-400"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
                ) : filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No users found</p>
                ) : (
                  filtered.map(user => (
                    <button
                      key={user.id}
                      onClick={() => toggle(user.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                        selected.has(user.id)
                          ? "bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-200 dark:ring-blue-500/30"
                          : "hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        selected.has(user.id)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                      }`}>
                        {selected.has(user.id) ? <Check className="h-4 w-4" /> : user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="capitalize">{user.role}</span>
                          {user.company && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {user.company}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {selected.size} recipient{selected.size !== 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-2">
                  <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!selected.size || sending}
                    className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send to {selected.size || "..."}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
