import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { requireAdmin, unauthorized } from "@/lib/rbac"

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const form = await request.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const blob = await put(`projects/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  })

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: file.size,
    fileName: file.name,
  })
}
