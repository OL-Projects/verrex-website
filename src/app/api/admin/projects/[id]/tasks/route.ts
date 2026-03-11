import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params

  const tasks = await prisma.projectTask.findMany({
    where: { projectId: id },
    include: { assignee: { select: { id: true, name: true } } },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(tasks)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()

  const { title, description, priority, category, dueDate, assigneeId } = body
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

  // Auto-log activity
  await prisma.projectActivity.create({
    data: { type: "task_created", content: `Task created: "${title}"`, authorId: session.user.id, projectId: id },
  })

  return NextResponse.json(task, { status: 201 })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()

  const { taskId, status, title, priority, assigneeId } = body
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

  // Auto-log completion
  if (status === "done") {
    await prisma.projectActivity.create({
      data: { type: "task_completed", content: `Task completed: "${task.title}"`, authorId: session.user.id, projectId: id },
    })
  }

  return NextResponse.json(task)
}
