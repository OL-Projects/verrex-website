"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { usePortalStore } from "@/lib/portal-store"
import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Paperclip, Lock, Hash } from "lucide-react"

export default function MessagesPage() {
  const { data: session } = useSession()
  const store = usePortalStore()
  const userId = session?.user?.id || "usr_admin_001"
  const userName = session?.user?.name || "Sarah Mitchell"
  const role = session?.user?.role || "admin"

  const [selectedThread, setSelectedThread] = useState(store.threads[0]?.id || "")
  const [newMessage, setNewMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const threadMessages = store.messages
    .filter(m => m.threadId === selectedThread)
    .filter(m => role === "admin" || role === "contractor" || !m.isInternal)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const selectedThreadData = store.threads.find(t => t.id === selectedThread)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [threadMessages.length])

  const handleSend = () => {
    if (!newMessage.trim() || !selectedThread) return
    const thread = store.threads.find(t => t.id === selectedThread)
    store.sendMessage({
      projectId: thread?.projectId || "",
      threadId: selectedThread,
      senderId: userId,
      senderName: userName,
      senderRole: role,
      content: newMessage.trim(),
      isInternal,
    })
    setNewMessage("")
    setIsInternal(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{store.threads.length} conversation threads</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="space-y-2">
          {store.threads.map(thread => (
            <button key={thread.id} onClick={() => setSelectedThread(thread.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedThread === thread.id
                  ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
                  : "bg-white/60 dark:bg-white/5 border-slate-200/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/8"
              }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{thread.projectName}</p>
                {thread.unreadCount > 0 && (
                  <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white px-1.5">{thread.unreadCount}</span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{thread.lastMessage}</p>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 overflow-hidden" style={{ minHeight: 500 }}>
          {/* Thread Header */}
          {selectedThreadData && (
            <div className="px-4 py-3 border-b border-slate-200/60 dark:border-white/10 flex items-center gap-2">
              <Hash className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedThreadData.projectName}</span>
              <span className="text-[10px] text-slate-400 ml-auto">{threadMessages.length} messages</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {threadMessages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl ${
                  msg.isInternal
                    ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                    : msg.senderId === userId
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-white/10"
                }`}>
                  {msg.isInternal && (
                    <div className="flex items-center gap-1 mb-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      <Lock className="h-2.5 w-2.5" /> Internal Note
                    </div>
                  )}
                  <p className="text-xs font-medium mb-0.5 opacity-70">{msg.senderName} ({msg.senderRole})</p>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
            {(role === "admin" || role === "contractor") && (
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-white/20 text-amber-500" />
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Internal note (hidden from client)
                </span>
              </label>
            )}
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 shrink-0">
                <Paperclip className="h-4 w-4" />
              </button>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={isInternal ? "Type an internal note..." : "Type a message..."}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  isInternal
                    ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20 text-slate-900 dark:text-white"
                    : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                }`} />
              <button onClick={handleSend} disabled={!newMessage.trim()}
                className="h-9 w-9 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
