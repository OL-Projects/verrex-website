import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Test DB connection with latency
    const pingStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const pingMs = Date.now() - pingStart

    // Get row counts for all tables
    const [
      users, projects, appointments, invoices, messages, leads,
      activities, tasks, attachments, teamMembers, passwordResets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.appointment.count(),
      prisma.invoice.count(),
      prisma.message.count(),
      prisma.lead.count(),
      prisma.projectActivity.count(),
      prisma.projectTask.count(),
      prisma.projectAttachment.count(),
      prisma.projectTeamMember.count(),
      prisma.passwordReset.count(),
    ])

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    })

    // Recent accounts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    })

    // Recently updated accounts
    const recentlyUpdated = await prisma.user.count({
      where: { updatedAt: { gte: sevenDaysAgo } },
    })

    // Get DB version
    let dbVersion = "unknown"
    try {
      const result = await prisma.$queryRaw<[{ version: string }]>`SELECT version()`
      dbVersion = result[0]?.version || "unknown"
    } catch {
      dbVersion = "PostgreSQL (version query failed)"
    }

    return NextResponse.json({
      connected: true,
      pingMs,
      provider: "PostgreSQL",
      version: dbVersion,
      tables: {
        users,
        projects,
        appointments,
        invoices,
        messages,
        leads,
        activities,
        tasks,
        attachments,
        teamMembers,
        passwordResets,
      },
      totalRows: users + projects + appointments + invoices + messages + leads + activities + tasks + attachments + teamMembers + passwordResets,
      usersByRole: usersByRole.map((r) => ({ role: r.role, count: r._count.id })),
      recentUsers,
      recentlyUpdated,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      pingMs: -1,
      provider: "PostgreSQL",
      error: error instanceof Error ? error.message : "Connection failed",
      timestamp: new Date().toISOString(),
    })
  }
}
