import path from "node:path"

/** Directory next to the SQLite file (the persistent Docker volume in production), or ATTACHMENTS_DIR. */
export function attachmentsDir(): string {
  if (process.env.ATTACHMENTS_DIR) return process.env.ATTACHMENTS_DIR
  const url = (process.env.DATABASE_URL || "file:./prisma/dev.db").replace(/^file:/, "")
  const abs = path.isAbsolute(url) ? url : path.resolve(process.cwd(), "prisma", url)
  return path.join(path.dirname(abs), "attachments")
}
