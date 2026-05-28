'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentProps } from 'react'

/**
 * Custom `<pre>` for MDX code blocks.
 *
 * Wraps the original `<pre>` (already syntax-highlighted by rehype-pretty-code)
 * with a hover-visible "copy" button. The button reads the rendered code's
 * `textContent` so it copies exactly what the reader sees, not the source —
 * which means typographic preprocessing (smartypants etc.) doesn't sneak into
 * pasted code.
 *
 * `rehype-pretty-code` adds data attributes we leave intact so styling in
 * globals.css can target the right elements.
 */
export function CodeBlock(props: ComponentProps<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const [supported, setSupported] = useState(false)

  // Only mount the button if the Clipboard API is actually available
  // (it requires HTTPS in production — which we always have on GH Pages —
  // and a user activation gesture, which a click satisfies).
  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' && !!window.navigator?.clipboard,
    )
  }, [])

  const handleCopy = async () => {
    const text = preRef.current?.querySelector('code')?.textContent ?? ''
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard write can fail in restricted contexts — fail silently.
    }
  }

  return (
    <div className="group relative my-6">
      <pre ref={preRef} {...props} />
      {supported && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink/15 bg-paper/70 text-ink/60 opacity-0 backdrop-blur-sm transition-opacity hover:bg-paper hover:text-ink focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent group-hover:opacity-100"
        >
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
        </button>
      )}
    </div>
  )
}
