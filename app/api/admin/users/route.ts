import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["EMPLOYEE", "HR", "IT", "ADMIN"]),
  department: z.string().optional(),
  title: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      title: true,
      isActive: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  })

  // Annotate each user with whether they're an SSO user
  const enriched = users.map((u) => ({
    ...u,
    isExternal: u.accounts.some((a) => a.provider !== "credentials"),
    accounts: undefined,
  }))

  return NextResponse.json({ users: enriched })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = CreateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  const { name, email, password, role, department, title } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "A user with that email already exists." },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
      department: department || null,
      title: title || null,
      isActive: true,
    },
    select: { id: true, email: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}
