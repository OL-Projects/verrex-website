import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"

// GET /api/portal/users — Search users for recipient picker
export async function GET(req: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const userId = session.user.id
  const role = session.user.role || "client"

  const url = new URL(req.url)
  const search = url.searchParams.get("search") || ""
  const projectId = url.searchParams.get("projectId")

  const searchFilter = search
    ? { OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { company: { contains: search, mode: "insensitive" as const } },
      ] }
    : {}

  if (role === "admin") {
    // Admin sees ALL users except self
    const users = await prisma.user.findMany({
      where: { id: { not: userId }, ...searchFilter },
      select: { id: true, name: true, email: true, role: true, company: true },
      orderBy: { name: "asc" },
      take: 50,
    })
    return NextResponse.json(users)
  }

  // Non-admin: find all users related through shared projects
  const myProjectsAsClient = await prisma.project.findMany({
    where: { clientId: userId },
    select: { id: true },
  })
  const myProjectsAsTeam = await prisma.projectTeamMember.findMany({
    where: { userId },
    select: { projectId: true },
  })
  const allProjectIds = [
    ...myProjectsAsClient.map((p) => p.id),
    ...myProjectsAsTeam.map((t) => t.projectId),
    ...(projectId ? [projectId] : []),
  ]

  const teamMembers = await prisma.projectTeamMember.findMany({
    where: { projectId: { in: allProjectIds } },
    select: { userId: true },
  })
  const projectClients = await prisma.project.findMany({
    where: { id: { in: allProjectIds } },
    select: { clientId: true },
  })

  const relatedIds = new Set([
    ...teamMembers.map((m) => m.userId),
    ...projectClients.map((p) => p.clientId),
  ])
  relatedIds.delete(userId)

  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { id: { in: Array.from(relatedIds) } },
        { role: "admin" }, // always include admins
      ],
      ...searchFilter,
    },
    select: { id: true, name: true, email: true, role: true, company: true },
    orderBy: { name: "asc" },
    take: 50,
  })

  return NextResponse.json(users)
}
