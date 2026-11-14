/**
 * The part of speech of a word, for fill-the-gap wrong answers (24-review-4 Req 8, Property 3). A wrong answer is fair
 * only when it could stand in the gap: a noun for a noun, a verb for a verb, a number word for a number word. The
 * quiz builder passes a dictionary-backed `PosOf` (Open English WordNet); the browser, which builds quizzes for
 * on-demand articles without the dictionary, uses `heuristicPos`.
 */

export type Pos = 'noun' | 'verb' | 'adj' | 'num' | 'other';
export type PosOf = (word: string) => Pos;

const NUMBER_WORDS = new Set(
  'zero one two three four five six seven eight nine ten eleven twelve twenty thirty forty fifty sixty seventy eighty ninety hundred hundreds thousand thousands million millions billion billions trillion half double triple dozen'.split(' '),
);

/** Common verbs in their "-s" form, which look like plural nouns. */
const VERB_S = new Set(
  'gives makes takes causes produces creates forms holds shows keeps needs uses moves runs lives grows helps brings becomes means allows gets goes comes sees knows finds turns works calls starts begins looks seems leaves puts sets lets runs reaches carries requires provides contains includes remains happens depends appears refers belongs follows leads stands plays lies flows rises falls changes measures'.split(' '),
);

const ADJ_END = /(?:al|ous|ive|ful|less|ic|able|ible|ary|ish|ent|ant)$/;

/** A guess from the shape of the word alone: number words, "-ing" and "-ed" forms, common "-s" verbs, adjective endings. */
export const heuristicPos: PosOf = (word) => {
  const w = word.toLowerCase();
  if (/^\d/.test(w) || NUMBER_WORDS.has(w)) return 'num';
  if (VERB_S.has(w) || (w.length > 5 && /(?:ing|ed)$/.test(w))) return 'verb';
  if (w.length > 5 && ADJ_END.test(w) && !/(?:ment|tion|ness|ity)$/.test(w)) return 'adj';
  return 'noun';
};

/** Whether a noun looks plural ("photospheres", not "gas", "focus" or "analysis"). */
export function looksPlural(word: string): boolean {
  const w = word.toLowerCase();
  return /[^s]s$/.test(w) && !/(?:us|is|ss|ics)$/.test(w) && !/^\w{1,3}as$/.test(w);
}

/** Whether `candidate` could fill a gap whose answer is `answer`: the same part of speech and the same number. */
export function sameKind(candidate: string, answer: string, posOf: PosOf): boolean {
  const p = posOf(answer);
  if (posOf(candidate) !== p) return false;
  return p !== 'noun' || looksPlural(candidate) === looksPlural(answer);
}

/**
 * A `PosOf` backed by a dictionary lookup: `senses(word)` returns the part-of-speech letters of the word's senses in
 * order ('n', 'v', 'a', 'r'), or undefined when the word is not listed. Number words and unlisted words fall back to
 * the heuristic; a listed word takes its first sense, after the inflected form is tried and then its base forms.
 */
export function dictionaryPos(senses: (word: string) => readonly string[] | undefined, lemmas: (word: string) => readonly string[]): PosOf {
  const map: Record<string, Pos> = { n: 'noun', v: 'verb', a: 'adj', s: 'adj', r: 'other' };
  return (word) => {
    const w = word.toLowerCase();
    if (/^\d/.test(w) || NUMBER_WORDS.has(w)) return 'num';
    if (VERB_S.has(w)) return 'verb';
    for (const form of lemmas(w)) {
      const first = senses(form)?.[0];
      if (first) {
        const p = map[first] ?? 'other';
        return p;
      }
    }
    return heuristicPos(w);
  };
}
