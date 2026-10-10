import { Calendar, MapPin, Clock } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { APP_TIMEZONE } from "@/lib/utils"

function getCategoryStyle(category: string) {
  const styles: Record<string, { dot: string; badge: string }> = {
    general: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
    holiday: { dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
    training: { dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700" },
    meeting: { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
    deadline: { dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
    social: { dot: "bg-pink-500", badge: "bg-pink-100 text-pink-700" },
    academic: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  }
  return styles[category] ?? styles.general
}

export default async function EventsPage() {
  await auth() // still enforce login via layout

  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    where: {
      published: true,
      startDate: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
  })

  const upcoming = events.filter((e) => new Date(e.startDate) >= new Date())
  const past = events.filter((e) => new Date(e.startDate) < new Date())

  function renderEvent(event: typeof events[0]) {
    const { dot, badge } = getCategoryStyle(event.category)
    return (
      <div key={event.id} className="mcc-card p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 text-center w-14">
            <div className="mcc-gradient rounded-xl py-2 text-white">
              <p className="text-xs font-bold uppercase leading-none">
                {new Date(event.startDate).toLocaleDateString("en-US", { timeZone: APP_TIMEZONE, month: "short" })}
              </p>
              <p className="text-xl font-bold leading-tight">
                {new Date(event.startDate).getDate()}
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-800">{event.title}</h3>
              <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>
                {event.category}
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {new Date(event.startDate).toLocaleTimeString("en-US", { timeZone: APP_TIMEZONE, hour: "numeric", minute: "2-digit" })}
                {event.endDate && ` – ${new Date(event.endDate).toLocaleTimeString("en-US", { timeZone: APP_TIMEZONE, hour: "numeric", minute: "2-digit" })}`}
              </div>
              {event.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#1a4a8a]" />
          Events & Calendar
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upcoming events, deadlines, trainings, and company activities.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {["general", "holiday", "training", "meeting", "deadline", "social", "academic"].map((cat) => {
          const { dot } = getCategoryStyle(cat)
          return (
            <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <span className="capitalize">{cat}</span>
            </div>
          )
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="mcc-card p-8 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No upcoming events. Check back later!</p>
          </div>
        ) : (
          <div className="space-y-3">{upcoming.map(renderEvent)}</div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Recent Past ({past.length})
          </h2>
          <div className="space-y-3 opacity-60">{past.map(renderEvent)}</div>
        </div>
      )}
    </div>
  )
}
