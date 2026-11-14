/**
 * The part of speech of a word from the bundled Open English WordNet shards (`public/packs/dictionary/*.json`), for the
 * quiz builder and its tests (24-review-4 Req 8). Node only: it reads the shards from disk, once per letter.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lemmaCandidates } from '../../src/lib/dictionary/lemmatize.ts';
import { dictionaryPos, type PosOf } from '../../src/lib/quiz/pos.ts';

const DIR = join('public', 'packs', 'dictionary');
const shards = new Map<string, Record<string, Array<{ pos: string }>>>();

function senses(word: string): readonly string[] | undefined {
  const letter = word.charAt(0);
  if (!/^[a-z]$/.test(letter)) return undefined;
  if (!shards.has(letter)) {
    const file = join(DIR, `${letter}.json`);
    shards.set(letter, existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as { entries: Record<string, Array<{ pos: string }>> }).entries : {});
  }
  return shards.get(letter)?.[word]?.map((s) => s.pos);
}

export const wordnetPos: PosOf = dictionaryPos(senses, (w) => lemmaCandidates(w));
