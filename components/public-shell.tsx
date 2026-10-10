import Image from "next/image"

/** Minimal chrome for the no-login pages (approval + ticket tracking links). */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0d2d5c] text-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden p-0.5">
            <Image src="/logo.png" alt="MCC" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">My MCC Portal</p>
            <p className="text-xs text-blue-300 leading-tight">IT Help Desk</p>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">{children}</main>
    </div>
  )
}
