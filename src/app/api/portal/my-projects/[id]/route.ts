import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// ─── Shared: Verify user can access this project ────────
async function verifyAccess(projectId: string, userId: string, userRole: string) {
  // Admins can access everything
  if (userRole === "admin") return true

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      clientId: true,
      teamMembers: { select: { userId: true } },
    },
  })
  if (!project) return false

  // Client owns the project
  if (project.clientId === userId) return true

  // User is a team member (contractor, inspector, etc.)
  if (project.teamMembers.some(tm => tm.userId === userId)) return true

  return false
}

export { verifyAccess }

// ─── GET /api/portal/my-projects/[id] ───────────────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params

  const hasAccess = await verifyAccess(id, session.user.id, session.user.role || "")
  if (!hasAccess) {
    return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 })
  }

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
