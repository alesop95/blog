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
  updated: '2026-07-13',
  en: [
    'Writing a book on harmony - the mathematics and the philosophy of it.',
    'Building and tending this site, in the open.',
    'Playing lead guitar and recording song sketches.',
    'Taking audio gear apart to understand how it actually works.',
    'Relearning bass, self-taught, for a band project just getting off the ground - 2000s pop-punk covers, on an instrument that isn’t mine, after a long time away from it.',
  ],
  it: [
    'Scrivo un libro sull’armonia - la matematica e la filosofia che ci stanno dietro.',
    'Costruisco e curo questo sito, allo scoperto.',
    'Suono la chitarra solista e registro bozze di canzoni.',
    'Smonto attrezzatura audio per capire come funziona davvero.',
    'Riscopro il basso da autodidatta per un progetto di band che sta nascendo ora - cover pop-punk anni 2000, su uno strumento che non è il mio, dopo tanto tempo che non lo suonavo.',
  ],
}
