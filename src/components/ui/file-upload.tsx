"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, Paperclip, X, File, Image as ImageIcon } from "lucide-react"

interface UploadedFile {
  id: string
  file: File
  preview?: string
  type: "image" | "document"
}

interface FileUploadProps {
  maxFiles?: number
  maxSizeMB?: number
  onFilesChange?: (files: File[]) => void
}

export function FileUpload({ maxFiles = 5, maxSizeMB = 10, onFilesChange }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const validFiles: UploadedFile[] = []

    for (const file of fileArray) {
      if (files.length + validFiles.length >= maxFiles) break
      if (file.size > maxSizeMB * 1024 * 1024) continue

      const isImage = file.type.startsWith("image/")
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: isImage ? "image" : "document",
      }

      if (isImage) {
        uploadedFile.preview = URL.createObjectURL(file)
      }

      validFiles.push(uploadedFile)
    }

    const updated = [...files, ...validFiles]
    setFiles(updated)
    onFilesChange?.(updated.map((f) => f.file))
  }, [files, maxFiles, maxSizeMB, onFilesChange])

  const removeFile = (id: string) => {
    const fileToRemove = files.find((f) => f.id === id)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    const updated = files.filter((f) => f.id !== id)
    setFiles(updated)
    onFilesChange?.(updated.map((f) => f.file))
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-3">
      {/* Upload Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        >
          <Camera className="h-4 w-4" />
          Add Photos
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
        >
          <Paperclip className="h-4 w-4" />
          Attach Files
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Drop Zone (shown when dragging or no files) */}
      {files.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center text-sm transition-all ${
            isDragging
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
          }`}
        >
          <p>Drag & drop files here, or use the buttons above</p>
          <p className="text-xs mt-1">Max {maxFiles} files, {maxSizeMB}MB each</p>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {files.length} of {maxFiles} files attached
            </span>
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview))
                  setFiles([])
                  onFilesChange?.([])
                }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove all
              </button>
            )}
          </div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                {f.type === "image" && f.preview ? (
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                    <img src={f.preview} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    {f.type === "image" ? (
                      <ImageIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <File className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {f.file.name}
                  </p>
                  <p className="text-xs text-slate-400">{formatSize(f.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
