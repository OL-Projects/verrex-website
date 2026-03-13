import { NextResponse } from "next/server"

// DEPRECATED: Old 1:1 message API — use /api/portal/conversations instead
export async function GET() {
  return NextResponse.json(
    { error: "Deprecated. Use /api/portal/conversations for the new messaging system." },
    { status: 410 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: "Deprecated. Use /api/portal/conversations to create conversations, then POST to /api/portal/conversations/[id]/messages." },
    { status: 410 }
  )
}
