"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  HelpCircle,
  Calendar,
  Bookmark,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SidebarProps {
  user: {
    name?: string | null
    role: string
    department?: string | null
  }
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/directory", label: "Employee Directory", icon: Users },
  { href: "/documents", label: "Documents & SharePoint", icon: FileText },
  { href: "/benefits", label: "Benefits", icon: Heart },
  { href: "/hr", label: "HR Resources", icon: ClipboardList },
  { href: "/it-help", label: "IT Help Desk", icon: HelpCircle },
  { href: "/events", label: "Events & Calendar", icon: Calendar },
  { href: "/quick-links", label: "Quick Links", icon: Bookmark },
]

const adminItems = [
  { href: "/admin", label: "Admin Panel", icon: Settings },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isAdmin = ["ADMIN", "HR"].includes(user.role)
  const items = navItems // Ticket Queue now lives on the IT Help Desk page (staff only)

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#0d2d5c] text-white transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden p-0.5">
          <img
            src="/logo.png"
            alt="My MCC Portal"
            className="w-full h-full object-contain"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate">My MCC Portal</p>
            <p className="text-xs text-blue-300 leading-tight truncate">Employee Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-[#1a4a8a] text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("flex-shrink-0 w-5 h-5", isActive ? "text-[#c9a227]" : "")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              {!collapsed && (
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Administration
                </p>
              )}
              {collapsed && <div className="border-t border-white/10" />}
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#1a4a8a] text-white"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn("flex-shrink-0 w-5 h-5", isActive ? "text-[#c9a227]" : "")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-[#1a4a8a] border border-blue-700 rounded-full flex items-center justify-center text-white hover:bg-[#c9a227] transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-xs text-blue-400 truncate">
            {user.department && `${user.department} · `}
            <span className="capitalize">{user.role.toLowerCase()}</span>
          </p>
        </div>
      )}
    </aside>
  )
}
