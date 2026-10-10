import { cn } from "@/lib/utils"
import { STATUS_LABEL } from "@/lib/ticket-constants"

const statusColor: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  WAITING: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
}
const priorityColor: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap", statusColor[status] ?? "bg-gray-100 text-gray-600")}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", priorityColor[priority] ?? "bg-gray-100 text-gray-600")}>
      {priority.toLowerCase()}
    </span>
  )
}
