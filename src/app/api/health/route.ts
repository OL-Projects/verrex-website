import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const checks: Record<string, string> = {
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "MISSING",
    AUTH_SECRET: process.env.AUTH_SECRET ? `set (len=${process.env.AUTH_SECRET.length})` : "MISSING",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "MISSING",
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "set" : "MISSING",
  }
  
  try {
    const count = await prisma.user.count()
    checks.db_connection = `OK (${count} users)`
  } catch (e: unknown) {
    const err = e as Error
    checks.db_connection = `FAIL: ${err.message?.substring(0, 200)}`
  }

  // Test bcrypt import
  try {
    const bcrypt = await import("bcryptjs")
    const hash = await bcrypt.hash("test", 10)
    checks.bcrypt = `OK (hash len=${hash.length})`
  } catch (e: unknown) {
    const err = e as Error
    checks.bcrypt = `FAIL: ${err.message?.substring(0, 200)}`
  }

  // Test auth module import
  try {
    const authMod = await import("@/lib/auth")
    checks.auth_module = typeof authMod.auth === "function" ? "OK (auth function loaded)" : "FAIL: auth function missing"
  } catch (e: unknown) {
    const err = e as Error
    checks.auth_module = `FAIL: ${err.message?.substring(0, 300)}`
  }
  
  return NextResponse.json(checks)
}
