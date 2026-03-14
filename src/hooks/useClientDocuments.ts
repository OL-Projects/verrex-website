"use client"

import { useState, useEffect, useCallback } from "react"

export interface ClientDocument {
  id: string
  type: string // invoice | contract | estimation
  title: string
  description: string | null
  fileUrl: string
  signedFileUrl?: string | null // URL of signed PDF with signature burned on it
  status: string // sent | viewed | signed | accepted | rejected
  readAt: string | null
  signedAt?: string | null
  createdAt: string
  updatedAt: string
  sender: { id: string; name: string; role: string; image?: string | null }
  recipient: { id: string; name: string; role: string; company?: string; image?: string | null }
  project?: { id: string; title: string } | null
}

/**
 * Hook to fetch documents from the Prisma Document API for client role.
 * Supports filtering by type (invoice / contract / estimation).
 * Provides markAsRead and polling for real-time badge updates.
 */
export function useClientDocuments(type?: string) {
  const [docs, setDocs] = useState<ClientDocument[]>([])
  const [loading, setLoading] = useState(true)
  const isBrowser = typeof window !== "undefined"

  const fetchDocs = useCallback(async () => {
    if (!isBrowser) return // SSR guard
    try {
      const params = new URLSearchParams()
      if (type) params.set("type", type)
      const res = await fetch(`/api/portal/documents?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDocs(Array.isArray(data) ? data : [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [type, isBrowser])

  useEffect(() => {
    if (!isBrowser) return // SSR guard
    fetchDocs()
    // Visibility-aware polling: skip when tab hidden, resume on focus
    const poll = () => { if (!document.hidden) fetchDocs() }
    const interval = setInterval(poll, 15000)
    const onVisibility = () => { if (!document.hidden) fetchDocs() }
    document.addEventListener("visibilitychange", onVisibility)
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVisibility) }
  }, [fetchDocs, isBrowser])

  const markAsRead = useCallback(async (docId: string) => {
    try {
      await fetch(`/api/portal/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      })
      // Optimistic update
      setDocs(prev => prev.map(d =>
        d.id === docId ? { ...d, readAt: new Date().toISOString(), status: d.status === "sent" ? "viewed" : d.status } : d
      ))
    } catch {}
  }, [])

  const unreadCount = docs.filter(d => !d.readAt).length

  return { docs, loading, unreadCount, markAsRead, refetch: fetchDocs }
}

/**
 * Hook for sidebar — fetches unread document counts by type.
 * Polls every 30 seconds. Returns { invoices, contracts, estimates } counts.
 */
export function useDocumentBadges() {
  const [badges, setBadges] = useState({ invoices: 0, contracts: 0, estimates: 0 })

  useEffect(() => {
    if (typeof window === "undefined") return // SSR guard
    let active = true
    const fetchBadges = async () => {
      try {
        const res = await fetch("/api/portal/documents")
        if (res.ok && active) {
          const docs: ClientDocument[] = await res.json()
          setBadges({
            invoices: docs.filter(d => d.type === "invoice" && !d.readAt).length,
            contracts: docs.filter(d => d.type === "contract" && !d.readAt).length,
            estimates: docs.filter(d => d.type === "estimation" && !d.readAt).length,
          })
        }
      } catch {}
    }
    fetchBadges()
    const interval = setInterval(fetchBadges, 30000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  return badges
}
