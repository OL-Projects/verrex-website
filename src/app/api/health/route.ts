import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks: Record<string, string> = {
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "MISSING",
    DATABASE_POSTGRES_PRISMA_URL: process.env.DATABASE_POSTGRES_PRISMA_URL ? "set" : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "MISSING",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "set" : "MISSING",
  }
  
  try {
    const count = await prisma.user.count()
    checks.db_connection = `OK (${count} users)`
  } catch (e: unknown) {
    const err = e as Error
    checks.db_connection = `FAIL: ${err.message?.substring(0, 200)}`
  }
  
  return NextResponse.json(checks)
}
