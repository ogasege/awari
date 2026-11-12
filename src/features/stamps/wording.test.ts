// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { listFiles } from '../../../scripts/lib/files.ts';

describe('no Africa-only wording (16-world-stamp-book Req 4)', () => {
  it('has no "Africa’s 54", "African countries" or bare 54-country count in the app text', () => {
    const files = listFiles('src').filter((f) => /\.(tsx|ts|css)$/.test(f) && !/\.test\.|\.property\./.test(f));
    const offenders: string[] = [];
    for (const f of files) {
      const text = readFileSync(`src/${f}`, 'utf8');
      text.split('\n').forEach((line, i) => {
        if (/Africa(’|&rsquo;|')s\s*\{?\s*\d|African countries|of 54\b|AFRICA_TOTAL|54 (little )?stamp/i.test(line)) {
          offenders.push(`src/${f}:${i + 1}: ${line.trim()}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
