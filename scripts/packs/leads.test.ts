import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOURS } from '../../src/features/tours/tours.ts';
import type { Article, FactsPack } from '../../src/lib/packs/types.ts';
import { LEAD_OVERRIDES } from './lead-overrides.ts';
import { PHOTO_OVERRIDES } from './photo-overrides.ts';

const article = (key: string): Article => JSON.parse(readFileSync(`public/packs/${key}.json`, 'utf8')) as Article;
const facts = JSON.parse(readFileSync('public/packs/countries/facts.json', 'utf8')) as FactsPack;
const credits = readFileSync('CREDITS.md', 'utf8');

const top30 = [...facts.countries]
  .filter((c) => typeof c.population === 'number')
  .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
  .slice(0, 30)
  .map((c) => `countries/${c.id}`);
const judges = ['countries/nigeria', 'wildlife/lion', ...TOURS.flatMap((t) => t.stops.map((s) => s.article))];

describe('lead photographs (21-review-2 Property 10)', () => {
  it('every article on the judges path and every top-30 country has a credited lead photo', () => {
    for (const key of new Set([...judges, ...top30])) {
      const photo = article(key).photos[0];
      expect(photo, key).toBeDefined();
      expect(photo?.alt.length, key).toBeGreaterThan(10);
      expect(credits.includes(`packs/${photo?.file}`), `${key} credited`).toBe(true);
    }
  });

  it('every reviewed override is the committed lead photo and is in the override list the build reads', () => {
    expect(LEAD_OVERRIDES.length).toBeGreaterThanOrEqual(24);
    for (const [key, override] of LEAD_OVERRIDES) {
      const photo = article(key).photos[0];
      expect(photo?.credit.name, key).toBe(`Wikimedia Commons: ${override.file}`);
      expect(photo?.caption, key).toBe(override.caption);
      expect(PHOTO_OVERRIDES.get(key)?.file, key).toBe(override.file);
    }
  });

  it('every top-30 country now leads with a reviewed landmark or an earlier reviewed pick', () => {
    const reviewed = new Set(LEAD_OVERRIDES.map(([key]) => key));
    // Countries left on their automatic pick after the contact-sheet review: a recognisable city or landscape.
    const keptAutomatic = new Set(['countries/japan', 'countries/turkey', 'countries/germany', 'countries/thailand', 'countries/democratic-republic-of-the-congo']);
    for (const key of top30) {
      expect(reviewed.has(key) || keptAutomatic.has(key), `${key} was neither replaced nor kept on review`).toBe(true);
    }
  });
});
