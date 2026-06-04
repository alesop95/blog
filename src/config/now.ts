/**
 * Content for the /now page (en `/now`, it `/ora`) - a "now page"
 * (https://nownownow.com/about): what you're focused on at the moment.
 *
 * **Edit this** whenever your focus shifts, and bump `updated`. Seeded from
 * Alessio's documented interests (the harmony book, this site, playing/recording).
 */

export const now: {
  /** ISO date shown as "last updated"; bump it when you edit the list. */
  updated: string
  en: string[]
  it: string[]
} = {
  updated: '2026-06-04',
  en: [
    'Writing a book on harmony - the mathematics and the philosophy of it.',
    'Building and tending this site, in the open.',
    'Playing lead guitar and recording song sketches.',
    'Taking audio gear apart to understand how it actually works.',
  ],
  it: [
    'Scrivo un libro sull’armonia - la matematica e la filosofia che ci stanno dietro.',
    'Costruisco e curo questo sito, allo scoperto.',
    'Suono la chitarra solista e registro bozze di canzoni.',
    'Smonto attrezzatura audio per capire come funziona davvero.',
  ],
}
