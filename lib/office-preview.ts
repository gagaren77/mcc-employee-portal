import path from "node:path"
import os from "node:os"
import { execFile } from "node:child_process"
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import { attachmentsDir } from "@/lib/attachments-path"
import { extOf } from "@/lib/ticket-constants"

/**
 * Converts an Office-style attachment to PDF with LibreOffice (headless) so it can be previewed in
 * the same viewer as real PDFs. The result is cached next to the original (<id>.preview.pdf);
 * a failure leaves a marker (<id>.preview.failed) so we don't retry a bad file on every click.
 * The original file is never modified, and the user's filename never touches the filesystem.
 */

const OFFICE_BIN = process.env.OFFICE_BIN || "soffice"
const TIMEOUT_MS = 60_000

const ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04])
const OLE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])

/** The file must actually look like what its extension claims before we hand it to a converter. */
function signatureOk(ext: string, b: Buffer): boolean {
  if (["docx", "xlsx", "pptx", "odt", "ods", "odp"].includes(ext)) return b.subarray(0, 4).equals(ZIP)
  if (["doc", "xls", "ppt"].includes(ext)) return b.subarray(0, 8).equals(OLE)
  if (ext === "rtf") return b.subarray(0, 5).toString("latin1") === "{\\rtf"
  if (ext === "txt" || ext === "csv") return !b.subarray(0, 2048).includes(0) // text, not binary
  return false
}

// LibreOffice is heavy: convert one file at a time.
let queue: Promise<unknown> = Promise.resolve()
const serial = <T,>(fn: () => Promise<T>): Promise<T> => {
  const run = queue.then(fn, fn)
  queue = run.catch(() => undefined)
  return run
}

const exists = (p: string) => stat(p).then(() => true, () => false)

export type PreviewResult = { ok: true; pdf: Buffer } | { ok: false; reason: "unsupported" | "failed" | "unavailable" }

export async function getOfficePreviewPdf(id: string, filename: string, original: Buffer): Promise<PreviewResult> {
  const ext = extOf(filename)
  if (!signatureOk(ext, original)) return { ok: false, reason: "unsupported" }

  const cache = path.join(attachmentsDir(), `${id}.preview.pdf`)
  const failedMarker = path.join(attachmentsDir(), `${id}.preview.failed`)
  if (await exists(cache)) return { ok: true, pdf: await readFile(cache) }
  if (await exists(failedMarker)) return { ok: false, reason: "failed" }

  return serial(async (): Promise<PreviewResult> => {
    if (await exists(cache)) return { ok: true, pdf: await readFile(cache) } // converted while we waited
    const tmp = await mkdtemp(path.join(os.tmpdir(), "lo-"))
    try {
      const input = path.join(tmp, `in.${ext}`)
      await writeFile(input, original)
      await new Promise<void>((resolve, reject) => {
        execFile(
          OFFICE_BIN,
          [
            "--headless", "--norestore", "--nolockcheck", "--nodefault", "--nofirststartwizard",
            `-env:UserInstallation=file://${tmp}/profile`,
            "--convert-to", "pdf", "--outdir", tmp, input,
          ],
          { timeout: TIMEOUT_MS, env: { ...process.env, HOME: tmp }, maxBuffer: 1024 * 1024 },
          (err) => (err ? reject(err) : resolve())
        )
      })
      const pdf = await readFile(path.join(tmp, "in.pdf"))
      await writeFile(cache, pdf)
      return { ok: true, pdf }
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return { ok: false, reason: "unavailable" } // LibreOffice not installed
      console.error("[office-preview] conversion failed:", id, (e as Error).message)
      await writeFile(failedMarker, new Date().toISOString()).catch(() => undefined)
      return { ok: false, reason: "failed" }
    } finally {
      await rm(tmp, { recursive: true, force: true }).catch(() => undefined)
    }
  })
}
