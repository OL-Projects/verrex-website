import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, requireAuth, unauthorized } from "@/lib/rbac"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params

  const activities = await prisma.projectActivity.findMany({
    where: { projectId: id },
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(activities)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()

  const { type, content, metadata, attachmentUrls } = body
  if (!type) return NextResponse.json({ error: "Activity type is required" }, { status: 400 })

  const activity = await prisma.projectActivity.create({
    data: {
      type,
      content: content || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      attachmentUrls: attachmentUrls ? JSON.stringify(attachmentUrls) : null,
      authorId: session.user.id,
      projectId: id,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  })

  return NextResponse.json(activity, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const activityId = searchParams.get("activityId")
  if (!activityId) return NextResponse.json({ error: "activityId required" }, { status: 400 })

  // Find the activity
  const activity = await prisma.projectActivity.findUnique({ where: { id: activityId } })
  if (!activity || activity.projectId !== id) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  }

  // Only author or admin can delete
  const isAuthor = activity.authorId === session.user.id
  const isAdmin = session.user.role === "admin"
  if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Delete related annotations first
  await prisma.clientAnnotation.deleteMany({ where: { activityId } })
  await prisma.projectActivity.delete({ where: { id: activityId } })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const { activityId, content, metadata } = body
  if (!activityId) return NextResponse.json({ error: "activityId required" }, { status: 400 })

  // Find the activity
  const activity = await prisma.projectActivity.findUnique({ where: { id: activityId } })
  if (!activity || activity.projectId !== id) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 })
  }

  // Only author or admin can edit
  const isAuthor = activity.authorId === session.user.id
  const isAdmin = session.user.role === "admin"
  if (!isAuthor && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.projectActivity.update({
    where: { id: activityId },
    data: {
      content: content !== undefined ? (content || null) : undefined,
      metadata: metadata !== undefined ? (metadata ? JSON.stringify(metadata) : null) : undefined,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  })

  return NextResponse.json(updated)
}
