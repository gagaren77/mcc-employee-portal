import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <div className="min-h-screen mcc-gradient flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-9 h-9 bg-[#c9a227] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Midwestern Career College</p>
          <p className="text-blue-300 text-xs">Employee Portal</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-blue-300 text-xs">
          © {new Date().getFullYear()} Midwestern Career College. All rights reserved.
        </p>
      </div>
    </div>
  )
}
