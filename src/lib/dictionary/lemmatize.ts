/**
 * Turns a word as it appears in running text into the base forms a
 * dictionary might list it under. Used by the pack pipeline (to decide
 * which dictionary entries to bundle) and by the app (to look up a tapped
 * word), so both always agree.
 */

/** Suffix rewrites, tried in order: [suffix, replacement]. */
const RULES: ReadonlyArray<readonly [string, string]> = [
  ['ies', 'y'],
  ['ves', 'f'],
  ['ves', 'fe'],
  ['ses', 's'],
  ['xes', 'x'],
  ['zes', 'z'],
  ['ches', 'ch'],
  ['shes', 'sh'],
  ['men', 'man'],
  ['es', 'e'],
  ['es', ''],
  ['s', ''],
  ['ied', 'y'],
  ['ed', 'e'],
  ['ed', ''],
  ['ing', 'e'],
  ['ing', ''],
  ['ier', 'y'],
  ['iest', 'y'],
  ['er', 'e'],
  ['er', ''],
  ['est', 'e'],
  ['est', ''],
  ['ly', ''],
];

/** Lowercases a token and strips punctuation and possessive endings. */
export function normaliseWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/'s$/, '')
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}

/**
 * Returns candidate lemmas for a word, most likely first. The normalised
 * word itself is always the first candidate.
 */
export function lemmaCandidates(raw: string): string[] {
  const word = normaliseWord(raw);
  if (word === '') {
    return [];
  }
  const out = [word];
  for (const [suffix, replacement] of RULES) {
    if (word.length > suffix.length + 1 && word.endsWith(suffix)) {
      const stem = word.slice(0, -suffix.length) + replacement;
      out.push(stem);
      // running -> runn -> run; stopped -> stopp -> stop
      const last = stem.at(-1);
      if (replacement === '' && last && stem.at(-2) === last) {
        out.push(stem.slice(0, -1));
      }
    }
  }
  return [...new Set(out)].filter((w) => w.length > 0);
}

/** Splits text into word tokens (letters, digits, inner hyphen/apostrophe). */
export function tokenise(text: string): string[] {
  return text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? [];
}

/** Shard name for a lemma: its first letter a–z, or "other". */
export function shardFor(lemma: string): string {
  const first = lemma.charAt(0);
  return first >= 'a' && first <= 'z' ? first : 'other';
}
