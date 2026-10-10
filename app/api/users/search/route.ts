import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isStaff } from "@/lib/tickets"

// Staff-only people search for the "request approval" picker.
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || !isStaff(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim()
  if (q.length < 2) return NextResponse.json({ users: [] })

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      OR: [{ name: { contains: q } }, { email: { contains: q } }, { department: { contains: q } }, { title: { contains: q } }],
    },
    select: { id: true, name: true, email: true, department: true, title: true },
    orderBy: { name: "asc" },
    take: 8,
  })
  return NextResponse.json({ users })
}
