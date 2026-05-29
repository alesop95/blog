# ADR-005 – Math & LaTeX rendering: MDX + KaTeX, circuits pre-rendered to SVG

**Status**: Accepted · **Date**: 2026-05-29 · **Session**: #6

## Context

Alessio writes technical posts that are heavily mathematical (musical acoustics,
signal processing, harmony theory) and sometimes contain circuit diagrams. The
reference example was a full LaTeX `article` with `amsmath`, `siunitx`, `circuitikz`,
`hyperref`, sections, and itemize.

We needed to decide how to author such content on a **static** Next.js blog
(`output: 'export'`, GitHub Pages, no server/Edge runtime, Lighthouse perf budgets).

Two sub-problems, very different in nature:
1. **Mathematics** (equations, `\frac`, `\nabla`, `equation`/`align`, `\SI`).
2. **Full LaTeX documents** incl. **TikZ/circuitikz** drawings.

## Options considered

- **A. MDX + KaTeX** — math written as `$inline$` / `$$display$$` in MDX, rendered to
  HTML+MathML at **build time** via `remark-math` + `rehype-katex`. Only `katex.min.css`
  (~23 KB) ships, scoped to the post route. Document structure stays in Markdown.
- **B. Full `.tex` → HTML at build** (LaTeXML / Pandoc / tex4ht). Ingests near-verbatim
  `.tex`, but is a heavy, fragile toolchain, breaks integration with the existing MDX
  pipeline (ToC, Shiki, smartypants), and still cannot draw `circuitikz` without a real
  TeX engine.
- **C. TikZJax in-browser** — client-side WASM TeX rendering TikZ/circuitikz. Convenient
  but ships several MB per page that uses it — against the perf budgets.

## Decision

- **Math → Option A (MDX + KaTeX).** It's lightweight, zero runtime JS, integrates with the
  existing pipeline, and the math from a LaTeX source transfers almost 1:1 (only the
  delimiters change: `\(…\)`→`$…$`, `\[…\]`/`equation`→`$$…$$`). siunitx is covered by two
  KaTeX macros: `\SI{n}{u} → n\,\mathrm{u}` and `\si{u} → \mathrm{u}`.
- **Circuits / TikZ → pre-rendered to SVG** (Option for diagrams). The author compiles the
  `circuitikz` once locally (or via `tikztosvg`) and commits the resulting SVG under
  `public/images/<slug>/`, inserting it through the standard image feature. Perfect
  typographic quality, zero page-weight overhead, no TeX toolchain in the repo.
- **Rejected B and C** for this project's static/lightweight ethos. C (TikZJax) may be
  revisited as an opt-in per-post component if circuit-heavy posts become frequent.

## Consequences

- `pnpm add remark-math rehype-katex katex`. Pipeline updated in `src/lib/mdx.ts`
  (`remarkMath` + `[rehypeKatex, { throwOnError:false, macros }]`). `katex.min.css` imported
  in `src/app/[locale]/posts/[slug]/page.tsx` so it loads only on post pages.
- `throwOnError: false`: a malformed expression renders as red source text instead of
  failing the whole build.
- Authoring contract: math in `$…$`/`$$…$$`; **don't** wrap an `equation` environment inside
  `$$` (double display) — put the equation body directly, or use `\begin{aligned}` for
  multi-line. Full `\documentclass`/`\usepackage` scaffolding is NOT supported — structure is
  Markdown.
- Images are basePath-aware (see the image feature) so `/images/...` resolves to `/blog/...`
  on deploy.
- A demo draft post `content/posts/it/propagazione-acustica-parete.mdx` doubles as the
  authoring template and the pipeline smoke-test.
