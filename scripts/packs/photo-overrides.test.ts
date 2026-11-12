import { describe, expect, it } from 'vitest';
import { BUNDLED_PACKS } from '../../src/lib/packs/subjects.ts';
import { PHOTO_OVERRIDES } from './photo-overrides.ts';

const words = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

describe('photo overrides', () => {
  it('keys are "<pack>/<slug>" with a bundled pack', () => {
    for (const key of PHOTO_OVERRIDES.keys()) {
      const parts = key.split('/');
      expect(parts, key).toHaveLength(2);
      const [pack, slug] = parts as [string, string];
      expect((BUNDLED_PACKS as readonly string[]).includes(pack), `${key}: unknown pack`).toBe(true);
      expect(slug, key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('captions are two to five words', () => {
    for (const [key, override] of PHOTO_OVERRIDES) {
      const n = words(override.caption);
      expect(n, `${key}: "${override.caption}"`).toBeGreaterThanOrEqual(2);
      expect(n, `${key}: "${override.caption}"`).toBeLessThanOrEqual(5);
    }
  });

  it('alt texts are at most 140 characters', () => {
    for (const [key, override] of PHOTO_OVERRIDES) {
      expect(override.alt.length, key).toBeGreaterThan(0);
      expect(override.alt.length, key).toBeLessThanOrEqual(140);
    }
  });

  it('keeps the Central African Republic override', () => {
    const override = PHOTO_OVERRIDES.get('countries/central-african-republic');
    expect(override).toBeDefined();
    expect(override?.file).toBe('Bangui City Centre.jpg');
  });
});
