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
- [ ] Bio "Chi sono" a scomparsa: chiusa all'ingresso, clic sul titolo (chevron ruota) la apre/chiude.
- [ ] Scritti ad albero: anno (chevron) → apre i mesi → mese apre la lista articoli di quel mese.
      All'ingresso è aperto solo l'anno più recente e, dentro, il mese più recente.
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

## 2bis. Media - inserire e testare foto/video (manuale)

**Come si usa (ADR-015):**
- **Foto**: metti l'originale in `_media/<slug>/foto.jpg`, lancia `pnpm build:media`, scrivi
  `![alt](/images/<slug>/foto.jpg)` -> responsive automatico (WebP/AVIF + `srcset`).
- **Video tuo pesante**: caricalo su YouTube/Vimeo (anche "non in elenco") ->
  `<YouTube id="…" />` oppure `<Vimeo id="…" hash="…" />`.
- **Clip breve (<20 MB)**: `public/videos/<slug>/clip.mp4` -> `<Video src="/videos/<slug>/clip.mp4" />`
  (opzionale: `pnpm build:video` comprime gli originali da `_media/<slug>/` con ffmpeg).

**Test manuale:**
- [ ] **Foto responsive**: crea `_media/test/foto.jpg`, `pnpm build:media`, mettila in un post con
  `![…](/images/test/foto.jpg)`, `pnpm dev` -> l'immagine si vede; in DevTools (Network/Elements)
  l'`<img>` ha `srcset` e il browser scarica la variante giusta per la larghezza/zoom (e l'`<picture>`
  serve AVIF dove supportato). [dev]
- [ ] **Guard video**: copia un file >20 MB in `public/videos/test/` e lancia `pnpm build` ->
  **la build fallisce** con il messaggio del guard. Rimuovilo e ritorna verde. [build]
- [ ] **Vimeo**: in un post `<Vimeo id="76979871" />` -> player 16:9 responsive; con `hash` per i
  "non in elenco". [dev]
- [ ] **Clip self-host**: `<Video src="/videos/<slug>/clip.mp4" poster="…" />` -> player con
  controlli; in stampa (Ctrl+P) sparisce. [dev]
- [ ] **Spotify**: in un post `<Spotify url="https://open.spotify.com/track/…" />` -> player; per
  /now imposta `siteConfig.spotify.nowPlaying` -> sezione "On repeat" in fondo a /now. [dev]
- [ ] **Niente falsi elenchi**: un inciso ` - testo - ` a inizio riga NON deve diventare un pallino
  (vedi fix pathosfera IT). [dev]

## 3. Integrazioni opzionali (solo se le vuoi)
- [ ] Giscus: Discussions sul repo + 4 valori giscus.app in `siteConfig.comments` -> box commenti a fondo articolo.
- [ ] Newsletter: username Buttondown in `siteConfig.newsletter.buttondownUser` -> box in fondo home.

## 3bis. Igiene repo (git)
- [ ] Aggiungi un pattern a `.gitignore` per un file gia' tracciato, poi committa -> il pre-commit
  hook lo **de-indicizza** (lo vedi nel log) tenendolo su disco. O manuale: `pnpm gitignore:prune`.
  *(Setup hook: `pnpm install` imposta `core.hooksPath=.githooks`; su Unix eventualmente
  `chmod +x .githooks/pre-commit`.)*

## 4. Produzione / deploy [live]

> **Cache di GitHub Pages (non un bug).** Le pagine HTML sono servite con
> `Cache-Control: max-age=600` (10 min), valore imposto da GitHub Pages e non
> modificabile su sito statico. Dopo un deploy, una pagina **già visitata** può
> mostrare la versione precedente fino a 10 min (cache del browser e dell'edge CDN);
> una pagina mai visitata si carica subito aggiornata. Sintomo tipico: una novità
> manca su `/en/` (in cache) ma c'è su `/it/` (fresca), e "ricompare" navigando da
> IT a EN perché il routing client rirenderizza dal codice nuovo. Rimedio: hard
> refresh (Ctrl+F5) o attendere la scadenza. In verifica live, hard-refresh sempre.

- [ ] `git push` su `main` -> Actions verde.
- [ ] Favicon "AS" nella scheda; `/manifest.webmanifest` raggiungibile.
- [ ] OG: condividi un post o apri `/og/en/<slug>.png`.
- [ ] `sitemap.xml` e `/en/feed.xml` rispondono.
- [ ] 0 trattini lunghi (-/—) negli articoli; solo `-`.
