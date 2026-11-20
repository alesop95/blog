# Lezioni per il template

> Le lezioni nate in questo progetto che valgono oltre il progetto, cioè che passano le due domande della sezione 16 di `.claude/PROJECT-SYSTEM.md`: restano vere tolti i nomi propri, e non sono già nella testa di chi lavora bene. Una voce per lezione, creata con `python .claude/templates/tools/lezioni-template.py nuova` nel giro di lavoro in cui la lezione nasce. Lo stato non si scrive qui: una lezione è recepita quando il template la elenca in `.claude/templates/lezioni-recepite.json`, che arriva con l'allineamento.

Adottato il: 2026-11-20

## L-001 - 2026-11-20 - I tre strumenti tipografici percorrono le cartelle di build

fix-accents.py, fix-dashes.py e fix-missing-accents.py, lanciati da chiudi su '.', escludono .git, node_modules, .venv e _notes ma non leggono il .gitignore, quindi percorrono anche l'output di build ignorato. In un sito statico Next.js la cartella out/ contiene i segni meno U+2212 delle formule renderizzate da KaTeX e le abbreviazioni di data come `giu` (giugno), e dopo ogni build chiudi diventa rosso su file che nessuno scrive a mano: misurato il 2026-11-20, out/ dava 6 file a fix-dashes e 48 a fix-missing-accents. Correzione proposta: potare le cartelle ignorate da git (git check-ignore o git ls-files -co --exclude-standard) invece di un elenco fisso di nomi.
