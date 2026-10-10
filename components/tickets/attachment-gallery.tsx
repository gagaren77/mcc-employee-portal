"use client"

import { useEffect, useState } from "react"
import { Download, FileText, FileSpreadsheet, File as FileIcon, X, Eye } from "lucide-react"
import { formatBytes } from "@/lib/ticket-constants"

export interface AttachmentView {
  id: string
  filename: string
  mimeType: string
  size: number
  previewable: boolean
}

const isImage = (a: AttachmentView) => a.previewable && a.mimeType.startsWith("image/")
const isPdf = (a: AttachmentView) => a.previewable && a.mimeType === "application/pdf"

function iconFor(a: AttachmentView) {
  if (/sheet|excel|csv/.test(a.mimeType)) return FileSpreadsheet
  if (/pdf|word|text|presentation/.test(a.mimeType)) return FileText
  return FileIcon
}

export function AttachmentGallery({ attachments, basePath = "/api/attachments" }: { attachments: AttachmentView[]; basePath?: string }) {
  const [open, setOpen] = useState<AttachmentView | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  if (attachments.length === 0) return null
  const images = attachments.filter(isImage)
  const files = attachments.filter((a) => !isImage(a))

  return (
    <div className="mt-3 space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((a) => (
            <div key={a.id} className="group relative">
              <button type="button" onClick={() => setOpen(a)} className="block rounded-lg overflow-hidden border border-gray-200 bg-gray-50" title={a.filename}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${basePath}/${a.id}`} alt={a.filename} loading="lazy" className="h-24 w-32 object-cover" />
              </button>
              <a
                href={`${basePath}/${a.id}?download=1`}
                className="absolute bottom-1 right-1 bg-white/90 rounded p-1 shadow opacity-0 group-hover:opacity-100 focus:opacity-100"
                title={`Download ${a.filename}`}
              >
                <Download className="w-3.5 h-3.5 text-gray-700" />
              </a>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((a) => {
            const Icon = iconFor(a)
            return (
              <li key={a.id} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm max-w-full">
                <Icon className="w-4 h-4 text-[#1a4a8a] flex-shrink-0" />
                <span className="truncate max-w-[14rem]" title={a.filename}>{a.filename}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatBytes(a.size)}</span>
                {isPdf(a) && (
                  <button type="button" onClick={() => setOpen(a)} className="text-xs text-[#1a4a8a] hover:underline inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                )}
                <a href={`${basePath}/${a.id}?download=1`} className="text-xs text-[#1a4a8a] hover:underline inline-flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </li>
            )
          })}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col p-4" onClick={() => setOpen(null)}>
          <div className="flex items-center justify-between text-white mb-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium truncate pr-4">{open.filename} <span className="text-white/60 font-normal">· {formatBytes(open.size)}</span></p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href={`${basePath}/${open.id}?download=1`} className="bg-white text-gray-800 text-sm font-medium rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Download full copy
              </a>
              <button type="button" onClick={() => setOpen(null)} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isPdf(open) ? (
              <iframe src={`${basePath}/${open.id}`} title={open.filename} className="w-full h-full bg-white rounded-lg" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${basePath}/${open.id}`} alt={open.filename} className="max-w-full max-h-full object-contain rounded-lg bg-white" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
