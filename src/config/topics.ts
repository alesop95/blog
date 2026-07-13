/**
 * Language-neutral topic → tag mapping.
 *
 * A "topic" is a curated interest area that gets a rich description on its
 * tag page (via `messages/{en,it}.json` under `topics.<id>`), independent of
 * whether any post carries that tag yet. This lets `/tags/<tag>` (and its IT
 * counterpart `/tag/<tag>`) render an editorial abstract before the first
 * article exists - see ADR-018.
 *
 * Reader-facing text (title, description) lives in `messages/{en,it}.json`,
 * per the site.ts convention: this file holds only structural data.
 */
export interface Topic {
  /** Stable id, also the key under `topics.<id>` in the message catalogs. */
  id: string
  /** The literal tag string used in post frontmatter, per locale. */
  tags: { en: string; it: string }
}

export const topics: Topic[] = [
  { id: 'musicTheory', tags: { en: 'music', it: 'musica' } },
  { id: 'audiophile', tags: { en: 'audiophile', it: 'audiofilia' } },
  { id: 'personalFinance', tags: { en: 'personal-finance', it: 'finanza-personale' } },
  { id: 'gaming', tags: { en: 'gaming', it: 'videogiochi' } },
  { id: 'collecting', tags: { en: 'collecting', it: 'collezionismo' } },
  { id: 'tutoring', tags: { en: 'teaching', it: 'ripetizioni' } },
  { id: 'psychology', tags: { en: 'psychology', it: 'psicologia' } },
  { id: 'homeOptimization', tags: { en: 'home-optimization', it: 'ottimizzazione-domestica' } },
  { id: 'linux', tags: { en: 'linux', it: 'linux' } },
  { id: 'digitalEcosystem', tags: { en: 'digital-ecosystem', it: 'ecosistema-digitale' } },
  { id: 'android', tags: { en: 'android', it: 'android' } },
  { id: 'threeDPrinting', tags: { en: '3d-printing', it: 'stampa-3d' } },
  { id: 'dataAnalysis', tags: { en: 'data-analysis', it: 'analisi-dati' } },
  { id: 'puzzles', tags: { en: 'puzzles', it: 'puzzle' } },
  { id: 'educationTheory', tags: { en: 'education-theory', it: 'pedagogia' } },
  { id: 'songwriting', tags: { en: 'songwriting', it: 'songwriting' } },
]

/** Finds the topic whose tag (in this locale) matches the given raw tag string. */
export function getTopicByTag(locale: 'en' | 'it', tag: string): Topic | undefined {
  return topics.find((topic) => topic.tags[locale] === tag)
}

/** Every tag string known in this locale: from posts (via caller) union topics. */
export function topicTags(locale: 'en' | 'it'): string[] {
  return topics.map((topic) => topic.tags[locale])
}
