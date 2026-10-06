"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2, KeyRound } from "lucide-react"

const ROLES = ["EMPLOYEE", "HR", "IT", "ADMIN"] as const

interface EditUserFormProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    department: string
    title: string
    isActive: boolean
    isExternal: boolean
    isSelf: boolean
  }
}

export function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState<(typeof ROLES)[number]>(
    (user.role as (typeof ROLES)[number]) ?? "EMPLOYEE"
  )
  const [department, setDepartment] = useState(user.department)
  const [title, setTitle] = useState(user.title)
  const [isActive, setIsActive] = useState(user.isActive)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Reset password state
  const [resetOpen, setResetOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [resetLoading, setResetLoading] = useState(false)

  // Delete state
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          department: department || null,
          title: title || null,
          isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to update user.")
      } else {
        setSuccess("User updated.")
        router.refresh()
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setResetLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to reset password.")
      } else {
        setSuccess("Password reset successfully.")
        setResetOpen(false)
        setNewPassword("")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setResetLoading(false)
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Permanently delete ${user.name}? This cannot be undone.`
      )
    )
      return
    setError("")
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to delete user.")
        setDeleteLoading(false)
      } else {
        router.push("/admin/users")
        router.refresh()
      }
    } catch {
      setError("Network error.")
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Profile form */}
      <form onSubmit={handleSave} className="mcc-card p-6 space-y-5">
        <Field label="Full Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={user.email}
            readOnly
            disabled
            className="input bg-gray-50 text-gray-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Email cannot be changed. Create a new user if needed.
          </p>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Role">
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as (typeof ROLES)[number])
              }
              className="input"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Department">
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Job Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={user.isSelf}
            className="w-4 h-4 accent-[#1a4a8a]"
          />
          <span className="text-sm text-gray-700">
            Account is active
            {user.isSelf && (
              <span className="text-xs text-gray-400 ml-2">
                (you cannot deactivate yourself)
              </span>
            )}
          </span>
        </label>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="mcc-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Password reset */}
      <div className="mcc-card p-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
          <KeyRound className="w-4 h-4 text-[#1a4a8a]" />
          Reset Password
        </h3>
        {user.isExternal ? (
          <p className="text-sm text-gray-600">
            This user signs in via SSO. Their password must be changed through
            the SSO provider.
          </p>
        ) : !resetOpen ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-gray-600">
              Set a new password for this user.
            </p>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Reset Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="New password (min 8 chars)"
              className="input"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setResetOpen(false)
                  setNewPassword("")
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="mcc-btn-primary flex items-center gap-2 px-4 py-2 rounded-xl disabled:opacity-60"
              >
                {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {resetLoading ? "Saving..." : "Save Password"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delete */}
      {!user.isSelf && (
        <div className="mcc-card p-6 border border-red-100">
          <h3 className="text-base font-bold text-red-700 mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Permanently delete this user and all associated sessions.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            {deleteLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleteLoading ? "Deleting..." : "Delete User"}
          </button>
        </div>
      )}

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
    </div>
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
