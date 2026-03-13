"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface RealtimeMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  receiverId: string
  read: boolean
  createdAt: string
}

interface UseRealtimeMessagesOptions {
  /** Current user's ID */
  userId: string
  /** Partner user's ID (for 1:1 conversation) */
  partnerId?: string
  /** Called when a new message arrives */
  onNewMessage?: (message: RealtimeMessage) => void
  /** Called when typing indicator changes */
  onTypingChange?: (isTyping: boolean, userId: string) => void
}

export function useRealtimeMessages({
  userId,
  partnerId,
  onNewMessage,
  onTypingChange,
}: UseRealtimeMessagesOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  // ─── Subscribe to message channel ───
  useEffect(() => {
    if (!userId) return

    const supabase = getSupabaseBrowser()
    const channelName = partnerId
      ? `messages:${[userId, partnerId].sort().join("-")}`
      : `messages:${userId}`

    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } },
    })

    // Listen for new messages broadcast
    channel.on("broadcast", { event: "new-message" }, (payload) => {
      const msg = payload.payload as RealtimeMessage
      if (msg.senderId !== userId) {
        onNewMessage?.(msg)
      }
    })

    // Listen for typing indicators
    channel.on("broadcast", { event: "typing" }, (payload) => {
      const { userId: typingUserId, isTyping } = payload.payload as {
        userId: string
        isTyping: boolean
      }
      if (typingUserId !== userId) {
        onTypingChange?.(isTyping, typingUserId)
      }
    })

    // Presence tracking (who's online)
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState()
      const users = Object.keys(state)
      setOnlineUsers(users)
    })

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true)
        await channel.track({ user_id: userId, online_at: new Date().toISOString() })
      }
    })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, partnerId])

  // ─── Broadcast a new message to the channel ───
  const broadcastMessage = useCallback(
    (message: RealtimeMessage) => {
      if (!channelRef.current) return
      channelRef.current.send({
        type: "broadcast",
        event: "new-message",
        payload: message,
      })
    },
    []
  )

  // ─── Send typing indicator ───
  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current) return
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId, isTyping },
      })
    },
    [userId]
  )

  return {
    isConnected,
    onlineUsers,
    broadcastMessage,
    sendTypingIndicator,
  }
}
