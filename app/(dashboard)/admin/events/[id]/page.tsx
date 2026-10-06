import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { CalendarCog } from "lucide-react"
import { EventForm } from "../event-form"

// Helper to convert Date to "YYYY-MM-DDTHH:mm" for datetime-local inputs
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    redirect("/admin/events")
  }

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarCog className="w-6 h-6 text-[#1a4a8a]" />
          Edit Event
        </h1>
        <p className="text-gray-500 text-sm mt-1">{event.title}</p>
      </div>

      <EventForm
        initial={{
          id: event.id,
          title: event.title,
          description: event.description ?? "",
          startDate: toLocalInput(new Date(event.startDate)),
          endDate: event.endDate ? toLocalInput(new Date(event.endDate)) : "",
          location: event.location ?? "",
          category: event.category,
          published: event.published,
        }}
      />
    </div>
  )
}
