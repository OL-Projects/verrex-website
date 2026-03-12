import { NextResponse } from "next/server"
import { requireAdmin, unauthorized } from "@/lib/rbac"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileName = `${timestamp}-${safeName}`

    // Strategy 1: Vercel Blob (production — when token exists)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob")
      const blob = await put(`projects/${fileName}`, file, {
        access: "public",
        addRandomSuffix: true,
      })
      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || file.type,
        size: file.size,
        fileName: file.name,
      })
    }

    // Strategy 2: Local file storage (dev / fallback)
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "projects")
    await mkdir(uploadsDir, { recursive: true })
    const filePath = path.join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    const url = `/uploads/projects/${fileName}`

    return NextResponse.json({
      url,
      pathname: url,
      contentType: file.type,
      size: file.size,
      fileName: file.name,
    })
  } catch (err: unknown) {
    console.error("Upload error:", err)
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
