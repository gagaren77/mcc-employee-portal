/** Renders plain text with http(s) URLs as safe, clickable links (no HTML injection: React escapes everything else). */
const URL_RE = /(https?:\/\/[^\s<>"']+)/g

export function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_RE)
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          // Keep trailing punctuation outside the link.
          const m = part.match(/^(.*?)([.,;:!?)\]]*)$/)!
          return (
            <span key={i}>
              <a href={m[1]} target="_blank" rel="noopener noreferrer" className="text-[#1a4a8a] underline break-all">
                {m[1]}
              </a>
              {m[2]}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
