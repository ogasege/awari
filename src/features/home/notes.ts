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
    text: "Most of Madagascar's mammals live nowhere else!",
    to: '/article/countries/madagascar',
    article: 'countries/madagascar',
    proof: 'most of the mammals living in Madagascar do not live anywhere else in the world',
  },
  ice: { kind: 'question', text: 'What is hiding under all that ice?', to: '/search?q=ice' },
};

export const SUBJECT_NOTES: Record<'falls' | 'pyramids' | 'kili', HomeNote> = {
  falls: {
    kind: 'fact',
    text: 'Victoria Falls is one of the seven natural wonders of the world.',
    to: '/article/countries/zambia',
    article: 'countries/zambia',
    proof: 'Zambia is home to one of the seven natural wonders of the world, Victoria falls',
  },
  pyramids: {
    kind: 'fact',
    text: 'The Pyramids and the Sphinx!',
    to: '/article/countries/egypt',
    article: 'countries/egypt',
    proof: 'Egypt is famous for its ancient monuments, such as the Pyramids and the Sphinx',
  },
  kili: {
    kind: 'question',
    text: 'Can you find Kilimanjaro on the globe?',
    to: '/atlas?c=tanzania',
  },
};
