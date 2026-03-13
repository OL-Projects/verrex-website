import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"
import { verifyAccess } from "../route"

// ─── GET /api/portal/my-projects/[id]/tasks ─────────────
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params

  const hasAccess = await verifyAccess(id, session.user.id, session.user.role || "")
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const tasks = await prisma.projectTask.findMany({
    where: { projectId: id },
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(tasks)
}

// ─── POST — admins only can create tasks ────────────────
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const role = session.user.role || ""
  if (role !== "admin") {
    return NextResponse.json({ error: "Only admins can create tasks" }, { status: 403 })
  }
  const { id } = await params

  const { title, description, priority, category, dueDate, assigneeId } = await req.json()
  if (!title) return NextResponse.json({ error: "Task title is required" }, { status: 400 })

  const task = await prisma.projectTask.create({
    data: {
      title, description: description || null,
      priority: priority || "medium", category: category || "other",
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      projectId: id,
    },
    include: { assignee: { select: { id: true, name: true } } },
  })

  await prisma.projectActivity.create({
    data: { type: "task_created", content: `Task created: "${title}"`, authorId: session.user.id, projectId: id },
  })

  return NextResponse.json(task, { status: 201 })
}

// ─── PATCH — admins + contractors can toggle tasks ──────
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const role = session.user.role || ""
  if (!["admin", "contractor"].includes(role)) {
    return NextResponse.json({ error: "Only admins and contractors can update tasks" }, { status: 403 })
  }
  const { id } = await params

  const hasAccess = await verifyAccess(id, session.user.id, role)
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { taskId, status, title, priority, assigneeId } = await req.json()
  if (!taskId) return NextResponse.json({ error: "Task ID is required" }, { status: 400 })

  const updateData: Record<string, unknown> = {}
  if (status) updateData.status = status
  if (title) updateData.title = title
  if (priority) updateData.priority = priority
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null
  if (status === "done") updateData.completedAt = new Date()
  if (status === "todo" || status === "in_progress") updateData.completedAt = null

  const task = await prisma.projectTask.update({
    where: { id: taskId },
    data: updateData,
    include: { assignee: { select: { id: true, name: true } } },
  })

  if (status === "done") {
    await prisma.projectActivity.create({
      data: { type: "task_completed", content: `Task completed: "${task.title}"`, authorId: session.user.id, projectId: id },
    })
  }

  return NextResponse.json(task)
}
