import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const UpdateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  category: z.string().min(1).max(50).optional(),
  published: z.boolean().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = UpdateEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  const data = parsed.data
  const update: Record<string, unknown> = {}

  if (data.title !== undefined) update.title = data.title
  if (data.description !== undefined) update.description = data.description || null
  if (data.startDate !== undefined) update.startDate = new Date(data.startDate)
  if (data.endDate !== undefined) update.endDate = data.endDate ? new Date(data.endDate) : null
  if (data.location !== undefined) update.location = data.location || null
  if (data.category !== undefined) update.category = data.category
  if (data.published !== undefined) update.published = data.published

  const event = await prisma.event.update({ where: { id }, data: update })
  return NextResponse.json({ event })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
