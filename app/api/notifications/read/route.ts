import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// "Mark all as read": everything up to now counts as seen.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.user.update({ where: { id: session.user.id }, data: { notificationsSeenAt: new Date() } })
  return NextResponse.json({ ok: true })
}
