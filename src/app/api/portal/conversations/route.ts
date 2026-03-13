import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// GET /api/portal/conversations — List all conversations for current user
export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: {
        include: { user: { select: { id: true, name: true, role: true, company: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true } } },
      },
      project: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Enrich with unread counts
  const enriched = await Promise.all(
    conversations.map(async (c) => {
      const myPart = c.participants.find((p) => p.userId === userId)
      const lastRead = myPart?.lastReadAt
      const unread = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          ...(lastRead ? { createdAt: { gt: lastRead } } : {}),
        },
      })
      return {
        id: c.id,
        type: c.type,
        name: c.name,
        project: c.project,
        participants: c.participants.map((p) => ({
          id: p.userId,
          name: p.user.name,
          role: p.user.role,
          company: p.user.company,
        })),
        lastMessage: c.messages[0]
          ? {
              id: c.messages[0].id,
              content: c.messages[0].content,
              senderId: c.messages[0].senderId,
              senderName: c.messages[0].sender.name,
              createdAt: c.messages[0].createdAt,
            }
          : null,
        unreadCount: unread,
        updatedAt: c.updatedAt,
      }
    })
  )

  return NextResponse.json(enriched)
}

// POST /api/portal/conversations — Create a new conversation
export async function POST(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id

  const body = await req.json()
  const { type, name, participantIds, projectId } = body as {
    type: "direct" | "group"
    name?: string
    participantIds: string[]
    projectId?: string
  }

  if (!participantIds?.length) {
    return NextResponse.json({ error: "participantIds required" }, { status: 400 })
  }

  // For direct messages, check if conversation already exists
  if (type === "direct" && participantIds.length === 1) {
    const partnerId = participantIds[0]
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "direct",
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: partnerId } } },
        ],
      },
    })
    if (existing) {
      return NextResponse.json({ id: existing.id, existing: true })
    }
  }

  const allIds = Array.from(new Set([userId, ...participantIds]))

  const conversation = await prisma.conversation.create({
    data: {
      type: type || "direct",
      name: type === "group" ? name || "Group Chat" : null,
      projectId: projectId || null,
      participants: {
        create: allIds.map((uid) => ({
          userId: uid,
          lastReadAt: uid === userId ? new Date() : null,
        })),
      },
    },
  })

  return NextResponse.json({ id: conversation.id, existing: false })
}
