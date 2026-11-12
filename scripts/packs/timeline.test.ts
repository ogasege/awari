// @vitest-environment node
/**
 * Tests for the timeline pipeline helpers (07-timeline 2.1):
 * Property 3 (sentences carry label and date), Property 4 (two
 * different day dates give nothing) and Property 5 (events are sorted
 * and fully dated). _Req 1.2, 1.3_
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { TimelinePack } from '../../src/lib/packs/types.ts';
import {
  KINDS,
  buildEvents,
  dayDate,
  formatDate,
  isIsoDay,
  sentence,
  validateTimeline,
  type EventKind,
  type TimelineItem,
} from './timeline.ts';
import type { Entity, Statement } from './wikidata.ts';

const time = (iso: string, precision = 11): Statement => ({
  rank: 'normal',
  mainsnak: {
    datavalue: {
      type: 'time',
      value: {
        time: `+${iso.slice(0, 4)}-${precision >= 10 ? iso.slice(5, 7) : '00'}-${precision >= 11 ? iso.slice(8, 10) : '00'}T00:00:00Z`,
        precision,
      },
    },
  },
});

const entity = (id: string, claims: Entity['claims'], label = `Label ${id}`): Entity => ({
  id,
  labels: { en: { value: label } },
  claims,
});

const kinds = Object.keys(KINDS) as EventKind[];

/** A real CE date between years 1 and 2100. */
const isoDay = fc
  .date({ min: new Date('0100-01-01T00:00:00Z'), max: new Date('2100-12-31T00:00:00Z'), noInvalidDate: true })
  .map((d) => d.toISOString().slice(0, 10).padStart(10, '0'))
  .filter(isIsoDay);

describe('dates', () => {
  it('formats a full date in words', () => {
    expect(formatDate('1867-11-07')).toBe('7 November 1867');
    expect(formatDate('0789-03-01')).toBe('1 March 789');
    expect(() => formatDate('1867-11')).toThrow();
  });

  it('accepts only real CE days', () => {
    expect(isIsoDay('2024-02-29')).toBe(true);
    expect(isIsoDay('2023-02-29')).toBe(false);
    expect(isIsoDay('1900-02-29')).toBe(false);
    expect(isIsoDay('2000-02-29')).toBe(true);
    expect(isIsoDay('0000-01-01')).toBe(false);
    expect(isIsoDay('1999-13-01')).toBe(false);
    expect(isIsoDay('1999-00-10')).toBe(false);
  });

  it('writes the template sentence for each kind', () => {
    expect(sentence('born', 'Marie Curie', '1867-11-07')).toBe(
      'Marie Curie was born on 7 November 1867.',
    );
    expect(sentence('independence', 'Mali', '1960-09-22')).toBe(
      'Mali became an independent country on 22 September 1960.',
    );
  });
});

describe('dayDate', () => {
  it('reads the one day-precision date', () => {
    const e = entity('Q1', { P569: [time('1867-11-07')] });
    expect(dayDate(e, 'P569')).toBe('1867-11-07');
  });

  it('ignores coarser dates beside a day date, and returns nothing for only coarse ones', () => {
    expect(
      dayDate(entity('Q1', { P569: [time('1452-04-15'), time('1452-01-01', 9)] }), 'P569'),
    ).toBe('1452-04-15');
    expect(dayDate(entity('Q2', { P571: [time('1963-01-01', 9)] }), 'P571')).toBeUndefined();
    expect(dayDate(entity('Q3', {}), 'P569')).toBeUndefined();
  });

  it('ignores deprecated statements and dates before the common era', () => {
    const deprecated: Statement = { ...time('1700-01-01'), rank: 'deprecated' };
    expect(dayDate(entity('Q1', { P569: [deprecated, time('1701-02-03')] }), 'P569')).toBe(
      '1701-02-03',
    );
    const bce: Statement = {
      rank: 'normal',
      mainsnak: {
        datavalue: { type: 'time', value: { time: '-0196-10-27T00:00:00Z', precision: 11 } },
      },
    };
    expect(dayDate(entity('Q2', { P571: [bce] }), 'P571')).toBeUndefined();
  });

  it('Property 4: two different day dates give nothing; the same date twice is fine. _Req 1.2_', () => {
    fc.assert(
      fc.property(isoDay, isoDay, (a, b) => {
        const e = entity('Q9', { P569: [time(a), time(b)] });
        expect(dayDate(e, 'P569')).toBe(a === b ? a : undefined);
      }),
    );
  });
});

describe('Property 3: sentences carry the label and the formatted date. _Req 1.3_', () => {
  it('holds for every kind, label and date', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...kinds),
        fc.stringMatching(/^[A-Z][A-Za-z ]{0,30}[a-z]$/),
        isoDay,
        (kind, label, iso) => {
          const text = sentence(kind, label, iso);
          expect(text).toContain(label);
          expect(text).toContain(formatDate(iso));
          expect(text.endsWith('.')).toBe(true);
        },
      ),
    );
  });
});

describe('buildEvents', () => {
  const items: TimelineItem[] = [
    { qid: 'Q1', subject: 'people', kind: 'born' },
    { qid: 'Q2', subject: 'science', kind: 'launched', label: 'Spirit rover' },
    { qid: 'Q3', subject: 'history', kind: 'founded' },
    { qid: 'Q4', subject: 'history', kind: 'founded' },
    { qid: 'Q5', subject: 'people', kind: 'born' },
    { qid: 'Q1', subject: 'people', kind: 'born' },
    { qid: 'Q6', subject: 'people', kind: 'born' },
  ];
  const entities = new Map<string, Entity>([
    ['Q1', entity('Q1', { P569: [time('1867-11-07')] }, 'Marie Curie')],
    ['Q2', entity('Q2', { P619: [time('2003-06-10')] }, 'Spirit')],
    ['Q3', entity('Q3', { P571: [time('1945-10-24')] }, 'United Nations')],
    // Two different dates: dropped.
    ['Q4', entity('Q4', { P571: [time('1945-10-24'), time('1946-01-10')] })],
    // No English label: dropped.
    ['Q5', { id: 'Q5', claims: { P569: [time('1900-01-01')] } }],
  ]);

  it('builds sorted events and reports what it dropped', () => {
    const { events, dropped } = buildEvents(items, entities, '2026-11-12');
    expect(events.map((e) => e.id)).toEqual(['Q1', 'Q3', 'Q2']);
    expect(events[0]?.text).toBe('Marie Curie was born on 7 November 1867.');
    expect(events[2]?.label).toBe('Spirit rover');
    expect(events[1]?.source).toMatchObject({
      licence: 'CC0',
      url: 'https://www.wikidata.org/wiki/Q3',
      retrieved: '2026-11-12',
    });
    expect(dropped.map((d) => [d.qid, d.reason])).toEqual([
      ['Q4', 'no single day-precision P571 date'],
      ['Q5', 'no English label'],
      ['Q1', 'listed twice'],
      ['Q6', 'not found on Wikidata'],
    ]);
  });

  it('adds links from the callback', () => {
    const { events } = buildEvents(items, entities, '2026-11-12', (i) =>
      i.qid === 'Q3' ? 'countries/mali' : undefined,
    );
    expect(events.find((e) => e.id === 'Q3')?.link).toBe('countries/mali');
    expect(events.find((e) => e.id === 'Q1')).not.toHaveProperty('link');
  });

  it('Property 5: output is sorted by date and every date is a full ISO day. _Req 1.2_', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(isoDay, fc.constantFrom(...kinds)), { minLength: 0, maxLength: 25 }),
        (rows) => {
          const list: TimelineItem[] = [];
          const map = new Map<string, Entity>();
          rows.forEach(([iso, kind], i) => {
            const qid = `Q${i + 1}`;
            list.push({ qid, subject: 'history', kind });
            map.set(qid, entity(qid, { [KINDS[kind].pid]: [time(iso)] }));
          });
          const { events, dropped } = buildEvents(list, map, '2026-11-12');
          expect(dropped).toEqual([]);
          expect(events).toHaveLength(rows.length);
          for (const e of events) {
            expect(e.date).toMatch(/^\d{4}-\d\d-\d\d$/);
            expect(isIsoDay(e.date)).toBe(true);
          }
          const dates = events.map((e) => e.date);
          expect(dates).toEqual([...dates].sort());
        },
      ),
    );
  });
});

describe('validateTimeline', () => {
  const base = buildEvents(
    [{ qid: 'Q1', subject: 'people', kind: 'born' }],
    new Map([['Q1', entity('Q1', { P569: [time('1867-11-07')] }, 'Marie Curie')]]),
    '2026-11-12',
  ).events;

  it('reports thin subjects and too few month-days', () => {
    const problems = validateTimeline({ events: base, source: base[0]!.source });
    expect(problems.some((p) => p.includes('countries has 0 events'))).toBe(true);
    expect(problems.some((p) => p.includes('1 distinct month-days'))).toBe(true);
  });

  it('reports broken events', () => {
    const [good] = base;
    const bad = {
      events: [
        { ...good!, date: '1867-11' },
        { ...good!, id: 'Q2', text: 'Nothing here.', source: { ...good!.source, licence: 'CC BY 4.0' as const } },
        { ...good!, id: 'Q3', link: 'countries/nowhere' },
      ],
      source: good!.source,
    } satisfies TimelinePack;
    const problems = validateTimeline(bad, () => false);
    expect(problems.some((p) => p.includes('not a full CE date'))).toBe(true);
    expect(problems.some((p) => p.includes('Q2: text does not carry'))).toBe(true);
    expect(problems.some((p) => p.includes('Q2: source must be'))).toBe(true);
    expect(problems.some((p) => p.includes('Q3: link countries/nowhere'))).toBe(true);
  });
});
