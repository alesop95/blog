/**
 * Content for the /uses page (en `/uses`, it `/strumenti`).
 *
 * A starting point in Alessio's voice - **edit freely**: replace the generic
 * entries with your actual gear and software. Same bilingual shape as `bio.ts`.
 * Keep `note` short (one line); omit it when the name speaks for itself.
 */

export interface UsesItem {
  name: string
  note?: string
}

export interface UsesGroup {
  category: string
  items: UsesItem[]
}

export const uses: { en: UsesGroup[]; it: UsesGroup[] } = {
  en: [
    {
      category: 'Instruments',
      items: [
        { name: 'Electric guitar', note: 'the main voice - lead and writing' },
        { name: 'Acoustic guitar', note: 'for the bare version of a song' },
      ],
    },
    {
      category: 'Pedals & amp',
      items: [
        { name: 'Overdrive / boost' },
        { name: 'Delay & reverb' },
        { name: 'Tube amp', note: 'mic’d or via load box' },
      ],
    },
    {
      category: 'Studio & audio',
      items: [
        { name: 'Audio interface' },
        { name: 'Studio monitors + measurement mic' },
        { name: 'DAW', note: 'recording, editing, mixing' },
      ],
    },
    {
      category: 'Desk & software',
      items: [
        { name: 'Editor + terminal', note: 'where this site is built' },
        { name: 'Notation / score tools', note: 'for the harmony work' },
      ],
    },
  ],
  it: [
    {
      category: 'Strumenti',
      items: [
        { name: 'Chitarra elettrica', note: 'la voce principale - assoli e scrittura' },
        { name: 'Chitarra acustica', note: 'per la versione nuda di una canzone' },
      ],
    },
    {
      category: 'Pedali & ampli',
      items: [
        { name: 'Overdrive / boost' },
        { name: 'Delay & riverbero' },
        { name: 'Ampli valvolare', note: 'microfonato o via load box' },
      ],
    },
    {
      category: 'Studio & audio',
      items: [
        { name: 'Scheda audio' },
        { name: 'Monitor da studio + microfono di misura' },
        { name: 'DAW', note: 'registrazione, editing, mix' },
      ],
    },
    {
      category: 'Scrivania & software',
      items: [
        { name: 'Editor + terminale', note: 'dove e’ costruito questo sito' },
        { name: 'Strumenti di notazione', note: 'per il lavoro sull’armonia' },
      ],
    },
  ],
}
