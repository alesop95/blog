# ADR-013 - Interactive Web Audio components (playable Score, circle of fifths, EQ playground)

**Status**: Accepted · **Date**: 2026-06-04 · **Session**: #8

## Context

Phase-4 added static music/audio visualisations. The "interesting extras" program makes three of them *interactive* so readers can **hear** the idea, not just see it: a playable `<Score>`, a clickable circle of fifths, and an EQ playground. The site is a static export, so all audio must run client-side in the browser.

## Decision

- **Client islands**: each interactive component is `'use client'` and ships only on pages that use it (MDX server-renders them as islands). No audio code loads otherwise.
- **Shared helper `src/lib/audio.ts`**: one lazily-created, page-shared `AudioContext` (`getAudioContext`), `audioSupported()`, `playChord(semitones, ms)` (triangle oscillators
  + a soft gain envelope), and `triadFromLabel` (note→semitone map; trailing "m" = minor). Reused by `HarmonyDiagram`; `EQPlayground` shares the same context.
- **Audio starts on a user gesture**: browsers block audio until interaction, so the context is created/`resume()`d on the first play/click. Curves and rendering work while the context is still suspended (`getFrequencyResponse` is pure), so visuals never wait on audio permission.
- **`<Score>` playback**: abcjs's own synth (`abcjs.synth.CreateSynth`), `init`+`prime` lazily on first play; the soundfont is fetched on demand from abcjs's CDN. Button hidden where `supportsAudio()` is false; auto-resets at `getTotalTime()`.
- **`<EQPlayground>`**: looping pink-noise `AudioBuffer` (Paul Kellet) → one `BiquadFilterNode` → destination; the live response curve comes from `filter.getFrequencyResponse()` over 96 log-spaced points. Controls are native `<select>`/`<input type=range>` in `<label>`s.
- **`<HarmonyDiagram>`** keys are `<g role="button" tabIndex>` with `onClick`/`onKeyDown` (Enter/Space) → `playChord(triadFromLabel(label))`; the SVG is `role="group"`. Hover/focus lights the key ring (`.cof-key` CSS).

## Consequences

- **Accessibility**: every control has an accessible name; keys/buttons are keyboard-operable; axe passes on the demo page (with `color-contrast` on). `useSemanticElements` is a false positive for SVG (no native `<button>` inside SVG) and its inline suppression doesn't bind, so it's disabled **only for `HarmonyDiagram.tsx`** via a `biome.json` override.
- **Network**: `<Score>` playback fetches a soundfont at first play (progressive; fails to a no-op offline). The circle of fifths and EQ playground are self-contained (synthesised), no network.
- **No new deps**: Web Audio is a browser API; abcjs was already a dependency.
- Demonstrated on `field-notes-workshop` / `note-di-officina`; protected by Playwright smoke tests (play controls present) + the axe suite.
