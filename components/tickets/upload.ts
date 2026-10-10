/** Uploads files one request each (keeps every request under the body-size limit). Returns names that failed. */
export async function uploadFiles(ticketId: string, files: File[], commentId?: string): Promise<string[]> {
  const failed: string[] = []
  for (const f of files) {
    const fd = new FormData()
    fd.append("files", f)
    if (commentId) fd.append("commentId", commentId)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/attachments`, { method: "POST", body: fd })
      if (!res.ok) failed.push(f.name)
    } catch {
      failed.push(f.name)
    }
  }
  return failed
}
