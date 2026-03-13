import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch all project activities with author info
    const activities = await prisma.projectActivity.findMany({
      include: {
        author: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, stage: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    })

    // Map to TimelineEvent format
    const events = activities.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      timestamp: a.createdAt.toISOString(),
      actorId: a.authorId,
      actorName: a.author?.name || "System",
      actorRole: a.author?.role || "system",
      eventType: mapActivityType(a.type),
      title: a.title,
      visibility: "all" as const,
      notes: a.description || undefined,
      metadata: a.metadata ? (typeof a.metadata === "object" ? a.metadata as Record<string, string> : {}) : {},
    }))

    return NextResponse.json({ events, total: events.length })
  } catch (error) {
    console.error("Timeline API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch timeline" },
      { status: 500 }
    )
  }
}

function mapActivityType(type: string): string {
  const map: Record<string, string> = {
    stage_change: "stage_changed",
    note: "note_added",
    appointment: "appointment_scheduled",
    measurement: "measurement_completed",
    quote: "quote_created",
    order: "order_placed",
    installation: "install_completed",
    payment: "payment_received",
    document: "document_uploaded",
    photo: "photo_uploaded",
    system: "system_event",
  }
  return map[type] || type
}
