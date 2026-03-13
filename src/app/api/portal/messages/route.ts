import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Fetch all threads (conversations) for current user
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id!

  try {
    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Group into threads by the "other person"
    const threadMap = new Map<string, {
      partnerId: string; partnerName: string; partnerRole: string
      messages: typeof messages; lastMessage: string; lastAt: Date; unread: number
    }>()

    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender
      const existing = threadMap.get(partner.id)
      if (existing) {
        existing.messages.push(msg)
        if (!msg.read && msg.receiverId === userId) existing.unread++
      } else {
        threadMap.set(partner.id, {
          partnerId: partner.id,
          partnerName: partner.name || "Unknown",
          partnerRole: partner.role,
          messages: [msg],
          lastMessage: msg.content,
          lastAt: msg.createdAt,
          unread: (!msg.read && msg.receiverId === userId) ? 1 : 0,
        })
      }
    }

    const threads = Array.from(threadMap.values()).map(t => ({
      id: `thread_${t.partnerId}`,
      partnerId: t.partnerId,
      partnerName: t.partnerName,
      partnerRole: t.partnerRole,
      lastMessage: t.lastMessage,
      lastAt: t.lastAt.toISOString(),
      unreadCount: t.unread,
      messageCount: t.messages.length,
    }))

    return NextResponse.json({ threads, totalMessages: messages.length })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 })
  }
}

// POST: Send a new message
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { receiverId, content } = body as { receiverId: string; content: string }

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "receiverId and content required" }, { status: 400 })
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, name: true } })
    if (!receiver) return NextResponse.json({ error: "Recipient not found" }, { status: 404 })

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id!,
        receiverId,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    })

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: message.sender.name,
        senderRole: message.sender.role,
        receiverId: message.receiverId,
        receiverName: message.receiver.name,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send" }, { status: 500 })
  }
}
