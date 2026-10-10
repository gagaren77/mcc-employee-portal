import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const Schema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().trim().min(1).max(10000).optional(),
  category: z.string().trim().min(1).max(50).optional(),
  priority: z.enum(["NORMAL", "HIGH", "URGENT"]).optional(),
  pinned: z.boolean().optional(),
  published: z.boolean().optional(),
})

async function guard() {
  const session = await auth()
  return session?.user?.id && ["ADMIN", "HR"].includes(session.user.role) ? session : null
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })

  // A draft that gets published counts as posted now, so people's notification bell picks it up.
  const publishing = parsed.data.published === true && !existing.published
  const announcement = await prisma.announcement.update({
    where: { id },
    data: { ...parsed.data, ...(publishing ? { createdAt: new Date() } : {}) },
  })
  return NextResponse.json({ announcement })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
  await prisma.announcement.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
