import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ANNOUNCEMENT_PRIORITIES } from "@/lib/announcement-constants"


const Schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Message is required").max(10000),
  category: z.string().trim().min(1).max(50),
  priority: z.enum(ANNOUNCEMENT_PRIORITIES),
  pinned: z.boolean().optional(),
  published: z.boolean().optional(),
})

// HR and Admin only.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !["ADMIN", "HR"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })

  const announcement = await prisma.announcement.create({
    data: { ...parsed.data, pinned: parsed.data.pinned ?? false, published: parsed.data.published ?? true, authorId: session.user.id },
  })
  return NextResponse.json({ announcement }, { status: 201 })
}
