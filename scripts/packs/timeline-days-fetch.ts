/**
 * Finds candidate Wikidata items for the days of the year that have fewer
 * than three timeline events (22-review-3 Req 1). Run on purpose, not by
 * `npm run packs`: `npx tsx scripts/packs/timeline-days-fetch.ts`.
 *
 * It asks the Wikidata query service, one kid-friendly occupation or kind of
 * place at a time (a query over all of Wikidata times out), for items with a
 * day-precision date and many Wikipedia articles. It writes
 * `timeline-days-data.ts`: a QID, the expected day and a name per row. The
 * build then reads each item from Wikidata again and drops it when the day
 * differs (the same cross-check as the rest of the pack). Nothing here is
 * invented: a day with no candidate stays in the coverage report.
 * Politicians, soldiers and deaths are never queried.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fetchJson, withQuery } from './http.ts';
import { dayKeys } from './timeline-days.ts';

/** What a group of classes means for the timeline. */
interface Group {
  subject: string;
  kind: 'born' | 'founded' | 'published';
  /** The property holding the date. */
  pid: string;
  /** `P106` occupation or `P31` instance-of values. */
  link: 'P106' | 'P31';
  classes: readonly string[];
  minSitelinks: number;
}

const GROUPS: readonly Group[] = [
  { subject: 'science', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 25, classes: ['Q901', 'Q169470', 'Q593644', 'Q170790', 'Q864503', 'Q82594'] },
  { subject: 'space', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 20, classes: ['Q11063', 'Q11631'] },
  { subject: 'inventions', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 25, classes: ['Q205375', 'Q81096', 'Q42973'] },
  { subject: 'body', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 30, classes: ['Q39631'] },
  { subject: 'wildlife', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 15, classes: ['Q3055126', 'Q2374149', 'Q15627169'] },
  { subject: 'earth', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 15, classes: ['Q11900058', 'Q131512'] },
  { subject: 'arts', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 40, classes: ['Q36180', 'Q49757', 'Q6625963', 'Q4853732', 'Q1028181', 'Q36834', 'Q1281618', 'Q33231', 'Q266569', 'Q177220'] },
  { subject: 'arts', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 50, classes: ['Q937857', 'Q3665646', 'Q11513337', 'Q10833314', 'Q12299841', 'Q10843402', 'Q10873124', 'Q2309784'] },
  { subject: 'people', kind: 'born', pid: 'P569', link: 'P106', minSitelinks: 40, classes: ['Q15253558', 'Q4964182', 'Q482980'] },
  { subject: 'arts', kind: 'founded', pid: 'P571', link: 'P31', minSitelinks: 20, classes: ['Q33506', 'Q3918', 'Q46169', 'Q43229'] },
  { subject: 'inventions', kind: 'published', pid: 'P577', link: 'P31', minSitelinks: 15, classes: ['Q7889'] },
];

const ENDPOINT = 'https://query.wikidata.org/sparql';

interface Binding {
  p: { value: string };
  d: { value: string };
  s: { value: string };
  l?: { value: string };
}

function query(group: Group, cls: string): string {
  return [
    'SELECT ?p ?d ?s ?l WHERE {',
    `  ?p wdt:${group.link} wd:${cls}.`,
    `  ?p p:${group.pid}/psv:${group.pid} [wikibase:timePrecision 11; wikibase:timeValue ?d].`,
    '  ?p wikibase:sitelinks ?s.',
    `  FILTER(?s >= ${group.minSitelinks})`,
    '  ?p rdfs:label ?l. FILTER(LANG(?l) = "en")',
    '} ORDER BY DESC(?s) LIMIT 4000',
  ].join('\n');
}

interface Candidate {
  qid: string;
  date: string;
  name: string;
  subject: string;
  kind: string;
  sitelinks: number;
}

async function main(): Promise<void> {
  const rows = new Map<string, Candidate>();
  let failed = 0;
  for (const group of GROUPS) {
    for (const cls of group.classes) {
      const url = withQuery(ENDPOINT, { query: query(group, cls), format: 'json' });
      try {
        // fetchJson times out each request at 30 s and retries 429 and 5xx.
        const res = await fetchJson<{ results: { bindings: Binding[] } }>(url, {
          kind: 'wikidata-sparql',
          key: `${group.pid}-${group.link}-${cls}-${group.minSitelinks}`,
          headers: { Accept: 'application/sparql-results+json' },
        });
        for (const b of res.body.results.bindings) {
          const qid = b.p.value.split('/').pop() ?? '';
          const date = b.d.value.slice(0, 10);
          if (!/^Q\d+$/.test(qid) || !/^\d{4}-\d\d-\d\d$/.test(date)) {
            continue;
          }
          const sitelinks = Number(b.s.value);
          const old = rows.get(qid);
          if (!old || old.sitelinks < sitelinks) {
            rows.set(qid, { qid, date, name: b.l?.value ?? qid, subject: group.subject, kind: group.kind, sitelinks });
          }
        }
        console.log(`${group.pid} ${cls}: ${res.body.results.bindings.length} rows`);
      } catch (error) {
        failed++;
        console.log(`${group.pid} ${cls}: FAILED ${String(error).slice(0, 120)}`);
      }
    }
  }
  const existing = existingCounts();
  const byDay = new Map<string, Candidate[]>();
  for (const c of rows.values()) {
    const day = c.date.slice(5);
    const list = byDay.get(day) ?? [];
    list.push(c);
    byDay.set(day, list);
  }
  const lines: string[] = [];
  let kept = 0;
  for (const day of dayKeys()) {
    const need = Math.max(0, 4 - (existing.get(day) ?? 0));
    if (need === 0) continue;
    const list = (byDay.get(day) ?? []).sort((a, b) => b.sitelinks - a.sitelinks || a.qid.localeCompare(b.qid));
    // Keep a few more than needed, so a disputed date still leaves two.
    for (const c of list.slice(0, need + 1)) {
      lines.push(`  ['${c.qid}', '${c.date}', '${c.subject}', '${c.kind}', ${JSON.stringify(c.name)}],`);
      kept++;
    }
  }
  const out = [
    '/**',
    ' * GENERATED by `npx tsx scripts/packs/timeline-days-fetch.ts` from the Wikidata query',
    ' * service (CC0). A row is a candidate only: the build reads the item again and drops it',
    ' * when its own statement gives another day. The date is the cross-check, not the source.',
    ' */',
    "export type DayRow = readonly [qid: string, date: string, subject: string, kind: string, name: string];",
    '',
    'export const DAY_ROWS: readonly DayRow[] = [',
    ...lines,
    '];',
    '',
  ].join('\n');
  writeFileSync(new URL('./timeline-days-data.ts', import.meta.url), out);
  console.log(`candidates ${rows.size}; kept ${kept}; failed queries ${failed}`);
}

function existingCounts(): Map<string, number> {
  const pack = JSON.parse(readFileSync('public/packs/timeline.json', 'utf8')) as {
    events: { date: string }[];
  };
  const m = new Map<string, number>();
  for (const e of pack.events) m.set(e.date.slice(5), (m.get(e.date.slice(5)) ?? 0) + 1);
  return m;
}

await main();
