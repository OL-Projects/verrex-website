import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

// GET /api/admin/leads/export — Export leads as CSV or JSON
export async function GET(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const url = new URL(request.url)
  const format = url.searchParams.get("format") || "csv" // csv | json
  const status = url.searchParams.get("status") || ""
  const source = url.searchParams.get("source") || ""

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (source) where.source = source

  const leads = await prisma.lead.findMany({
    where: where as any,
    include: { assignedTo: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })

  if (format === "json") {
    return new NextResponse(JSON.stringify({ leads, exportedAt: new Date().toISOString(), count: leads.length }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="verrex-leads-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  }

  // CSV export
  const csvHeaders = ["id", "name", "email", "phone", "company", "source", "type", "status", "priority", "stage", "subject", "message", "notes", "projectType", "budget", "address", "city", "postalCode", "assignedTo", "convertedAt", "createdAt", "updatedAt"]

  const escapeCSV = (val: string | null | undefined) => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = leads.map(lead => csvHeaders.map(h => {
    if (h === "assignedTo") return escapeCSV(lead.assignedTo?.name || "")
    return escapeCSV((lead as any)[h])
  }).join(","))

  const csv = [csvHeaders.join(","), ...rows].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="verrex-leads-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  })
}
