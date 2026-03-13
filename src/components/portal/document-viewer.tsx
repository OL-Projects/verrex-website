"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, FileText, Receipt, ClipboardSignature, Clock, CheckCircle2, AlertCircle, Download, ExternalLink, User, Calendar, Building2, Eye } from "lucide-react"
import type { ClientDocument } from "@/hooks/useClientDocuments"

const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string; bg: string }> = {
  invoice: { icon: Receipt, color: "text-blue-600", label: "Invoice", bg: "bg-blue-100" },
  contract: { icon: ClipboardSignature, color: "text-purple-600", label: "Contract", bg: "bg-purple-100" },
  estimation: { icon: FileText, color: "text-indigo-600", label: "Estimate", bg: "bg-indigo-100" },
}

const statusConfig: Record<string, { color: string; label: string; icon: typeof Clock }> = {
  sent: { color: "bg-blue-100 text-blue-700", label: "New — Pending Review", icon: Clock },
  viewed: { color: "bg-slate-100 text-slate-600", label: "Viewed", icon: Eye },
  signed: { color: "bg-green-100 text-green-700", label: "Signed", icon: CheckCircle2 },
  accepted: { color: "bg-green-100 text-green-700", label: "Accepted", icon: CheckCircle2 },
  rejected: { color: "bg-red-100 text-red-700", label: "Declined", icon: AlertCircle },
}

interface Props {
  doc: ClientDocument
  onBack: () => void
  onAccept?: () => void
  onReject?: () => void
  onRequestRevision?: () => void
  onSign?: () => void
}

export default function DocumentViewer({ doc, onBack, onAccept, onReject, onRequestRevision, onSign }: Props) {
  const typeCfg = typeConfig[doc.type] || typeConfig.estimation
  const stCfg = statusConfig[doc.status] || statusConfig.sent
  const TypeIcon = typeCfg.icon
  const StatusIcon = stCfg.icon
  const isRealFile = doc.fileUrl && !doc.fileUrl.startsWith("/api/portal/")
  const isPdf = doc.fileUrl?.toLowerCase().endsWith(".pdf")
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.fileUrl || "")

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-slate-900">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          {doc.status === "sent" && onRequestRevision && (
            <button onClick={onRequestRevision}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors">
              <AlertCircle className="w-3.5 h-3.5" /> Request Changes
            </button>
          )}
          {doc.status === "sent" && doc.type === "contract" && onSign && (
            <button onClick={onSign}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <ClipboardSignature className="w-3.5 h-3.5" /> Sign
            </button>
          )}
          {doc.status === "sent" && doc.type === "estimation" && onAccept && (
            <button onClick={onAccept}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Accept
            </button>
          )}
          {isRealFile && (
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Document Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            {/* Gradient header */}
            <div className={`p-6 ${
              doc.type === "invoice" ? "bg-gradient-to-r from-blue-600 to-blue-700"
              : doc.type === "contract" ? "bg-gradient-to-r from-purple-600 to-purple-700"
              : "bg-gradient-to-r from-indigo-600 to-indigo-700"
            } text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TypeIcon className="h-5 w-5 text-white/80" />
                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{typeCfg.label}</span>
                  </div>
                  <h2 className="text-xl font-bold">{doc.title}</h2>
                  {doc.description && <p className="text-sm text-white/80 mt-1">{doc.description}</p>}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-white/20 text-white`}>
                    <StatusIcon className="h-3 w-3" /> {stCfg.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Document details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Sent By</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.sender.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{doc.sender.role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Date Sent</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(doc.createdAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(doc.createdAt).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>

              {doc.project && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Project</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.project.title}</p>
                  </div>
                </div>
              )}

              {/* Read status */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs">
                  {doc.readAt ? (
                    <><Eye className="h-3.5 w-3.5 text-green-500" /><span className="text-slate-500">Viewed on {new Date(doc.readAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}</span></>
                  ) : (
                    <><Clock className="h-3.5 w-3.5 text-blue-500" /><span className="text-blue-600 font-medium">Unread — First time viewing</span></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* File Preview Area */}
          {isRealFile && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Document Preview</h3>
              </div>
              {isPdf ? (
                <iframe src={doc.fileUrl} className="w-full h-[600px]" title={doc.title} />
              ) : isImage ? (
                <div className="p-4">
                  <img src={doc.fileUrl} alt={doc.title} className="max-w-full rounded-lg mx-auto" />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm text-slate-500 mb-3">Preview not available for this file type</p>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                    <ExternalLink className="h-4 w-4" /> Open File
                  </a>
                </div>
              )}
            </div>
          )}

          {/* No file - info card */}
          {!isRealFile && (
            <div className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/10 p-8 text-center">
              <div className={`h-16 w-16 rounded-2xl ${typeCfg.bg} flex items-center justify-center mx-auto mb-4`}>
                <TypeIcon className={`h-8 w-8 ${typeCfg.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {typeCfg.label} Document Received
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                This {typeCfg.label.toLowerCase()} has been sent to you by {doc.sender.name}. 
                You can review the details above and take action using the buttons in the header.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
