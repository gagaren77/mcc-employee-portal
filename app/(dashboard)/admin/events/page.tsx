import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, PlusCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { EventRowActions } from "./event-row-actions"

export default async function AdminEventsPage() {
  const session = await auth()
  if (!session?.user || !["ADMIN", "HR"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1a4a8a]" />
            Event Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, edit, and publish/unpublish events shown on the portal.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="mcc-btn-primary flex items-center gap-2 text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add Event
        </Link>
      </div>

      <div className="mcc-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                    No events yet. Click "Add Event" to create one.
                  </td>
                </tr>
              )}
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-gray-900">{event.title}</td>
                  <td className="py-3 text-gray-600 text-xs">
                    {formatDate(event.startDate)}
                  </td>
                  <td className="py-3 capitalize text-gray-600">{event.category}</td>
                  <td className="py-3">
                    {event.published ? (
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <EventRowActions
                      id={event.id}
                      published={event.published}
                      title={event.title}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
