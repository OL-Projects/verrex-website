"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

type ProjectEvent = "activity-added" | "task-updated" | "file-uploaded" | "project-updated"

interface UseRealtimeProjectOptions {
  /** Project ID to subscribe to */
  projectId: string
  /** Current user ID */
  userId: string
  /** Called when any data changes on this project */
  onDataChanged?: (event: ProjectEvent) => void
}

export function useRealtimeProject({
  projectId,
  userId,
  onDataChanged,
}: UseRealtimeProjectOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [viewers, setViewers] = useState<string[]>([])

  useEffect(() => {
    if (!projectId || !userId) return

    const supabase = getSupabaseBrowser()
    const channelName = `project:${projectId}`

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } },
    })

    // Listen for any project data changes
    channel.on("broadcast", { event: "data-changed" }, (payload) => {
      const { senderId, eventType } = payload.payload as {
        senderId: string
        eventType: ProjectEvent
      }
      // Only refresh if someone ELSE made the change (we already have local state)
      if (senderId !== userId) {
        onDataChanged?.(eventType)
      }
    })

    // Presence — see who's viewing this project
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState()
      setViewers(Object.keys(state))
    })

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true)
        await channel.track({
          user_id: userId,
          viewing_since: new Date().toISOString(),
        })
      }
    })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, userId])

  // Broadcast a change event to all other viewers
  const broadcastChange = useCallback(
    (eventType: ProjectEvent) => {
      if (!channelRef.current) return
      channelRef.current.send({
        type: "broadcast",
        event: "data-changed",
        payload: { senderId: userId, eventType },
      })
    },
    [userId]
  )

  return {
    isConnected,
    viewers,
    broadcastChange,
  }
}
