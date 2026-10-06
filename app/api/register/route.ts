import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Registration is disabled. Contact your administrator." },
    { status: 403 }
  )
}

export async function GET() {
  return NextResponse.json(
    { error: "Registration is disabled." },
    { status: 403 }
  )
}
