import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { QUICK_LINK_CATEGORIES, normalizeLinkUrl } from "@/lib/quick-link-constants"

const Schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80),
  url: z.string().trim().min(1, "Link is required").max(1000),
  description: z.string().trim().max(120).optional().nullable(),
  category: z.enum(QUICK_LINK_CATEGORIES),
  isActive: z.boolean().optional(),
})

// Admin and HR only.
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const parsed = Schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })

  const url = normalizeLinkUrl(parsed.data.url)
  if (!url) return NextResponse.json({ error: "Enter a web address (https://…), a portal page like /hr, or an email link." }, { status: 400 })

  const last = await prisma.quickLink.findFirst({ where: { category: parsed.data.category }, orderBy: { order: "desc" } })
  const link = await prisma.quickLink.create({
    data: { ...parsed.data, url, description: parsed.data.description || null, isActive: parsed.data.isActive ?? true, order: (last?.order ?? 0) + 1 },
  })
  return NextResponse.json({ link }, { status: 201 })
}
