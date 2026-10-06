import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CalendarPlus } from "lucide-react"
import { EventForm } from "../event-form"

export default async function NewEventPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    redirect("/admin/events")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarPlus className="w-6 h-6 text-[#1a4a8a]" />
          Add New Event
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new event to show on the portal.
        </p>
      </div>
      <EventForm />
    </div>
  )
}
