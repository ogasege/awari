/**
 * `npm run packs`: builds every content pack from open data into a
 * staging folder, validates it, swaps it into `public/packs/` and
 * rewrites the pack region of `CREDITS.md`.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import type {
  Article,
  PackIndex,
  PackIndexItem,
} from '../../src/lib/packs/types.ts';
import { tokenise } from '../../src/lib/dictionary/lemmatize.ts';
import { trimAtlas } from './atlas.ts';
import {
  AFRICAN_UN_MEMBERS,
  NATURAL_EARTH_ALIASES,
  buildCountryArticles,
  buildFacts,
  loadNaturalEarth,
  selectCountries,
} from './countries.ts';
import { renderCredits, replaceRegion, type PhotoCredit } from './credits.ts';
import { networkRequests } from './http.ts';
import { MANIFEST_FILE, buildManifest } from './manifest.ts';
import { PHYSICS_TOPICS, buildPhysicsArticles } from './physics.ts';
import { choosePhoto, type PhotoSubject } from './photos.ts';
import {
  isoDate,
  naturalEarthSource,
  wikidataSource,
  wikipediaPackSource,
} from './sources.ts';
import { validatePacks } from './validate.ts';
import { loadWordNet, selectEntries, shardEntries } from './wordnet.ts';

const PUBLIC_PACKS = join('public', 'packs');
const STAGING = join('data', 'build', 'packs');
const PREVIOUS = join('data', 'build', 'packs-previous');

function log(message: string): void {
  console.log(`[packs] ${message}`);
}

function writeJson(rel: string, value: unknown): void {
  const path = join(STAGING, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value)}\n`);
}

function latest(dates: readonly string[]): string {
  return [...dates].sort().at(-1) ?? isoDate(new Date());
}

/** Adds a lead photo to an article, failing when none qualifies. */
async function addPhoto(
  article: Article,
  wikiTitle: string,
  queries: string[],
  credits: PhotoCredit[],
  places?: { names: string[]; otherNames: string[] },
): Promise<Article> {
  const subject: PhotoSubject = {
    slug: article.id,
    title: article.title,
    wikiTitle,
    pack: article.pack,
    queries,
    ...places,
  };
  const chosen = await choosePhoto(subject, STAGING);
  if (!chosen) {
    throw new Error(`No acceptable Commons photo for ${article.pack}/${article.id}`);
  }
  credits.push({ path: `packs/${chosen.photo.file}`, subject: article.title, photo: chosen.photo });
  return { ...article, photos: [chosen.photo] };
}

/** Every word a student can tap in an article. */
function articleTokens(a: Article): string[] {
  return [
    a.title,
    ...a.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...a.photos.flatMap((p) => [p.caption, p.alt]),
    ...a.notes.map((n) => n.text),
  ].flatMap(tokenise);
}

async function main(): Promise<void> {
  const started = Date.now();
  rmSync(STAGING, { recursive: true, force: true });
  mkdirSync(STAGING, { recursive: true });
  const credits: PhotoCredit[] = [];

  log('Selecting countries (Natural Earth 1:50m + Wikidata)…');
  const { countries, fetched: wdFetched } = await selectCountries();
  log(`  ${countries.length} countries`);

  log('Fetching country articles (Simple English Wikipedia)…');
  const byQid = await buildCountryArticles(countries);
  const facts = await buildFacts(countries, byQid, wdFetched);
  const factsById = new Map(facts.countries.map((c) => [c.id, c]));

  log('Choosing lead photos for African countries…');
  const countryArticles: Article[] = [];
  const namesOf = (qid: string): string[] => {
    const c = countries.find((x) => x.qid === qid);
    const title = byQid.get(qid)?.title;
    return [
      ...new Set([title, c?.entity.labels?.en?.value].filter((n): n is string => !!n)),
    ];
  };
  const allNames = countries.flatMap((c) => namesOf(c.qid));
  for (const c of countries) {
    let article = byQid.get(c.qid);
    if (!article) {
      throw new Error(`No article for ${c.qid}`);
    }
    if (AFRICAN_UN_MEMBERS.has(c.iso3)) {
      const names = namesOf(c.qid);
      const capitals = (factsById.get(article.id)?.capital ?? '')
        .split(', ')
        .filter(Boolean);
      article = await addPhoto(
        article,
        c.wikiTitle,
        [`${article.title} landscape`, article.title, ...capitals],
        credits,
        {
          names: [...names, ...capitals],
          otherNames: allNames.filter((n) => !names.includes(n)),
        },
      );
    }
    countryArticles.push(article);
  }

  log('Fetching physics articles…');
  const physicsArticles: Article[] = [];
  const physics = await buildPhysicsArticles();
  for (const [i, article] of physics.entries()) {
    const topic = PHYSICS_TOPICS[i];
    if (!topic) {
      throw new Error(`Physics topic ${i} missing`);
    }
    physicsArticles.push(
      await addPhoto(article, topic.title, [topic.photoQuery], credits),
    );
  }

  const wikiRetrieved = latest(
    [...countryArticles, ...physicsArticles].map((a) => a.source.retrieved),
  );
  const item = (a: Article): PackIndexItem => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    ...(a.photos[0] ? { thumb: a.photos[0].file } : {}),
    ...(a.pack === 'countries'
      ? { continent: factsById.get(a.id)?.continent ?? 'Unknown' }
      : {}),
  });

  log('Writing countries and physics packs…');
  for (const a of [...countryArticles, ...physicsArticles]) {
    writeJson(`${a.pack}/${a.id}.json`, a);
  }
  const countriesIndex: PackIndex = {
    pack: 'countries',
    title: 'Countries of the world',
    items: [...countryArticles]
      .sort((a, b) => a.title.localeCompare(b.title))
      .map(item),
    sources: [
      wikipediaPackSource(wikiRetrieved),
      wikidataSource(isoDate(wdFetched)),
    ],
  };
  writeJson('countries/index.json', countriesIndex);
  writeJson('countries/facts.json', facts);
  const physicsIndex: PackIndex = {
    pack: 'physics',
    title: 'Physics: electricity',
    items: physicsArticles.map(item),
    sources: [wikipediaPackSource(wikiRetrieved)],
  };
  writeJson('physics/index.json', physicsIndex);

  log('Building the dictionary (Open English WordNet)…');
  const { lexicon, source: wnSource } = await loadWordNet();
  const entries = selectEntries(
    [...countryArticles, ...physicsArticles].flatMap(articleTokens),
    lexicon,
  );
  const shards = shardEntries(entries, wnSource);
  for (const shard of shards) {
    writeJson(`dictionary/${shard.shard}.json`, shard);
  }
  log(`  ${entries.size} lemmas in ${shards.length} shards`);

  log('Trimming the atlas (Natural Earth 1:110m)…');
  const { data: ne110, fetched: neFetched } = await loadNaturalEarth('110m');
  const articleByQid = new Map(countryArticles.map((a) => [a.qid ?? '', a]));
  const atlas = trimAtlas(ne110, (p) => {
    const qid = p.WIKIDATAID ? (NATURAL_EARTH_ALIASES.get(p.WIKIDATAID) ?? p.WIKIDATAID) : '';
    const a = articleByQid.get(qid);
    return a ? { id: a.id, name: a.title } : undefined;
  });
  writeJson('atlas/countries.json', {
    ...atlas,
    source: naturalEarthSource(isoDate(neFetched)),
  });

  const manifest = buildManifest(STAGING, isoDate(new Date()));
  writeJson(MANIFEST_FILE, manifest);

  log('Validating…');
  const problems = validatePacks(STAGING);
  if (problems.length > 0) {
    throw new Error(
      `Validation failed (${problems.length}):\n- ${problems.slice(0, 40).join('\n- ')}`,
    );
  }

  log('Swapping into public/packs and updating CREDITS.md…');
  rmSync(PREVIOUS, { recursive: true, force: true });
  if (existsSync(PUBLIC_PACKS)) {
    renameSync(PUBLIC_PACKS, PREVIOUS);
  }
  renameSync(STAGING, PUBLIC_PACKS);
  rmSync(PREVIOUS, { recursive: true, force: true });
  const creditsPath = 'CREDITS.md';
  const before = existsSync(creditsPath) ? readFileSync(creditsPath, 'utf8') : '';
  writeFileSync(
    creditsPath,
    replaceRegion(before, renderCredits(credits, wikiRetrieved)),
  );

  const african = countryArticles.filter((a) =>
    AFRICAN_UN_MEMBERS.has(factsById.get(a.id)?.iso3 ?? ''),
  ).length;
  log(
    `Done in ${Math.round((Date.now() - started) / 1000)} s: ` +
      `${countryArticles.length} countries (${african} African), ` +
      `${physicsArticles.length} physics articles, ${credits.length} photos, ` +
      `${entries.size} dictionary lemmas, ${atlas.features.length} atlas shapes, ` +
      `${(manifest.totalBytes / 1024 / 1024).toFixed(2)} MB, ` +
      `${networkRequests()} network requests.`,
  );
}

main().catch((error: unknown) => {
  console.error(`[packs] FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
