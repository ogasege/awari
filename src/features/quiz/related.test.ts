import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normaliseContinent, SUBJECTS } from '../../lib/packs/subjects.ts';
import type { FactsPack, PackIndex } from '../../lib/packs/types.ts';
import { relatedQuizzes } from './related.ts';

const read = <T,>(path: string): T => JSON.parse(readFileSync(`public/packs/${path}`, 'utf8')) as T;
const facts = read<FactsPack>('countries/facts.json').countries;

describe('the certificate offers related quizzes (28-every-screen-like-home, owner feedback)', () => {
  it('Property: after a country quiz both suggestions are on the same continent, neighbours first', () => {
    const items = read<PackIndex>('countries/index.json').items;
    for (const item of items) {
      const next = relatedQuizzes(items, item.id, facts);
      expect(next.length, item.id).toBeGreaterThan(0);
      for (const n of next) {
        expect(n.id).not.toBe(item.id);
        expect(normaliseContinent(n.continent ?? ''), `${item.id} -> ${n.id}`).toBe(normaliseContinent(item.continent ?? ''));
      }
    }
    const nigeria = relatedQuizzes(items, 'nigeria', facts).map((n) => n.id);
    const borders = new Set(facts.find((f) => f.id === 'nigeria')?.neighbours);
    expect(nigeria.every((id) => borders.has(id))).toBe(true);
  });

  it('Property: after any other quiz both suggestions come from the same pack', () => {
    for (const pack of SUBJECTS.map((s) => s.id).filter((p) => p !== 'countries')) {
      const items = read<PackIndex>(`${pack}/index.json`).items;
      for (const item of items) {
        const next = relatedQuizzes(items, item.id);
        expect(next).toHaveLength(Math.min(2, items.length - 1));
        for (const n of next) {
          expect(items.some((i) => i.id === n.id)).toBe(true);
          expect(n.id).not.toBe(item.id);
        }
      }
    }
  });
});
