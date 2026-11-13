import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BUNDLED_CREDITS, creditLine } from './bundledCredits.ts';

const rows = readFileSync('CREDITS.md', 'utf8').split('\n').filter((l) => l.startsWith('|'));

describe('creditLine (21-review-2 Property 7)', () => {
  it('names exactly the bundled photos passed in, no more and no fewer', () => {
    const line = creditLine(['/photos/earth.jpg', '/photos/covers/arts.jpg']);
    expect(line).toContain('NASA (Apollo 17 crew)');
    expect(line).toContain('Leonardo da Vinci');
    for (const c of BUNDLED_CREDITS.filter((x) => !['/photos/earth.jpg', '/photos/covers/arts.jpg'].includes(x.src))) {
      expect(line, c.src).not.toContain(c.author);
    }
  });

  it('names a photo once however many times it is shown, and skips pack photos', () => {
    const line = creditLine(['/photos/kili.jpg', '/photos/kili.jpg', '/packs/img/nigeria-1.jpg']);
    expect(line.match(/Kilimanjaro/g)).toHaveLength(1);
    expect(line).not.toContain('nigeria');
    expect(creditLine(['/packs/img/x.jpg'])).toBe('');
  });

  it('matches CREDITS.md: every entry has a row with the same file and author', () => {
    for (const c of BUNDLED_CREDITS) {
      const row = rows.find((r) => r.includes(c.src.replace(/^\//, '')));
      expect(row, c.src).toBeDefined();
      expect(row, c.src).toContain(c.author);
    }
  });
});
