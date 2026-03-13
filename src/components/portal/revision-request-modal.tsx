"use client"

import { useState } from "react"
import { X, Send } from "lucide-react"

interface RevisionRequestModalProps {
  documentType: string
  documentNumber: string
  onSubmit: (notes: string) => void
  onClose: () => void
}

export default function RevisionRequestModal({ documentType, documentNumber, onSubmit, onClose }: RevisionRequestModalProps) {
  const [notes, setNotes] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Request Revision</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Describe the changes you&apos;d like made to <strong>{documentType} {documentNumber}</strong>.
          The Verex team will review and update the document.
        </p>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          rows={5} placeholder="Please describe the changes you'd like..."
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={() => { if (notes.trim()) onSubmit(notes.trim()) }} disabled={!notes.trim()}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50">
            <Send className="w-4 h-4" /> Send Request
          </button>
        </div>
      </div>
    </div>
  )
}
