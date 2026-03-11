import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    env: ["DATABASE_URL", "AUTH_SECRET", "RESEND_API_KEY"]
      .map(k => `${k}:${process.env[k] ? "✓" : "✗"}`)
      .join(", "),
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = "connected"
  } catch {
    checks.db = "disconnected"
    checks.status = "degraded"
  }

  return NextResponse.json(checks)
}
