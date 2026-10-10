import { NotFoundView } from "@/components/not-found-view"

export const metadata = { title: "Page not found" }

// Shown inside the portal layout (sidebar + top bar stay visible) for notFound() on dashboard routes, e.g. a ticket you can't open.
export default function DashboardNotFound() {
  return <NotFoundView />
}
