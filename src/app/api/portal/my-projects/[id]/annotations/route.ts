import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Verify the user has access to this project (client, team member, or admin)
async function verifyAccess(projectId: string, userId: string, userRole: string) {
  if (userRole === "admin") return true
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      clientId: true,
      teamMembers: { select: { userId: true } },
    },
  })
  if (!project) return false
  if (project.clientId === userId) return true
  if (project.teamMembers.some((tm) => tm.userId === userId)) return true
  return false
}

// GET — fetch all annotations for a project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const hasAccess = await verifyAccess(projectId, session.user.id, (session.user as { role: string }).role)
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const annotations = await prisma.clientAnnotation.findMany({
    where: { projectId },
    include: { author: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(annotations)
}

// POST — create a new annotation
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const hasAccess = await verifyAccess(projectId, session.user.id, (session.user as { role: string }).role)
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { activityId, position, type, content, attachmentUrls } = body

  if (!activityId || !position || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!["before", "at", "after"].includes(position)) {
    return NextResponse.json({ error: "Invalid position" }, { status: 400 })
  }
  if (!["note", "photo", "attachment"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  }

  const annotation = await prisma.clientAnnotation.create({
    data: {
      activityId,
      position,
      type,
      content: content || null,
      attachmentUrls: attachmentUrls ? JSON.stringify(attachmentUrls) : null,
      authorId: session.user.id,
      projectId,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  })

  return NextResponse.json(annotation, { status: 201 })
}

// DELETE — delete own annotation
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: projectId } = await params
  const { searchParams } = new URL(req.url)
  const annotationId = searchParams.get("annotationId")
  if (!annotationId) return NextResponse.json({ error: "Missing annotationId" }, { status: 400 })

  const annotation = await prisma.clientAnnotation.findUnique({ where: { id: annotationId } })
  if (!annotation || annotation.projectId !== projectId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  // Only author or admin can delete
  if (annotation.authorId !== session.user.id && (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.clientAnnotation.delete({ where: { id: annotationId } })
  return NextResponse.json({ success: true })
}
