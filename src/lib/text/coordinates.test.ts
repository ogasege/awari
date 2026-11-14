/** 24-review-4 Req 11, Property 4: no coordinate string survives in a snippet or an article lead. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { snippetOf } from '../../features/search/search.ts';
import { withoutCoordinates } from './coordinates.ts';

/** A run of coordinate tokens: degrees with a hemisphere, or a decimal pair. */
const COORD_RUN = /\d+\s*[°º]\s*[\d′'″"\s.]*[NSEW]\b[\s/,;]*\d+\s*[°º]|\d+\.\d{2,}\s*[;,/]\s*-?\d+\.\d{2,}|[°º]\s*[NSEW]\s*\/\s*\d/;

describe('coordinate strings', () => {
  it('the owner’s Nile Delta example is cut whole, in a snippet and in a lead', () => {
    const delta = 'The Nile Delta is the delta formed in Northern Egypt. 30°54′N 31°07′E / 30.900°N 31.117°E / 30.900; 31.117 It is one of the largest river deltas.';
    expect(withoutCoordinates(delta)).toBe('The Nile Delta is the delta formed in Northern Egypt. It is one of the largest river deltas.');
    const left = 'Nile Delta 117°E / 30.900; 31.117 is a river delta.';
    expect(withoutCoordinates(left)).toBe('Nile Delta is a river delta.');
    expect(snippetOf('117°E / 30.900; 31.117 The Nile Delta is a river delta in Egypt.', 'nile')).toBe('The Nile Delta is a river delta in Egypt.');
    expect(snippetOf(delta, 'delta')).not.toMatch(/°|30\.900/);
  });

  it('cuts every common shape', () => {
    expect(withoutCoordinates("Rhodes (approximate coordinates 36°27'04\"N, 28°13'40\"E) by Chares")).toBe('Rhodes by Chares');
    expect(withoutCoordinates('Found at 34°39′N 135°30′E near the coast.')).toBe('Found near the coast.');
    expect(withoutCoordinates('Position: 30.900; 31.117.')).toBe('Position:.');
    expect(withoutCoordinates('Cairo 30.0444°N 31.2357°E is large')).toBe('Cairo is large');
  });

  it('takes the word and the comma that introduced a position with it', () => {
    expect(withoutCoordinates('The main island, at 13°15′N 61°12′W, is 18 km long.')).toBe('The main island is 18 km long.');
  });

  it('leaves prose with one degree figure alone', () => {
    const prose = 'The Andes run south to about 30°S, then go down to 4,500 m. Pi is 3.14159 and 22/7.';
    expect(withoutCoordinates(prose)).toBe(prose);
    expect(withoutCoordinates('It lies between 42° and 47° N and 13° and 20° E.')).toBe('It lies between 42° and 47° N and 13° and 20° E.');
  });

  it('never leaves a coordinate run, and never changes text that has none (property)', () => {
    const word = fc.stringMatching(/^[A-Za-z]{2,9}$/);
    const plain = fc.array(word, { minLength: 1, maxLength: 12 }).map((w) => w.join(' '));
    const coord = fc
      .tuple(fc.integer({ min: 0, max: 89 }), fc.integer({ min: 0, max: 59 }), fc.integer({ min: 0, max: 179 }), fc.integer({ min: 0, max: 59 }))
      .map(([a, b, c, d]) => `${a}°${b}′N ${c}°${d}′E / ${a}.${String(b).padStart(2, '0')}; ${c}.${String(d).padStart(2, '0')}`);
    fc.assert(
      fc.property(plain, coord, plain, (before, c, after) => {
        const out = withoutCoordinates(`${before} ${c} ${after}`);
        expect(out).toBe(`${before} ${after}`);
        expect(withoutCoordinates(before)).toBe(before);
      }),
      { numRuns: 300 },
    );
  });

  it('no summary or lead paragraph in the packs holds a coordinate run', () => {
    const bad: string[] = [];
    for (const d of readdirSync('public/packs', { withFileTypes: true }).filter((x) => x.isDirectory())) {
      let items: Array<{ id: string; summary?: string }> = [];
      try {
        items = (JSON.parse(readFileSync(join('public/packs', d.name, 'index.json'), 'utf8')) as { items: typeof items }).items ?? [];
      } catch {
        continue;
      }
      for (const i of items) {
        let lead = '';
        try {
          lead = (JSON.parse(readFileSync(join('public/packs', d.name, `${i.id}.json`), 'utf8')) as { sections: Array<{ paragraphs: string[] }> }).sections[0]?.paragraphs[0] ?? '';
        } catch {
          /* not an article file */
        }
        for (const text of [i.summary ?? '', lead]) if (COORD_RUN.test(text)) bad.push(`${d.name}/${i.id}: ${text.slice(0, 80)}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
