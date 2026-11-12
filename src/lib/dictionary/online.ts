/**
 * Word meanings beyond the bundled dictionary (14-any-article Req 5.1):
 * a saved lookup first, then Wiktionary when online. Every answer,
 * including "nothing found", is saved so it works offline next time.
 * Wiktionary text is CC BY-SA 4.0 and is credited on the word card.
 */
import type { WordSense } from '../packs/types.ts';
import { stripHtml } from '../text/html.ts';
import { getWord, putWord } from '../wiki/cache.ts';
import { lookupWord, type Definition } from './lookup.ts';

/** A Definition, marked with where a non-bundled one came from. */
export interface AnyDefinition extends Definition {
  from?: 'wiktionary';
}

const POS: Record<string, WordSense['pos']> = {
  noun: 'n',
  'proper noun': 'n',
  verb: 'v',
  adjective: 'a',
  adverb: 'r',
};

interface WiktionaryReply {
  en?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{ definition?: string; examples?: string[] }>;
  }>;
}

/** Reads a Wiktionary REST definition reply into up to three senses. */
export function parseWiktionary(reply: unknown, word: string): AnyDefinition | null {
  const entries = (reply as WiktionaryReply | null)?.en ?? [];
  const senses: WordSense[] = [];
  for (const entry of entries) {
    const pos = POS[(entry.partOfSpeech ?? '').toLowerCase()];
    if (!pos) continue;
    for (const d of entry.definitions ?? []) {
      const gloss = stripHtml(d.definition ?? '');
      if (gloss.length < 3 || gloss.length > 220) continue;
      const example = stripHtml(d.examples?.[0] ?? '');
      senses.push({ pos, gloss, ...(example && example.length <= 160 ? { example } : {}) });
      if (senses.length === 3) break;
    }
    if (senses.length === 3) break;
  }
  return senses.length > 0 ? { word, lemma: word.toLowerCase(), senses, from: 'wiktionary' } : null;
}

/** Asks Wiktionary for a word; null when it has none, undefined when unreachable. */
export async function lookupOnline(
  word: string,
  fetchImpl: typeof fetch = fetch,
): Promise<AnyDefinition | null | undefined> {
  const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.toLowerCase())}`;
  let res: Response;
  try {
    res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  } catch {
    return undefined; // unreachable: do not save, ask again later
  }
  if (res.status === 404) return null;
  if (!res.ok) return undefined;
  try {
    return parseWiktionary(await res.json(), word);
  } catch {
    return undefined;
  }
}

/**
 * Bundled dictionary, then saved lookups, then Wiktionary. Resolves a
 * null definition when none is found; `offline` is true when the word is
 * not saved and the network could not be reached.
 */
export async function lookupAnyWord(
  word: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ definition: AnyDefinition | null; offline: boolean }> {
  const bundled = await lookupWord(word);
  if (bundled) return { definition: bundled, offline: false };
  const saved = await getWord(word);
  if (saved !== undefined) return { definition: saved, offline: false };
  const online = await lookupOnline(word, fetchImpl);
  if (online === undefined) return { definition: null, offline: true };
  await putWord(word, online);
  return { definition: online, offline: false };
}
