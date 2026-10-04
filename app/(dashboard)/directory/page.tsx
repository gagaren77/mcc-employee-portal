"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Phone, MapPin, Users, Building2 } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface Employee {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  department: string | null
  title: string | null
  phone: string | null
  location: string | null
}

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [selectedDept, setSelectedDept] = useState("All")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((data) => {
        setEmployees(data)
        setLoading(false)
      })
  }, [])

  const departments = ["All", ...Array.from(new Set(employees.map((e) => e.department ?? "Unknown").filter(Boolean))).sort()]

  const filtered = employees.filter((e) => {
    const matchSearch =
      search === "" ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.department?.toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept === "All" || e.department === selectedDept
    return matchSearch && matchDept
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#1a4a8a]" />
          Employee Directory
        </h1>
        <p className="text-gray-500 text-sm mt-1">Find and connect with your colleagues at MCC.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, title, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a] bg-white"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500">
        Showing <strong>{filtered.length}</strong> of <strong>{employees.length}</strong> employees
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mcc-card p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No employees found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div key={emp.id} className="mcc-card p-5">
              <div className="flex items-start gap-3">
                {emp.image ? (
                  <img src={emp.image} alt={emp.name ?? ""} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1a4a8a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getInitials(emp.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">{emp.name ?? "Unknown"}</h3>
                  {emp.title && <p className="text-xs text-[#1a4a8a] font-medium truncate">{emp.title}</p>}
                  {emp.department && (
                    <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full mt-1">
                      {emp.department}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                <a href={`mailto:${emp.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#1a4a8a] truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  {emp.email}
                </a>
                {emp.phone && (
                  <a href={`tel:${emp.phone}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#1a4a8a]">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {emp.phone}
                  </a>
                )}
                {emp.location && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    {emp.location}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
