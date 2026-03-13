"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Image as ImageIcon, X, Loader2, Smile, Reply } from "lucide-react"
import type { ChatMessage } from "./use-messages"

const EMOJI_LIST = ["😀","😂","❤️","👍","🎉","🔥","✅","⭐","💡","🏠","🪟","🚪","📐","🔨","📦","💰","📋","🙏","👋","😊","🤔","😎","💪","🎯","🛠️","📸","👏","🤝","💬","📌"]

interface Props {
  onSend: (content: string, files?: File[]) => void
  sending: boolean
  replyTo: ChatMessage | null
  onCancelReply: () => void
  editingMsg: ChatMessage | null
  onEdit: (msgId: string, content: string) => void
  onCancelEdit: () => void
}

export default function MessageComposer({ onSend, sending, replyTo, onCancelReply, editingMsg, onEdit, onCancelEdit }: Props) {
  const [draft, setDraft] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [showEmoji, setShowEmoji] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Auto-focus and prefill when editing
  useEffect(() => {
    if (editingMsg) {
      setDraft(editingMsg.content)
      textRef.current?.focus()
    }
  }, [editingMsg])

  // Auto-focus when replying
  useEffect(() => {
    if (replyTo) textRef.current?.focus()
  }, [replyTo])

  // Generate previews for image files
  useEffect(() => {
    const urls = files.filter(f => f.type.startsWith("image/")).map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [files])

  const handleFiles = (newFiles: FileList | File[]) => {
    setFiles(prev => [...prev, ...Array.from(newFiles)])
  }
  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSend = () => {
    if (editingMsg) {
      if (draft.trim()) onEdit(editingMsg.id, draft.trim())
      setDraft("")
      return
    }
    if (!draft.trim() && files.length === 0) return
    onSend(draft.trim(), files.length > 0 ? files : undefined)
    setDraft("")
    setFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape") {
      if (editingMsg) onCancelEdit()
      else if (replyTo) onCancelReply()
    }
  }

  // Paste image support
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    const imgFiles: File[] = []
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) imgFiles.push(file)
      }
    }
    if (imgFiles.length > 0) {
      e.preventDefault()
      handleFiles(imgFiles)
    }
  }, [])

  // Drag & drop
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }, [])

  // Auto-resize textarea
  const adjustHeight = () => {
    if (textRef.current) {
      textRef.current.style.height = "auto"
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 120) + "px"
    }
  }

  return (
    <div className="border-t border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Paperclip className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-blue-600">Drop files to attach</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply / Edit preview bar */}
      <AnimatePresence>
        {(replyTo || editingMsg) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className={`flex items-center gap-2 px-4 py-2 border-b ${editingMsg ? "border-amber-200 bg-amber-50/50 dark:bg-amber-500/5" : "border-blue-200 bg-blue-50/50 dark:bg-blue-500/5"}`}>
              <div className={`w-1 h-8 rounded-full ${editingMsg ? "bg-amber-500" : "bg-blue-500"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-semibold ${editingMsg ? "text-amber-600" : "text-blue-600"}`}>
                  {editingMsg ? "Editing message" : `Replying to ${replyTo?.sender.name}`}
                </p>
                <p className="text-xs text-slate-500 truncate">{editingMsg?.content || replyTo?.content || "📎 Attachment"}</p>
              </div>
              <button onClick={editingMsg ? onCancelEdit : onCancelReply} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto">
          {files.map((f, i) => (
            <div key={i} className="relative shrink-0 group">
              {f.type.startsWith("image/") ? (
                <img src={previews[files.filter(x => x.type.startsWith("image/")).indexOf(f)] || ""} alt=""
                  className="h-16 w-16 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
                  <Paperclip className="h-4 w-4 text-slate-400 mb-0.5" />
                  <span className="text-[8px] text-slate-400 truncate w-14 text-center">{f.name.slice(0, 10)}</span>
                </div>
              )}
              <button onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 p-3">
        {/* Emoji button */}
        <div className="relative">
          <button onClick={() => setShowEmoji(!showEmoji)}
            className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
            <Smile className="h-5 w-5" />
          </button>
          <AnimatePresence>
            {showEmoji && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-12 left-0 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 w-[240px]">
                  <div className="grid grid-cols-6 gap-1">
                    {EMOJI_LIST.map(e => (
                      <button key={e} onClick={() => { setDraft(d => d + e); setShowEmoji(false); textRef.current?.focus() }}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-base transition-colors">
                        {e}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Attachment button */}
        <button onClick={() => fileRef.current?.click()}
          className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <Paperclip className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" className="hidden"
          onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = "" }} />

        {/* Text input */}
        <textarea ref={textRef} value={draft}
          onChange={e => { setDraft(e.target.value); adjustHeight() }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 max-h-[120px] min-h-[42px]"
          style={{ height: "42px" }}
        />

        {/* Send button */}
        <motion.button onClick={handleSend}
          disabled={(!draft.trim() && files.length === 0) || sending}
          whileTap={{ scale: 0.92 }}
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            draft.trim() || files.length > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
              : "bg-slate-100 dark:bg-white/5 text-slate-400"
          } disabled:opacity-40`}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </motion.button>
      </div>
    </div>
  )
}
