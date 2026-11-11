/**
 * Checks a packs folder against the contract and the spec's acceptance
 * criteria. Used by the build (on the staging folder, before it replaces
 * `public/packs`) and by `validate.test.ts` (on the committed output).
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Article,
  DictionaryShard,
  FactsPack,
  PackId,
  PackIndex,
} from '../../src/lib/packs/types.ts';
import { lemmaCandidates, shardFor } from '../../src/lib/dictionary/lemmatize.ts';
import { listFiles } from '../lib/files.ts';
import type { AtlasCollection } from './atlas.ts';
import { AFRICAN_UN_MEMBERS } from './countries.ts';
import { ACCEPTED_LICENCES } from './licence.ts';
import { MANIFEST_FILE, type PacksManifest } from './manifest.ts';
import { MAX_NOTES, NOTE_LIMIT } from './notes.ts';
import { articleText } from './text.ts';
import { MAX_SENSES } from './wordnet.ts';

/** Largest allowed total size of the packs folder. */
export const SIZE_BUDGET = 25 * 1024 * 1024;

/** Everything loaded from a packs folder. */
export interface LoadedPacks {
  indexes: Map<PackId, PackIndex>;
  articles: Article[];
  facts: FactsPack;
  shards: DictionaryShard[];
  atlas: AtlasCollection;
  manifest?: PacksManifest;
  files: string[];
}

function readJson<T>(dir: string, rel: string): T {
  return JSON.parse(readFileSync(join(dir, rel), 'utf8')) as T;
}

/** Loads every pack file from `dir`. */
export function loadPacks(dir: string): LoadedPacks {
  const files = listFiles(dir).sort();
  const indexes = new Map<PackId, PackIndex>();
  const articles: Article[] = [];
  for (const pack of ['countries', 'physics'] as const) {
    indexes.set(pack, readJson<PackIndex>(dir, `${pack}/index.json`));
    for (const f of files) {
      if (
        f.startsWith(`${pack}/`) &&
        f.endsWith('.json') &&
        !['index.json', 'facts.json'].includes(f.slice(pack.length + 1))
      ) {
        articles.push(readJson<Article>(dir, f));
      }
    }
  }
  return {
    indexes,
    articles,
    facts: readJson<FactsPack>(dir, 'countries/facts.json'),
    shards: files
      .filter((f) => f.startsWith('dictionary/'))
      .map((f) => readJson<DictionaryShard>(dir, f)),
    atlas: readJson<AtlasCollection>(dir, 'atlas/countries.json'),
    manifest: files.includes(MANIFEST_FILE)
      ? readJson<PacksManifest>(dir, MANIFEST_FILE)
      : undefined,
    files,
  };
}

const LICENCES = new Set<string>(ACCEPTED_LICENCES);

/** Every object in a JSON value that looks like a Source. */
function sourcesIn(value: unknown, out: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const v of value) {
      sourcesIn(v, out);
    }
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('licence' in obj) {
      out.push(obj);
    }
    for (const v of Object.values(obj)) {
      sourcesIn(v, out);
    }
  }
  return out;
}

/** Problems with one Source-like object, as messages. */
function sourceProblems(where: string, s: unknown): string[] {
  if (!s || typeof s !== 'object') {
    return [`${where}: missing source`];
  }
  const src = s as Record<string, unknown>;
  const problems: string[] = [];
  if (!LICENCES.has(String(src.licence))) {
    problems.push(`${where}: licence "${String(src.licence)}" not accepted`);
  }
  for (const key of ['name', 'url', 'licenceUrl']) {
    if (typeof src[key] !== 'string' || src[key] === '') {
      problems.push(`${where}: source has no ${key}`);
    }
  }
  if (!/^\d{4}-\d\d-\d\d$/.test(String(src.retrieved))) {
    problems.push(`${where}: source has no retrieved date`);
  }
  return problems;
}

/**
 * Validates a packs folder and returns a list of problems (empty when
 * everything holds).
 */
export function validatePacks(dir: string): string[] {
  const p = loadPacks(dir);
  const errors: string[] = [];
  const fail = (msg: string): void => {
    errors.push(msg);
  };

  // Every record carries an accepted Source (Req 9.1).
  for (const [pack, index] of p.indexes) {
    if (index.sources.length === 0) {
      fail(`${pack}/index.json: no sources`);
    }
  }
  for (const a of p.articles) {
    errors.push(...sourceProblems(`${a.pack}/${a.id}`, a.source));
    for (const photo of a.photos) {
      errors.push(...sourceProblems(`${a.pack}/${a.id} photo`, photo.credit));
      if (!photo.credit.author) {
        fail(`${a.pack}/${a.id}: photo has no author`);
      }
    }
  }
  errors.push(...sourceProblems('facts.json', p.facts.source));
  for (const c of p.facts.countries) {
    errors.push(...sourceProblems(`facts ${c.id}`, c.source));
  }
  for (const s of p.shards) {
    errors.push(...sourceProblems(`dictionary/${s.shard}`, s.source));
  }
  for (const f of p.files.filter((x) => x.endsWith('.json'))) {
    for (const s of sourcesIn(readJson<unknown>(dir, f))) {
      errors.push(...sourceProblems(f, s));
    }
  }

  // Indexes, article files and sections (Req 2.8, 4.1, 10.1).
  const byPack = new Map<string, Map<string, Article>>();
  for (const a of p.articles) {
    const m = byPack.get(a.pack) ?? new Map<string, Article>();
    m.set(a.id, a);
    byPack.set(a.pack, m);
    if (a.sections.length === 0 || a.sections.some((s) => s.paragraphs.length === 0)) {
      fail(`${a.pack}/${a.id}: empty article or section`);
    }
    if (!p.files.includes(`${a.pack}/${a.id}.json`)) {
      fail(`${a.pack}/${a.id}: id does not match its file name`);
    }
    // Margin notes (Req 8).
    const text = articleText(a.sections);
    if (a.notes.length > MAX_NOTES) {
      fail(`${a.pack}/${a.id}: too many notes`);
    }
    for (const n of a.notes) {
      if (n.kind === 'fact' && (!n.proof || !text.includes(n.proof))) {
        fail(`${a.pack}/${a.id}: note proof is not in the article: ${n.text}`);
      }
      if (n.text.length >= NOTE_LIMIT) {
        fail(`${a.pack}/${a.id}: note too long: ${n.text}`);
      }
    }
    // Photo files exist (Req 5.5).
    for (const photo of a.photos) {
      if (!p.files.includes(photo.file)) {
        fail(`${a.pack}/${a.id}: photo ${photo.file} missing`);
      }
    }
  }
  for (const [pack, index] of p.indexes) {
    const arts = byPack.get(pack) ?? new Map<string, Article>();
    if (index.items.length !== arts.size) {
      fail(`${pack}/index.json lists ${index.items.length} items for ${arts.size} articles`);
    }
    for (const item of index.items) {
      if (!arts.has(item.id)) {
        fail(`${pack}/index.json: ${item.id} has no article`);
      }
      if (item.thumb && !p.files.includes(item.thumb)) {
        fail(`${pack}/index.json: thumb ${item.thumb} missing`);
      }
    }
  }

  // Africa: 54 countries with articles and lead photos (Req 2.2, 5.1).
  const countries = byPack.get('countries') ?? new Map<string, Article>();
  const african = p.facts.countries.filter((c) => AFRICAN_UN_MEMBERS.has(c.iso3));
  if (african.length !== AFRICAN_UN_MEMBERS.size) {
    fail(`facts list ${african.length} of ${AFRICAN_UN_MEMBERS.size} African UN members`);
  }
  for (const c of african) {
    const article = countries.get(c.id);
    if (c.continent !== 'Africa') {
      fail(`${c.id}: continent is ${c.continent}`);
    }
    if (!article) {
      fail(`${c.id}: African country has no article`);
    } else if (article.photos.length === 0) {
      fail(`${c.id}: African country has no lead photo`);
    }
  }
  const indexAfrica = p.indexes
    .get('countries')
    ?.items.filter((i) => i.continent === 'Africa').length;
  if (indexAfrica !== AFRICAN_UN_MEMBERS.size) {
    fail(`countries index has ${indexAfrica ?? 0} African items, expected 54`);
  }
  for (const a of byPack.get('physics')?.values() ?? []) {
    if (a.photos.length === 0) {
      fail(`physics/${a.id}: no lead photo`);
    }
  }
  for (const c of p.facts.countries) {
    if (!countries.has(c.id)) {
      fail(`facts ${c.id}: no article`);
    }
    for (const n of c.neighbours) {
      if (!countries.has(n) || n === c.id) {
        fail(`facts ${c.id}: bad neighbour ${n}`);
      }
    }
  }

  // Dictionary (Req 6).
  for (const s of p.shards) {
    for (const [lemma, senses] of Object.entries(s.entries)) {
      if (shardFor(lemma) !== s.shard) {
        fail(`dictionary/${s.shard}: ${lemma} is in the wrong shard`);
      }
      if (senses.length === 0 || senses.length > MAX_SENSES) {
        fail(`dictionary/${s.shard}: ${lemma} has ${senses.length} senses`);
      }
    }
  }
  const lookup = (word: string): boolean =>
    lemmaCandidates(word).some((c) =>
      p.shards.some((s) => s.shard === shardFor(c) && c in s.entries),
    );
  if (!lookup('delta')) {
    fail('dictionary: "delta" does not resolve');
  }

  // Atlas joins facts by iso3 (Req 7.4).
  const factsById = new Map(p.facts.countries.map((c) => [c.id, c]));
  for (const f of p.atlas.features) {
    const keys = Object.keys(f.properties).sort().join(',');
    if (keys !== 'id,iso3,name') {
      fail(`atlas ${f.properties.name}: properties ${keys}`);
    }
    if (f.properties.id !== null) {
      const facts = factsById.get(f.properties.id);
      if (!facts || facts.iso3 !== f.properties.iso3) {
        fail(`atlas ${f.properties.id}: no facts with iso3 ${f.properties.iso3}`);
      }
    }
  }

  // Manifest matches the files and the size budget holds (Req 9.4, 10.2).
  let total = 0;
  for (const f of p.files) {
    total += statSync(join(dir, f)).size;
  }
  if (total > SIZE_BUDGET) {
    fail(`packs total ${total} bytes, over the ${SIZE_BUDGET} budget`);
  }
  if (!p.manifest) {
    fail('manifest.json missing');
  } else {
    const listed = new Map(p.manifest.files.map((f) => [f.path, f.bytes]));
    for (const f of p.files.filter((x) => x !== MANIFEST_FILE)) {
      const bytes = listed.get(`/packs/${f}`);
      if (bytes === undefined) {
        fail(`manifest does not list ${f}`);
      } else if (bytes !== statSync(join(dir, f)).size) {
        fail(`manifest size wrong for ${f}`);
      }
    }
    for (const path of listed.keys()) {
      if (!existsSync(join(dir, path.replace(/^\/packs\//, '')))) {
        fail(`manifest lists missing ${path}`);
      }
    }
  }
  return errors;
}
