/**
 * Handwritten margin notes on Home. Every fact names the pack article it
 * was checked against and the exact sentence that backs it; the test in
 * notes.test.ts fails if that sentence is not in the article
 * (design steering rule 3; 01-app-shell Req 5.4).
 */
export interface HomeNote {
  text: string;
  kind: 'fact' | 'question';
  /** Where the note leads, and for facts the article that proves it. */
  to: string;
  /** For facts: "<pack>/<id>" of the article checked against. */
  article?: string;
  /** For facts: an exact sentence (or clause) from that article. */
  proof?: string;
}

export const HERO_NOTES: Record<'dry' | 'lemurs' | 'ice', HomeNote> = {
  dry: { kind: 'question', text: 'Why is it so dry up here?', to: '/search?q=desert' },
  lemurs: {
    kind: 'fact',
    text: 'Lemurs live here and nowhere else',
    to: '/article/countries/madagascar',
    article: 'countries/madagascar',
    proof: '',
  },
  ice: { kind: 'question', text: 'What is hiding under all that ice?', to: '/search?q=ice' },
};

export const SUBJECT_NOTES: Record<'falls' | 'pyramids' | 'kili', HomeNote> = {
  falls: {
    kind: 'fact',
    text: 'People who live near these falls call them the smoke that thunders.',
    to: '/article/countries/zambia',
    article: 'countries/zambia',
    proof: '',
  },
  pyramids: {
    kind: 'fact',
    text: 'about 4,500 years old!',
    to: '/article/countries/egypt',
    article: 'countries/egypt',
    proof: '',
  },
  kili: {
    kind: 'fact',
    text: 'Kilimanjaro. 5,895 m, the top of Africa.',
    to: '/article/countries/tanzania',
    article: 'countries/tanzania',
    proof: '',
  },
};
