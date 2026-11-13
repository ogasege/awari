/** 23-media-library Properties 1 and 7: the allow-list, the comparison and the exit code. */
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { authorKey, parseLicence, sameAuthor, titleFromUrl } from './allow.ts';
import { checkRecord, exitCode, type CommonsAnswer, type ShownRecord } from './check.ts';
import { readRecords } from './licences.ts';

const shown: ShownRecord = { path: 'photos/x.jpg', title: 'File:X.jpg', author: 'Jane Doe', licence: 'CC BY-SA 4.0' };
const answer = (over: Partial<{ licence: string; author: string; restrictions: string; repo: string }> = {}): CommonsAnswer => ({
  imagerepository: over.repo ?? 'shared',
  imageinfo: [
    {
      width: 2000,
      height: 1500,
      sha1: 'abc',
      descriptionurl: 'https://commons.wikimedia.org/wiki/File:X.jpg',
      extmetadata: {
        LicenseShortName: { value: over.licence ?? 'CC BY-SA 4.0' },
        Artist: { value: over.author ?? '<a href="//commons.wikimedia.org/wiki/User:Jane">Jane Doe</a>' },
        Restrictions: { value: over.restrictions ?? '' },
      },
    },
  ],
});

describe('allow-list (Req 6, 7)', () => {
  it('allows public domain, CC0, CC BY and CC BY-SA of any version', () => {
    for (const l of ['Public domain', 'CC0', 'CC0 1.0 Universal', 'PD-old-70', 'CC BY 2.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0', 'CC BY 4.0']) {
      expect(parseLicence(l), l).toBeDefined();
    }
  });

  it('refuses NC, ND, GFDL-only, fair use and anything it cannot read', () => {
    for (const l of ['CC BY-NC 4.0', 'CC BY-ND 2.0', 'CC BY-NC-SA 3.0', 'GFDL', 'Fair use', 'Copyrighted free use', '', 'Attribution']) {
      expect(parseLicence(l), l).toBeUndefined();
    }
  });

  it('never allows a licence with NC or ND in it, whatever surrounds it (property)', () => {
    fc.assert(
      fc.property(fc.constantFrom('NC', 'ND', 'NC-SA', 'NC-ND'), fc.constantFrom('1.0', '2.0', '2.5', '3.0', '4.0'), (kind, v) => {
        expect(parseLicence(`CC BY-${kind} ${v}`)).toBeUndefined();
      }),
    );
  });
});

describe('check (Req 2, Property 7)', () => {
  it('passes a matching, allowed, unrestricted file', () => {
    expect(checkRecord(shown, answer()).ok).toBe(true);
  });

  it('fails a file that is missing on Commons or not in the shared repository', () => {
    expect(checkRecord(shown, { missing: true }).problems).toContain('missing-on-commons');
    expect(checkRecord(shown, undefined).problems).toContain('missing-on-commons');
    expect(checkRecord(shown, answer({ repo: 'elsewhere' })).problems).toContain('not-shared-repository');
  });

  it('fails an off-list licence, listed restrictions, and a differing licence or author', () => {
    expect(checkRecord(shown, answer({ licence: 'CC BY-NC 4.0' })).problems).toContain('licence-off-list');
    expect(checkRecord(shown, answer({ restrictions: 'personality' })).problems).toContain('restrictions');
    expect(checkRecord(shown, answer({ licence: 'CC BY 4.0' })).problems).toContain('licence-differs');
    expect(checkRecord(shown, answer({ author: 'Someone Else' })).problems).toContain('author-differs');
  });

  it('exits non-zero when any image has a problem, zero when none has', () => {
    const good = checkRecord(shown, answer());
    const bad = checkRecord(shown, answer({ licence: 'GFDL' }));
    expect(exitCode([good])).toBe(0);
    expect(exitCode([good, bad])).toBe(1);
  });

  it('accepts an author with a website added by Commons, and a public-domain file with no author', () => {
    expect(sameAuthor('Diego Delso', 'Diego Delso, delso.photo, License CC-BY-SA')).toBe(true);
    expect(authorKey('Dhirad , picture edited')).toBe(authorKey('Dhirad, picture edited'));
    const pd = { ...shown, licence: 'Public domain' };
    expect(checkRecord(pd, answer({ licence: 'Public domain', author: '' })).ok).toBe(true);
  });
});

describe('records (Req 4)', () => {
  it('reads a Commons file title from every credited row, never a guessed URL', () => {
    expect(titleFromUrl('https://commons.wikimedia.org/wiki/File:Lagos_skyline_with_marina.jpg')).toBe('File:Lagos skyline with marina.jpg');
    const rows = readRecords(readFileSync('CREDITS.md', 'utf8'));
    expect(rows.length).toBeGreaterThan(400);
    for (const r of rows) {
      expect(r.title, r.path).toMatch(/^File:.+\.(jpe?g|png|webp|tiff?|svg|gif)$/i);
    }
    // The ten design photos are among them.
    expect(rows.filter((r) => r.path.startsWith('photos/') && !r.path.startsWith('photos/covers/')).length).toBeGreaterThanOrEqual(10);
  });
});
