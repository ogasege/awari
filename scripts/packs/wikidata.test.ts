// @vitest-environment node
/** Tests for the Wikidata claim helpers behind the country facts. */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  areaKm2,
  chooseContinent,
  currentStatements,
  formatWikidataTime,
  inception,
  isSovereignState,
  itemIds,
  mapNeighbours,
  pickPopulation,
  populationFigures,
  timeKey,
  type Entity,
  type PopulationFigure,
  type Rank,
  type Statement,
} from './wikidata.ts';

const item = (id: string, rank: Rank = 'normal', ended = false): Statement => ({
  rank,
  mainsnak: { datavalue: { type: 'wikibase-entityid', value: { id } } },
  ...(ended
    ? {
        qualifiers: {
          P582: [{ datavalue: { type: 'time', value: { time: '+1990-01-01T00:00:00Z', precision: 11 } } }],
        },
      }
    : {}),
});

const NIGERIA: Entity = {
  id: 'Q1033',
  labels: { en: { value: 'Nigeria' } },
  claims: {
    P31: [item('Q3624078'), item('Q6256')],
    P36: [item('Q3787', 'preferred'), item('Q8673', 'normal', true)],
    P1082: [
      {
        rank: 'normal',
        mainsnak: { datavalue: { type: 'quantity', value: { amount: '+1000', unit: '1' } } },
        qualifiers: { P585: [{ datavalue: { type: 'time', value: { time: '+2020-00-00T00:00:00Z', precision: 9 } } }] },
      },
      {
        rank: 'normal',
        mainsnak: { datavalue: { type: 'quantity', value: { amount: '+2000', unit: '1' } } },
        qualifiers: { P585: [{ datavalue: { type: 'time', value: { time: '+2024-00-00T00:00:00Z', precision: 9 } } }] },
      },
    ],
    P2046: [
      {
        rank: 'normal',
        mainsnak: {
          datavalue: {
            type: 'quantity',
            value: { amount: '+100', unit: 'http://www.wikidata.org/entity/Q232291' },
          },
        },
      },
    ],
    P571: [
      {
        rank: 'normal',
        mainsnak: { datavalue: { type: 'time', value: { time: '+1963-10-01T00:00:00Z', precision: 11 } } },
      },
    ],
  },
};

describe('claim helpers', () => {
  it('reads current statements, population, area and inception', () => {
    expect(itemIds(currentStatements(NIGERIA, 'P36'))).toEqual(['Q3787']);
    expect(isSovereignState(NIGERIA)).toBe(true);
    expect(pickPopulation(populationFigures(NIGERIA))?.value).toBe(2000);
    expect(areaKm2(NIGERIA)).toBe(259);
    expect(inception(NIGERIA)).toBe('1963-10-01');
  });

  it('formats times at their precision', () => {
    expect(formatWikidataTime('+1960-10-01T00:00:00Z', 11)).toBe('1960-10-01');
    expect(formatWikidataTime('+1960-10-00T00:00:00Z', 10)).toBe('1960-10');
    expect(formatWikidataTime('+2024-00-00T00:00:00Z', 11)).toBe('2024');
    expect(formatWikidataTime('-3150-00-00T00:00:00Z', 9)).toBe('-3150');
    expect(timeKey('+2024-00-00T00:00:00Z')).toBeGreaterThan(
      timeKey('+2023-12-31T00:00:00Z'),
    );
  });

  it('chooses continents', () => {
    expect(chooseContinent(['Asia', 'Africa'], 'Africa', false)).toBe('Africa');
    expect(chooseContinent(['Europe', 'Asia'], 'Europe', false)).toBe('Europe');
    expect(chooseContinent(['Asia'], 'Seven seas (open ocean)', true)).toBe('Africa');
    expect(chooseContinent([], 'Oceania', false)).toBe('Oceania');
  });

  const figure: fc.Arbitrary<PopulationFigure> = fc.record(
    {
      value: fc.integer({ min: 1, max: 2_000_000_000 }),
      rank: fc.constantFrom<Rank>('preferred', 'normal', 'deprecated'),
      time: fc
        .integer({ min: 1800, max: 2030 })
        .map((y) => `+${y}-00-00T00:00:00Z`),
    },
    { requiredKeys: ['value', 'rank'] },
  );

  it('Property 4: population pick is the latest of the best rank, whatever the order (Req 3.3)', () => {
    fc.assert(
      fc.property(fc.array(figure, { maxLength: 12 }), fc.nat(), (figures, seed) => {
        const picked = pickPopulation(figures);
        const live = figures.filter((f) => f.rank !== 'deprecated');
        if (live.length === 0) {
          expect(picked).toBeUndefined();
          return;
        }
        expect(picked).toBeDefined();
        const bestRank = live.some((f) => f.rank === 'preferred') ? 'preferred' : 'normal';
        expect(picked?.rank).toBe(bestRank);
        const sameRank = live.filter((f) => f.rank === bestRank);
        const latest = Math.max(...sameRank.map((f) => timeKey(f.time ?? '')));
        expect(timeKey(picked?.time ?? '')).toBe(latest);
        const shuffled = [...figures].sort(
          (a, b) => ((a.value * 31 + seed) % 7) - ((b.value * 31 + seed) % 7),
        );
        const again = pickPopulation(shuffled);
        expect(again?.value).toBe(picked?.value);
        expect(timeKey(again?.time ?? '')).toBe(timeKey(picked?.time ?? ''));
      }),
    );
  });

  it('Property 5: neighbours are sorted, unique, known and never the country itself (Req 3.5)', () => {
    const qid = fc.integer({ min: 1, max: 40 }).map((n) => `Q${n}`);
    fc.assert(
      fc.property(
        fc.array(qid, { maxLength: 20 }),
        fc.array(fc.tuple(qid, fc.stringMatching(/^[a-z]{1,4}$/)), { maxLength: 30 }),
        fc.stringMatching(/^[a-z]{1,4}$/),
        (qids, pairs, self) => {
          const slugByQid = new Map(pairs);
          const known = new Set(slugByQid.values());
          const out = mapNeighbours(qids, slugByQid, self);
          expect(out).toEqual([...new Set(out)].sort());
          for (const slug of out) {
            expect(known.has(slug)).toBe(true);
            expect(slug).not.toBe(self);
          }
          for (const q of qids) {
            const slug = slugByQid.get(q);
            if (slug !== undefined && slug !== self) {
              expect(out).toContain(slug);
            }
          }
        },
      ),
    );
  });
});
