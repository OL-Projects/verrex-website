import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// GET /api/portal/conversations/[id]/messages — Get messages + mark as read
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id
  const { id } = await params

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId } },
  })
  if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get("limit") || "50")
  const before = url.searchParams.get("before")

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  // Mark as read
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId } },
    data: { lastReadAt: new Date() },
  })

  return NextResponse.json(messages.reverse())
}

// POST /api/portal/conversations/[id]/messages — Send a message
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id
  const { id } = await params

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId } },
  })
  if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

  const body = await req.json()
  const { content, attachmentUrls } = body as { content: string; attachmentUrls?: string[] }

  if (!content?.trim() && !attachmentUrls?.length) {
    return NextResponse.json({ error: "Content or attachments required" }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      content: content?.trim() || "",
      attachmentUrls: attachmentUrls?.length ? JSON.stringify(attachmentUrls) : null,
      conversationId: id,
      senderId: userId,
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  })

  // Update conversation timestamp + sender's read marker
  await prisma.$transaction([
    prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
    prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: id, userId } },
      data: { lastReadAt: new Date() },
    }),
  ])

  return NextResponse.json(message)
}
