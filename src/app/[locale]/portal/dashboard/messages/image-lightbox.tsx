"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react"

interface Props { url: string; allUrls: string[]; onClose: () => void }

export default function ImageLightbox({ url, allUrls, onClose }: Props) {
  const [idx, setIdx] = useState(allUrls.indexOf(url))
  const src = allUrls[idx] || url
  const hasPrev = idx > 0
  const hasNext = idx < allUrls.length - 1

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <a href={src} download target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
          <Download className="h-5 w-5" />
        </a>
        <button onClick={onClose} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      {allUrls.length > 1 && (
        <p className="absolute top-4 left-4 text-white/60 text-sm font-medium">{idx + 1} / {allUrls.length}</p>
      )}
      {hasPrev && <button onClick={e => { e.stopPropagation(); setIdx(i => i - 1) }}
        className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
        <ChevronLeft className="h-6 w-6" />
      </button>}
      {hasNext && <button onClick={e => { e.stopPropagation(); setIdx(i => i + 1) }}
        className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10">
        <ChevronRight className="h-6 w-6" />
      </button>}
      <img src={src} alt="" onClick={e => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" />
    </motion.div>
  )
}
