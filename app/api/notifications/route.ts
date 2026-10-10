import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { loadNotifications } from "@/lib/notifications"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // First time: start from now so existing content doesn't show up as hundreds of "new" items.
  let seenAt = user.notificationsSeenAt
  if (!seenAt) {
    seenAt = new Date()
    await prisma.user.update({ where: { id: user.id }, data: { notificationsSeenAt: seenAt } })
  }
  return NextResponse.json(await loadNotifications(user, seenAt), { headers: { "Cache-Control": "no-store" } })
}
