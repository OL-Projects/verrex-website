import { NextRequest, NextResponse } from "next/server"
import { requireAuth, unauthorized } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { sendDocumentSignedEmail } from "@/lib/email"

/**
 * POST /api/portal/documents/[id]/sign-pdf
 * Burns the client's signature onto the PDF, uploads the signed copy,
 * and updates the document record with signedFileUrl.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session) return unauthorized()
    const { id } = await params
    const { signature, action } = await req.json()

    if (!signature) {
      return NextResponse.json({ error: "Signature is required" }, { status: 400 })
    }

    // Fetch document
    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        recipient: { select: { id: true, name: true, email: true, role: true } },
        project: { select: { id: true, title: true } },
      },
    })

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Only recipient can sign (or admin for testing)
    if (doc.recipientId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Must be in signable state
    if (!["sent", "viewed"].includes(doc.status)) {
      return NextResponse.json({ error: "Document cannot be signed in current state" }, { status: 400 })
    }

    // ── 1. Fetch the original PDF ──
    const pdfRes = await fetch(doc.fileUrl)
    if (!pdfRes.ok) {
      return NextResponse.json({ error: "Failed to fetch original PDF" }, { status: 500 })
    }
    const originalBytes = new Uint8Array(await pdfRes.arrayBuffer())

    // ── 2. Load PDF with pdf-lib ──
    const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true })

    // ── 3. Embed signature image ──
    // Strip data URL prefix if present
    const base64Data = signature.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
    const sigBytes = Buffer.from(base64Data, "base64")

    let sigImage
    try {
      sigImage = await pdfDoc.embedPng(sigBytes)
    } catch {
      // Fallback: try JPEG
      sigImage = await pdfDoc.embedJpg(sigBytes)
    }

    // ── 4. Draw signature on the last page ──
    const pages = pdfDoc.getPages()
    const lastPage = pages[pages.length - 1]
    const { width: pageWidth } = lastPage.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const sigWidth = 180
    const sigHeight = (sigImage.height / sigImage.width) * sigWidth
    const boxX = pageWidth - sigWidth - 40
    const boxY = 30
    const boxPad = 10
    const totalBoxH = sigHeight + 55 // signature + text below

    // Draw signature box background
    lastPage.drawRectangle({
      x: boxX - boxPad,
      y: boxY - boxPad,
      width: sigWidth + boxPad * 2,
      height: totalBoxH + boxPad * 2,
      color: rgb(0.98, 0.98, 1),
      borderColor: rgb(0.7, 0.7, 0.85),
      borderWidth: 0.5,
    })

    // Draw signature image
    lastPage.drawImage(sigImage, {
      x: boxX,
      y: boxY + 50,
      width: sigWidth,
      height: sigHeight,
    })

    // Draw signature line
    lastPage.drawLine({
      start: { x: boxX, y: boxY + 48 },
      end: { x: boxX + sigWidth, y: boxY + 48 },
      color: rgb(0.4, 0.4, 0.5),
      thickness: 0.5,
    })

    // Signer name
    const signerName = doc.recipient.name || "Client"
    lastPage.drawText(signerName, {
      x: boxX,
      y: boxY + 34,
      size: 8,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.25),
    })

    // Date
    const signDate = new Date().toLocaleDateString("en-CA", {
      year: "numeric", month: "short", day: "numeric",
    })
    lastPage.drawText(`Signed: ${signDate}`, {
      x: boxX,
      y: boxY + 22,
      size: 7,
      font,
      color: rgb(0.4, 0.4, 0.5),
    })

    // Status label
    const statusLabel = action === "accept" ? "ACCEPTED" : "SIGNED"
    lastPage.drawText(`✓ Digitally ${statusLabel}`, {
      x: boxX,
      y: boxY + 8,
      size: 7,
      font: fontBold,
      color: rgb(0.1, 0.5, 0.2),
    })

    // ── 5. Save the signed PDF ──
    const signedPdfBytes = await pdfDoc.save()

    // ── 6. Upload signed PDF via /api/upload ──
    const blob = new Blob([signedPdfBytes as unknown as BlobPart], { type: "application/pdf" })
    const fileName = `signed-${doc.type}-${doc.id.slice(-6)}-${Date.now()}.pdf`
    const formData = new FormData()
    formData.append("file", blob, fileName)

    // Use internal upload (construct absolute URL from request)
    const origin = req.nextUrl.origin
    const uploadRes = await fetch(`${origin}/api/upload`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      body: formData,
    })

    let signedFileUrl = ""
    if (uploadRes.ok) {
      const uploadData = await uploadRes.json()
      signedFileUrl = uploadData.url
    } else {
      return NextResponse.json({ error: "Failed to upload signed PDF" }, { status: 500 })
    }

    // ── 7. Get client IP ──
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown"

    // ── 8. Update document in DB ──
    const newStatus = action === "accept" ? "accepted" : "signed"
    const updateData: Record<string, unknown> = {
      signatureUrl: signature,
      signedFileUrl,
      signedAt: new Date(),
      clientIp,
      status: newStatus,
    }
    if (action === "accept") {
      updateData.acceptedAt = new Date()
    }

    const updated = await prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    })

    // ── 9. Notify admin via email ──
    try {
      await sendDocumentSignedEmail(updated.sender.email, {
        clientName: updated.recipient.name,
        documentTitle: updated.title,
        documentType: updated.type,
        signedAt: new Date().toISOString(),
        projectTitle: updated.project?.title,
      })
    } catch {
      // Email failure shouldn't block the signing
    }

    return NextResponse.json({
      success: true,
      signedFileUrl,
      status: newStatus,
      signedAt: updated.signedAt,
    })
  } catch (error: unknown) {
    console.error("[sign-pdf] Error:", error)
    return NextResponse.json(
      { error: "Failed to sign document" },
      { status: 500 }
    )
  }
}
