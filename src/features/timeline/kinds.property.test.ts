/** 22-review-3 Property 5 (Req 14 to 16): kinds, legend, ruler step and the share of births. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { TimelineEvent } from '../../lib/packs/types.ts';
import { EVENT_KIND_GROUPS, balancedCentury, centuriesWith, inCentury, isBirth, kindOf, rulerMarks, rulerStep } from './filter.ts';

const events = (JSON.parse(readFileSync('public/packs/timeline.json', 'utf8')) as { events: TimelineEvent[] }).events;

describe('event kinds (22-review-3 Req 14)', () => {
  it('gives every event in the pack exactly one kind that the legend names', () => {
    const legend = new Set(EVENT_KIND_GROUPS.map((k) => k.id));
    for (const e of events) {
      expect(legend.has(kindOf(e))).toBe(true);
    }
  });

  it('uses every colour group somewhere in the pack', () => {
    const used = new Set(events.map(kindOf));
    expect([...used].sort()).toEqual(EVENT_KIND_GROUPS.map((k) => k.id).sort());
  });
});

describe('births are under 40% of every default century view (22-review-3 Req 16)', () => {
  it('holds for each century of the real pack, with and without a subject filter', () => {
    const sets = [events, events.filter((e) => e.subject === 'arts'), events.filter((e) => e.subject === 'science')];
    for (const set of sets) {
      for (const c of centuriesWith(set)) {
        const shown = balancedCentury(inCentury(set, c));
        const others = shown.filter((e) => !isBirth(e)).length;
        if (others > 0) {
          expect(shown.filter(isBirth).length / shown.length).toBeLessThan(0.4);
        }
      }
    }
  });
});

describe('ruler step (22-review-3 Req 15)', () => {
  it('keeps the marks to about ten, whatever the span', () => {
    for (const [min, max] of [[1900, 2000], [0, 2026], [-2500, 2026], [900, 2026]] as const) {
      expect(rulerMarks(min, max, rulerStep(min, max)).length).toBeLessThanOrEqual(11);
    }
  });
});
