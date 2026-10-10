import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { QUICK_LINK_CATEGORIES, normalizeLinkUrl } from "@/lib/quick-link-constants"

const Schema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  url: z.string().trim().min(1).max(1000).optional(),
  description: z.string().trim().max(120).nullable().optional(),
  category: z.enum(QUICK_LINK_CATEGORIES).optional(),
  isActive: z.boolean().optional(),
  move: z.enum(["up", "down"]).optional(), // reorder within its category
})

async function guard() {
  const session = await auth()
  return session?.user && ["ADMIN", "HR"].includes(session.user.role) ? session : null
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const existing = await prisma.quickLink.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Link not found" }, { status: 404 })
  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  const { move, ...rest } = parsed.data

  if (move) {
    // Renumber the category 1..n first so equal/gappy orders cannot break the swap, then swap with the neighbour.
    const siblings = await prisma.quickLink.findMany({ where: { category: existing.category }, orderBy: [{ order: "asc" }, { createdAt: "asc" }, { id: "asc" }] })
    const i = siblings.findIndex((s) => s.id === id)
    const j = move === "up" ? i - 1 : i + 1
    if (j < 0 || j >= siblings.length) return NextResponse.json({ ok: true })
    const ids = siblings.map((s) => s.id)
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    await prisma.$transaction(ids.map((sid, n) => prisma.quickLink.update({ where: { id: sid }, data: { order: n + 1 } })))
    return NextResponse.json({ ok: true })
  }

  const data: Record<string, unknown> = { ...rest }
  if (rest.url !== undefined) {
    const url = normalizeLinkUrl(rest.url)
    if (!url) return NextResponse.json({ error: "Enter a web address (https://…), a portal page like /hr, or an email link." }, { status: 400 })
    data.url = url
  }
  if (rest.description !== undefined) data.description = rest.description || null
  const link = await prisma.quickLink.update({ where: { id }, data })
  return NextResponse.json({ link })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guard())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const existing = await prisma.quickLink.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Link not found" }, { status: 404 })
  await prisma.quickLink.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
