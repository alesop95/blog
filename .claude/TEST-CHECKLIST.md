# Test checklist - intero sito

> Da percorrere dall'alto in basso. Legenda: **[dev]** = `pnpm dev` (porta 8642) ·
> **[build]** = dopo `pnpm build` servendo `out/` · **[live]** = sul sito pubblicato ·
> **[auto]** = test automatico. Aggiornato: Session #8.

## 0. Scrivere un articolo da zero (flusso di autoring)

1. Crea `content/posts/en/<slug>.mdx` e `content/posts/it/<slug-it>.mdx`.
2. Frontmatter: `title`, `description` (<=280), `date`, `tags`; **stesso `articleId`** nei due file.
3. Opzionali: `dropCap: true`, `type: review` (+ blocco `review`), `series: {name, order}`, `draft: true`.
4. Corpo MDX: `##` sezioni; `$…$`/`$$…$$` math; `<Callout>` `<Quote>` `<Score>` `<HarmonyDiagram>`
   `<EQGraph>` `<EQPlayground>` `<PedalSignalFlow>`; immagini `![alt](/images/<slug>/x.jpg)`;
   footnote `[^id]`.
5. `pnpm dev` (controllo a vista) -> `pnpm verify` (verde) -> commit + push.
   - Atteso: l'articolo compare in home/archivio/sitemap/feed, OG generata, `articleId` lega EN<->IT.

Esempio reale già in repo: `what-a-string-does` / `cosa-fa-una-corda`.

## 1. Controlli automatici [auto]

- [ ] `pnpm verify` -> typecheck + lint (0 errori) + Vitest + build verdi.
- [ ] `pnpm test:e2e` -> Playwright verde (smoke + a11y light&dark + visual). Serve `pnpm build` prima.
- [ ] `pnpm lhci` (o job CI) -> budget Lighthouse (a11y/seo/best-practices >=0.95, perf >=0.85).

## 2. Giro manuale - pagina per pagina

### Home `/en` e `/it` [dev]
- [ ] Wordmark = titolo; foto `rounded-lg` accanto alla tagline.
- [ ] Lista articoli con date incolonnate; badge Review su Pathosfera.
- [ ] Toggle tema -> dark mode. Switch lingua EN<->IT resta sulla stessa pagina.
- [ ] Shared-element: clic su un titolo -> morfa dalla lista all'hero (Chromium).
- [ ] `/` (root) -> redirect a `/en` o `/it`.

### `/en/posts/field-notes-workshop` (tutto-in-uno) [dev]
- [ ] Barra di lettura si riempie scrollando.
- [ ] Drop-cap + testo giustificato.
- [ ] `<Score>`: ▶ suona il brano; clic su singola nota la suona; leggibile in dark; dimensione contenuta.
- [ ] Circolo delle quinte: clic su tonalita -> accordo gia' dal primo click.
- [ ] EQ playground: muovi Gain -> finestra NON trema; Type/Freq/Q live; Pink noise suona.
- [ ] Diagram SVG (ok in dark); YouTube embed.
- [ ] Footnote -> sezione Note a fondo pagina (piu' piccola); freccia di ritorno.
- [ ] Pull-quote centrata, nessun errore in console.

### `/en/posts/what-a-string-does` (<-> `/it/articoli/cosa-fa-una-corda`) [dev]
- [ ] KaTeX inline + display; Callout; footnote `[^mu]`; Score (accordatura, note cliccabili); switch lingua -> gemella.

### Recensione `/it/articoli/pathosfera-caparezza` [dev]
- [ ] Header recensione: BRANO · 2025, Caparezza - Pathosfera, 4½ stelle, link Fonte.

### Indici e pagine [dev]
- [ ] `/en/tags` + una pagina tag; `/en/archive`; `/en/reviews`; `/en/series` (arco "Field notes"); `/en/year/2026`.
- [ ] `/en/uses` (<-> `/it/strumenti`); `/en/now` (<-> `/it/ora`).
- [ ] Footer: Tags · Reviews · Series · Archive · Uses · Now · RSS.

### Trasversali
- [ ] Stampa (Ctrl+P su un articolo) [dev/build]: niente chrome/correlati/commenti/controlli; palette chiara anche in dark; footnote presenti.
- [ ] Reduced-motion (DevTools Rendering): transizioni istantanee.
- [ ] TOC scroll-spy: dormiente finche' non c'e' un post >1500 parole.
- [ ] Dark mode: articolo leggibile (testo/score/diagrammi/accent) - contrasto AA.

### Ricerca ⌘K [build]/[live] (NON in dev)
- [ ] `pnpm build` + servi `out/` (o live): ⌘K/Ctrl+K, query -> risultati filtrati per lingua. In dev mostra "non disponibile".

## 3. Integrazioni opzionali (solo se le vuoi)
- [ ] Giscus: Discussions sul repo + 4 valori giscus.app in `siteConfig.comments` -> box commenti a fondo articolo.
- [ ] Newsletter: username Buttondown in `siteConfig.newsletter.buttondownUser` -> box in fondo home.

## 4. Produzione / deploy [live]
- [ ] `git push` su `main` -> Actions verde.
- [ ] Favicon "AS" nella scheda; `/manifest.webmanifest` raggiungibile.
- [ ] OG: condividi un post o apri `/og/en/<slug>.png`.
- [ ] `sitemap.xml` e `/en/feed.xml` rispondono.
- [ ] 0 trattini lunghi (-/—) negli articoli; solo `-`.
