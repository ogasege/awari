/**
 * 23-media-library Properties 1-4, on the real library: every picture has a verified, allow-listed licence; the
 * library holds at least 3,000 pictures and four or more for each article (gaps listed); no picture is listed
 * twice; every caption traces back to Commons text.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseLicence } from '../../../scripts/media/allow.ts';
import { isTraceable } from '../../../scripts/media/caption.ts';
import type { MediaFile, MediaIndex, MediaItem } from './media.ts';

const DIR = join('public', 'media');
const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(f));
const items: MediaItem[] = files.flatMap((f) => (JSON.parse(readFileSync(join(DIR, f), 'utf8')) as MediaFile).items);
const licences = JSON.parse(readFileSync(join(DIR, 'licences.json'), 'utf8')) as { problems: number; results: Array<{ title: string; ok: boolean; commonsLicence: string }> };
const index = JSON.parse(readFileSync(join(DIR, 'index.json'), 'utf8')) as MediaIndex;

/** Articles that have fewer than four allowed pictures on Commons: listed in docs/kiro-log.md and the report. */
const KNOWN_GAPS = new Set(['science/radioactive-decay']);

describe('the media library', () => {
  it('Property 1: every picture has a verified, allow-listed licence in licences.json', () => {
    expect(licences.problems).toBe(0);
    const byTitle = new Map(licences.results.map((r) => [r.title, r]));
    for (const m of items) {
      const r = byTitle.get(m.title);
      expect(r, m.title).toBeDefined();
      expect(r?.ok, m.title).toBe(true);
      expect(parseLicence(m.licence), `${m.title}: ${m.licence}`).toBeDefined();
      expect(parseLicence(r?.commonsLicence), m.title).toBeDefined();
    }
  });

  it('Property 2: at least 3,000 pictures, and at least four for every article except the listed gaps', () => {
    expect(items.length).toBeGreaterThanOrEqual(3000);
    const perArticle = new Map<string, number>();
    for (const m of items) perArticle.set(m.article, (perArticle.get(m.article) ?? 0) + 1);
    const packs = readdirSync('public/packs', { withFileTypes: true }).filter((d) => d.isDirectory() && existsSync(join('public/packs', d.name, 'index.json')));
    const low: string[] = [];
    for (const p of packs) {
      const idx = JSON.parse(readFileSync(join('public/packs', p.name, 'index.json'), 'utf8')) as { items?: Array<{ id: string }> };
      for (const a of idx.items ?? []) {
        const key = `${p.name}/${a.id}`;
        if ((perArticle.get(key) ?? 0) < 4 && !KNOWN_GAPS.has(key)) low.push(`${key} (${perArticle.get(key) ?? 0})`);
      }
    }
    expect(low).toEqual([]);
  });

  it('Property 3: no picture is listed twice, and the index agrees with the records', () => {
    expect(new Set(items.map((m) => m.id)).size).toBe(items.length);
    expect(new Set(items.map((m) => m.title.toLowerCase())).size).toBe(items.length);
    expect(index.count).toBe(items.length);
    expect(new Set(index.items.map((r) => r[0])).size).toBe(items.length);
  });

  it('Property 4: every caption is a traceable shortening of its Commons description, file name or article title', () => {
    for (const m of items) {
      expect(isTraceable({ text: m.caption, source: m.captionFrom as 'description' | 'title' }, m.description, m.title), `${m.id}: ${m.caption}`).toBe(true);
      expect(m.caption.length).toBeLessThanOrEqual(100);
      expect(m.alt.length).toBeGreaterThan(1);
    }
  });

  it('has a thumbnail file for every picture, none for a picture that is not listed, and stays under 150 MB', () => {
    let total = 0;
    for (const m of items) {
      const path = join(DIR, m.thumb);
      expect(existsSync(path), m.thumb).toBe(true);
      total += statSync(path).size;
    }
    const onDisk = readdirSync(join(DIR, 'img')).filter((f) => f.endsWith('.webp'));
    expect(onDisk.length).toBe(items.length);
    expect(total).toBeLessThan(150 * 1024 * 1024);
  });
});
