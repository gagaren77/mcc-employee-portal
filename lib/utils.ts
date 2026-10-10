import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** All dates are shown in the college's time zone, not the server's (the container runs in UTC). */
export const APP_TIMEZONE = "America/Chicago"

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: APP_TIMEZONE,
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: APP_TIMEZONE,
  })
}

export function getInitials(name: string | null | undefined) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getRoleBadgeColor(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-700"
    case "HR":
      return "bg-purple-100 text-purple-700"
    case "IT":
      return "bg-blue-100 text-blue-700"
    case "ADJUNCT":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "URGENT":
      return "bg-red-500"
    case "HIGH":
      return "bg-orange-500"
    case "NORMAL":
      return "bg-blue-500"
    case "LOW":
      return "bg-gray-400"
    default:
      return "bg-blue-500"
  }
}
