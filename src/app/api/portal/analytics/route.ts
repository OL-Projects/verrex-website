import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Parallel queries for performance
    const [
      invoices, leads, projects, appointments, users,
      recentLeads, recentProjects,
    ] = await Promise.all([
      prisma.invoice.findMany({ select: { total: true, status: true, createdAt: true, paidDate: true } }),
      prisma.lead.findMany({ select: { source: true, stage: true, priority: true, createdAt: true, status: true } }),
      prisma.project.findMany({ select: { id: true, status: true, totalValue: true, createdAt: true } }),
      prisma.appointment.findMany({ select: { type: true, status: true, date: true } }),
      prisma.user.count({ where: { role: "client" } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.project.count({ where: { createdAt: { gte: startOfMonth } } }),
    ])

    // ── Revenue by Month (last 6 months from paid invoices)
    const revenueMonths: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthLabel = mStart.toLocaleDateString("en", { month: "short", year: "2-digit" })
      const monthRevenue = invoices
        .filter(inv => inv.status === "paid" && (inv.paidDate || inv.createdAt) >= mStart && (inv.paidDate || inv.createdAt) < mEnd)
        .reduce((sum, inv) => sum + inv.total, 0)
      revenueMonths.push({ month: monthLabel, revenue: Math.round(monthRevenue) })
    }

    // ── Revenue MTD
    const revenueMTD = invoices
      .filter(inv => inv.status === "paid" && (inv.paidDate || inv.createdAt) >= startOfMonth)
      .reduce((sum, inv) => sum + inv.total, 0)

    // ── Total Revenue
    const totalRevenue = invoices
      .filter(inv => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0)

    // ── Lead Sources
    const sourceMap: Record<string, number> = {}
    leads.forEach(l => { sourceMap[l.source] = (sourceMap[l.source] || 0) + 1 })
    const leadSources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)

    // ── Conversion Funnel (leads through pipeline stages)
    const stageOrder = [
      "lead_received", "contacted", "appointment_scheduled", "measured",
      "quote_prepared", "client_approved", "ordered_to_supplier", "in_production",
      "shipped", "delivered", "install_scheduled", "installed",
      "completion_verified", "payment_received", "closed",
    ]
    const funnelLabels: Record<string, string> = {
      lead_received: "Leads Received", contacted: "Contacted",
      appointment_scheduled: "Appt Scheduled", measured: "Measured",
      quote_prepared: "Quote Sent", client_approved: "Approved",
      ordered_to_supplier: "Ordered", installed: "Installed",
      completion_verified: "Verified", closed: "Closed",
    }
    // Count leads at or past each stage
    const conversionFunnel = Object.entries(funnelLabels).map(([stage, label]) => {
      const idx = stageOrder.indexOf(stage)
      const count = leads.filter(l => stageOrder.indexOf(l.stage) >= idx).length
      return { stage: label, count }
    }).filter(f => f.count > 0)

    // ── Conversion Rate (leads that became converted status)
    const convertedLeads = leads.filter(l => l.status === "converted").length
    const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0

    // ── Avg Project Value
    const projectValues = projects.filter(p => p.totalValue && p.totalValue > 0).map(p => p.totalValue!)
    const avgProjectValue = projectValues.length > 0
      ? Math.round(projectValues.reduce((s, v) => s + v, 0) / projectValues.length)
      : 0

    // ── Completed Projects
    const completedProjects = projects.filter(p => p.status === "completed").length

    // ── Cancellation Rate (cancelled appointments / total)
    const totalApts = appointments.length
    const cancelledApts = appointments.filter(a => a.status === "cancelled").length
    const cancellationRate = totalApts > 0 ? Math.round((cancelledApts / totalApts) * 100 * 10) / 10 : 0

    // ── Appointment Types
    const aptTypeMap: Record<string, number> = {}
    appointments.forEach(a => { aptTypeMap[a.type] = (aptTypeMap[a.type] || 0) + 1 })

    // ── Project Status Distribution
    const stageMap: Record<string, number> = {}
    projects.forEach(p => { stageMap[p.status] = (stageMap[p.status] || 0) + 1 })

    return NextResponse.json({
      kpi: {
        revenueMTD: Math.round(revenueMTD),
        totalRevenue: Math.round(totalRevenue),
        newLeadsMTD: recentLeads,
        totalLeads: leads.length,
        conversionRate,
        avgProjectValue,
        totalClients: users,
        completedProjects,
        cancellationRate,
        totalProjects: projects.length,
        totalAppointments: appointments.length,
      },
      revenueMonths,
      leadSources,
      conversionFunnel,
      projectStages: Object.entries(stageMap).map(([stage, count]) => ({ stage, count })),
      appointmentTypes: Object.entries(aptTypeMap).map(([type, count]) => ({ type, count })),
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
