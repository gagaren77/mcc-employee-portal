import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const announcements = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 20,
  })

  return NextResponse.json(announcements)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["ADMIN", "HR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const announcement = await prisma.announcement.create({
    data: {
      title: body.title,
      content: body.content,
      category: body.category ?? "general",
      priority: body.priority ?? "NORMAL",
      authorId: session.user.id,
      pinned: body.pinned ?? false,
    },
  })

  return NextResponse.json(announcement, { status: 201 })
}
