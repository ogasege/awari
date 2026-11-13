import { describe, expect, it } from 'vitest';
import { CONTINENTS, SUBJECTS } from '../../lib/packs/subjects.ts';
import { ROOMS, WINGS } from './castle.ts';

describe('castle wings (17-castle-wings Property 1)', () => {
  it('has sixteen wings: six continents and ten subjects, with unique ids. _Req 1_', () => {
    expect(WINGS).toHaveLength(16);
    expect(new Set(WINGS.map((w) => w.id)).size).toBe(16);
    expect(WINGS.filter((w) => w.group === 'world').map((w) => w.continent)).toEqual([...CONTINENTS]);
    expect(WINGS.filter((w) => w.group === 'subject').map((w) => w.pack)).toEqual(
      SUBJECTS.filter((s) => s.id !== 'countries').map((s) => s.id),
    );
    expect(ROOMS).toBe(12);
  });

  it('gives every wing a source: a continent of countries, or a whole pack', () => {
    for (const w of WINGS) {
      if (w.group === 'world') {
        expect(w.pack).toBe('countries');
        expect(w.continent).toBeDefined();
      } else {
        expect(w.pack).not.toBe('countries');
        expect(w.continent).toBeUndefined();
      }
      expect(w.name.length).toBeGreaterThan(0);
      expect(w.blurb.length).toBeGreaterThan(0);
    }
  });

  it('keeps the saved ids of the first two wings, so earlier progress still counts', () => {
    expect(WINGS.find((w) => w.id === 'africa')?.continent).toBe('Africa');
    expect(WINGS.find((w) => w.id === 'electricity')?.pack).toBe('physics');
  });
});

describe('wing names and prints (22-review-3 Req 19)', () => {
  it('never doubles "The" in a wing name', async () => {
    const { WINGS } = await import('./castle.ts');
    for (const w of WINGS) {
      expect(w.name, w.id).not.toMatch(/The The/i);
      expect(w.name).toMatch(/^The .+ wing$/);
    }
  });

  it('gives every wing a print whose picture exists', async () => {
    const { WINGS, wingPrint } = await import('./castle.ts');
    const { existsSync } = await import('node:fs');
    for (const w of WINGS) {
      const p = wingPrint(w);
      expect(p, w.id).toBeDefined();
      expect(p?.alt.length).toBeGreaterThan(5);
      const file = (p?.src ?? '').replace(/^\/packs\//, 'packs/').replace(/^\//, '');
      expect(existsSync(`public/${file.startsWith('packs/') ? file : file}`), p?.src).toBe(true);
    }
  });
});
