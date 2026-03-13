"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Send, Loader2, Search, ArrowLeft, Plus, Users,
  User, Wifi, WifiOff, X, Hash, Paperclip, Upload, FileText,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────
interface Participant { id: string; name: string; role: string; company: string | null }
interface ConvoLastMsg { id: string; content: string; senderId: string; senderName: string; createdAt: string }
interface Conversation {
  id: string; type: "direct" | "group"; name: string | null
  project: { id: string; title: string } | null
  participants: Participant[]; lastMessage: ConvoLastMsg | null
  unreadCount: number; updatedAt: string
}
interface ChatMessage {
  id: string; content: string; attachmentUrls: string | null
  senderId: string; sender: { id: string; name: string; role: string }
  createdAt: string
}
interface PortalUser { id: string; name: string; email: string; role: string; company: string | null }

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  client: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  contractor: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  partner: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
}

// ─── Main Page ──────────────────────────────────────────
export default function MessagesPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "direct" | "group">("all")
  const [showNewConvo, setShowNewConvo] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // ─── Fetch Conversations ────────────────────────
  const fetchConvos = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/conversations")
      if (res.ok) setConversations(await res.json())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchConvos() }, [fetchConvos])

  // Poll for new messages every 5s
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchConvos()
      if (activeConvo) {
        fetch(`/api/portal/conversations/${activeConvo.id}/messages?limit=50`)
          .then(r => r.ok ? r.json() : [])
          .then(msgs => setMessages(msgs))
          .catch(() => {})
      }
    }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchConvos, activeConvo])

  // ─── Open Conversation ──────────────────────────
  const openConvo = useCallback(async (convo: Conversation) => {
    setActiveConvo(convo)
    setMsgsLoading(true)
    setMessages([])
    try {
      const res = await fetch(`/api/portal/conversations/${convo.id}/messages?limit=50`)
      if (res.ok) {
        setMessages(await res.json())
        // Clear unread locally
        setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unreadCount: 0 } : c))
      }
    } catch { /* silent */ }
    finally { setMsgsLoading(false) }
  }, [])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ─── Send Message ───────────────────────────────
  const sendMessage = async () => {
    if (!draft.trim() || !activeConvo || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/portal/conversations/${activeConvo.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setDraft("")
        // Update conversation preview
        setConversations(prev => prev.map(c =>
          c.id === activeConvo.id
            ? { ...c, lastMessage: { id: msg.id, content: msg.content, senderId: msg.senderId, senderName: msg.sender.name, createdAt: msg.createdAt }, updatedAt: msg.createdAt }
            : c
        ))
      }
    } catch { /* silent */ }
    finally { setSending(false) }
  }

  // ─── New Conversation Created ───────────────────
  const handleConvoCreated = async (convoId: string) => {
    setShowNewConvo(false)
    await fetchConvos()
    const convo = conversations.find(c => c.id === convoId)
    if (convo) openConvo(convo)
    else {
      // Refetch and open
      const res = await fetch("/api/portal/conversations")
      if (res.ok) {
        const all: Conversation[] = await res.json()
        setConversations(all)
        const found = all.find(c => c.id === convoId)
        if (found) openConvo(found)
      }
    }
  }

  // ─── Helpers ────────────────────────────────────
  const getConvoName = (c: Conversation) => {
    if (c.type === "group") return c.name || "Group Chat"
    const partner = c.participants.find(p => p.id !== userId)
    return partner?.name || "Unknown"
  }
  const getConvoInitials = (c: Conversation) => {
    if (c.type === "group") return c.participants.length.toString()
    const partner = c.participants.find(p => p.id !== userId)
    return partner?.name?.charAt(0) || "?"
  }
  const getConvoRole = (c: Conversation) => {
    if (c.type === "group") return "group"
    const partner = c.participants.find(p => p.id !== userId)
    return partner?.role || "user"
  }

  const fmtTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
    return d.toLocaleDateString("en", { month: "short", day: "numeric" })
  }

  const filtered = conversations.filter(c => {
    if (filter === "direct" && c.type !== "direct") return false
    if (filter === "group" && c.type !== "group") return false
    const name = getConvoName(c).toLowerCase()
    return name.includes(search.toLowerCase())
  })

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-3 text-slate-500">Loading messages…</span>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
      {/* ═══ LEFT: Conversation List ═══ */}
      <div className={`${activeConvo ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-slate-200/60 dark:border-white/10`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" /> Messages
            </h2>
            <button onClick={() => setShowNewConvo(true)}
              className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
              title="New conversation">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          {/* Tabs */}
          <div className="flex gap-1">
            {(["all", "direct", "group"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                  filter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}>
                {f === "all" ? "All" : f === "direct" ? "Direct" : "Groups"}
              </button>
            ))}
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">No conversations yet</p>
              <button onClick={() => setShowNewConvo(true)} className="text-xs text-blue-500 hover:underline mt-2">
                Start a new conversation
              </button>
            </div>
          ) : (
            filtered.map(c => (
              <button key={c.id} onClick={() => openConvo(c)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                  activeConvo?.id === c.id ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                    c.type === "group" ? "bg-gradient-to-br from-purple-500 to-pink-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}>
                    {c.type === "group" ? <Users className="h-4 w-4" /> : getConvoInitials(c)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{getConvoName(c)}</span>
                      {c.lastMessage && <span className="text-[10px] text-slate-400 shrink-0">{fmtTime(c.lastMessage.createdAt)}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[getConvoRole(c)] || "bg-slate-100 text-slate-600"}`}>
                        {c.type === "group" ? `${c.participants.length} members` : getConvoRole(c)}
                      </span>
                      {c.project && (
                        <span className="text-[10px] text-slate-400 truncate">· {c.project.title}</span>
                      )}
                    </div>
                    {c.lastMessage && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        {c.type === "group" && c.lastMessage.senderId !== userId && <span className="font-medium">{c.lastMessage.senderName}: </span>}
                        {c.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-blue-600 text-[10px] text-white font-bold shrink-0">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ═══ RIGHT: Chat Area ═══ */}
      <div className={`${activeConvo ? "flex" : "hidden md:flex"} flex-col flex-1`}>
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-lg font-semibold text-slate-400">Select a conversation</p>
              <p className="text-sm text-slate-400 mt-1">Or create a new one with the + button</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
              <button onClick={() => setActiveConvo(null)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                activeConvo.type === "group" ? "bg-gradient-to-br from-purple-500 to-pink-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
              }`}>
                {activeConvo.type === "group" ? <Users className="h-4 w-4" /> : getConvoInitials(activeConvo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{getConvoName(activeConvo)}</p>
                <p className="text-[10px] text-slate-400 truncate">
                  {activeConvo.participants.map(p => p.name).join(", ")}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">No messages yet. Send the first one!</p>
                </div>
              ) : (
                messages.map(m => {
                  const isMine = m.senderId === userId
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isMine
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-md"
                      }`}>
                        {!isMine && activeConvo.type === "group" && (
                          <p className="text-[10px] font-semibold mb-0.5 opacity-70">{m.sender.name}</p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        {m.attachmentUrls && (() => {
                          const urls: string[] = JSON.parse(m.attachmentUrls)
                          return urls.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {urls.map((url, i) => {
                                const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
                                return isImg ? (
                                  <a key={i} href={url} target="_blank" rel="noreferrer" className="h-16 w-16 rounded-lg overflow-hidden">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                  </a>
                                ) : (
                                  <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 text-[10px]">
                                    <FileText className="h-3 w-3" /> {url.split("/").pop()?.slice(0, 15)}
                                  </a>
                                )
                              })}
                            </div>
                          ) : null
                        })()}
                        <p className={`text-[10px] mt-1 ${isMine ? "text-blue-200" : "text-slate-400"}`}>
                          {fmtTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Send bar */}
            <div className="p-3 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <input type="text" value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                <button onClick={sendMessage} disabled={!draft.trim() || sending}
                  className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-40">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ═══ New Conversation Modal ═══ */}
      <AnimatePresence>
        {showNewConvo && (
          <NewConversationModal userId={userId} onClose={() => setShowNewConvo(false)} onCreated={handleConvoCreated} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── New Conversation Modal ─────────────────────────────
function NewConversationModal({ userId, onClose, onCreated }: {
  userId: string; onClose: () => void; onCreated: (convoId: string) => void
}) {
  const [mode, setMode] = useState<"direct" | "group">("direct")
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<PortalUser[]>([])
  const [selected, setSelected] = useState<PortalUser[]>([])
  const [groupName, setGroupName] = useState("")
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  // Search users
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/portal/users?search=${encodeURIComponent(search)}`)
        if (res.ok) setUsers(await res.json())
      } catch { /* silent */ }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const toggleUser = (user: PortalUser) => {
    if (mode === "direct") {
      setSelected([user])
    } else {
      setSelected(prev =>
        prev.some(u => u.id === user.id)
          ? prev.filter(u => u.id !== user.id)
          : [...prev, user]
      )
    }
  }

  const create = async () => {
    if (!selected.length) return
    setCreating(true)
    try {
      const res = await fetch("/api/portal/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          name: mode === "group" ? groupName || `Group (${selected.length + 1})` : undefined,
          participantIds: selected.map(u => u.id),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        onCreated(data.id)
      }
    } catch { /* silent */ }
    finally { setCreating(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Conversation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button onClick={() => { setMode("direct"); setSelected([]) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === "direct" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}>
              <User className="h-4 w-4" /> Direct Message
            </button>
            <button onClick={() => { setMode("group"); setSelected([]) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === "group" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}>
              <Users className="h-4 w-4" /> Group Chat
            </button>
          </div>

          {/* Group name */}
          {mode === "group" && (
            <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)}
              placeholder="Group name (optional)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40" />
          )}

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map(u => (
                <span key={u.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-xs font-medium">
                  {u.name}
                  <button onClick={() => setSelected(prev => prev.filter(s => s.id !== u.id))} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* User search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>

          {/* User list */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {loading ? (
              <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto" /></div>
            ) : users.length === 0 ? (
              <p className="text-center py-4 text-sm text-slate-400">No users found</p>
            ) : (
              users.map(u => {
                const isSelected = selected.some(s => s.id === u.id)
                return (
                  <button key={u.id} onClick={() => toggleUser(u)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      isSelected ? "bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30" : "hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email} · <span className={`font-medium px-1 py-0.5 rounded ${ROLE_COLORS[u.role] || ""}`}>{u.role}</span></p>
                    </div>
                    {isSelected && <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center"><span className="text-white text-[10px]">✓</span></div>}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
          <button onClick={create} disabled={creating || !selected.length}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
            {creating ? "Creating…" : mode === "direct" ? "Start Chat" : "Create Group"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
