"use client"

import { signOut } from "next-auth/react"
import { LogOut, User, Settings, ChevronDown, Users, Calendar, Ticket, Megaphone } from "lucide-react"
import { getInitials, APP_TIMEZONE } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { NotificationsBell } from "@/components/notifications-bell"

interface TopBarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    title?: string | null
  }
}

export function TopBar({ user }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const isAdminLevel = ["ADMIN", "HR"].includes(user.role)
  const canSeeAdminPanel = isAdminLevel || user.role === "IT"

  // Dropdown groups: personal, content management (Admin/HR), then the Admin Panel (Admin/HR/IT).
  const sections = [
    { label: null as string | null, items: [{ href: "/profile", label: "My Profile", Icon: User }, { href: "/tickets", label: "My Tickets", Icon: Ticket }] },
    {
      label: "Manage",
      items: isAdminLevel
        ? [
            { href: "/admin/users", label: "Users", Icon: Users },
            { href: "/admin/events", label: "Events", Icon: Calendar },
            { href: "/admin/announcements", label: "Announcements", Icon: Megaphone },
          ]
        : [],
    },
    { label: "Administration", items: canSeeAdminPanel ? [{ href: "/admin", label: "Admin Panel", Icon: Settings }] : [] },
  ]

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
      {/* Left: Date/Time */}
      <div>
        <p className="text-sm font-medium text-gray-800">
          {new Date().toLocaleDateString("en-US", { timeZone: APP_TIMEZONE,
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {user.title && (
          <p className="text-xs text-gray-500">{user.title}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <NotificationsBell />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {user.image ? (
              <img
                src={user.image}
                alt={user.name ?? "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1a4a8a] flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user.name)}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-none">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                {sections.map((section) =>
                  section.items.length === 0 ? null : (
                    <div key={section.label ?? "me"} className={section.label ? "border-t border-gray-100 mt-1 pt-1" : ""}>
                      {section.label && (
                        <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{section.label}</p>
                      )}
                      {section.items.map(({ href, label, Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Icon className="w-4 h-4 text-gray-400" />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )
                )}

                <div className="border-t border-gray-100 mt-1" />
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
