import { Users, Calendar, FileText, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"

export async function StatsWidget() {
  const [employeeCount, eventCount, resourceCount] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.event.count({ where: { startDate: { gte: new Date() } } }),
    prisma.hrResource.count({ where: { isActive: true } }),
  ])

  const stats = [
    {
      label: "Employees",
      value: employeeCount,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Upcoming Events",
      value: eventCount,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "HR Resources",
      value: resourceCount,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Quick Access",
      value: "→",
      icon: TrendingUp,
      color: "text-[#c9a227]",
      bg: "bg-amber-50",
      href: "/quick-links",
    },
  ]

  return (
    <div className="mcc-card p-5">
      <h2 className="font-semibold text-gray-800 mb-3 text-sm">Portal Stats</h2>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3`}>
              <div className={`${stat.color} mb-1`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
