"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

export interface Person {
  name: string | null
  email: string
  department?: string | null
  title?: string | null
}

/** Search-as-you-type picker over portal users, with a fallback to typing any email address. */
export function UserPicker({ value, onChange }: { value: Person | null; onChange: (p: Person | null) => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Person[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const seq = useRef(0)

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const mine = ++seq.current
    setLoading(true)
    const t = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json().catch(() => ({ users: [] }))
      if (mine === seq.current) {
        setResults(data.users ?? [])
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  if (value) {
    return (
      <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{value.name || value.email}</p>
          <p className="text-xs text-gray-500 truncate">
            {value.email}
            {value.title ? ` · ${value.title}` : ""}
            {value.department ? ` · ${value.department}` : ""}
          </p>
        </div>
        <button type="button" onClick={() => onChange(null)} aria-label="Clear selection">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    )
  }

  const typed = q.trim()
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typed)
  const pick = (p: Person) => {
    onChange(p)
    setQ("")
    setResults([])
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search name, department, title — or type an email"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4a8a]"
        />
      </div>
      {open && typed.length >= 2 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-64 overflow-auto py-1">
            {results.map((u) => (
              <li key={u.email}>
                <button type="button" onClick={() => pick(u)} className="w-full text-left px-3 py-2 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-800">{u.name || u.email}</p>
                  <p className="text-xs text-gray-500">
                    {u.email}
                    {u.title ? ` · ${u.title}` : ""}
                    {u.department ? ` · ${u.department}` : ""}
                  </p>
                </button>
              </li>
            ))}
            {looksLikeEmail && !results.some((u) => u.email.toLowerCase() === typed.toLowerCase()) && (
              <li>
                <button type="button" onClick={() => pick({ name: null, email: typed })} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-[#1a4a8a]">
                  Use email address <b>{typed}</b>
                </button>
              </li>
            )}
            {!loading && results.length === 0 && !looksLikeEmail && <li className="px-3 py-2 text-sm text-gray-500">No matches. Type a full email address to use someone outside the portal.</li>}
            {loading && results.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">Searching…</li>}
          </ul>
        </>
      )}
    </div>
  )
}
