import { Pin, Megaphone, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: string
  pinned: boolean
  createdAt: Date
}

interface AnnouncementsWidgetProps {
  announcements: Announcement[]
}

function getPriorityIcon(priority: string) {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case "NORMAL":
      return <Megaphone className="w-4 h-4 text-blue-500" />
    default:
      return <Info className="w-4 h-4 text-gray-400" />
  }
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    general: "bg-blue-100 text-blue-700",
    hr: "bg-purple-100 text-purple-700",
    it: "bg-cyan-100 text-cyan-700",
    facilities: "bg-green-100 text-green-700",
    academic: "bg-amber-100 text-amber-700",
    urgent: "bg-red-100 text-red-700",
  }
  return colors[category] ?? "bg-gray-100 text-gray-700"
}

export function AnnouncementsWidget({ announcements }: AnnouncementsWidgetProps) {
  return (
    <div className="mcc-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#1a4a8a]" />
          Announcements
        </h2>
        <Link
          href="/announcements"
          className="text-xs text-[#1a4a8a] hover:text-[#0d2d5c] font-medium"
        >
          View all →
        </Link>
      </div>

      {announcements.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No announcements at this time.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-3 rounded-lg border ${
                ann.pinned ? "border-[#c9a227]/30 bg-amber-50" : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-2">
                {ann.pinned && <Pin className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0 mt-0.5 rotate-45" />}
                {getPriorityIcon(ann.priority)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-800">{ann.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(ann.category)}`}>
                      {ann.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(ann.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
