import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Used by Docker/Coolify to decide whether this container is healthy. Public (no login) and reveals nothing but ok/not ok.
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: "db-error" }, { status: 503 })
  }
}
