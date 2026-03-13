"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reply, Pencil, Trash2, Copy, Check, CheckCheck, Ban, Download, FileText, Film, Share2, Info, SmilePlus, X } from "lucide-react"
import { type ChatMessage, type MessageReaction, type ParsedAttachment, parseAttachments, fmtTime, canEdit, ROLE_BUBBLE_COLORS } from "./use-messages"

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🙏", "🔥"]
const FULL_EMOJIS = [
  "👍","❤️","😂","😮","🙏","🔥","😢","😡","🤔","😍","🎉","✅","⭐","💡","👏","🤝","💪","😎","🎯","🛠️",
  "👋","😊","💬","📌","🏠","🪟","🚪","📐","🔨","📦","💰","📋","📸","🙌","💯","😅","🫡","🤩","👀","🫶",
]

interface Props {
  msg: ChatMessage
  isMine: boolean
  userId: string
  isGroup: boolean
  showSender: boolean
  onReply: (msg: ChatMessage) => void
  onEdit: (msg: ChatMessage) => void
  onDelete: (msgId: string) => void
  onReact: (msgId: string, emoji: string) => void
  onImageClick: (url: string, allUrls: string[]) => void
}

/* ── WhatsApp-style read receipt icon ── */
function ReadReceipt({ isMine }: { isMine: boolean }) {
  if (!isMine) return null
  // For now: double-check = delivered. Blue = read (we can enhance with real read tracking later)
  return <CheckCheck className="h-[14px] w-[14px] text-blue-300 shrink-0" />
}

export default function MessageBubble({ msg, isMine, userId, isGroup, showSender, onReply, onEdit, onDelete, onReact, onImageClick }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFullEmojis, setShowFullEmojis] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const longPressRef = useRef<NodeJS.Timeout | null>(null)
  const attachments = parseAttachments(msg.attachmentUrls)
  const images = attachments.filter(a => a.type === "image")
  const files = attachments.filter(a => a.type !== "image")
  const isDeleted = !!msg.deletedAt
  const senderColor = ROLE_BUBBLE_COLORS[msg.sender.role] || "text-slate-600"
  // Avatar helper
  const senderAvatar = msg.sender.image
  const senderInitial = msg.sender.name?.charAt(0)?.toUpperCase() || "?"

  const hasOnlyImages = images.length > 0 && !msg.content && files.length === 0

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => { setCopied(false); setShowMenu(false) }, 1200)
  }

  const handleShare = async () => {
    setShowMenu(false)
    const shareData: ShareData = { text: msg.content || undefined }
    if (images.length > 0) shareData.url = images[0].url
    if (navigator.share) { try { await navigator.share(shareData) } catch {} }
    else { navigator.clipboard.writeText(msg.content || images[0]?.url || ""); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  }

  // Group reactions by emoji
  const reactionGroups = (msg.reactions || []).reduce<Record<string, { emoji: string; users: { id: string; name: string }[]; myReaction: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, users: [], myReaction: false }
    acc[r.emoji].users.push(r.user)
    if (r.userId === userId) acc[r.emoji].myReaction = true
    return acc
  }, {})
  const reactionList = Object.values(reactionGroups)

  const handleLongPressStart = () => {
    longPressRef.current = setTimeout(() => setShowMenu(true), 500)
  }
  const handleLongPressEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
  }

  // ── Deleted message ──
  if (isDeleted) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-2`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-dashed border-slate-200/60 dark:border-white/10">
          <Ban className="h-3 w-3 text-slate-300" />
          <span className="text-[11px] italic text-slate-400">This message was deleted</span>
        </div>
      </div>
    )
  }

  // ── Timestamp + status footer (inline, WhatsApp-style) ──
  const timeFooter = (
    <span className={`inline-flex items-center gap-1 ml-2 float-right translate-y-[3px] select-none ${isMine ? "text-blue-200/70" : "text-slate-400/70"}`}>
      {msg.editedAt && <span className="text-[9px] italic mr-0.5">edited</span>}
      <span className="text-[10px] leading-none">{fmtTime(msg.createdAt)}</span>
      <ReadReceipt isMine={isMine} />
    </span>
  )

  // ── Image-only message (frameless, WhatsApp style) ──
  if (hasOnlyImages) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-2 group relative`}>
        <div className={`relative max-w-[320px] ${showSender && !isMine ? "mt-1" : ""}`}
          onContextMenu={e => { e.preventDefault(); setShowMenu(true) }}
          onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd}>

          {showSender && isGroup && !isMine && (
            <p className={`text-[11px] font-semibold mb-1 px-1 ${senderColor}`}>{msg.sender.name}</p>
          )}

          {/* Image(s) — clean, no frame */}
          <div className={`rounded-2xl overflow-hidden ${images.length === 1 ? "" : "grid gap-[2px]"}`}
            style={images.length === 2 ? { gridTemplateColumns: "1fr 1fr" } : images.length >= 3 ? { gridTemplateColumns: "1fr 1fr" } : {}}>
            {images.slice(0, 4).map((img, i) => (
              <button key={i} onClick={() => onImageClick(img.url, images.map(x => x.url))}
                className={`relative overflow-hidden cursor-pointer ${images.length === 1 ? "rounded-2xl" : "aspect-square"} ${images.length === 3 && i === 0 ? "row-span-2" : ""}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200" loading="lazy" />
                {i === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">+{images.length - 4}</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Floating time badge on image */}
          <div className={`absolute bottom-2 ${isMine ? "right-2" : "left-2"} flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5`}>
            <span className="text-[10px] text-white/90">{fmtTime(msg.createdAt)}</span>
            {isMine && <CheckCheck className="h-3 w-3 text-blue-300" />}
          </div>

          {/* Hover actions */}
          <HoverActions isMine={isMine} msg={msg} onReply={onReply} onEdit={onEdit} onShowEmoji={() => setShowEmojiPicker(true)} />

          {/* Reaction pills */}
          <ReactionPills reactions={reactionList} onReact={(emoji) => onReact(msg.id, emoji)} />

          {/* Emoji picker */}
          <EmojiPickerPopover show={showEmojiPicker} showFull={showFullEmojis} isMine={isMine}
            onPick={(e) => { onReact(msg.id, e); setShowEmojiPicker(false); setShowFullEmojis(false) }}
            onToggleFull={() => setShowFullEmojis(!showFullEmojis)}
            onClose={() => { setShowEmojiPicker(false); setShowFullEmojis(false) }} />
        </div>
        <ContextMenu show={showMenu} isMine={isMine} msg={msg} copied={copied}
          onCopy={handleCopy} onReply={onReply} onEdit={onEdit} onDelete={onDelete}
          onShare={handleShare} onInfo={() => { setShowMenu(false); setShowInfo(true) }}
          onReact={() => { setShowMenu(false); setShowEmojiPicker(true) }}
          onClose={() => setShowMenu(false)} />
      </div>
    )
  }

  // ── Standard message bubble ──
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-2 group relative`}>
      <div
        className={`relative max-w-[80%] sm:max-w-[70%] ${showSender && !isMine ? "mt-1" : ""}`}
        onContextMenu={e => { e.preventDefault(); setShowMenu(true) }}
        onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd}
      >
        <div className={`relative px-3 py-[7px] ${
          isMine
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm shadow-sm shadow-blue-500/10"
            : "bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-white/[0.06]"
        }`}>

          {/* Sender name */}
          {showSender && isGroup && !isMine && (
            <p className={`text-[11px] font-semibold mb-0.5 ${senderColor}`}>{msg.sender.name}</p>
          )}

          {/* Reply preview */}
          {msg.replyTo && (
            <div className={`mb-1.5 pl-2.5 border-l-[3px] rounded-r-lg py-1.5 px-2 text-[11px] leading-snug ${
              isMine ? "border-white/40 bg-white/10" : "border-blue-400 bg-blue-50/80 dark:bg-blue-500/10"
            }`}>
              <p className={`font-semibold ${isMine ? "text-white/90" : "text-blue-600 dark:text-blue-400"}`}>{msg.replyTo.sender.name}</p>
              <p className={`truncate mt-0.5 ${isMine ? "text-white/60" : "text-slate-500 dark:text-slate-400"}`}>{msg.replyTo.content || "📎 Attachment"}</p>
            </div>
          )}

          {/* Images (with text) — clean rounded */}
          {images.length > 0 && (
            <div className={`mb-2 rounded-xl overflow-hidden ${images.length === 1 ? "" : "grid gap-[2px]"}`}
              style={images.length === 2 ? { gridTemplateColumns: "1fr 1fr" } : images.length >= 3 ? { gridTemplateColumns: "1fr 1fr" } : {}}>
              {images.slice(0, 4).map((img, i) => (
                <button key={i} onClick={() => onImageClick(img.url, images.map(x => x.url))}
                  className={`relative overflow-hidden cursor-pointer ${images.length === 1 ? "max-w-[300px] rounded-xl" : "aspect-square"} ${images.length === 3 && i === 0 ? "row-span-2" : ""}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-200" loading="lazy" />
                  {i === 3 && images.length > 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">+{images.length - 4}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Text content + inline time */}
          {msg.content ? (
            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">
              {msg.content}
              {/* Invisible spacer for time footer */}
              <span className="inline-block w-[70px]" />
            </p>
          ) : (
            <span className="inline-block w-[60px]" />
          )}

          {/* File attachments — slim pills (open in preview panel) */}
          {files.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {files.map((f, i) => (
                <button key={i} onClick={() => onImageClick(f.url, [f.url])}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isMine
                      ? "bg-white/10 hover:bg-white/15 text-white"
                      : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
                  }`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isMine ? "bg-white/15" : "bg-blue-50 dark:bg-blue-500/10"
                  }`}>
                    {f.type === "video" ? <Film className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <span className="truncate flex-1 text-[12px]">{f.name}</span>
                  <Download className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Floating time + status (absolute bottom-right, WhatsApp style) */}
          <div className={`absolute bottom-[5px] right-3 flex items-center gap-1 select-none`}>
            {msg.editedAt && <span className={`text-[9px] italic ${isMine ? "text-blue-200/60" : "text-slate-400/60"}`}>edited</span>}
            <span className={`text-[10px] leading-none ${isMine ? "text-blue-200/70" : "text-slate-400/60"}`}>{fmtTime(msg.createdAt)}</span>
            <ReadReceipt isMine={isMine} />
          </div>
        </div>

        {/* Hover actions */}
        <HoverActions isMine={isMine} msg={msg} onReply={onReply} onEdit={onEdit} onShowEmoji={() => setShowEmojiPicker(true)} />

        {/* Reaction pills */}
        <ReactionPills reactions={reactionList} onReact={(emoji) => onReact(msg.id, emoji)} />

        {/* Emoji picker popover */}
        <EmojiPickerPopover show={showEmojiPicker} showFull={showFullEmojis} isMine={isMine}
          onPick={(e) => { onReact(msg.id, e); setShowEmojiPicker(false); setShowFullEmojis(false) }}
          onToggleFull={() => setShowFullEmojis(!showFullEmojis)}
          onClose={() => { setShowEmojiPicker(false); setShowFullEmojis(false) }} />
      </div>

      <ContextMenu show={showMenu} isMine={isMine} msg={msg} copied={copied}
        onCopy={handleCopy} onReply={onReply} onEdit={onEdit} onDelete={onDelete}
        onShare={handleShare} onInfo={() => { setShowMenu(false); setShowInfo(true) }}
        onReact={() => { setShowMenu(false); setShowEmojiPicker(true) }}
        onClose={() => setShowMenu(false)} />

      {/* Message Info Sheet */}
      <AnimatePresence>
        {showInfo && (
          <>
            <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowInfo(false)} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className={`absolute z-50 ${isMine ? "right-0" : "left-0"} top-0 mt-10 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden`}
              onClick={e => e.stopPropagation()}>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Message Info</h4>
                <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-4 space-y-3">
                <div><p className="text-[10px] font-medium text-slate-400 uppercase">From</p><p className="text-sm text-slate-700 dark:text-slate-300">{msg.sender.name} <span className="text-slate-400">({msg.sender.role})</span></p></div>
                <div><p className="text-[10px] font-medium text-slate-400 uppercase">Sent</p><p className="text-sm text-slate-700 dark:text-slate-300">{new Date(msg.createdAt).toLocaleString()}</p></div>
                {msg.editedAt && <div><p className="text-[10px] font-medium text-slate-400 uppercase">Edited</p><p className="text-sm text-slate-700 dark:text-slate-300">{new Date(msg.editedAt).toLocaleString()}</p></div>}
                {reactionList.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase mb-2">Reactions</p>
                    <div className="space-y-1.5">
                      {reactionList.map(r => (
                        <div key={r.emoji} className="flex items-center gap-2">
                          <span className="text-lg">{r.emoji}</span>
                          <span className="text-xs text-slate-600 dark:text-slate-400">{r.users.map(u => u.name).join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {reactionList.length === 0 && <p className="text-xs text-slate-400 italic">No reactions yet</p>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Reaction Pills (below bubble) ── */
function ReactionPills({ reactions, onReact }: { reactions: { emoji: string; users: { id: string; name: string }[]; myReaction: boolean }[]; onReact: (emoji: string) => void }) {
  if (reactions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1 px-1">
      {reactions.map(r => (
        <button key={r.emoji} onClick={() => onReact(r.emoji)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
            r.myReaction
              ? "bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-500/40 shadow-sm"
              : "bg-slate-100 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/15"
          }`}>
          <span className="text-sm">{r.emoji}</span>
          <span className={`text-[10px] font-medium ${r.myReaction ? "text-blue-700 dark:text-blue-400" : "text-slate-500"}`}>{r.users.length}</span>
        </button>
      ))}
    </div>
  )
}

/* ── Hover action buttons ── */
function HoverActions({ isMine, msg, onReply, onEdit, onShowEmoji }: {
  isMine: boolean; msg: ChatMessage; onReply: (m: ChatMessage) => void; onEdit: (m: ChatMessage) => void; onShowEmoji: () => void
}) {
  return (
    <div className={`absolute top-1 ${isMine ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} hidden group-hover:flex items-center gap-0.5 z-10`}>
      <button onClick={onShowEmoji} className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105" title="React">
        <SmilePlus className="h-3.5 w-3.5 text-slate-500" />
      </button>
      <button onClick={() => onReply(msg)} className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105" title="Reply">
        <Reply className="h-3.5 w-3.5 text-slate-500" />
      </button>
      {isMine && canEdit(msg) && (
        <button onClick={() => onEdit(msg)} className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/10 shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105" title="Edit">
          <Pencil className="h-3.5 w-3.5 text-slate-500" />
        </button>
      )}
    </div>
  )
}

/* ── Emoji Picker Popover (quick + full grid) ── */
function EmojiPickerPopover({ show, showFull, isMine, onPick, onToggleFull, onClose }: {
  show: boolean; showFull: boolean; isMine: boolean
  onPick: (emoji: string) => void; onToggleFull: () => void; onClose: () => void
}) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-50 ${isMine ? "right-0" : "left-0"} -bottom-2 translate-y-full bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-white/10 ${
              showFull ? "rounded-2xl p-2 w-[280px]" : "rounded-full px-1.5 py-1"
            }`}>
            {showFull ? (
              <div className="grid grid-cols-8 gap-0.5 max-h-[200px] overflow-y-auto">
                {FULL_EMOJIS.map(e => (
                  <button key={e} onClick={() => onPick(e)}
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-lg transition-transform hover:scale-110">{e}</button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-0.5">
                {QUICK_EMOJIS.map(e => (
                  <button key={e} onClick={() => onPick(e)}
                    className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-lg transition-transform hover:scale-125">{e}</button>
                ))}
                <button onClick={onToggleFull}
                  className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-sm text-slate-400 font-bold transition-transform hover:scale-110" title="More emojis">
                  <SmilePlus className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Context menu (right-click / long-press) ── */
function ContextMenu({ show, isMine, msg, copied, onCopy, onReply, onEdit, onDelete, onShare, onInfo, onReact, onClose }: {
  show: boolean; isMine: boolean; msg: ChatMessage; copied: boolean
  onCopy: () => void; onReply: (m: ChatMessage) => void; onEdit: (m: ChatMessage) => void; onDelete: (id: string) => void
  onShare: () => void; onInfo: () => void; onReact: () => void; onClose: () => void
}) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <div className="fixed inset-0 z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 ${isMine ? "right-4" : "left-4"} top-0 mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden`}>
            {/* Quick emoji row */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-slate-100 dark:border-white/5">
              {QUICK_EMOJIS.map(e => (
                <button key={e} onClick={() => { onReact(); }} className="h-7 w-7 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-base transition-transform hover:scale-125">{e}</button>
              ))}
            </div>
            {/* Action items */}
            <div className="py-1 min-w-[180px]">
              {[
                { icon: SmilePlus, label: "React", action: onReact, show: true },
                { icon: Reply, label: "Reply", action: () => { onReply(msg); onClose() }, show: true },
                { icon: copied ? Check : Copy, label: copied ? "Copied!" : "Copy", action: onCopy, show: !!msg.content },
                { icon: Share2, label: "Share", action: onShare, show: true },
                { icon: Info, label: "Info", action: onInfo, show: true },
                { icon: Pencil, label: `Edit (5 min)`, action: () => { onEdit(msg); onClose() }, show: isMine && canEdit(msg) },
                { icon: Trash2, label: "Delete", action: () => { if (confirm("Delete this message?")) { onDelete(msg.id); onClose() } }, show: isMine, danger: true },
              ].filter(a => a.show).map((action, i) => (
                <button key={i} onClick={action.action}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-[12px] font-medium transition-colors ${
                    (action as any).danger ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}>
                  <action.icon className="h-4 w-4" /> {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
