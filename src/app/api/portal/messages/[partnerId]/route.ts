import { NextResponse } from "next/server"

// DEPRECATED: Old 1:1 partner message API — use /api/portal/conversations/[id]/messages
export async function GET() {
  return NextResponse.json(
    { error: "Deprecated. Use /api/portal/conversations/[id]/messages instead." },
    { status: 410 }
  )
}
