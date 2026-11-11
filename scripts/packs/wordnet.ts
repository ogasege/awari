/**
 * Open English WordNet (CC BY 4.0): download of the latest LMF XML
 * release, a regular-expression parser for the parts Awari needs, and
 * the selection of lemmas reachable from bundled article text.
 */
import { gunzipSync } from 'node:zlib';
import type {
  DictionaryShard,
  Source,
  WordSense,
} from '../../src/lib/packs/types.ts';
import { lemmaCandidates, shardFor } from '../../src/lib/dictionary/lemmatize.ts';
import { fetchBytes, fetchJson } from './http.ts';
import { isoDate, wordnetSource } from './sources.ts';

/** Lower-cased lemma -> senses, most frequent first per part of speech. */
export type Lexicon = Map<string, WordSense[]>;

/** Senses kept per bundled lemma. */
export const MAX_SENSES = 3;

const POS = new Set(['n', 'v', 'a', 's', 'r']);

/** Decodes the five XML entities and numeric references. */
export function decodeXml(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function attr(tag: string, name: string): string | undefined {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(tag);
  return m ? decodeXml(m[1] ?? '') : undefined;
}

/**
 * Parses WN-LMF XML into a lexicon. Senses of all entries sharing a
 * lower-cased lemma are interleaved round-robin in file order, so a word
 * that is both a noun and a verb gets both early.
 */
export function parseWordNet(xml: string): Lexicon {
  const synsets = new Map<string, WordSense>();
  for (const m of xml.matchAll(/<Synset\b([^>]*)>([\s\S]*?)<\/Synset>/g)) {
    const attrs = m[1] ?? '';
    const body = m[2] ?? '';
    const id = attr(attrs, 'id');
    const pos = attr(attrs, 'partOfSpeech');
    const gloss = /<Definition\b[^>]*>([\s\S]*?)<\/Definition>/.exec(body)?.[1];
    if (!id || !pos || !POS.has(pos) || gloss === undefined) {
      continue;
    }
    const example = /<Example\b[^>]*>([\s\S]*?)<\/Example>/.exec(body)?.[1];
    synsets.set(id, {
      pos: pos as WordSense['pos'],
      gloss: decodeXml(gloss).trim(),
      ...(example !== undefined ? { example: decodeXml(example).trim() } : {}),
    });
  }
  const grouped = new Map<string, WordSense[][]>();
  for (const m of xml.matchAll(/<LexicalEntry\b[^>]*>([\s\S]*?)<\/LexicalEntry>/g)) {
    const body = m[1] ?? '';
    const lemmaTag = /<Lemma\b[^>]*>/.exec(body)?.[0] ?? '';
    const form = attr(lemmaTag, 'writtenForm');
    if (!form) {
      continue;
    }
    const senses: WordSense[] = [];
    for (const s of body.matchAll(/<Sense\b[^>]*>/g)) {
      const synset = synsets.get(attr(s[0], 'synset') ?? '');
      if (synset) {
        senses.push(synset);
      }
    }
    if (senses.length > 0) {
      const key = form.toLowerCase();
      const list = grouped.get(key) ?? [];
      list.push(senses);
      grouped.set(key, list);
    }
  }
  const lexicon: Lexicon = new Map();
  for (const [key, lists] of grouped) {
    const merged: WordSense[] = [];
    const longest = Math.max(...lists.map((l) => l.length));
    for (let i = 0; i < longest; i++) {
      for (const list of lists) {
        const sense = list[i];
        if (sense) {
          merged.push(sense);
        }
      }
    }
    lexicon.set(key, merged);
  }
  return lexicon;
}

/**
 * Selects every lemma candidate of every token that the lexicon knows,
 * keeping at most three senses each.
 */
export function selectEntries(
  tokens: Iterable<string>,
  lexicon: ReadonlyMap<string, WordSense[]>,
): Map<string, WordSense[]> {
  const out = new Map<string, WordSense[]>();
  const seen = new Set<string>();
  for (const token of tokens) {
    if (seen.has(token)) {
      continue;
    }
    seen.add(token);
    for (const lemma of lemmaCandidates(token)) {
      const senses = lexicon.get(lemma);
      if (senses && !out.has(lemma)) {
        out.set(lemma, senses.slice(0, MAX_SENSES));
      }
    }
  }
  return out;
}

/** Groups entries into shards by `shardFor`, sorted by shard and lemma. */
export function shardEntries(
  entries: ReadonlyMap<string, WordSense[]>,
  source: Source,
): DictionaryShard[] {
  const shards = new Map<string, Record<string, WordSense[]>>();
  for (const lemma of [...entries.keys()].sort()) {
    const shard = shardFor(lemma);
    const bucket = shards.get(shard) ?? {};
    bucket[lemma] = entries.get(lemma) ?? [];
    shards.set(shard, bucket);
  }
  return [...shards.keys()]
    .sort()
    .map((shard) => ({ shard, entries: shards.get(shard) ?? {}, source }));
}

/** Downloads (or reads from cache) the latest OEWN XML release. */
export async function loadWordNet(): Promise<{ lexicon: Lexicon; source: Source }> {
  const release = await fetchJson<{
    tag_name: string;
    published_at: string;
    assets: { name: string; browser_download_url: string }[];
  }>('https://api.github.com/repos/globalwordnet/english-wordnet/releases/latest', {
    kind: 'wordnet',
    key: 'release-latest',
    headers: { Accept: 'application/vnd.github+json' },
  });
  const asset = release.body.assets.find((a) =>
    /^english-wordnet-\d{4}\.xml\.gz$/.test(a.name),
  );
  if (!asset) {
    throw new Error(`No LMF XML asset in OEWN release ${release.body.tag_name}`);
  }
  const gz = await fetchBytes(asset.browser_download_url, {
    kind: 'wordnet',
    key: asset.name.replace(/\.xml\.gz$/, ''),
    ext: '.xml.gz',
  });
  const xml = gunzipSync(gz.body).toString('utf8');
  const version = /\d{4}/.exec(asset.name)?.[0] ?? release.body.tag_name;
  return {
    lexicon: parseWordNet(xml),
    source: wordnetSource(version, isoDate(release.body.published_at)),
  };
}
