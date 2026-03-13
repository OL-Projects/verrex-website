import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"
import { verifyAccess } from "../route"

// ─── GET /api/portal/my-projects/[id]/files ─────────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params

  const hasAccess = await verifyAccess(id, session.user.id, session.user.role || "")
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const files = await prisma.projectAttachment.findMany({
    where: { projectId: id },
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(files)
}

// ─── POST — admins + contractors can upload files ───────
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const role = session.user.role || ""
  if (!["admin", "contractor"].includes(role)) {
    return NextResponse.json({ error: "Only admins and contractors can upload files" }, { status: 403 })
  }
  const { id } = await params

  const hasAccess = await verifyAccess(id, session.user.id, role)
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { fileName, fileUrl, fileSize, fileType, category, caption } = await req.json()
  if (!fileName || !fileUrl) return NextResponse.json({ error: "fileName and fileUrl are required" }, { status: 400 })

  const attachment = await prisma.projectAttachment.create({
    data: {
      fileName, fileUrl, fileSize: fileSize || null, fileType: fileType || null,
      category: category || "photo", caption: caption || null,
      uploadedById: session.user.id, projectId: id,
    },
    include: { uploadedBy: { select: { id: true, name: true } } },
  })

  await prisma.projectActivity.create({
    data: { type: "file_uploaded", content: `File uploaded: "${fileName}"`, authorId: session.user.id, projectId: id },
  })

  return NextResponse.json(attachment, { status: 201 })
}
