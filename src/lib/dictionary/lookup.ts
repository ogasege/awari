/**
 * Looks a word up in the sharded Open English WordNet pack, trying each
 * candidate lemma in order. Shards load on demand.
 */
import { loadPack } from '../packs/load.ts';
import type { DictionaryShard, WordSense } from '../packs/types.ts';
import { lemmaCandidates, shardFor } from './lemmatize.ts';

export interface Definition {
  word: string;
  lemma: string;
  senses: WordSense[];
}

export type ShardLoader = (shard: string) => Promise<DictionaryShard | null>;

/** Loads a shard from /packs/dictionary, or null if it is missing. */
export const packShardLoader: ShardLoader = (shard) =>
  loadPack<DictionaryShard>(`dictionary/${shard}.json`).catch(() => null);

/** Returns the first candidate lemma found, with up to three senses. */
export async function lookupWord(
  word: string,
  loadShard: ShardLoader = packShardLoader,
): Promise<Definition | null> {
  for (const lemma of lemmaCandidates(word)) {
    const shard = await loadShard(shardFor(lemma));
    const senses = shard?.entries[lemma];
    if (senses && senses.length > 0) {
      return { word, lemma, senses: senses.slice(0, 3) };
    }
  }
  return null;
}

/** Plain-English name for a WordNet part of speech. */
export function partOfSpeech(pos: WordSense['pos']): string {
  switch (pos) {
    case 'n':
      return 'noun';
    case 'v':
      return 'verb';
    case 'a':
    case 's':
      return 'adjective';
    case 'r':
      return 'adverb';
  }
}
