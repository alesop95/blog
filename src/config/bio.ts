/**
 * The home-page "About me" content, per locale.
 *
 * EN: lifted faithfully from Alessio's BIOPIC.
 * IT: faithful translation, intended as a starting draft —
 *     Alessio is invited to rewrite in his authorial voice.
 *
 * The id values are shared across locales so that translations
 * stay aligned. Adding a paragraph means adding it in both arrays.
 */

import type { Locale } from '@/i18n/routing'

export interface BioParagraph {
  /** Stable key across locales — never rendered. */
  id: string
  /** The paragraph body. */
  text: string
}

export const bio: Record<Locale, BioParagraph[]> = {
  en: [
    {
      id: 'curiosity',
      text: `A tech-savvy enthusiast with an instinct for diving vertically into almost anything. I love taking things apart—conceptually, digitally, sometimes literally—just to understand how they truly work. My brain runs on a strange hybrid engine: part engineer, part entrepreneur, part manager, fully nerd. I like turning messy problems into clean systems, dissecting challenges on my own and engineering more efficient personal workflows. I love optimizing life like it's one giant R&D lab, and teaching myself whatever I need to solve the next puzzle. Every dive leaves a lasting imprint, shaping the way I think and sharpening the way I learn, so each new challenge becomes a deeper version of the last. It's a never-ending process… Curiosity is my default setting and deep dives are my natural habitat, and often I have way too much fun figuring things out on my own. I am passionate about understanding how things work in depth, and designing automations and processes for greater efficiency in daily life. I actively study new technologies to solve problems and gain real insights.`,
    },
    {
      id: 'guitar',
      text: `I am also deeply passionate about music. I started out as a lead guitarist, and when I had the time to dive into it fully, I focused intensely on technique without ever sacrificing style or the sheer fun of playing. Long time ago I spent years performing live and playing in bands, and that stage energy shaped my approach as much as the hours of disciplined practice. My two guitar heroes are Mark Knopfler and Eric Johnson.`,
    },
    {
      id: 'production',
      text: `I also completed a course in music production.`,
    },
    {
      id: 'electronics',
      text: `As an amateur electronics engineer, I've always been passionate about guitar pedals and effects. I've studied the circuits of classic stompboxes to understand how each component shapes the sound, and I love exploring how tone is sculpted through electronics and signal flow.`,
    },
    {
      id: 'professional',
      text: `Professionally, I built my former background as an engineer in musical acoustics, multimedia signal processing, and computer music, which led me to develop PA, car audio and marine speakers for three years. Nonetheless, I've always devoured albums and discographies, building what is essentially an encyclopedic musical culture over time, especially around rock. My curiosity naturally extends to lyrics: I'm drawn to the storytelling and poetic depth of singer-songwriters in Italian cantautorato. Texts often reveal the most human, fragile and truthful parts of music, and exploring them helped me feed a humanistic side that my studies and work never touched.`,
    },
    {
      id: 'acoustic',
      text: `I've always been fascinated by songs in their rawest form, before production layers or genre conventions are added. A song that thrives acoustically shows the composer's real intention and emotional honesty—the closest we get to hearing it exactly as it wanted to be born. I cherish the idea of songs arising in their purest form, songwriting stripped of production layers and genre-specific embellishments. In their raw acoustic state, these songs reveal the composer's genuine talent and the emotions they aim to convey, connecting directly with the listener in the way they were meant to be born.`,
    },
    {
      id: 'arrangement',
      text: `This led me to dedicate myself to arrangement and occasionally songwriting.`,
    },
    {
      id: 'discovery',
      text: `At the same time, I constantly explore new musical discoveries, seeking originality in productions, arrangements and lyrics—a pursuit that nurtures that same humanistic side, because I still love music first and foremost as the most complete art form to me (subjective thought indeed, I know!). It's the only one I can experience at 360°, understanding every nuance without losing the emotional pull.`,
    },
    {
      id: 'book',
      text: `I am also currently writing a book on harmony and Western music theory, trying to convey both a mathematical and a philosophical perspective.`,
    },
    {
      id: 'why',
      text: `This is why, despite working in a field that is technical, managerial and sometimes entrepreneurial, I still want to write about music in all the forms it intersects with my life: from engineering to performance, from harmony to production, from arrangement to listening culture, hoping to bring insights that can span across all these worlds…`,
    },
    {
      id: 'fun',
      text: `…just for fun!`,
    },
    {
      id: 'sign-off',
      text: `Hope you enjoy, guys!`,
    },
  ],

  // ⚠️ DRAFT — traduzione fedele dall'inglese. Da rivedere e
  //    riscrivere a voce d'autore quando Alessio ne ha voglia.
  it: [
    {
      id: 'curiosity',
      text: `Un appassionato di tecnologia con l'istinto di tuffarsi in verticale dentro praticamente qualsiasi cosa. Adoro smontare le cose—concettualmente, digitalmente, a volte letteralmente—solo per capire come funzionano davvero. Il mio cervello gira su uno strano motore ibrido: parte ingegnere, parte imprenditore, parte manager, completamente nerd. Mi piace trasformare problemi disordinati in sistemi puliti, sezionare sfide in autonomia e progettare flussi di lavoro personali più efficienti. Amo ottimizzare la vita come se fosse un grande laboratorio di R&S, e imparare da solo qualunque cosa serva per risolvere il prossimo enigma. Ogni immersione lascia un'impronta duratura, modella il modo in cui penso e affina il modo in cui imparo, così ogni nuova sfida diventa una versione più profonda della precedente. È un processo senza fine… La curiosità è il mio stato di default e le immersioni profonde il mio habitat naturale, e spesso mi diverto fin troppo a capire le cose per conto mio. Sono appassionato di capire come funzionano le cose in profondità, e di progettare automazioni e processi per una maggiore efficienza nella vita quotidiana. Studio attivamente nuove tecnologie per risolvere problemi e ottenere intuizioni reali.`,
    },
    {
      id: 'guitar',
      text: `Sono anche profondamente appassionato di musica. Sono partito come chitarrista solista, e quando ho avuto il tempo per tuffarmici davvero, mi sono concentrato intensamente sulla tecnica senza mai sacrificare lo stile o il puro divertimento del suonare. Tanto tempo fa ho passato anni suonando dal vivo e in band, e quell'energia del palco ha plasmato il mio approccio tanto quanto le ore di studio disciplinato. I miei due eroi della chitarra sono Mark Knopfler ed Eric Johnson.`,
    },
    {
      id: 'production',
      text: `Ho anche completato un corso di produzione musicale.`,
    },
    {
      id: 'electronics',
      text: `Come ingegnere elettronico amatoriale sono sempre stato appassionato di pedali per chitarra ed effetti. Ho studiato i circuiti dei classici stompbox per capire come ogni componente plasma il suono, e amo esplorare come il tono viene scolpito attraverso l'elettronica e il flusso di segnale.`,
    },
    {
      id: 'professional',
      text: `Professionalmente, ho costruito il mio background passato come ingegnere in acustica musicale, elaborazione di segnali multimediali e computer music, cosa che mi ha portato a sviluppare diffusori PA, car audio e marini per tre anni. Ciononostante, ho sempre divorato album e discografie, costruendo nel tempo quella che è essenzialmente una cultura musicale enciclopedica, specialmente attorno al rock. La mia curiosità si estende naturalmente ai testi: sono attratto dalla narrazione e dalla profondità poetica dei cantautori italiani. I testi spesso rivelano le parti più umane, fragili e veritiere della musica, ed esplorarli mi ha aiutato a nutrire un lato umanistico che gli studi e il lavoro non hanno mai toccato.`,
    },
    {
      id: 'acoustic',
      text: `Mi hanno sempre affascinato le canzoni nella loro forma più grezza, prima che vi vengano aggiunti strati di produzione o convenzioni di genere. Una canzone che vive in acustico mostra l'intenzione reale del compositore e la sua onestà emotiva—il più vicino a sentirla esattamente come voleva nascere. Custodisco l'idea di canzoni che sorgono nella loro forma più pura, songwriting spogliato di strati di produzione ed orpelli di genere. Nel loro stato acustico grezzo, queste canzoni rivelano il talento genuino del compositore e le emozioni che vuole trasmettere, collegandosi direttamente con l'ascoltatore nel modo in cui erano destinate a nascere.`,
    },
    {
      id: 'arrangement',
      text: `Questo mi ha portato a dedicarmi all'arrangiamento e occasionalmente al songwriting.`,
    },
    {
      id: 'discovery',
      text: `Allo stesso tempo, esploro costantemente nuove scoperte musicali, cercando originalità in produzioni, arrangiamenti e testi—una ricerca che nutre quello stesso lato umanistico, perché ancora amo la musica prima di tutto come la forma d'arte più completa per me (pensiero soggettivo, certo!). È l'unica che riesco a vivere a 360°, capendo ogni sfumatura senza perdere la spinta emotiva.`,
    },
    {
      id: 'book',
      text: `Sto anche scrivendo un libro sull'armonia e la teoria musicale occidentale, cercando di trasmettere sia una prospettiva matematica che una filosofica.`,
    },
    {
      id: 'why',
      text: `Per questo, nonostante lavori in un campo tecnico, manageriale e a volte imprenditoriale, voglio comunque scrivere di musica in tutte le forme in cui interseca la mia vita: dall'ingegneria all'esecuzione, dall'armonia alla produzione, dall'arrangiamento alla cultura d'ascolto, sperando di portare intuizioni che possano abbracciare tutti questi mondi…`,
    },
    {
      id: 'fun',
      text: `…giusto per divertimento!`,
    },
    {
      id: 'sign-off',
      text: `Spero vi piaccia, ragazzi!`,
    },
  ],
}
