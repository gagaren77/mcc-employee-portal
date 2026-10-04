import { Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Event {
  id: string
  title: string
  description?: string | null
  startDate: Date
  endDate?: Date | null
  location?: string | null
  category: string
}

interface EventsWidgetProps {
  events: Event[]
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    general: "bg-blue-500",
    holiday: "bg-green-500",
    training: "bg-purple-500",
    meeting: "bg-orange-500",
    deadline: "bg-red-500",
    social: "bg-pink-500",
  }
  return colors[category] ?? "bg-gray-400"
}

export function EventsWidget({ events }: EventsWidgetProps) {
  return (
    <div className="mcc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#1a4a8a]" />
          Upcoming Events
        </h2>
        <Link href="/events" className="text-xs text-[#1a4a8a] hover:text-[#0d2d5c] font-medium">
          View all →
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No upcoming events.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3">
              {/* Date block */}
              <div className="flex-shrink-0 w-12 text-center">
                <div className="bg-[#1a4a8a] text-white rounded-lg py-1">
                  <p className="text-xs font-bold leading-none">
                    {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                  </p>
                  <p className="text-lg font-bold leading-tight">
                    {new Date(event.startDate).getDate()}
                  </p>
                </div>
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getCategoryColor(event.category)}`} />
                  <h3 className="text-sm font-medium text-gray-800 truncate">{event.title}</h3>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(event.startDate).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
