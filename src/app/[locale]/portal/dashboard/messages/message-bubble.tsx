"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reply, Pencil, Trash2, Copy, Check, Ban, Download, FileText, Film, X, Image as ImageIcon } from "lucide-react"
import { type ChatMessage, type ParsedAttachment, parseAttachments, fmtTime, canEdit, ROLE_BUBBLE_COLORS } from "./use-messages"

interface Props {
  msg: ChatMessage
  isMine: boolean
  isGroup: boolean
  showSender: boolean // first message in a cluster from same sender
  onReply: (msg: ChatMessage) => void
  onEdit: (msg: ChatMessage) => void
  onDelete: (msgId: string) => void
  onImageClick: (url: string, allUrls: string[]) => void
}

export default function MessageBubble({ msg, isMine, isGroup, showSender, onReply, onEdit, onDelete, onImageClick }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const longPressRef = useRef<NodeJS.Timeout | null>(null)
  const attachments = parseAttachments(msg.attachmentUrls)
  const images = attachments.filter(a => a.type === "image")
  const files = attachments.filter(a => a.type !== "image")
  const isDeleted = !!msg.deletedAt
  const senderColor = ROLE_BUBBLE_COLORS[msg.sender.role] || "text-slate-600"

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => { setCopied(false); setShowMenu(false) }, 1200)
  }

  const handleLongPressStart = () => {
    longPressRef.current = setTimeout(() => setShowMenu(true), 500)
  }
  const handleLongPressEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
  }

  // Deleted message
  if (isDeleted) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-2`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10">
          <Ban className="h-3 w-3 text-slate-400" />
          <span className="text-xs italic text-slate-400">This message was deleted</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-2 group relative`}>
      <div
        className={`relative max-w-[80%] sm:max-w-[70%] ${showSender && !isMine ? "mt-1" : ""}`}
        onContextMenu={e => { e.preventDefault(); setShowMenu(true) }}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
      >
        {/* Bubble */}
        <div className={`relative px-3 py-2 ${
          isMine
            ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl rounded-bl-md border border-slate-200/60 dark:border-white/10"
        }`}>
          {/* SVG Tail */}
          <svg className={`absolute bottom-0 w-3 h-3 ${isMine ? "-right-1.5 text-blue-600" : "-left-1.5 text-white dark:text-slate-800"}`}
            viewBox="0 0 12 12" fill="currentColor">
            {isMine
              ? <path d="M0 12 L12 12 L0 0 Z" />
              : <path d="M12 12 L0 12 L12 0 Z" />
            }
          </svg>

          {/* Sender Name (group, not mine) */}
          {showSender && isGroup && !isMine && (
            <p className={`text-[11px] font-semibold mb-0.5 ${senderColor}`}>{msg.sender.name}</p>
          )}

          {/* Reply Preview */}
          {msg.replyTo && (
            <div className={`mb-1.5 pl-2 border-l-2 rounded-sm py-1 text-[11px] leading-tight ${
              isMine ? "border-blue-300 bg-blue-500/30" : "border-blue-400 bg-blue-50 dark:bg-blue-500/10"
            }`}>
              <p className={`font-semibold ${isMine ? "text-blue-200" : "text-blue-600 dark:text-blue-400"}`}>{msg.replyTo.sender.name}</p>
              <p className={`truncate ${isMine ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>{msg.replyTo.content || "📎 Attachment"}</p>
            </div>
          )}

          {/* Image Grid */}
          {images.length > 0 && (
            <div className={`mb-1.5 rounded-lg overflow-hidden ${images.length === 1 ? "" : "grid gap-0.5"}`}
              style={images.length === 2 ? { gridTemplateColumns: "1fr 1fr" } : images.length === 3 ? { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" } : images.length >= 4 ? { gridTemplateColumns: "1fr 1fr" } : {}}>
              {images.slice(0, 4).map((img, i) => (
                <button key={i} onClick={() => onImageClick(img.url, images.map(x => x.url))}
                  className={`relative overflow-hidden ${images.length === 1 ? "max-w-[280px] rounded-lg" : "aspect-square"} ${images.length === 3 && i === 0 ? "row-span-2" : ""}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" loading="lazy" />
                  {i === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">+{images.length - 4}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Text Content */}
          {msg.content && (
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
          )}

          {/* File Attachments */}
          {files.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {files.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isMine ? "bg-blue-500/30 hover:bg-blue-500/40 text-white" : "bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}>
                  {f.type === "video" ? <Film className="h-3.5 w-3.5 shrink-0" /> : <FileText className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate flex-1">{f.name}</span>
                  <Download className="h-3 w-3 shrink-0 opacity-60" />
                </a>
              ))}
            </div>
          )}

          {/* Timestamp + Edited + Read */}
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
            {msg.editedAt && <span className={`text-[9px] italic ${isMine ? "text-blue-300" : "text-slate-400"}`}>edited</span>}
            <span className={`text-[10px] ${isMine ? "text-blue-200" : "text-slate-400"}`}>{fmtTime(msg.createdAt)}</span>
            {isMine && <Check className={`h-3 w-3 ${isMine ? "text-blue-300" : "text-slate-400"}`} />}
          </div>
        </div>

        {/* Hover Actions (desktop) */}
        <div className={`absolute top-1 ${isMine ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} hidden group-hover:flex items-center gap-0.5 z-10`}>
          <button onClick={() => onReply(msg)} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Reply">
            <Reply className="h-3.5 w-3.5 text-slate-500" />
          </button>
          {isMine && canEdit(msg) && (
            <button onClick={() => onEdit(msg)} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Edit">
              <Pencil className="h-3.5 w-3.5 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Context Menu (long-press / right-click) */}
      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute z-50 ${isMine ? "right-4" : "left-4"} top-0 mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 py-1.5 min-w-[160px]`}>
              {[
                { icon: Reply, label: "Reply", action: () => { onReply(msg); setShowMenu(false) }, show: true },
                { icon: copied ? Check : Copy, label: copied ? "Copied!" : "Copy", action: handleCopy, show: !!msg.content },
                { icon: Pencil, label: "Edit", action: () => { onEdit(msg); setShowMenu(false) }, show: isMine && canEdit(msg) },
                { icon: Trash2, label: "Delete", action: () => { if (confirm("Delete this message?")) { onDelete(msg.id); setShowMenu(false) } }, show: isMine, danger: true },
              ].filter(a => a.show).map((action, i) => (
                <button key={i} onClick={action.action}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors ${
                    (action as any).danger ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}>
                  <action.icon className="h-3.5 w-3.5" /> {action.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
