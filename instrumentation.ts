export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { startMailPolling } = await import("@/lib/mail-poller")
  startMailPolling()
}
