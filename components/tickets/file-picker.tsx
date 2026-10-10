"use client"

import { useRef } from "react"
import { Paperclip, X } from "lucide-react"
import { MAX_ATTACHMENT_BYTES, MAX_FILES_PER_UPLOAD, formatBytes, isBlockedFile } from "@/lib/ticket-constants"

export function FilePicker({
  files,
  onChange,
  onError,
}: {
  files: File[]
  onChange: (f: File[]) => void
  onError?: (msg: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)

  function add(list: FileList | null) {
    if (!list) return
    const next = [...files]
    for (const f of Array.from(list)) {
      if (isBlockedFile(f.name)) onError?.(`"${f.name}" can't be attached (file type not allowed).`)
      else if (f.size > MAX_ATTACHMENT_BYTES) onError?.(`"${f.name}" is larger than ${formatBytes(MAX_ATTACHMENT_BYTES)}.`)
      else if (next.length >= MAX_FILES_PER_UPLOAD) onError?.(`You can attach up to ${MAX_FILES_PER_UPLOAD} files at a time.`)
      else next.push(f)
    }
    onChange(next)
    if (input.current) input.current.value = ""
  }

  return (
    <div>
      <input ref={input} type="file" multiple className="hidden" onChange={(e) => add(e.target.files)} />
      <button type="button" onClick={() => input.current?.click()} className="mcc-btn-secondary text-sm inline-flex items-center gap-1.5">
        <Paperclip className="w-4 h-4" /> Attach files
      </button>
      <span className="text-xs text-gray-400 ml-2">Screenshots, PDFs, Office files · up to {formatBytes(MAX_ATTACHMENT_BYTES)} each</span>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="truncate">{f.name} <span className="text-gray-400">· {formatBytes(f.size)}</span></span>
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}>
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
