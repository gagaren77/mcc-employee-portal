import { GraduationCap, Sparkles } from "lucide-react"

interface WelcomeBannerProps {
  user: {
    name?: string | null
    role: string
    department?: string | null
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function WelcomeBanner({ user }: WelcomeBannerProps) {
  const firstName = user.name?.split(" ")[0] ?? "there"

  return (
    <div className="mcc-gradient rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#c9a227]" />
            <span className="text-blue-200 text-sm font-medium">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-1">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            Welcome to the Midwestern Career College Employee Portal.
            {user.department && ` You're in the ${user.department} department.`}
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl flex-shrink-0">
          <GraduationCap className="w-8 h-8 text-[#c9a227]" />
        </div>
      </div>

      {/* Quick stats row */}
      <div className="relative mt-4 flex gap-4 flex-wrap">
        <div className="bg-white/10 rounded-lg px-3 py-1.5">
          <span className="text-xs text-blue-200">Role</span>
          <p className="text-sm font-semibold capitalize">{user.role.toLowerCase()}</p>
        </div>
        {user.department && (
          <div className="bg-white/10 rounded-lg px-3 py-1.5">
            <span className="text-xs text-blue-200">Department</span>
            <p className="text-sm font-semibold">{user.department}</p>
          </div>
        )}
        <div className="bg-white/10 rounded-lg px-3 py-1.5">
          <span className="text-xs text-blue-200">Portal Version</span>
          <p className="text-sm font-semibold">2.0</p>
        </div>
      </div>
    </div>
  )
}
