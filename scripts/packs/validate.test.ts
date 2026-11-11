// @vitest-environment node
/**
 * Validates the committed `public/packs/` output against the contract
 * and the content-packs acceptance criteria (Requirement 10).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Article, DictionaryShard } from '../../src/lib/packs/types.ts';
import { lemmaCandidates, shardFor } from '../../src/lib/dictionary/lemmatize.ts';
import { AFRICAN_UN_MEMBERS } from './countries.ts';
import { loadPacks, validatePacks } from './validate.ts';

const DIR = join('public', 'packs');
const built = existsSync(join(DIR, 'manifest.json'));

describe.skipIf(!built)('committed packs (Req 10.1, 10.2)', () => {
  it('pass every validation check', () => {
    expect(validatePacks(DIR)).toEqual([]);
  });

  it('include all 54 African UN members with articles', () => {
    const packs = loadPacks(DIR);
    const african = packs.facts.countries.filter((c) => AFRICAN_UN_MEMBERS.has(c.iso3));
    expect(african).toHaveLength(54);
    for (const c of african) {
      expect(existsSync(join(DIR, 'countries', `${c.id}.json`))).toBe(true);
    }
  });

  it('render Nigeria with the Niger Delta, and "delta" resolves offline', () => {
    const nigeria = JSON.parse(
      readFileSync(join(DIR, 'countries', 'nigeria.json'), 'utf8'),
    ) as Article;
    const text = nigeria.sections.flatMap((s) => s.paragraphs).join('\n');
    expect(text).toContain('Niger Delta');
    const found = lemmaCandidates('Delta').find((c) => {
      const shard = JSON.parse(
        readFileSync(join(DIR, 'dictionary', `${shardFor(c)}.json`), 'utf8'),
      ) as DictionaryShard;
      return c in shard.entries;
    });
    expect(found).toBe('delta');
    expect(nigeria.photos[0]?.file).toBe('img/nigeria.jpg');
  });
});
