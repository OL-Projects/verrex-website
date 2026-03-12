import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        isDemo: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true,
            appointments: true,
            invoices: true,
            sentMessages: true,
            leads: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        company: u.company,
        phone: u.phone,
        isDemo: u.isDemo,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
        relatedData: {
          projects: u._count.projects,
          appointments: u._count.appointments,
          invoices: u._count.invoices,
          messages: u._count.sentMessages,
          leads: u._count.leads,
        },
      })),
      total: users.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 }
    )
  }
}
