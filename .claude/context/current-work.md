# Lavoro corrente e ultimo riscontro applicativo

Ultimo stato applicativo documentato:13/07/2026, trasferito dall’indice durante il riallineamento del30/10. Non sono stati rieseguiti build o test applicativi in questa passata.

Riscontro storico: **2026-07-13** · Session #10 continued again - **Now page + tag cleanup**: added a `/now` item (relearning bass, self-taught, for a nascent 2000s pop-punk cover band project) in both locales, bumped `updated`. Removed the standalone `caparezza` tag from both language twins of the Pathosfera review: redundant with the already-structured `review.artist` field (rendered by `<ReviewHeader>`, ADR-009), and it was cluttering `/tags` with a one-off, count-1 entry. Verified `cosa-fa-una-corda`/`what-a-string-does` was already tagged `acustica`/`acoustics` - no change needed. Verified: `pnpm typecheck`, `pnpm test` (15/15), `pnpm build:next` - the `caparezza` route is gone from `out/`, both `/now` pages show the new item.

Per il piano corrente usare `.claude/roadmap.md`, per i vincoli `.claude/CLAUDE.md`, per il dettaglio tecnico `.claude/architecture.md` e per le decisioni `.claude/decisions/`. Le date e gli esiti storici non sono prove nuove.
