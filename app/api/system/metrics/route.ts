import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isStaff } from "@/lib/ticket-constants"
import { collectMetrics } from "@/lib/system-metrics"

export const dynamic = "force-dynamic"

// IT / Admin only. Read-only server health numbers (CPU, memory, disk); no secrets or paths beyond mount points.
export async function GET() {
  const session = await auth()
  if (!session?.user || !isStaff(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return NextResponse.json(await collectMetrics(), { headers: { "Cache-Control": "no-store" } })
}
