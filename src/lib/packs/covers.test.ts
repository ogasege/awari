import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BUNDLED_PACKS } from './subjects.ts';
import { SUBJECT_COVERS, coverFor } from './covers.ts';

const credits = readFileSync('CREDITS.md', 'utf8');

describe('subject covers (21-review-2 Property 3)', () => {
  it('has exactly one cover per bundled subject', () => {
    for (const id of BUNDLED_PACKS) {
      expect(SUBJECT_COVERS.filter((c) => c.subject === id), id).toHaveLength(1);
      expect(coverFor(id)).toBeDefined();
    }
    expect(SUBJECT_COVERS).toHaveLength(BUNDLED_PACKS.length);
  });

  it('every cover file exists and is credited in CREDITS.md', () => {
    for (const c of SUBJECT_COVERS) {
      expect(existsSync(`public${c.file}`), c.file).toBe(true);
      expect(credits.includes(c.file.replace(/^\//, '')), c.file).toBe(true);
    }
  });
});
