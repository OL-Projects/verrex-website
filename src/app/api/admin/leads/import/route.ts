import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin, unauthorized } from "@/lib/rbac"

// POST /api/admin/leads/import — Import leads from CSV or JSON
export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await request.json()
  const { leads, format } = body // leads: array of lead objects, format: csv | json

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return NextResponse.json({ error: "No leads data provided" }, { status: 400 })
  }

  let imported = 0
  let skipped = 0
  const errors: string[] = []

  for (let i = 0; i < leads.length; i++) {
    const row = leads[i]
    try {
      if (!row.name || !row.email) {
        skipped++
        errors.push(`Row ${i + 1}: Missing name or email`)
        continue
      }

      await prisma.lead.create({
        data: {
          name: String(row.name).trim(),
          email: String(row.email).trim(),
          phone: row.phone ? String(row.phone).trim() : null,
          company: row.company ? String(row.company).trim() : null,
          source: row.source || "website",
          type: row.type || "contact",
          status: row.status || "new",
          priority: row.priority || "medium",
          stage: row.stage || "lead_received",
          subject: row.subject || null,
          message: row.message || null,
          notes: row.notes || null,
          projectType: row.projectType || null,
          budget: row.budget || null,
          address: row.address || null,
          city: row.city || null,
          postalCode: row.postalCode || null,
          metadata: row.metadata ? (typeof row.metadata === "string" ? row.metadata : JSON.stringify(row.metadata)) : null,
        },
      })
      imported++
    } catch (err: any) {
      skipped++
      errors.push(`Row ${i + 1}: ${err.message?.slice(0, 100) || "Unknown error"}`)
    }
  }

  return NextResponse.json({
    imported,
    skipped,
    total: leads.length,
    errors: errors.slice(0, 20), // max 20 error messages
  })
}
