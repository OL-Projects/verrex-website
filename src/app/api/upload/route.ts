import { NextResponse } from "next/server"
import { requireAuth, unauthorized } from "@/lib/rbac"
import { getSupabaseServer, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase"

export async function POST(request: Request) {
  const session = await requireAuth()
  if (!session) return unauthorized()

  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)
    let contentType = file.type

    // ─── Image compression with sharp (photos: 5MB → ~200KB) ───
    const isImage = file.type.startsWith("image/") && !file.type.includes("svg")
    if (isImage) {
      try {
        const sharp = (await import("sharp")).default
        const compressed = await sharp(new Uint8Array(buffer))
          .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer()
        buffer = Buffer.from(compressed)
        contentType = "image/jpeg"
      } catch {
        // If sharp fails, upload original
        console.warn("Sharp compression failed, uploading original")
      }
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const ext = isImage ? "jpg" : safeName.split(".").pop() || "bin"
    const baseName = safeName.replace(/\.[^.]+$/, "")
    const fileName = `${timestamp}-${baseName}.${ext}`
    const storagePath = `projects/${fileName}`

    // ─── Strategy 1: Supabase Storage (preferred) ───
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = getSupabaseServer()
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType,
          cacheControl: "31536000", // 1 year cache
          upsert: false,
        })

      if (error) {
        console.error("Supabase storage error:", error)
        return NextResponse.json({ error: "Storage upload failed: " + error.message }, { status: 500 })
      }

      const url = getPublicUrl(storagePath)

      return NextResponse.json({
        url,
        pathname: storagePath,
        contentType,
        size: buffer.length,
        originalSize: file.size,
        compressed: isImage,
        fileName: file.name,
        storage: "supabase",
      })
    }

    // ─── Strategy 2: Vercel Blob (fallback) ───
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob")
      const blob = await put(`projects/${fileName}`, new Blob([buffer], { type: contentType }), {
        access: "public",
        addRandomSuffix: true,
      })
      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType || contentType,
        size: buffer.length,
        originalSize: file.size,
        compressed: isImage,
        fileName: file.name,
        storage: "vercel-blob",
      })
    }

    // ─── Strategy 3: Local file storage (dev only) ───
    const { writeFile, mkdir } = await import("fs/promises")
    const path = await import("path")
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "projects")
    await mkdir(uploadsDir, { recursive: true })
    const filePath = path.join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/projects/${fileName}`,
      pathname: `/uploads/projects/${fileName}`,
      contentType,
      size: buffer.length,
      originalSize: file.size,
      compressed: isImage,
      fileName: file.name,
      storage: "local",
    })
  } catch (err: unknown) {
    console.error("Upload error:", err)
    const message = err instanceof Error ? err.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
