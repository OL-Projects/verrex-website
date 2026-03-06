"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import React from "react"

export interface ToastData {
  id: string
  title: string
  description?: string
  variant?: "default" | "success" | "error"
}

interface ToastContextValue {
  toasts: ToastData[]
  toast: (opts: Omit<ToastData, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastCount = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<ToastData, "id">) => {
      const id = String(++toastCount)
      setToasts((prev) => [...prev, { id, title, description, variant }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return React.createElement(
    ToastContext.Provider,
    { value: { toasts, toast, dismiss } },
    children
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}
