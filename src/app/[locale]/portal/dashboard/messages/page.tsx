"use client"

import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { getThreadsByRole, mockMessages } from "@/lib/portal-data"
import { useState } from "react"
import { MessageSquare, Send, Paperclip, Lock } from "lucide-react"

export default function MessagesPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""
  const role = session?.user?.role || "client"
  const threads = getThreadsByRole(userId, role)
  const [selectedThread, setSelectedThread] = useState(threads[0]?.id || "")
  const [newMessage, setNewMessage] = useState("")

  const threadMessages = mockMessages.filter(m => m.threadId === selectedThread)
    .filter(m => role === "admin" || role === "contractor" || !m.isInternal)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{threads.length} conversation threads</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="space-y-2">
          {threads.map(thread => (
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
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-[10px] opacity-50 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                <Paperclip className="h-4 w-4" />
              </button>
              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
              <button className="h-9 w-9 rounded-lg flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
