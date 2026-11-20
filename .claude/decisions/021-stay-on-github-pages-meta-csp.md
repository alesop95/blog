# ADR-021 - Si resta su GitHub Pages: CSP e Referrer-Policy via `<meta>`, blindatura della catena di fornitura

**Status**: Accepted · **Date**: 2026-11-20 · **Session**: #11 · **Supersedes**: ADR-020

## Context

ADR-020 aveva deciso di migrare a Cloudflare Pages per poter inviare header HTTP di sicurezza, lasciando aperto l'indirizzo pubblico. Prima di toccare la configurazione si è misurato che cosa GitHub Pages manda già: con `curl -I https://alesop95.github.io/blog/en/` il 2026-11-20 la risposta porta `Strict-Transport-Security: max-age=31556952`, `Access-Control-Allow-Origin: *`, `Cache-Control: max-age=600` e `Server: GitHub.com`; mancano `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.

Di quelli mancanti, la CSP (tranne `frame-ancestors`, `report-uri` e `sandbox`) e la Referrer-Policy si possono dichiarare con un elemento `<meta>` nel documento. Restano fuori la protezione dal clickjacking, `nosniff` e `Permissions-Policy`. Il sito è un blog statico senza autenticazione, senza dati dell'utente e con un solo modulo, l'iscrizione alla newsletter che invia a Buttondown: il rischio che quei tre header coprono è basso. La migrazione avrebbe invece cambiato l'indirizzo pubblico (`*.pages.dev`) o introdotto un costo annuo per un dominio, contro la decisione della Session #2.

## Decision

Il proprietario ha scelto il 2026-11-20 di restare su GitHub Pages, project site `/blog` (ADR-004 resta valido). La sicurezza si fa in due parti: una CSP e una Referrer-Policy dichiarate via `<meta>`, scritte contro ciò che il sito carica davvero e verificate nel browser; e la blindatura della catena di fornitura, cioè action dei workflow fissate per hash di commit, `permissions` minime per job, audit delle dipendenze in CI e Dependabot.

## Consequences

- Nessun cambio di indirizzo, di `basePath` o di costo.
- `frame-ancestors`, `X-Content-Type-Options` e `Permissions-Policy` restano non impostabili: limite accettato e scritto qui, non dimenticato.
- La migrazione torna in discussione solo se il proprietario vorrà un dominio proprio; in quel caso ADR-020 contiene già l'analisi.
- Una CSP via `<meta>` non protegge ciò che il browser esegue prima di leggerla: va posta come primo figlio di `<head>`. Gli script inline del tema (next-themes) e dello splash di redirect richiedono hash o `'unsafe-inline'`, da decidere al momento dell'implementazione.
