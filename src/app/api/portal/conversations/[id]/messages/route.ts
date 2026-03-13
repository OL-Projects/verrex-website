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

  // Enrich with reply-to info
  const replyIds = messages.filter(m => m.replyToId).map(m => m.replyToId!)
  const replyMsgs = replyIds.length > 0
    ? await prisma.message.findMany({ where: { id: { in: replyIds } }, include: { sender: { select: { name: true } } } })
    : []
  const replyMap = new Map(replyMsgs.map(m => [m.id, { id: m.id, content: m.content, sender: { name: m.sender.name } }]))
  const enriched = messages.map(m => ({ ...m, replyTo: m.replyToId ? replyMap.get(m.replyToId) || null : null }))

  // Mark as read
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId } },
    data: { lastReadAt: new Date() },
  })

  return NextResponse.json(enriched.reverse())
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
  const { content, attachmentUrls, replyToId } = body as { content: string; attachmentUrls?: string[]; replyToId?: string }

  if (!content?.trim() && !attachmentUrls?.length) {
    return NextResponse.json({ error: "Content or attachments required" }, { status: 400 })
  }

  const message = await prisma.message.create({
    data: {
      content: content?.trim() || "",
      attachmentUrls: attachmentUrls?.length ? JSON.stringify(attachmentUrls) : null,
      conversationId: id,
      senderId: userId,
      ...(replyToId ? { replyToId } : {}),
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

// PATCH /api/portal/conversations/[id]/messages — Edit a message (own only, within 15 min)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id
  const { id } = await params

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId } },
  })
  if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

  const { messageId, content } = await req.json() as { messageId: string; content: string }
  if (!messageId || !content?.trim()) return NextResponse.json({ error: "messageId and content required" }, { status: 400 })

  const msg = await prisma.message.findUnique({ where: { id: messageId } })
  if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 })
  if (msg.senderId !== userId) return NextResponse.json({ error: "Can only edit own messages" }, { status: 403 })
  if (Date.now() - msg.createdAt.getTime() > 15 * 60 * 1000) return NextResponse.json({ error: "Edit window expired (15 min)" }, { status: 403 })

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { content: content.trim(), editedAt: new Date() },
    include: { sender: { select: { id: true, name: true, role: true } } },
  })

  return NextResponse.json(updated)
}

// DELETE /api/portal/conversations/[id]/messages — Soft-delete a message (own only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id
  const { id } = await params

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId } },
  })
  if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

  const { messageId } = await req.json() as { messageId: string }
  if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 })

  const msg = await prisma.message.findUnique({ where: { id: messageId } })
  if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 })
  if (msg.senderId !== userId) return NextResponse.json({ error: "Can only delete own messages" }, { status: 403 })

  const deleted = await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date(), content: "" },
  })

  return NextResponse.json({ success: true, id: deleted.id })
}
