import { sendMail } from "@/lib/graph"
import { appUrl } from "@/lib/app-url"

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}

/** Shared MCC-branded email shell. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:Segoe UI,Arial,sans-serif;color:#1f2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0d2d5c;padding:14px 24px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="background:#fff;border-radius:8px;padding:3px;width:30px;height:36px;line-height:0"><img src="${esc(appUrl("/logo.png"))}" alt="MCC" width="30" height="36" style="display:block;border:0"></td>
<td style="padding-left:12px;color:#fff;font-size:16px;font-weight:600">My MCC Portal &middot; IT Department</td>
</tr></table></td></tr>
<tr><td style="padding:24px"><h2 style="margin:0 0 12px;font-size:18px">${esc(title)}</h2>${bodyHtml}</td></tr>
<tr><td style="padding:12px 24px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb">Midwestern Career College &middot; ${esc(appUrl())}</td></tr>
</table></td></tr></table></body></html>`
}

export function emailButton(href: string, label: string, color = "#1a4a8a"): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px">${esc(label)}</a>`
}

export async function sendTestEmail(to: string) {
  await sendMail({
    to: [to],
    subject: "MCC Portal — test email",
    html: emailLayout(
      "Test email",
      `<p style="font-size:14px;line-height:1.5">If you can read this, the portal can send mail through Microsoft 365.</p>${emailButton(appUrl("/dashboard"), "Open portal")}`
    ),
  })
}
