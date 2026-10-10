import path from "node:path"
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { prisma } from "@/lib/prisma"
import { MAX_ATTACHMENT_BYTES, isBlockedFile, extOf } from "@/lib/ticket-constants"

/** Directory next to the SQLite file (the persistent Docker volume in production), or ATTACHMENTS_DIR. */
export function attachmentsDir(): string {
  if (process.env.ATTACHMENTS_DIR) return process.env.ATTACHMENTS_DIR
  const url = (process.env.DATABASE_URL || "file:./prisma/dev.db").replace(/^file:/, "")
  const abs = path.isAbsolute(url) ? url : path.resolve(process.cwd(), "prisma", url)
  return path.join(path.dirname(abs), "attachments")
}
const filePath = (id: string) => path.join(attachmentsDir(), id)

/** Identify previewable types by their file signature, never by the claimed type or extension. */
function sniff(b: Buffer): { mime: string } | null {
  if (b.length < 12) return null
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg" }
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png" }
  if (b.subarray(0, 4).toString("latin1") === "GIF8") return { mime: "image/gif" }
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return { mime: "image/webp" }
  if (b.subarray(0, 5).toString("latin1") === "%PDF-") return { mime: "application/pdf" }
  return null
}

const MIME_BY_EXT: Record<string, string> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
}

export function cleanFilename(name: string): string {
  const n = name.replace(/[\\/\0-\x1f\x7f"]/g, "_").replace(/^\.+/, "").trim().slice(0, 150)
  return n || "file"
}

export interface SaveInput {
  ticketId: string
  commentId?: string | null
  filename: string
  data: Buffer
  uploadedById?: string | null
  source: "PORTAL" | "EMAIL"
}

export async function saveAttachment(input: SaveInput): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const filename = cleanFilename(input.filename)
  if (isBlockedFile(filename)) return { ok: false, reason: "File type not allowed" }
  if (input.data.length === 0) return { ok: false, reason: "Empty file" }
  if (input.data.length > MAX_ATTACHMENT_BYTES) return { ok: false, reason: "File too large" }

  const sniffed = sniff(input.data)
  const rec = await prisma.ticketAttachment.create({
    data: {
      ticketId: input.ticketId,
      commentId: input.commentId ?? null,
      filename,
      mimeType: sniffed?.mime ?? MIME_BY_EXT[extOf(filename)] ?? "application/octet-stream",
      size: input.data.length,
      previewable: !!sniffed,
      uploadedById: input.uploadedById ?? null,
      source: input.source,
    },
  })
  await mkdir(attachmentsDir(), { recursive: true })
  await writeFile(filePath(rec.id), input.data)
  return { ok: true, id: rec.id }
}

export const readAttachment = (id: string) => readFile(filePath(id))
