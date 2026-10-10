/**
 * Minimal Microsoft Graph client (app-only / client-credentials). No SDK needed.
 * Access to mail is limited in Exchange (RBAC for Applications) to the mailbox(es)
 * named in the scope, so a leaked secret cannot read other mailboxes.
 */

const TENANT = process.env.AZURE_TENANT_ID
const CLIENT_ID = process.env.AZURE_CLIENT_ID
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET

export const SUPPORT_MAILBOX = process.env.MAILBOX_SUPPORT || "techsupport@mccollege.edu"

export function graphConfigured(): boolean {
  return !!(TENANT && CLIENT_ID && CLIENT_SECRET)
}

let cached: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (!graphConfigured()) throw new Error("Microsoft Graph is not configured (AZURE_* env vars missing)")
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token

  const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  })
  if (!res.ok) {
    // Never include the request body (contains the secret) in errors.
    throw new Error(`Graph token request failed: ${res.status} ${(await res.text()).slice(0, 300)}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cached = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return cached.token
}

export async function graphFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken()
  return fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  })
}

export interface SendMailInput {
  to: string[]
  subject: string
  html: string
  /** Mailbox to send from. Defaults to the support mailbox. */
  from?: string
  replyTo?: string
}

export async function sendMail({ to, subject, html, from = SUPPORT_MAILBOX, replyTo }: SendMailInput): Promise<void> {
  if (!graphConfigured()) {
    // Dev/mock mode: log instead of sending.
    console.log(`[mail:mock] from=${from} to=${to.join(",")} subject=${subject}`)
    return
  }
  const res = await graphFetch(`/users/${encodeURIComponent(from)}/sendMail`, {
    method: "POST",
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: to.map((address) => ({ emailAddress: { address } })),
        ...(replyTo ? { replyTo: [{ emailAddress: { address: replyTo } }] } : {}),
      },
      saveToSentItems: true,
    }),
  })
  if (!res.ok) {
    throw new Error(`Graph sendMail failed: ${res.status} ${(await res.text()).slice(0, 500)}`)
  }
}

export interface InboxMessage {
  id: string
  internetMessageId: string
  subject: string | null
  receivedDateTime: string
  from?: { emailAddress: { name?: string; address: string } }
  bodyPreview: string
  body: { contentType: string; content: string }
  conversationId: string
  hasAttachments?: boolean
  internetMessageHeaders?: { name: string; value: string }[]
}

export interface MailFolder {
  id: string
  displayName: string
}

let folderCache: { at: number; mailbox: string; map: Map<string, MailFolder> } | null = null

/** Inbox plus every subfolder (up to 3 levels deep), keyed by lower-cased display name. */
async function loadFolders(mailbox: string): Promise<Map<string, MailFolder>> {
  if (folderCache && folderCache.mailbox === mailbox && Date.now() - folderCache.at < 10 * 60_000) return folderCache.map
  const map = new Map<string, MailFolder>()
  const base = `/users/${encodeURIComponent(mailbox)}/mailFolders`

  const rootRes = await graphFetch(`${base}/inbox?$select=id,displayName`)
  if (!rootRes.ok) throw new Error(`Graph inbox lookup failed: ${rootRes.status} ${(await rootRes.text()).slice(0, 300)}`)
  const root = (await rootRes.json()) as MailFolder
  map.set("inbox", { id: root.id, displayName: "Inbox" })

  let level: MailFolder[] = [root]
  for (let depth = 0; depth < 3 && level.length; depth++) {
    const next: MailFolder[] = []
    for (const parent of level) {
      const res = await graphFetch(`${base}/${parent.id}/childFolders?$top=100&$select=id,displayName`)
      if (!res.ok) throw new Error(`Graph child folders failed: ${res.status} ${(await res.text()).slice(0, 300)}`)
      const kids = ((await res.json()) as { value: MailFolder[] }).value
      for (const k of kids) {
        const key = k.displayName.toLowerCase()
        if (!map.has(key)) map.set(key, k) // first match wins if names repeat
        next.push(k)
      }
    }
    level = next
  }
  folderCache = { at: Date.now(), mailbox, map }
  return map
}

/** Looks up folders by display name ("Inbox" or any subfolder of it). */
export async function resolveFolders(names: string[], mailbox = SUPPORT_MAILBOX): Promise<{ found: MailFolder[]; missing: string[] }> {
  const map = await loadFolders(mailbox)
  const found: MailFolder[] = []
  const missing: string[] = []
  for (const n of names) {
    const f = map.get(n.trim().toLowerCase())
    if (f) found.push(f)
    else missing.push(n)
  }
  return { found, missing }
}

/** Oldest-first messages in a folder received after `since` (ISO string). Read-only. */
export async function listFolderMessages(folderId: string, since: string, mailbox = SUPPORT_MAILBOX, top = 50): Promise<InboxMessage[]> {
  const params = new URLSearchParams({
    $filter: `receivedDateTime gt ${since}`,
    $orderby: "receivedDateTime asc",
    $top: String(top),
    $select: "id,internetMessageId,subject,receivedDateTime,from,bodyPreview,body,conversationId,hasAttachments,internetMessageHeaders",
  })
  const res = await graphFetch(`/users/${encodeURIComponent(mailbox)}/mailFolders/${folderId}/messages?${params}`)
  if (!res.ok) {
    throw new Error(`Graph list messages failed: ${res.status} ${(await res.text()).slice(0, 500)}`)
  }
  return ((await res.json()) as { value: InboxMessage[] }).value
}

export const listInboxMessages = (since: string, mailbox = SUPPORT_MAILBOX, top = 50) =>
  listFolderMessages("inbox", since, mailbox, top)

export interface MessageAttachment {
  id: string
  name: string
  contentType: string
  size: number
  isInline: boolean
  "@odata.type": string
}

export async function listMessageAttachments(messageId: string, mailbox = SUPPORT_MAILBOX): Promise<MessageAttachment[]> {
  const res = await graphFetch(
    `/users/${encodeURIComponent(mailbox)}/messages/${messageId}/attachments?$select=id,name,contentType,size,isInline`
  )
  if (!res.ok) throw new Error(`Graph list attachments failed: ${res.status} ${(await res.text()).slice(0, 300)}`)
  return ((await res.json()) as { value: MessageAttachment[] }).value
}

/** Raw bytes of a file attachment. */
export async function getAttachmentBytes(messageId: string, attachmentId: string, mailbox = SUPPORT_MAILBOX): Promise<Buffer> {
  const res = await graphFetch(`/users/${encodeURIComponent(mailbox)}/messages/${messageId}/attachments/${attachmentId}/$value`)
  if (!res.ok) throw new Error(`Graph attachment download failed: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}
