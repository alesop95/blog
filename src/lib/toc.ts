/**
 * Table-of-contents extraction from raw MDX content.
 *
 * IDs are produced with `github-slugger` – the SAME slugger that `rehype-slug`
 * uses at render time – so each entry's `id` matches the heading's rendered
 * anchor exactly. Every heading (any level) advances the slugger in document
 * order, so duplicate heading texts receive the same `-1`/`-2` suffixes
 * rehype-slug would assign; only h2/h3 are returned for the ToC.
 *
 * Build-time only – never shipped to the client.
 */

import GithubSlugger from 'github-slugger'
import type { Heading } from 'mdast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString as mdastToString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'

export interface TocEntry {
  depth: 2 | 3
  text: string
  id: string
}

export function extractToc(content: string): TocEntry[] {
  const tree = fromMarkdown(content)
  const slugger = new GithubSlugger()
  const entries: TocEntry[] = []

  visit(tree, 'heading', (node: Heading) => {
    const text = mdastToString(node)
    // Advance the slugger for EVERY heading to mirror rehype-slug's dedup state.
    const id = slugger.slug(text)
    if (node.depth === 2 || node.depth === 3) {
      entries.push({ depth: node.depth, text, id })
    }
  })

  return entries
}
