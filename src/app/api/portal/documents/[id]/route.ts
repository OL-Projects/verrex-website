import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, unauthorized } from "@/lib/rbac"
import {
  sendDocumentSignedEmail,
  sendDocumentAcceptedEmail,
  sendDocumentDeclinedEmail,
  sendRevisionRequestedEmail,
} from "@/lib/email"

// Helper: format date for emails
function formatDate(d: Date): string {
  return d.toLocaleDateString("en-CA", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// Helper: extract client IP from request
function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()
  return "unknown"
}

// PATCH /api/portal/documents/[id] — Document actions (read, unsend, sign, accept, reject, revision)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const { action, signature, message } = body as {
    action: "read" | "unsend" | "sign" | "accept" | "reject" | "revision"
    signature?: string  // base64 data URL for sign action
    message?: string    // revision request message
  }

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, email: true, role: true } },
      recipient: { select: { id: true, name: true, email: true, role: true, company: true } },
      project: { select: { id: true, title: true } },
    },
  })
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const clientIp = getClientIp(req)
  const now = new Date()

  // ─── READ ─────────────────────────────────────────────
  if (action === "read") {
    if (doc.recipientId !== session.user.id) {
      return NextResponse.json({ error: "Not your document" }, { status: 403 })
    }
    const updated = await prisma.document.update({
      where: { id },
      data: {
        readAt: doc.readAt || now,
        status: doc.status === "sent" ? "viewed" : doc.status,
      },
    })
    return NextResponse.json(updated)
  }

  // ─── UNSEND (admin only, within 25 minutes) ──────────
  if (action === "unsend") {
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }
    if (doc.senderId !== session.user.id) {
      return NextResponse.json({ error: "Not your document" }, { status: 403 })
    }
    const elapsed = Date.now() - doc.createdAt.getTime()
    if (elapsed > 25 * 60 * 1000) {
      return NextResponse.json({ error: "Unsend window expired (25 min)" }, { status: 403 })
    }
    const updated = await prisma.document.update({
      where: { id },
      data: { recalledAt: now, status: "draft" },
    })
    return NextResponse.json(updated)
  }

  // ─── Client-only actions below — verify recipient ────
  if (doc.recipientId !== session.user.id) {
    return NextResponse.json({ error: "Not your document" }, { status: 403 })
  }

  // Only allow actions on documents with status "sent" or "viewed"
  if (!["sent", "viewed"].includes(doc.status)) {
    return NextResponse.json({ error: `Cannot perform '${action}' on document with status '${doc.status}'` }, { status: 400 })
  }

  // ─── SIGN ─────────────────────────────────────────────
  if (action === "sign") {
    if (!signature) {
      return NextResponse.json({ error: "Signature data required" }, { status: 400 })
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: "signed",
        signatureUrl: signature,
        signedAt: now,
        clientIp,
      },
    })

    // Notify admin (non-blocking)
    sendDocumentSignedEmail(doc.sender.email, {
      clientName: doc.recipient.name,
      documentTitle: doc.title,
      documentType: doc.type,
      projectTitle: doc.project?.title,
      signedAt: formatDate(now),
    }).catch(console.error)

    return NextResponse.json(updated)
  }

  // ─── ACCEPT ───────────────────────────────────────────
  if (action === "accept") {
    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: "accepted",
        acceptedAt: now,
        signatureUrl: signature || null, // optional signature on accept
        signedAt: signature ? now : undefined,
        clientIp,
      },
    })

    // Notify admin (non-blocking)
    sendDocumentAcceptedEmail(doc.sender.email, {
      clientName: doc.recipient.name,
      documentTitle: doc.title,
      documentType: doc.type,
      projectTitle: doc.project?.title,
      acceptedAt: formatDate(now),
    }).catch(console.error)

    return NextResponse.json(updated)
  }

  // ─── REJECT ───────────────────────────────────────────
  if (action === "reject") {
    const updated = await prisma.document.update({
      where: { id },
      data: {
        status: "rejected",
        rejectedAt: now,
        clientIp,
      },
    })

    // Notify admin (non-blocking)
    sendDocumentDeclinedEmail(doc.sender.email, {
      clientName: doc.recipient.name,
      documentTitle: doc.title,
      documentType: doc.type,
      projectTitle: doc.project?.title,
      declinedAt: formatDate(now),
    }).catch(console.error)

    return NextResponse.json(updated)
  }

  // ─── REVISION ─────────────────────────────────────────
  if (action === "revision") {
    if (!message?.trim()) {
      return NextResponse.json({ error: "Revision message required" }, { status: 400 })
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        revisionNote: message.trim(),
        clientIp,
      },
    })

    // Notify admin (non-blocking)
    sendRevisionRequestedEmail(doc.sender.email, {
      clientName: doc.recipient.name,
      documentTitle: doc.title,
      documentType: doc.type,
      projectTitle: doc.project?.title,
      message: message.trim(),
      requestedAt: formatDate(now),
    }).catch(console.error)

    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// GET /api/portal/documents/[id] — Get document with recipient info
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  if (!session) return unauthorized()
  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, role: true, image: true } },
      recipient: { select: { id: true, name: true, role: true, company: true } },
      project: { select: { id: true, title: true } },
    },
  })

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Only sender or recipient can view
  if (doc.senderId !== session.user.id && doc.recipientId !== session.user.id) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  return NextResponse.json(doc)
}
