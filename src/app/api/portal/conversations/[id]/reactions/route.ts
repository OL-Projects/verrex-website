import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// POST: Toggle a reaction (add or remove)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id: conversationId } = await params
  const { messageId, emoji } = await req.json()
  if (!messageId || !emoji) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const userId = session.user.id

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })
  if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 })

  // Toggle: if exists remove, else add
  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
  })

  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } })
    return NextResponse.json({ action: "removed", emoji })
  } else {
    const reaction = await prisma.messageReaction.create({
      data: { messageId, userId, emoji },
      include: { user: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ action: "added", reaction })
  }
}

// GET: Get all reactions for a message
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const messageId = req.nextUrl.searchParams.get("messageId")
  if (!messageId) return NextResponse.json({ error: "Missing messageId" }, { status: 400 })

  const reactions = await prisma.messageReaction.findMany({
    where: { messageId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(reactions)
}
