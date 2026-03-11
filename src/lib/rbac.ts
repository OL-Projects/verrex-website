import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const ADMIN_EMAILS = ["admin@verex.ca"]

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin") return null
  return session
}

export async function requireRole(roles: string[]) {
  const session = await auth()
  if (!session?.user?.id || !roles.includes(session.user.role || "")) return null
  return session
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden — insufficient permissions" }, { status: 403 })
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
