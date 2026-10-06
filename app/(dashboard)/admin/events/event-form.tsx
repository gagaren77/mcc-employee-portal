"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const CATEGORIES = [
  "general",
  "holiday",
  "training",
  "meeting",
  "deadline",
  "social",
  "academic",
]

export interface EventFormValues {
  id?: string
  title: string
  description: string
  startDate: string // datetime-local format: "YYYY-MM-DDTHH:mm"
  endDate: string
  location: string
  category: string
  published: boolean
}

interface EventFormProps {
  initial?: EventFormValues
}

export function EventForm({ initial }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!initial?.id

  const [title, setTitle] = useState(initial?.title ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [startDate, setStartDate] = useState(initial?.startDate ?? "")
  const [endDate, setEndDate] = useState(initial?.endDate ?? "")
  const [location, setLocation] = useState(initial?.location ?? "")
  const [category, setCategory] = useState(initial?.category ?? "general")
  const [published, setPublished] = useState(initial?.published ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const payload = {
      title,
      description: description || null,
      startDate,
      endDate: endDate || null,
      location: location || null,
      category,
      published,
    }

    try {
      const url = isEdit ? `/api/admin/events/${initial!.id}` : "/api/admin/events"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to save event.")
      } else {
        router.push("/admin/events")
        router.refresh()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mcc-card p-6 space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Event Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input"
          placeholder="All-Staff Town Hall"
        />
      </Field>

      <Field label="Description (optional)">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input"
          placeholder="What's this event about?"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Start Date & Time">
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="input"
          />
        </Field>
        <Field label="End Date & Time (optional)">
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Location (optional)">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
            placeholder="Main Auditorium"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 accent-[#1a4a8a]"
        />
        <span className="text-sm text-gray-700">
          Published (visible on the employee portal)
        </span>
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="mcc-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.625rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #1a4a8a;
          box-shadow: 0 0 0 2px rgba(26, 74, 138, 0.15);
        }
      `}</style>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
