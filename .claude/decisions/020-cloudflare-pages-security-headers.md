# ADR-020 - Hosting: da GitHub Pages a Cloudflare Pages per poter inviare header di sicurezza

**Status**: Superseded by ADR-021 (2026-11-20, stessa sessione) · **Date**: 2026-11-20 · **Session**: #11

## Context

Il sito è un export statico di Next.js (`output: 'export'`, ADR-002) pubblicato come project site su GitHub Pages sotto `/blog` (ADR-004). Con l'export statico la funzione `headers()` di `next.config.mjs` non ha effetto, perché a servire le pagine non c'è un server Next.js, e GitHub Pages non offre alcun modo di impostare header HTTP di risposta. Ne segue che non si possono inviare una Content-Security-Policy completa, HSTS con le direttive scelte da noi, `frame-ancestors` (che funziona solo come header e non nel `<meta>`), `Permissions-Policy`, `X-Content-Type-Options` e `Referrer-Policy`.

Cloudflare Pages pubblica lo stesso export statico, è gratuito, e legge un file `_headers` alla radice della cartella pubblicata in cui si dichiarano gli header per percorso. La decisione è stata presa dal proprietario fuori dal repository il 2026-11-20 fra due opzioni: restare su GitHub Pages limitandosi a una CSP via `<meta>` (opzione A), oppure migrare (opzione B). È stata scelta la B.

## Decision

- Il sito migra su Cloudflare Pages, restando export statico: nessun runtime server, nessuna funzione edge.
- Gli header di sicurezza si dichiarano in `public/_headers`, così che finiscano in `out/` a ogni build.
- La blindatura della catena di fornitura si fa indipendentemente dalla piattaforma: action dei workflow fissate per hash di commit, `permissions` minime per job, audit delle dipendenze in CI, Dependabot.

## Questione aperta prima di migrare

Cloudflare Pages gratuito pubblica su `<progetto>.pages.dev`. Senza un dominio proprio l'indirizzo pubblico del blog cambia: `https://alesop95.github.io/blog` smette di essere l'indirizzo canonico, `basePath` passa da `/blog` a vuoto e ADR-004 viene superato. Con un dominio proprio l'indirizzo diventa stabile e indipendente dall'hosting, ma nasce un costo annuo, che la sezione 1 di `.claude/CLAUDE.md` aveva escluso (circa 8 euro l'anno con Porkbun o Cloudflare Registrar per un `.it`). La scelta spetta al proprietario e va presa prima di toccare `basePath`, sitemap, feed, OG e `site.ts`. Una terza via, da valutare, è tenere GitHub Pages attivo con un reindirizzamento verso il nuovo indirizzo, per non rompere i link già condivisi.

## Consequences

- Fino alla risposta sulla questione aperta si possono già preparare `public/_headers`, la CSP e la blindatura dei workflow, che non dipendono dall'indirizzo.
- La CSP va scritta contro ciò che il sito carica davvero (Giscus, Spotify, Buttondown, Pagefind, KaTeX, script inline del tema e dello splash di redirect), e verificata nel browser sul deploy di anteprima prima di passare da `Content-Security-Policy-Report-Only` a `Content-Security-Policy`.
