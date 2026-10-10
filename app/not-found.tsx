import { NotFoundView } from "@/components/not-found-view"

export const metadata = { title: "Page not found" }

// Shown for unknown URLs and for notFound() outside the dashboard (login pages, token links).
export default function NotFound() {
  return <NotFoundView fullScreen />
}
