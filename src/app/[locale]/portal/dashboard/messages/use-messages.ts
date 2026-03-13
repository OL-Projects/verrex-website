"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// ─── Types ──────────────────────────────────────────────
export interface Participant { id: string; name: string; role: string; company: string | null }
export interface ConvoLastMsg { id: string; content: string; senderId: string; senderName: string; createdAt: string; attachmentUrls?: string | null }
export interface Conversation {
  id: string; type: "direct" | "group"; name: string | null
  project: { id: string; title: string } | null
  participants: Participant[]; lastMessage: ConvoLastMsg | null
  unreadCount: number; updatedAt: string
  isMarkedUnread?: boolean
}
export interface ChatMessage {
  id: string; content: string; attachmentUrls: string | null
  senderId: string; sender: { id: string; name: string; role: string }
  createdAt: string
  editedAt?: string | null
  deletedAt?: string | null
  replyToId?: string | null
  replyTo?: { id: string; content: string; sender: { name: string } } | null
}
export interface PortalUser { id: string; name: string; email: string; role: string; company: string | null }

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  client: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  contractor: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  partner: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  supplier: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
}
export const ROLE_BUBBLE_COLORS: Record<string, string> = {
  admin: "text-blue-600 dark:text-blue-400",
  client: "text-emerald-600 dark:text-emerald-400",
  contractor: "text-amber-600 dark:text-amber-400",
  partner: "text-purple-600 dark:text-purple-400",
  supplier: "text-orange-600 dark:text-orange-400",
}

// ─── Formatting ─────────────────────────────────────────
export function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
}
export function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })
}
export function fmtConvoTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString("en", { month: "short", day: "numeric" })
}
export function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}
export function canEdit(msg: ChatMessage) {
  return Date.now() - new Date(msg.createdAt).getTime() < 15 * 60 * 1000 // 15 min
}

// ─── Parse Attachments ──────────────────────────────────
export interface ParsedAttachment {
  url: string; type: "image" | "file" | "video"; name: string
}
export function parseAttachments(raw: string | null): ParsedAttachment[] {
  if (!raw) return []
  try {
    const urls: string[] = JSON.parse(raw)
    return urls.map(url => {
      const name = decodeURIComponent(url.split("/").pop()?.split("?")[0] || "file")
      const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url)
      const isVid = /\.(mp4|webm|mov)$/i.test(url)
      return { url, type: isImg ? "image" : isVid ? "video" : "file", name }
    })
  } catch { return [] }
}

// ─── Conversation Helpers ───────────────────────────────
export function getConvoName(c: Conversation, userId: string) {
  if (c.type === "group") return c.name || "Group Chat"
  const partner = c.participants.find(p => p.id !== userId)
  return partner?.name || "Unknown"
}
export function getConvoInitials(c: Conversation, userId: string) {
  if (c.type === "group") return c.participants.length.toString()
  const partner = c.participants.find(p => p.id !== userId)
  return partner?.name?.charAt(0).toUpperCase() || "?"
}
export function getConvoRole(c: Conversation, userId: string) {
  if (c.type === "group") return "group"
  const partner = c.participants.find(p => p.id !== userId)
  return partner?.role || "user"
}
export function getLastMsgPreview(c: Conversation, userId: string): string {
  if (!c.lastMessage) return "No messages yet"
  const isMe = c.lastMessage.senderId === userId
  const prefix = isMe ? "You: " : c.type === "group" ? `${c.lastMessage.senderName}: ` : ""
  const hasAttach = c.lastMessage.attachmentUrls && JSON.parse(c.lastMessage.attachmentUrls || "[]").length > 0
  if (hasAttach && !c.lastMessage.content) return `${prefix}📎 Attachment`
  if (hasAttach) return `${prefix}📎 ${c.lastMessage.content}`
  return `${prefix}${c.lastMessage.content}`
}

// ─── Custom Hook ────────────────────────────────────────
export function useMessages(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // ── Fetch Conversations ──
  const fetchConvos = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/conversations")
      if (res.ok) {
        const data: Conversation[] = await res.json()
        setConversations(prev => {
          // Preserve local isMarkedUnread flags
          const flags = new Map(prev.map(c => [c.id, c.isMarkedUnread]))
          return data.map(c => ({ ...c, isMarkedUnread: flags.get(c.id) || false }))
        })
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchConvos() }, [fetchConvos])

  // ── Poll ──
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchConvos()
      if (activeConvo) {
        fetch(`/api/portal/conversations/${activeConvo.id}/messages?limit=100`)
          .then(r => r.ok ? r.json() : [])
          .then(msgs => setMessages(msgs))
          .catch(() => {})
      }
    }, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchConvos, activeConvo])

  // ── Open Conversation ──
  const openConvo = useCallback(async (convo: Conversation) => {
    setActiveConvo(convo)
    setMsgsLoading(true)
    setMessages([])
    setReplyTo(null)
    setEditingMsg(null)
    try {
      const res = await fetch(`/api/portal/conversations/${convo.id}/messages?limit=100`)
      if (res.ok) setMessages(await res.json())
      setConversations(prev => prev.map(c =>
        c.id === convo.id ? { ...c, unreadCount: 0, isMarkedUnread: false } : c
      ))
    } catch { /* silent */ }
    finally { setMsgsLoading(false) }
  }, [])

  // ── Send Message ──
  const sendMessage = useCallback(async (content: string, files?: File[]) => {
    if ((!content.trim() && (!files || files.length === 0)) || !activeConvo || sending) return
    setSending(true)
    try {
      let body: any
      let headers: any = {}
      if (files && files.length > 0) {
        const fd = new FormData()
        fd.append("content", content.trim())
        files.forEach(f => fd.append("files", f))
        if (replyTo) fd.append("replyToId", replyTo.id)
        body = fd
      } else {
        headers["Content-Type"] = "application/json"
        body = JSON.stringify({
          content: content.trim(),
          ...(replyTo ? { replyToId: replyTo.id } : {}),
        })
      }
      const res = await fetch(`/api/portal/conversations/${activeConvo.id}/messages`, { method: "POST", headers: files?.length ? {} : headers, body })
      if (res.ok) {
        const msg = await res.json()
        setMessages(prev => [...prev, msg])
        setConversations(prev => prev.map(c =>
          c.id === activeConvo.id
            ? { ...c, lastMessage: { id: msg.id, content: msg.content, senderId: msg.senderId, senderName: msg.sender?.name || "", createdAt: msg.createdAt, attachmentUrls: msg.attachmentUrls }, updatedAt: msg.createdAt }
            : c
        ))
        setReplyTo(null)
      }
    } catch { /* silent */ }
    finally { setSending(false) }
  }, [activeConvo, sending, replyTo])

  // ── Edit Message ──
  const editMessage = useCallback(async (msgId: string, newContent: string) => {
    if (!activeConvo) return
    try {
      const res = await fetch(`/api/portal/conversations/${activeConvo.id}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId, content: newContent }),
      })
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: newContent, editedAt: new Date().toISOString() } : m))
      }
    } catch { /* silent */ }
    setEditingMsg(null)
  }, [activeConvo])

  // ── Delete Message ──
  const deleteMessage = useCallback(async (msgId: string) => {
    if (!activeConvo) return
    try {
      const res = await fetch(`/api/portal/conversations/${activeConvo.id}/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId }),
      })
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deletedAt: new Date().toISOString(), content: "" } : m))
      }
    } catch { /* also do optimistic delete */ 
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, deletedAt: new Date().toISOString(), content: "" } : m))
    }
  }, [activeConvo])

  // ── Mark Read / Unread ──
  const toggleReadStatus = useCallback((convoId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === convoId
        ? { ...c, isMarkedUnread: !c.isMarkedUnread, unreadCount: c.isMarkedUnread ? 0 : Math.max(c.unreadCount, 1) }
        : c
    ))
  }, [])

  // ── Total Unread (for sidebar badge) ──
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount > 0 || c.isMarkedUnread ? Math.max(c.unreadCount, 1) : 0), 0)

  return {
    conversations, messages, activeConvo, loading, msgsLoading, sending,
    replyTo, setReplyTo, editingMsg, setEditingMsg, chatEndRef, totalUnread,
    fetchConvos, openConvo, setActiveConvo, sendMessage, editMessage, deleteMessage, toggleReadStatus,
    setConversations,
  }
}
