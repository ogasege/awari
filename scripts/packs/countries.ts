/**
 * The Countries pack: which countries are bundled, their Simple English
 * Wikipedia articles and their Wikidata facts.
 */
import type { Geometry } from 'geojson';
import type {
  Article,
  CountryFacts,
  FactsPack,
} from '../../src/lib/packs/types.ts';
import { assertUniqueIds, buildArticle } from './articles.ts';
import { fetchJson } from './http.ts';
import { isoDate, wikidataSource } from './sources.ts';
import {
  areaKm2,
  chooseContinent,
  currentStatements,
  getEntities,
  independenceDate,
  isSovereignState,
  itemIds,
  labelOf,
  liveStatements,
  mapNeighbours,
  pickPopulation,
  populationFigures,
  stringValue,
  type Entity,
} from './wikidata.ts';

/** ISO 3166-1 alpha-3 codes of the 54 African UN member states. */
export const AFRICAN_UN_MEMBERS: ReadonlySet<string> = new Set([
  'DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CPV', 'CMR', 'CAF', 'TCD',
  'COM', 'COD', 'COG', 'CIV', 'DJI', 'EGY', 'GNQ', 'ERI', 'SWZ', 'ETH',
  'GAB', 'GMB', 'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR', 'LBY', 'MDG',
  'MWI', 'MLI', 'MRT', 'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA',
  'STP', 'SEN', 'SYC', 'SLE', 'SOM', 'ZAF', 'SSD', 'SDN', 'TZA', 'TGO',
  'TUN', 'UGA', 'ZMB', 'ZWE',
]);

/**
 * Sovereign states Natural Earth draws under another Wikidata item:
 * sovereign QID -> the item used for the article and facts.
 */
export const SOVEREIGN_ALIASES: ReadonlyMap<string, string> = new Map([
  ['Q29999', 'Q55'], // Kingdom of the Netherlands -> Netherlands
  ['Q756617', 'Q35'], // Kingdom of Denmark -> Denmark
]);

/** Natural Earth items that stand for a sovereign state: NE QID -> state. */
export const NATURAL_EARTH_ALIASES: ReadonlyMap<string, string> = new Map([
  ['Q23792', 'Q219060'], // Palestinian territories -> State of Palestine
]);

const NE_BASE =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';

/** Natural Earth feature properties the pipeline reads. */
export interface NeProperties {
  ISO_A3: string;
  ADM0_A3: string;
  NAME: string;
  NAME_EN?: string;
  WIKIDATAID?: string;
  CONTINENT?: string;
}

/** A Natural Earth admin-0 FeatureCollection. */
export interface NeCollection {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    properties: NeProperties;
    geometry: Geometry | null;
  }[];
}

/** Downloads a Natural Earth admin-0 countries layer ("110m" or "50m"). */
export async function loadNaturalEarth(
  scale: '110m' | '50m',
): Promise<{ data: NeCollection; fetched: string }> {
  const url = `${NE_BASE}ne_${scale}_admin_0_countries.geojson`;
  const res = await fetchJson<NeCollection>(url, {
    kind: 'naturalearth',
    key: `ne_${scale}_admin_0_countries`,
  });
  return { data: res.body, fetched: res.fetched };
}

/** Natural Earth's ISO alpha-3 code: ISO_A3, or ADM0_A3 when it is -99. */
export function neIso3(p: Pick<NeProperties, 'ISO_A3' | 'ADM0_A3'>): string {
  return p.ISO_A3 && p.ISO_A3 !== '-99' ? p.ISO_A3 : p.ADM0_A3;
}

/** A country selected for the pack. */
export interface CountryChoice {
  /** QID used for the article and facts. */
  qid: string;
  /** QID Natural Earth uses for the feature. */
  neQid: string;
  /** Simple English Wikipedia title (before stripping). */
  wikiTitle: string;
  iso3: string;
  neContinent?: string;
  entity: Entity;
}

/**
 * Picks every sovereign state drawn on the Natural Earth 1:50m map that
 * has a Simple English Wikipedia article.
 */
export async function selectCountries(): Promise<{
  countries: CountryChoice[];
  fetched: string;
}> {
  const { data } = await loadNaturalEarth('50m');
  const neQids = data.features
    .map((f) => f.properties.WIKIDATAID)
    .filter((q): q is string => !!q);
  const ids = [
    ...neQids,
    ...SOVEREIGN_ALIASES.keys(),
    ...SOVEREIGN_ALIASES.values(),
    ...NATURAL_EARTH_ALIASES.values(),
  ];
  const { entities, fetched } = await getEntities(ids);
  const aliasTargets = new Set(
    [...SOVEREIGN_ALIASES]
      .filter(([sov]) => {
        const e = entities.get(sov);
        return e !== undefined && isSovereignState(e);
      })
      .map(([, target]) => target),
  );
  const chosen = new Map<string, CountryChoice>();
  for (const feature of data.features) {
    const p = feature.properties;
    const neQid = p.WIKIDATAID;
    if (!neQid) {
      continue;
    }
    const qid = NATURAL_EARTH_ALIASES.get(neQid) ?? neQid;
    const entity = entities.get(qid);
    if (
      !entity ||
      chosen.has(qid) ||
      !(isSovereignState(entity) || aliasTargets.has(qid))
    ) {
      continue;
    }
    const wikiTitle = entity.sitelinks?.simplewiki?.title;
    if (!wikiTitle) {
      console.warn(`  no Simple English article for ${labelOf(entity, qid)}`);
      continue;
    }
    chosen.set(qid, {
      qid,
      neQid,
      wikiTitle,
      iso3: neIso3(p),
      neContinent: p.CONTINENT,
      entity,
    });
  }
  const countries = [...chosen.values()];
  const present = new Set(countries.map((c) => c.iso3));
  const missing = [...AFRICAN_UN_MEMBERS].filter((iso) => !present.has(iso));
  if (missing.length > 0) {
    throw new Error(`African UN members missing: ${missing.join(', ')}`);
  }
  return { countries, fetched };
}

/** Builds the article for every selected country. */
export async function buildCountryArticles(
  countries: readonly CountryChoice[],
): Promise<Map<string, Article>> {
  const byQid = new Map<string, Article>();
  for (const c of countries) {
    const article = await buildArticle('countries', c.wikiTitle);
    byQid.set(c.qid, { ...article, qid: c.qid });
  }
  assertUniqueIds([...byQid.values()]);
  return byQid;
}

/** Builds the facts pack from the selected countries and their articles. */
export async function buildFacts(
  countries: readonly CountryChoice[],
  articles: ReadonlyMap<string, Article>,
  fetched: string,
): Promise<FactsPack> {
  const referenced = new Set<string>();
  for (const c of countries) {
    for (const pid of ['P30', 'P36', 'P38', 'P37']) {
      for (const id of itemIds(
        pid === 'P30' ? liveStatements(c.entity, pid) : currentStatements(c.entity, pid),
      )) {
        referenced.add(id);
      }
    }
  }
  const { entities: labels } = await getEntities([...referenced], 'labels');
  const label = (id: string): string => labelOf(labels.get(id), id);
  const slugByQid = new Map<string, string>();
  for (const [qid, a] of articles) {
    slugByQid.set(qid, a.id);
  }
  const retrieved = isoDate(fetched);
  const facts: CountryFacts[] = countries.map((c) => {
    const article = articles.get(c.qid);
    if (!article) {
      throw new Error(`No article for ${c.qid}`);
    }
    const e = c.entity;
    const p298 = stringValue(e, 'P298');
    if (p298 && p298 !== c.iso3) {
      console.warn(`  ${article.title}: Natural Earth ${c.iso3}, Wikidata ${p298}`);
    }
    const population = pickPopulation(populationFigures(e));
    const popYear = population?.time
      ? Number(/^([+-]?\d+)/.exec(population.time)?.[1])
      : undefined;
    const capital = itemIds(currentStatements(e, 'P36')).map(label);
    const currency = itemIds(currentStatements(e, 'P38')).map(label);
    const area = areaKm2(e);
    const independence = independenceDate(e);
    const record: CountryFacts = {
      id: article.id,
      qid: c.qid,
      name: article.title,
      iso3: c.iso3,
      continent: chooseContinent(
        itemIds(liveStatements(e, 'P30')).map(label),
        c.neContinent,
        AFRICAN_UN_MEMBERS.has(c.iso3),
      ),
      ...(capital.length ? { capital: capital.join(', ') } : {}),
      ...(population ? { population: population.value } : {}),
      ...(popYear !== undefined && Number.isFinite(popYear)
        ? { populationYear: popYear }
        : {}),
      ...(area !== undefined ? { areaKm2: area } : {}),
      ...(currency.length ? { currency: currency.join(', ') } : {}),
      languages: itemIds(currentStatements(e, 'P37')).map(label),
      ...(independence ? { independence } : {}),
      neighbours: mapNeighbours(
        itemIds(liveStatements(e, 'P47')),
        slugByQid,
        article.id,
      ),
      source: wikidataSource(retrieved, c.qid, article.title),
    };
    return record;
  });
  facts.sort((a, b) => a.id.localeCompare(b.id));
  return { countries: facts, source: wikidataSource(retrieved) };
}
