/**
 * Wikidata access through the Action API (`wbgetentities`) and the pure
 * helpers that turn raw claims into country facts. Wikidata is CC0.
 */
import { createHash } from 'node:crypto';
import { fetchJson } from './http.ts';

/** Statement rank as Wikidata reports it. */
export type Rank = 'preferred' | 'normal' | 'deprecated';

/** A Wikidata data value, narrowed to the kinds the pipeline reads. */
export type DataValue =
  | { type: 'wikibase-entityid'; value: { id: string } }
  | { type: 'string'; value: string }
  | { type: 'quantity'; value: { amount: string; unit: string } }
  | { type: 'time'; value: { time: string; precision: number } }
  | { type: string; value: unknown };

/** One snak (main value or qualifier). */
export interface Snak {
  snaktype?: string;
  datavalue?: DataValue;
}

/** One statement about an item. */
export interface Statement {
  rank: Rank;
  mainsnak: Snak;
  qualifiers?: Record<string, Snak[]>;
}

/** The parts of an entity the pipeline reads. */
export interface Entity {
  id: string;
  missing?: string;
  labels?: Record<string, { value: string }>;
  claims?: Record<string, Statement[]>;
  sitelinks?: Record<string, { title: string }>;
}

const API = 'https://www.wikidata.org/w/api.php';

/**
 * Fetches entities in batches of 50 with labels (English), claims and
 * the Simple English Wikipedia sitelink. Returns the entities and the
 * earliest fetch date among the batches.
 */
export async function getEntities(
  ids: readonly string[],
  props = 'labels|claims|sitelinks',
  languageFallback = false,
): Promise<{ entities: Map<string, Entity>; fetched: string }> {
  const unique = [...new Set(ids)].sort();
  const entities = new Map<string, Entity>();
  let fetched = '';
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const res = await fetchJson<{ entities: Record<string, Entity> }>(API, {
      kind: 'wikidata',
      key: languageFallback
        ? // A hash of the whole batch: long id lists must not collide.
          `fb-${createHash('sha1').update(`${props}|${batch.join('|')}`).digest('hex')}-${i}`
        : `${props.replace(/\|/g, '-')}-${batch.join('-')}`.slice(0, 180) +
          `-${batch.length}-${i}`,
      form: {
        action: 'wbgetentities',
        ids: batch.join('|'),
        props,
        languages: 'en',
        sitefilter: 'simplewiki',
        // Labels that equal the shared "mul" label are only returned
        // with fallback on (Marie Curie, Carl Linnaeus).
        ...(languageFallback ? { languagefallback: '1' } : {}),
        format: 'json',
        formatversion: '2',
      },
    });
    if (!res.body.entities) {
      throw new Error(`Wikidata returned no entities for ${batch.join(',')}`);
    }
    for (const entity of Object.values(res.body.entities)) {
      if (!entity.missing) {
        entities.set(entity.id, entity);
      }
    }
    fetched = fetched === '' || res.fetched < fetched ? res.fetched : fetched;
  }
  return { entities, fetched };
}

/** English label of an entity, or its id. */
export function labelOf(entity: Entity | undefined, fallback: string): string {
  return entity?.labels?.en?.value ?? fallback;
}

/**
 * Current statements for a property: deprecated ones and those with an
 * end time (P582) are dropped, then only the best remaining rank is
 * kept.
 */
export function currentStatements(
  entity: Entity,
  pid: string,
): Statement[] {
  const live = (entity.claims?.[pid] ?? []).filter(
    (s) => s.rank !== 'deprecated' && !s.qualifiers?.P582,
  );
  const preferred = live.filter((s) => s.rank === 'preferred');
  return preferred.length > 0 ? preferred : live;
}

/** All non-deprecated statements without an end time. */
export function liveStatements(entity: Entity, pid: string): Statement[] {
  return (entity.claims?.[pid] ?? []).filter(
    (s) => s.rank !== 'deprecated' && !s.qualifiers?.P582,
  );
}

/** Item ids a list of statements points at, de-duplicated, in order. */
export function itemIds(statements: readonly Statement[]): string[] {
  const out: string[] = [];
  for (const s of statements) {
    const dv = s.mainsnak.datavalue;
    if (dv?.type === 'wikibase-entityid') {
      const id = (dv.value as { id: string }).id;
      if (!out.includes(id)) {
        out.push(id);
      }
    }
  }
  return out;
}

/** True when the entity is a current sovereign state. */
export function isSovereignState(entity: Entity): boolean {
  const p31 = itemIds(
    (entity.claims?.P31 ?? []).filter((s) => s.rank !== 'deprecated'),
  );
  const dissolved = (entity.claims?.P576 ?? []).some(
    (s) => s.rank !== 'deprecated',
  );
  return p31.includes('Q3624078') && !dissolved;
}

/** A sortable number for a Wikidata time string like "+1960-10-01T…". */
export function timeKey(time: string): number {
  const m = /^([+-]?)(\d+)-(\d\d)-(\d\d)/.exec(time);
  if (!m) {
    return Number.NEGATIVE_INFINITY;
  }
  const year = Number(m[2]) * (m[1] === '-' ? -1 : 1);
  return year * 10000 + Number(m[3]) * 100 + Number(m[4]);
}

/**
 * Formats a Wikidata time at its precision: YYYY-MM-DD (11), YYYY-MM
 * (10) or YYYY (9 or coarser). Negative years keep their sign.
 */
export function formatWikidataTime(
  time: string,
  precision: number,
): string | undefined {
  const m = /^([+-]?)(\d+)-(\d\d)-(\d\d)/.exec(time);
  if (!m) {
    return undefined;
  }
  const sign = m[1] === '-' ? '-' : '';
  const year = `${sign}${(m[2] ?? '').replace(/^0+(?=\d{4})/, '')}`;
  if (precision >= 11 && m[3] !== '00' && m[4] !== '00') {
    return `${year}-${m[3]}-${m[4]}`;
  }
  if (precision >= 10 && m[3] !== '00') {
    return `${year}-${m[3]}`;
  }
  return year;
}

/** A population figure with its rank and point in time. */
export interface PopulationFigure {
  value: number;
  rank: Rank;
  /** Wikidata time string of the P585 qualifier, when present. */
  time?: string;
}

/**
 * Picks the population figure to show: deprecated figures are ignored,
 * preferred beats normal, the latest point in time wins within a rank,
 * and ties go to the larger figure so input order never matters.
 */
export function pickPopulation(
  figures: readonly PopulationFigure[],
): PopulationFigure | undefined {
  const rankScore = (r: Rank): number => (r === 'preferred' ? 2 : 1);
  let best: PopulationFigure | undefined;
  for (const f of figures) {
    if (f.rank === 'deprecated') {
      continue;
    }
    if (!best) {
      best = f;
      continue;
    }
    const byRank = rankScore(f.rank) - rankScore(best.rank);
    const fTime = timeKey(f.time ?? '');
    const bestTime = timeKey(best.time ?? '');
    const later = fTime > bestTime;
    const sameTime = fTime === bestTime;
    if (
      byRank > 0 ||
      (byRank === 0 && (later || (sameTime && f.value > best.value)))
    ) {
      best = f;
    }
  }
  return best;
}

/** Population figures from P1082 statements without an end time. */
export function populationFigures(entity: Entity): PopulationFigure[] {
  return (entity.claims?.P1082 ?? []).flatMap((s) => {
    const dv = s.mainsnak.datavalue;
    if (dv?.type !== 'quantity' || s.qualifiers?.P582) {
      return [];
    }
    const value = Number((dv.value as { amount: string }).amount);
    const when = s.qualifiers?.P585?.[0]?.datavalue;
    const time =
      when?.type === 'time' ? (when.value as { time: string }).time : undefined;
    return Number.isFinite(value) ? [{ value, rank: s.rank, time }] : [];
  });
}

/** Square kilometres per unit, keyed by Wikidata unit item. */
const AREA_UNITS: Record<string, number> = {
  Q712226: 1,
  Q232291: 2.589988110336,
  Q35852: 0.01,
  Q25343: 1e-6,
};

/** Area in km² from P2046, using the best current statement. */
export function areaKm2(entity: Entity): number | undefined {
  for (const s of currentStatements(entity, 'P2046')) {
    const dv = s.mainsnak.datavalue;
    if (dv?.type !== 'quantity') {
      continue;
    }
    const { amount, unit } = dv.value as { amount: string; unit: string };
    const factor = AREA_UNITS[unit.split('/').pop() ?? ''];
    const value = Number(amount);
    if (factor !== undefined && Number.isFinite(value)) {
      return Math.round(value * factor);
    }
  }
  return undefined;
}

/** First string value of a property's current statements. */
export function stringValue(entity: Entity, pid: string): string | undefined {
  for (const s of currentStatements(entity, pid)) {
    const dv = s.mainsnak.datavalue;
    if (dv?.type === 'string') {
      return dv.value as string;
    }
  }
  return undefined;
}

/** ISO date of the best current P571 (inception), latest if several. */
export function inception(entity: Entity): string | undefined {
  let best: { time: string; precision: number } | undefined;
  for (const s of currentStatements(entity, 'P571')) {
    const dv = s.mainsnak.datavalue;
    if (dv?.type !== 'time') {
      continue;
    }
    const v = dv.value as { time: string; precision: number };
    if (!best || timeKey(v.time) > timeKey(best.time)) {
      best = v;
    }
  }
  return best ? formatWikidataTime(best.time, best.precision) : undefined;
}

/** Wikidata item for the event "independence". */
export const INDEPENDENCE = 'Q1464916';

/**
 * ISO date of independence: the point in time (P585) of a "significant
 * event" (P793) statement whose value is independence (Q1464916); the
 * latest when there are several. Undefined when Wikidata records none:
 * inception (P571) is not used, because it often marks a later change
 * of government (Nigeria's is 1963, the year it became a republic).
 */
export function independenceDate(entity: Entity): string | undefined {
  let best: { time: string; precision: number } | undefined;
  for (const s of entity.claims?.P793 ?? []) {
    const dv = s.mainsnak.datavalue;
    if (
      s.rank === 'deprecated' ||
      dv?.type !== 'wikibase-entityid' ||
      (dv.value as { id: string }).id !== INDEPENDENCE
    ) {
      continue;
    }
    const when = s.qualifiers?.P585?.[0]?.datavalue;
    if (when?.type !== 'time') {
      continue;
    }
    const v = when.value as { time: string; precision: number };
    if (!best || timeKey(v.time) > timeKey(best.time)) {
      best = v;
    }
  }
  return best ? formatWikidataTime(best.time, best.precision) : undefined;
}

/**
 * Maps neighbour item ids to bundled slugs: unknown items and the
 * country itself are dropped; the result is sorted and unique.
 */
export function mapNeighbours(
  qids: readonly string[],
  slugByQid: ReadonlyMap<string, string>,
  self: string,
): string[] {
  const slugs = new Set<string>();
  for (const q of qids) {
    const slug = slugByQid.get(q);
    if (slug !== undefined && slug !== self) {
      slugs.add(slug);
    }
  }
  return [...slugs].sort();
}

/**
 * Chooses one continent: "Africa" for African UN members; otherwise
 * Natural Earth's continent when Wikidata lists it; otherwise the first
 * Wikidata label alphabetically; otherwise Natural Earth's.
 */
export function chooseContinent(
  labels: readonly string[],
  neContinent: string | undefined,
  africanUnMember: boolean,
): string {
  if (africanUnMember) {
    return 'Africa';
  }
  if (neContinent && labels.includes(neContinent)) {
    return neContinent;
  }
  const sorted = [...labels].sort();
  return sorted[0] ?? neContinent ?? 'Unknown';
}
