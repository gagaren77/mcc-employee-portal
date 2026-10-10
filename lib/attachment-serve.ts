import { readAttachment } from "@/lib/attachments"

/**
 * Builds the file response for an attachment. The CALLER must already have authorised access
 * (login + ticket check, ticket token, or approval token).
 *
 *   (default)     inline for verified images/PDF, otherwise download
 *   ?download=1   always a download
 */
export async function serveAttachment(
  att: { id: string; filename: string; mimeType: string; previewable: boolean },
  req: Request
): Promise<Response> {
  let data: Buffer
  try {
    data = await readAttachment(att.id)
  } catch {
    return new Response("File missing", { status: 404 })
  }

  const download = new URL(req.url).searchParams.get("download") === "1" || !att.previewable
  const ascii = att.filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "")
  const headers: Record<string, string> = {
    "Content-Type": download ? "application/octet-stream" : att.mimeType,
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(att.filename)}`,
    "Content-Length": String(data.length),
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, max-age=3600",
  }
  if (!download && att.mimeType.startsWith("image/")) {
    headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'"
  }
  return new Response(new Uint8Array(data), { headers })
}
