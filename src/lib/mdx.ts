/**
 * MDX plugin pipeline. Imported by the post page when compiling MDX
 * with `next-mdx-remote/rsc`.
 *
 * Keep the list short and curated – every plugin is HTML emitted into
 * every post forever, so additions should be justified.
 */

import type { MDXRemoteProps } from 'next-mdx-remote/rsc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkSmartypants from 'remark-smartypants'

/**
 * KaTeX configuration. Math is written as `$inline$` and `$$display$$` in MDX
 * and rendered to HTML+MathML at build (zero runtime JS; only katex.min.css
 * ships, imported in the post route). `macros` add the few siunitx-style
 * helpers we use so `\SI{6.02}{dB}` and `\si{dB}` work out of the box.
 * `throwOnError: false` degrades a malformed expression to red source text
 * instead of failing the whole build. See ADR-005.
 */
const katexOptions = {
  throwOnError: false,
  macros: {
    '\\SI': '#1\\,\\mathrm{#2}',
    '\\si': '\\mathrm{#1}',
  },
}

/**
 * Shiki configuration for code-block syntax highlighting.
 *
 * • Two themes – `github-light` and `github-dark` – emitted as CSS variables
 *   on every token. We swap them via the `.dark` class on <html> set by
 *   next-themes. Zero JavaScript at runtime.
 * • `keepBackground: false` lets our own CSS own the surface colour, so the
 *   code block surface harmonises with the editorial palette.
 * • `defaultLang: 'plaintext'` makes fenced code blocks without a language
 *   render as plain text instead of failing the build.
 */
const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
  keepBackground: false,
  defaultLang: 'plaintext',
  // Apply a data attribute so we can target inline code differently
  // from block code in CSS.
  onVisitHighlightedLine(node) {
    node.properties.className = [...(node.properties.className ?? []), 'highlighted-line']
  },
}

export const mdxOptions: MDXRemoteProps['options'] = {
  parseFrontmatter: false, // we parse it ourselves in lib/posts.ts
  mdxOptions: {
    remarkPlugins: [
      remarkGfm,
      // smartypants typographic quotes / dashes
      [remarkSmartypants, { quotes: true, dashes: 'oldschool' }],
      // parse `$inline$` and `$$display$$` math into math nodes
      remarkMath,
    ],
    rehypePlugins: [
      rehypeSlug,
      // render math nodes to KaTeX HTML+MathML at build time
      [rehypeKatex, katexOptions],
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            className: ['heading-anchor'],
            ariaLabel: 'Link to this section',
          },
          content: {
            type: 'element',
            tagName: 'span',
            properties: { className: ['heading-anchor__mark'] },
            children: [{ type: 'text', value: '#' }],
          },
        },
      ],
      [rehypePrettyCode, prettyCodeOptions],
    ],
  },
}
