"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import {
  MessageSquare, Loader2, Search, ArrowLeft, Plus, Users, User,
  X, ChevronDown, Eye, EyeOff, Download, Maximize2, FileText, Film,
} from "lucide-react"
import {
  useMessages, type Conversation, type ChatMessage, type PortalUser,
  ROLE_COLORS, fmtConvoTime, fmtDate, isSameDay, getConvoName, getConvoInitials, getConvoRole, getLastMsgPreview,
} from "./use-messages"
import MessageBubble from "./message-bubble"
import MessageComposer from "./message-composer"
import ImageLightbox from "./image-lightbox"

// ═══════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════
export default function MessagesPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""
  const hook = useMessages(userId)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "direct" | "group">("all")
  const [showNewConvo, setShowNewConvo] = useState(false)
  const [lightbox, setLightbox] = useState<{ url: string; all: string[] } | null>(null)
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: "image" | "pdf" | "video" | "file"; allUrls?: string[] } | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Determine file type from URL
  const openPreview = (url: string, allUrls?: string[]) => {
    const lower = url.toLowerCase()
    const name = url.split("/").pop()?.split("?")[0] || "file"
    const type = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(lower) ? "image" as const
      : /\.pdf(\?|$)/i.test(lower) ? "pdf" as const
      : /\.(mp4|webm|mov|avi)(\?|$)/i.test(lower) ? "video" as const
      : "file" as const
    setPreviewFile({ url, name, type, allUrls })
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    if (hook.chatEndRef.current) hook.chatEndRef.current.scrollIntoView({ behavior: "smooth" })
  }, [hook.messages])

  // Show/hide scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
  }
  const scrollToBottom = () => {
    hook.chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const filtered = hook.conversations.filter(c => {
    if (filter === "direct" && c.type !== "direct") return false
    if (filter === "group" && c.type !== "group") return false
    return getConvoName(c, userId).toLowerCase().includes(search.toLowerCase())
  })

  if (hook.loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="ml-3 text-slate-500">Loading messages…</span>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
      {/* ═══ LEFT: Conversation List ═══ */}
      <div className={`${hook.activeConvo ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 lg:w-96 border-r border-slate-200/60 dark:border-white/10`}>
        <div className="p-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" /> Messages
              {hook.totalUnread > 0 && <span className="text-[10px] font-bold bg-blue-600 text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">{hook.totalUnread}</span>}
            </h2>
            <button onClick={() => setShowNewConvo(true)} className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          <div className="flex gap-1">
            {(["all", "direct", "group"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"}`}>
                {f === "all" ? "All" : f === "direct" ? "Direct" : "Groups"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">No conversations yet</p>
            </div>
          ) : filtered.map(c => (
            <SwipeableConvoItem key={c.id} convo={c} userId={userId} isActive={hook.activeConvo?.id === c.id}
              onOpen={() => hook.openConvo(c)} onToggleRead={() => hook.toggleReadStatus(c.id)} />
          ))}
        </div>
      </div>

      {/* ═══ RIGHT: Chat + Preview Split ═══ */}
      <div className={`${hook.activeConvo ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
        {/* ── Chat Column ── */}
        <div className="flex flex-col flex-1 min-w-0 relative">
        {!hook.activeConvo ? (
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
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <button onClick={() => hook.setActiveConvo(null)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
                hook.activeConvo.type === "group" ? "bg-gradient-to-br from-purple-500 to-pink-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
              }`}>
                {hook.activeConvo.type === "group" ? <Users className="h-4 w-4" /> : getConvoInitials(hook.activeConvo, userId)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{getConvoName(hook.activeConvo, userId)}</p>
                <p className="text-[10px] text-slate-400 truncate">{hook.activeConvo.participants.map(p => p.name).join(", ")}</p>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-4 space-y-1 bg-slate-50/50 dark:bg-slate-950/30">
              {hook.msgsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-blue-500" /></div>
              ) : hook.messages.length === 0 ? (
                <div className="text-center py-8"><p className="text-sm text-slate-400">No messages yet. Send the first one!</p></div>
              ) : (
                hook.messages.map((m, i) => {
                  const prev = hook.messages[i - 1]
                  const showDate = !prev || !isSameDay(prev.createdAt, m.createdAt)
                  const showSender = !prev || prev.senderId !== m.senderId || showDate
                  return (
                    <div key={m.id}>
                      {showDate && (
                        <div className="flex justify-center my-3">
                          <span className="px-3 py-1 rounded-full bg-slate-200/60 dark:bg-white/10 text-[10px] font-medium text-slate-500">{fmtDate(m.createdAt)}</span>
                        </div>
                      )}
                      <MessageBubble msg={m} isMine={m.senderId === userId} isGroup={hook.activeConvo?.type === "group"} showSender={showSender}
                        onReply={hook.setReplyTo} onEdit={hook.setEditingMsg} onDelete={hook.deleteMessage}
                        onImageClick={(url, all) => openPreview(url, all)} />
                    </div>
                  )
                })
              )}
              <div ref={hook.chatEndRef} />
            </div>

            {/* Scroll-to-bottom FAB */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-20 right-4 z-20 h-9 w-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center">
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Composer */}
            <MessageComposer onSend={hook.sendMessage} sending={hook.sending}
              replyTo={hook.replyTo} onCancelReply={() => hook.setReplyTo(null)}
              editingMsg={hook.editingMsg} onEdit={hook.editMessage} onCancelEdit={() => hook.setEditingMsg(null)} />
          </>
        )}
        </div>{/* /Chat Column */}

        {/* ── Preview Panel (slides in from right) ── */}
        <AnimatePresence>
          {previewFile && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden md:flex flex-col border-l border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden"
              style={{ minWidth: 0 }}
            >
              {/* Preview header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  {previewFile.type === "image" ? <Maximize2 className="h-4 w-4 text-blue-500 shrink-0" />
                    : previewFile.type === "pdf" ? <FileText className="h-4 w-4 text-red-500 shrink-0" />
                    : previewFile.type === "video" ? <Film className="h-4 w-4 text-purple-500 shrink-0" />
                    : <FileText className="h-4 w-4 text-slate-500 shrink-0" />}
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{decodeURIComponent(previewFile.name)}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {previewFile.type === "image" && previewFile.allUrls && (
                    <button onClick={() => setLightbox({ url: previewFile.url, all: previewFile.allUrls! })}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors" title="Fullscreen">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <a href={previewFile.url} download target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors" title="Download">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => setPreviewFile(null)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors" title="Close">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview content — own scroll */}
              <div className="flex-1 overflow-y-auto">
                {previewFile.type === "image" && (
                  <div className="p-3">
                    <img src={previewFile.url} alt={previewFile.name} className="w-full rounded-xl object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => previewFile.allUrls && setLightbox({ url: previewFile.url, all: previewFile.allUrls })} />
                    {/* Image gallery navigation */}
                    {previewFile.allUrls && previewFile.allUrls.length > 1 && (
                      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-2">
                        {previewFile.allUrls.map((u, i) => (
                          <button key={i} onClick={() => setPreviewFile({ ...previewFile, url: u })}
                            className={`h-14 w-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${u === previewFile.url ? "border-blue-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}>
                            <img src={u} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {previewFile.type === "pdf" && (
                  <iframe src={previewFile.url} className="w-full h-full min-h-[600px]" title="PDF Preview" />
                )}
                {previewFile.type === "video" && (
                  <div className="p-3">
                    <video src={previewFile.url} controls className="w-full rounded-xl" />
                  </div>
                )}
                {previewFile.type === "file" && (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{decodeURIComponent(previewFile.name)}</p>
                      <p className="text-xs text-slate-400 mb-4">Preview not available</p>
                      <a href={previewFile.url} download target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4" /> Download File
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>{/* /Chat + Preview Split */}

      {/* Modals */}
      <AnimatePresence>
        {showNewConvo && <NewConversationModal userId={userId} onClose={() => setShowNewConvo(false)} onCreated={async id => { setShowNewConvo(false); await hook.fetchConvos(); const res = await fetch("/api/portal/conversations"); if (res.ok) { const all: Conversation[] = await res.json(); hook.setConversations(all); const found = all.find(c => c.id === id); if (found) hook.openConvo(found) } }} />}
        {lightbox && <ImageLightbox url={lightbox.url} allUrls={lightbox.all} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// Swipeable Conversation Item
// ═══════════════════════════════════════════════════════
function SwipeableConvoItem({ convo, userId, isActive, onOpen, onToggleRead }: {
  convo: Conversation; userId: string; isActive: boolean; onOpen: () => void; onToggleRead: () => void
}) {
  const x = useMotionValue(0)
  const bgLeft = useTransform(x, [0, 80], ["rgba(34,197,94,0)", "rgba(34,197,94,0.15)"])
  const bgRight = useTransform(x, [-80, 0], ["rgba(59,130,246,0.15)", "rgba(59,130,246,0)"])
  const isUnread = (convo.unreadCount > 0 || convo.isMarkedUnread)
  const role = getConvoRole(convo, userId)

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 60) onToggleRead()
  }

  return (
    <div className="relative overflow-hidden">
      {/* Swipe background hints */}
      <motion.div style={{ background: bgLeft }} className="absolute inset-0 flex items-center pl-4">
        <Eye className="h-4 w-4 text-green-600" />
      </motion.div>
      <motion.div style={{ background: bgRight }} className="absolute inset-0 flex items-center justify-end pr-4">
        <EyeOff className="h-4 w-4 text-blue-600" />
      </motion.div>

      <motion.button drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3}
        style={{ x }} onDragEnd={handleDragEnd}
        onClick={onOpen}
        className={`relative w-full text-left px-4 py-3 border-b border-slate-50 dark:border-white/5 transition-colors z-10 bg-white dark:bg-transparent ${
          isActive ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-slate-50 dark:hover:bg-white/5"
        }`}>
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${
            convo.type === "group" ? "bg-gradient-to-br from-purple-500 to-pink-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
          }`}>
            {convo.type === "group" ? <Users className="h-4 w-4" /> : getConvoInitials(convo, userId)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm truncate ${isUnread ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-900 dark:text-white"}`}>
                {getConvoName(convo, userId)}
              </span>
              {convo.lastMessage && <span className="text-[10px] text-slate-400 shrink-0">{fmtConvoTime(convo.lastMessage.createdAt)}</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${ROLE_COLORS[role] || "bg-slate-100 text-slate-600"}`}>
                {convo.type === "group" ? `${convo.participants.length} members` : role}
              </span>
              {convo.project && <span className="text-[10px] text-slate-400 truncate">· {convo.project.title}</span>}
            </div>
            <p className={`text-xs truncate mt-1 ${isUnread ? "font-semibold text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>
              {getLastMsgPreview(convo, userId)}
            </p>
          </div>
          {isUnread && (
            <span className="h-5 min-w-5 flex items-center justify-center px-1 rounded-full bg-blue-600 text-[10px] text-white font-bold shrink-0 mt-1">
              {convo.unreadCount || "•"}
            </span>
          )}
        </div>
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// New Conversation Modal (kept from original)
// ═══════════════════════════════════════════════════════
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

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try { const res = await fetch(`/api/portal/users?search=${encodeURIComponent(search)}`); if (res.ok) setUsers(await res.json()) } catch {}
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const toggleUser = (user: PortalUser) => {
    if (mode === "direct") setSelected([user])
    else setSelected(prev => prev.some(u => u.id === user.id) ? prev.filter(u => u.id !== user.id) : [...prev, user])
  }

  const create = async () => {
    if (!selected.length) return
    setCreating(true)
    try {
      const res = await fetch("/api/portal/conversations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode, name: mode === "group" ? groupName || `Group (${selected.length + 1})` : undefined, participantIds: selected.map(u => u.id) }),
      })
      if (res.ok) { const data = await res.json(); onCreated(data.id) }
    } catch {} finally { setCreating(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Conversation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => { setMode("direct"); setSelected([]) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === "direct" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <User className="h-4 w-4" /> Direct
            </button>
            <button onClick={() => { setMode("group"); setSelected([]) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === "group" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Users className="h-4 w-4" /> Group
            </button>
          </div>
          {mode === "group" && <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40" />}
          {selected.length > 0 && <div className="flex flex-wrap gap-1.5">
            {selected.map(u => <span key={u.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-xs font-medium">
              {u.name} <button onClick={() => setSelected(prev => prev.filter(s => s.id !== u.id))}><X className="h-3 w-3" /></button>
            </span>)}
          </div>}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {loading ? <div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin text-blue-500 mx-auto" /></div>
            : users.length === 0 ? <p className="text-center py-4 text-sm text-slate-400">No users found</p>
            : users.map(u => {
              const sel = selected.some(s => s.id === u.id)
              return <button key={u.id} onClick={() => toggleUser(u)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${sel ? "bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{u.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-400">{u.email} · <span className={`font-medium px-1 py-0.5 rounded ${ROLE_COLORS[u.role] || ""}`}>{u.role}</span></p>
                </div>
                {sel && <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center"><span className="text-white text-[10px]">✓</span></div>}
              </button>
            })}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
          <button onClick={create} disabled={creating || !selected.length}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
            {creating ? "Creating…" : "Start Chat"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
