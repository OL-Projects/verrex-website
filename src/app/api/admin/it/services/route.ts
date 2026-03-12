import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface ServiceCheck {
  name: string
  status: "connected" | "disconnected" | "degraded" | "not_configured"
  latencyMs: number
  details: string
}

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const services: ServiceCheck[] = []

  // 1. PostgreSQL Database
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const ms = Date.now() - start
    services.push({
      name: "PostgreSQL Database",
      status: ms > 1000 ? "degraded" : "connected",
      latencyMs: ms,
      details: ms > 1000 ? `High latency: ${ms}ms` : `Response: ${ms}ms`,
    })
  } catch (e) {
    services.push({
      name: "PostgreSQL Database",
      status: "disconnected",
      latencyMs: -1,
      details: e instanceof Error ? e.message : "Connection failed",
    })
  }

  // 2. NextAuth Authentication
  try {
    const start = Date.now()
    // Auth is working if we got this far (session is valid)
    const ms = Date.now() - start
    services.push({
      name: "NextAuth v5 Authentication",
      status: process.env.AUTH_SECRET ? "connected" : "not_configured",
      latencyMs: ms,
      details: process.env.AUTH_SECRET
        ? `AUTH_SECRET configured, AUTH_TRUST_HOST=${process.env.AUTH_TRUST_HOST || "not set"}`
        : "AUTH_SECRET not configured",
    })
  } catch {
    services.push({
      name: "NextAuth v5 Authentication",
      status: "disconnected",
      latencyMs: -1,
      details: "Auth check failed",
    })
  }

  // 3. Resend Email Service
  if (process.env.RESEND_API_KEY) {
    try {
      const start = Date.now()
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      })
      const ms = Date.now() - start
      services.push({
        name: "Resend Email Service",
        status: res.ok ? "connected" : "degraded",
        latencyMs: ms,
        details: res.ok ? `API reachable (${res.status}), ${ms}ms` : `HTTP ${res.status}: ${res.statusText}`,
      })
    } catch (e) {
      services.push({
        name: "Resend Email Service",
        status: "disconnected",
        latencyMs: -1,
        details: e instanceof Error ? e.message : "Connection failed",
      })
    }
  } else {
    services.push({
      name: "Resend Email Service",
      status: "not_configured",
      latencyMs: -1,
      details: "RESEND_API_KEY not set",
    })
  }

  // 4. Vercel Blob Storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    services.push({
      name: "Vercel Blob Storage",
      status: "connected",
      latencyMs: 0,
      details: "BLOB_READ_WRITE_TOKEN configured",
    })
  } else {
    services.push({
      name: "Vercel Blob Storage",
      status: "not_configured",
      latencyMs: -1,
      details: "BLOB_READ_WRITE_TOKEN not set",
    })
  }

  // 5. Next.js Runtime
  services.push({
    name: "Next.js Runtime",
    status: "connected",
    latencyMs: 0,
    details: `Node ${process.version}, PID ${process.pid}`,
  })

  const allConnected = services.every((s) => s.status === "connected")
  const anyDisconnected = services.some((s) => s.status === "disconnected")

  return NextResponse.json({
    overall: anyDisconnected ? "degraded" : allConnected ? "healthy" : "partial",
    services,
    checkedAt: new Date().toISOString(),
  })
}
