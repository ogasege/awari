// @vitest-environment node
/**
 * 18-world-timeline 2: the expected-date cross-check (Property 2),
 * continent derivation that never invents (Property 4) and the pack
 * thresholds (Property 3's rules, on synthetic packs).
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { EVENT_CONTINENTS, SUBJECTS } from '../../src/lib/packs/subjects.ts';
import type { TimelineEvent, TimelinePack } from '../../src/lib/packs/types.ts';
import {
  MIN_ANTARCTICA,
  MIN_EVENTS,
  MIN_PER_CONTINENT,
  MIN_PER_SUBJECT,
  buildEvents,
  continentFrom,
  referencedPlaces,
  validateTimeline,
  type TimelineItem,
} from './timeline.ts';
import type { Entity, Statement } from './wikidata.ts';

const time = (iso: string): Statement => ({
  rank: 'normal',
  mainsnak: { datavalue: { type: 'time', value: { time: `+${iso}T00:00:00Z`, precision: 11 } } },
});
const item = (id: string): Statement => ({
  rank: 'normal',
  mainsnak: { datavalue: { type: 'wikibase-entityid', value: { id } } },
});
const entity = (id: string, claims: Entity['claims']): Entity => ({ id, labels: { en: { value: `Label ${id}` } }, claims });

describe('expected dates (18-world-timeline Property 2)', () => {
  const entities = new Map([['Q1', entity('Q1', { P571: [time('1960-10-01')] })]]);
  const base: TimelineItem = { qid: 'Q1', subject: 'countries', kind: 'independence' };

  it('keeps an event when Wikidata agrees with the curator, drops it and reports when not. _Req 5_', () => {
    const agree = buildEvents([{ ...base, expect: '1960-10-01' }], entities, '2026-11-12');
    expect(agree.events).toHaveLength(1);
    const differ = buildEvents([{ ...base, expect: '1963-10-01' }], entities, '2026-11-12');
    expect(differ.events).toEqual([]);
    expect(differ.dropped).toEqual([{ qid: 'Q1', reason: 'Wikidata says 1960-10-01, expected 1963-10-01' }]);
    expect(buildEvents([base], entities, '2026-11-12').events).toHaveLength(1);
  });

  it('a mismatch always drops the event, for any two different days', () => {
    const day = fc.date({ min: new Date('1000-01-01'), max: new Date('2100-01-01'), noInvalidDate: true }).map((d) => d.toISOString().slice(0, 10));
    fc.assert(
      fc.property(day, day, (wikidata, expected) => {
        const e = new Map([['Q9', entity('Q9', { P571: [time(wikidata)] })]]);
        const out = buildEvents([{ qid: 'Q9', subject: 'countries', kind: 'founded', expect: expected }], e, '2026-11-12');
        expect(out.events.length).toBe(wikidata === expected ? 1 : 0);
      }),
    );
  });
});

describe('continent derivation (18-world-timeline Property 4)', () => {
  const byCountry = new Map([
    ['Q1033', 'Africa'],
    ['Q30', 'North America'],
  ]);
  const places = new Map([
    ['Q60', entity('Q60', { P17: [item('Q30')] })],
    ['Q99', entity('Q99', {})],
  ]);

  it('uses a named country, then the country of a named place, and otherwise nothing. _Req 3_', () => {
    expect(continentFrom(entity('Q1', { P27: [item('Q1033')] }), byCountry, places)).toBe('Africa');
    expect(continentFrom(entity('Q2', { P19: [item('Q60')] }), byCountry, places)).toBe('North America');
    expect(continentFrom(entity('Q3', { P159: [item('Q99')] }), byCountry, places)).toBeUndefined();
    expect(continentFrom(entity('Q4', {}), byCountry, places)).toBeUndefined();
    expect(continentFrom(entity('Q1033', {}), byCountry, places)).toBe('Africa'); // the country itself
  });

  it('never invents a continent, and lists the places it needs', () => {
    const e = entity('Q5', { P19: [item('Q60')], P17: [item('Q30')], P31: [item('Q5')] });
    expect(referencedPlaces(e).sort()).toEqual(['Q30', 'Q60']);
    fc.assert(
      fc.property(fc.array(fc.stringMatching(/^Q[1-9][0-9]{0,4}$/), { maxLength: 6 }), (ids) => {
        const e2 = entity('Q7', { P27: ids.map(item), P19: ids.map(item) });
        const found = continentFrom(e2, new Map(), new Map());
        expect(found).toBeUndefined();
      }),
    );
  });

  it('lets a curator name a continent Wikidata does not (Antarctica)', () => {
    const entities = new Map([['Q70', entity('Q70', { P571: [time('1959-12-01')] })]]);
    const { events } = buildEvents([{ qid: 'Q70', subject: 'earth', kind: 'founded', continent: 'Antarctica' }], entities, '2026-11-12');
    expect(events[0]?.continent).toBe('Antarctica');
  });
});

describe('thresholds (18-world-timeline Req 1-3, 7)', () => {
  const source = { name: 'Wikidata', url: 'https://www.wikidata.org/wiki/Q1', licence: 'CC0' as const, licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', retrieved: '2026-11-12' };
  const make = (n: number, over: Partial<TimelineEvent>): TimelineEvent[] =>
    Array.from({ length: n }, (_, i) => ({
      id: `Q${over.subject}${over.continent}${i}`.replace(/\W/g, ''),
      date: `1900-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      label: 'X',
      text: `X was born on ${(i % 28) + 1} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][i % 12]} 1900.`,
      subject: 'people',
      source: { ...source, url: `https://www.wikidata.org/wiki/Q${over.subject}${over.continent}${i}`.replace(/[^\w:/.]/g, '') },
      ...over,
    }));

  it('reports a thin pack, thin subjects and thin continents', () => {
    const pack: TimelinePack = { events: make(5, { subject: 'people', continent: 'Africa' }), source };
    const problems = validateTimeline(pack).join('\n');
    expect(problems).toContain(`5 events, needs ${MIN_EVENTS}`);
    expect(problems).toContain(`wildlife has 0 events, needs ${MIN_PER_SUBJECT}`);
    expect(problems).toContain(`Asia has 0 events, needs ${MIN_PER_CONTINENT}`);
    expect(problems).toContain(`Antarctica has 0 events, needs ${MIN_ANTARCTICA}`);
  });

  it('accepts a pack that meets every threshold', () => {
    const events: TimelineEvent[] = [];
    SUBJECTS.forEach((s, si) => {
      EVENT_CONTINENTS.forEach((c, ci) => {
        const n = c === 'Antarctica' ? 4 : 5;
        events.push(...make(n, { subject: s.id, continent: c }).map((e, i) => ({ ...e, id: `Q${si}x${ci}x${i}`, source: { ...source, url: `https://www.wikidata.org/wiki/Q${si}x${ci}x${i}` }, date: `${1900 + si}-${String(((ci * 5 + i) % 12) + 1).padStart(2, '0')}-${String(((si * 3 + i) % 28) + 1).padStart(2, '0')}` })));
      });
    });
    const fixed = events.map((e) => ({ ...e, text: e.text.replace(/\d+ \w+ 1900/, `${Number(e.date.slice(8))} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(e.date.slice(5, 7)) - 1]} ${e.date.slice(0, 4)}`) }))
      .sort((a, b) => a.date.localeCompare(b.date));
    const problems = validateTimeline({ events: fixed, source });
    expect(problems.filter((p) => /needs/.test(p) && !/events, needs/.test(p) && !/month-days/.test(p))).toEqual([]);
  });
});
