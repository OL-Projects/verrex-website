"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Send, Loader2, Search, ArrowLeft, RefreshCw, AlertCircle,
  User, Clock,
} from "lucide-react"

interface Thread {
  id: string; partnerId: string; partnerName: string; partnerRole: string
  lastMessage: string; lastAt: string; unreadCount: number; messageCount: number
}
interface ChatMsg {
  id: string; content: string; senderId: string; senderName: string; senderRole: string
  read: boolean; createdAt: string; isMine: boolean
}

const roleBadge: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  client: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  contractor: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  supplier: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""

  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/messages")
      if (res.ok) {
        const data = await res.json()
        setThreads(data.threads || [])
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchThreads() }, [fetchThreads])

  // Fetch messages for active thread
  const openThread = useCallback(async (thread: Thread) => {
    setActiveThread(thread)
    setMsgsLoading(true)
    setMessages([])
    try {
      const res = await fetch(`/api/portal/messages/${thread.partnerId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        // Update unread count locally
        setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unreadCount: 0 } : t))
      }
    } catch { /* silent */ }
    finally { setMsgsLoading(false) }
  }, [])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send message
  const sendMessage = async () => {
    if (!draft.trim() || !activeThread || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeThread.partnerId, content: draft.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { ...data.message, isMine: true }])
        setDraft("")
        // Update thread preview
        setThreads(prev => prev.map(t =>
          t.id === activeThread.id ? { ...t, lastMessage: draft.trim(), lastAt: new Date().toISOString(), messageCount: t.messageCount + 1 } : t
        ))
      }
    } catch { setError("Failed to send") }
    finally { setSending(false) }
  }

  const filteredThreads = threads.filter(t =>
    t.partnerName.toLowerCase().includes(search.toLowerCase()) ||
    t.partnerRole.toLowerCase().includes(search.toLowerCase())
  )

  const fmtTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
    return d.toLocaleDateString("en", { month: "short", day: "numeric" })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-3 text-slate-500">Loading messages…</span>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
      {/* ── Thread List (Left) ──────────────── */}
      <div className={`${activeThread ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-slate-200/60 dark:border-white/10`}>
        <div className="p-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <MessageSquare className="h-5 w-5 text-blue-500" /> Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Messages sent to other users will appear here</p>
            </div>
          ) : (
            filteredThreads.map(t => (
              <button key={t.id} onClick={() => openThread(t)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                  activeThread?.id === t.id ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5">
                    {t.partnerName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.partnerName}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{fmtTime(t.lastAt)}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${roleBadge[t.partnerRole] || "bg-slate-100 text-slate-600"}`}>
                      {t.partnerRole}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{t.lastMessage}</p>
                  </div>
                  {t.unreadCount > 0 && (
                    <span className="h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-blue-600 text-[10px] text-white font-bold shrink-0">
                      {t.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Area (Right) ──────────────── */}
      <div className={`${activeThread ? "flex" : "hidden md:flex"} flex-col flex-1`}>
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-slate-200 dark:text-slate-700 mb-3" />
              <p className="text-lg font-semibold text-slate-400 dark:text-slate-500">Select a conversation</p>
              <p className="text-sm text-slate-400 mt-1">Choose from the list to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
              <button onClick={() => setActiveThread(null)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {activeThread.partnerName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{activeThread.partnerName}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${roleBadge[activeThread.partnerRole] || "bg-slate-100 text-slate-600"}`}>
                  {activeThread.partnerRole}
                </span>
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
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      m.isMine
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-md"
                    }`}>
                      {!m.isMine && (
                        <p className="text-[10px] font-semibold mb-0.5 opacity-70">{m.senderName}</p>
                      )}
                      <p className="text-sm leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.isMine ? "text-blue-200" : "text-slate-400"}`}>
                        {fmtTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Send bar */}
            <div className="p-3 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <input type="text" value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
                <button onClick={sendMessage} disabled={!draft.trim() || sending}
                  className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-40">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
