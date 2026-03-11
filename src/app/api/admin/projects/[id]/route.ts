import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, company: true, address: true, city: true } },
      teamMembers: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { activities: true, tasks: true, attachments: true, appointments: true, invoices: true } },
    },
  })

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()

  const { title, description, status, type, address, city, postalCode, totalValue, notes, progress, priority, coverPhotoUrl, startDate, endDate } = body

  // Track status changes for activity timeline
  if (status) {
    const current = await prisma.project.findUnique({ where: { id }, select: { status: true } })
    if (current && current.status !== status) {
      await prisma.projectActivity.create({
        data: {
          type: "status_change",
          content: `Status changed from "${current.status}" to "${status}"`,
          metadata: JSON.stringify({ oldStatus: current.status, newStatus: status }),
          authorId: session.user.id,
          projectId: id,
        },
      })
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(type !== undefined && { type }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(postalCode !== undefined && { postalCode }),
      ...(totalValue !== undefined && { totalValue: parseFloat(totalValue) }),
      ...(notes !== undefined && { notes }),
      ...(progress !== undefined && { progress: parseInt(progress) }),
      ...(priority !== undefined && { priority }),
      ...(coverPhotoUrl !== undefined && { coverPhotoUrl }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
  })

  return NextResponse.json(project)
}
