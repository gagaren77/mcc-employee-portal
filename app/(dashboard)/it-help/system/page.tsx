import Link from "next/link"
import { redirect } from "next/navigation"
import { Activity, ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { isStaff } from "@/lib/ticket-constants"
import { MetricsLive } from "@/components/system/metrics-live"

// IT / Admin only.
export default async function SystemPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (!isStaff(session.user.role)) redirect("/it-help")
  return (
    <div className="space-y-5">
      <div>
        <Link href="/it-help" className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-[#1a4a8a] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> IT Help Desk
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Activity className="w-6 h-6 text-[#1a4a8a]" />
          Server health
        </h1>
        <p className="mt-1 text-sm text-gray-500">Live CPU, memory and disk for the server the portal runs on. Visible to IT and Admin only.</p>
      </div>
      <MetricsLive />
    </div>
  )
}
