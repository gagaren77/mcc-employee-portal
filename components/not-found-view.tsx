import Link from "next/link"
import { Compass, HelpCircle, LayoutDashboard } from "lucide-react"

/** Friendly 404 body, shared by the app-wide page and the in-dashboard page. */
export function NotFoundView({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div className={`flex items-center justify-center px-4 ${fullScreen ? "min-h-screen mcc-gradient" : "py-16"}`}>
      <div className="mcc-card max-w-md w-full p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <Compass className="w-7 h-7 text-[#1a4a8a]" />
        </div>
        <p className="text-sm font-semibold text-[#c9a227] tracking-widest">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">We can&apos;t find that page</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          The link may be old or mistyped, or the page may have moved. If you followed a ticket or approval link from an email, it may have expired or been replaced by a newer one.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/dashboard" className="mcc-btn-primary text-sm inline-flex items-center justify-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Back to dashboard
          </Link>
          <Link href="/it-help" className="text-sm font-medium text-[#1a4a8a] border border-gray-200 rounded-lg px-4 py-2 inline-flex items-center justify-center gap-2 hover:bg-gray-50">
            <HelpCircle className="w-4 h-4" /> Contact IT
          </Link>
        </div>
      </div>
    </div>
  )
}
