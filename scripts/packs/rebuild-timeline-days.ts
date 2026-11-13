/**
 * Adds the day-of-year events (22-review-3 Req 1) to `public/packs/timeline.json`
 * without rebuilding the rest of the packs:
 *
 *   npx tsx scripts/packs/rebuild-timeline-days.ts
 *
 * Existing events are kept as they are. Each candidate row is read from
 * Wikidata again and dropped when its own statement gives another day.
 * Requests go through `getEntities`, which times out and retries.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { normaliseContinent } from '../../src/lib/packs/subjects.ts';
import type { TimelineEvent } from '../../src/lib/packs/types.ts';
import { MANIFEST_FILE, buildManifest } from './manifest.ts';
import { buildEvents, continentFrom, referencedPlaces } from './timeline.ts';
import { dayItems, daysShort } from './timeline-days.ts';
import { getEntities } from './wikidata.ts';

const DIR = join('public', 'packs');
const pack = JSON.parse(readFileSync(join(DIR, 'timeline.json'), 'utf8')) as {
  events: TimelineEvent[];
  source: unknown;
};
const have = new Set(pack.events.map((e) => e.id));
const items = dayItems().filter((i) => !have.has(i.qid));
console.log(`${pack.events.length} events on disk; ${items.length} new candidates`);

const facts = JSON.parse(readFileSync(join(DIR, 'countries', 'facts.json'), 'utf8')) as {
  countries: { qid: string; continent: string }[];
};
const continentByQid = new Map<string, string>();
for (const f of facts.countries) {
  const c = normaliseContinent(f.continent);
  if (c) continentByQid.set(f.qid, c);
}

const { entities, fetched } = await getEntities(items.map((i) => i.qid), 'labels|claims', true);
const placeIds = [...new Set([...entities.values()].flatMap(referencedPlaces).filter((id) => !entities.has(id)))];
const { entities: places } = await getEntities(placeIds, 'claims', true);
const retrieved = fetched.slice(0, 10);
const { events, dropped } = buildEvents(
  items,
  entities,
  retrieved,
  undefined,
  (_i, entity) => continentFrom(entity, continentByQid, new Map([...places, ...entities])),
);
for (const d of dropped.filter((x) => ['Q7315','Q7294','Q7241'].includes(x.qid))) console.log(d.qid, d.reason);
console.log(`built ${events.length}; dropped ${dropped.length}`);
// Re-check the events already on disk: drop one whose date is a Julian-calendar day after 1582.
const modern = pack.events.filter((e) => Number(e.date.slice(0, 4)) > 1582);
const { entities: baseEntities } = await getEntities(modern.map((e) => e.id), 'claims', true);
const julian = new Set<string>();
for (const e of modern) {
  const claims = baseEntities.get(e.id)?.claims ?? {};
  for (const list of Object.values(claims)) {
    for (const st of list as { mainsnak?: { datavalue?: { type?: string; value?: { time?: string; calendarmodel?: string } } } }[]) {
      const v = st.mainsnak?.datavalue;
      if (v?.type === 'time' && v.value?.calendarmodel?.endsWith('/Q1985786') && v.value.time?.slice(1, 11) === e.date) {
        julian.add(e.id);
      }
    }
  }
}
if (julian.size > 0) console.log(`dropped Julian-calendar days: ${[...julian].join(' ')}`);
const kept = pack.events.filter((e) => !julian.has(e.id));
const merged = [...kept, ...events].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
writeFileSync(join(DIR, 'timeline.json'), `${JSON.stringify({ ...pack, events: merged })}\n`);
const previous = JSON.parse(readFileSync(join(DIR, MANIFEST_FILE), 'utf8')) as { built: string };
writeFileSync(join(DIR, MANIFEST_FILE), `${JSON.stringify(buildManifest(DIR, previous.built))}\n`);
const short = daysShort(merged, 2);
console.log(`events now ${merged.length}; days with fewer than 2: ${short.length}`);
if (short.length > 0) console.log(short.map((s) => `${s.day}(${s.count})`).join(' '));
