// @vitest-environment node
import fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  KIRO_PROMPTS,
  featureProblems,
  fillNumbers,
  isStandardMit,
  numberProblems,
  untaggedCounts,
  videoNameProblems,
  writeupProblems,
} from './writeup.ts';

const all = KIRO_PROMPTS.map((p) => p.id);
const good = [
  '## Kiro surfaces',
  '## Custom agents',
  '## Agent hooks',
  '## Spec-driven development',
  '## Steering',
  '## MCP',
  '## Property-based testing',
  '## Kiro powers',
].join('\nText.\n');

describe('write-up checks (rules-alignment item 9)', () => {
  it('accepts a write-up with every used prompt, in order, and no overclaims', () => {
    expect(writeupProblems('x.md', good, all)).toEqual([]);
  });

  it('reports a missing prompt, a prompt out of order, and overclaiming phrases', () => {
    const noMcp = good.replace('## MCP\n', '');
    expect(writeupProblems('x.md', noMcp, all)).toContain('x.md: no heading for the "mcp" prompt');
    expect(writeupProblems('x.md', noMcp, all.filter((p) => p !== 'mcp'))).toEqual([]);
    const swapped = good.replace('## Steering', '## Temp').replace('## Agent hooks', '## Steering').replace('## Temp', '## Agent hooks');
    expect(writeupProblems('x.md', swapped, all).join()).toContain('out of the rules');
    expect(writeupProblems('x.md', `${good}\nBuilt end to end with Kiro.`, all).join()).toContain('end to end');
    expect(writeupProblems('x.md', `${good}\nEverything was built spec-first with Kiro.`, all).join()).toContain('everything was built');
  });

  it('recognises the standard MIT text, and the repo LICENSE is one', () => {
    expect(isStandardMit(readFileSync('LICENSE', 'utf8'))).toBe(true);
    expect(isStandardMit('MIT License\n\nCopyright (c) 2026 X\n\nDo what you like.')).toBe(false);
    expect(isStandardMit('Apache License 2.0')).toBe(false);
  });

  it('finds brand and track names in a video script, not in its rule lines', () => {
    expect(videoNameProblems('| 0:00 | Open | Upload to YouTube |')).toHaveLength(1);
    expect(videoNameProblems('No third-party logos, no copyrighted music.')).toEqual([]);
    expect(videoNameProblems('| 0:10 | Home | Awari opens |')).toEqual([]);
  });

  it('property: filled numbers always match the stats they came from', () => {
    fc.assert(
      fc.property(fc.dictionary(fc.stringMatching(/^[a-z]{1,8}$/), fc.nat({ max: 99_999 }), { minKeys: 1, maxKeys: 6 }), (stats) => {
        const doc = Object.keys(stats)
          .map((k) => `We have <!--n:${k}-->0<!--/n--> ${k}.`)
          .join('\n');
        const filled = fillNumbers(doc, stats);
        const plain = Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, v >= 10_000 ? v.toLocaleString('en-GB') : String(v)]));
        const { problems, checked } = numberProblems('d.md', filled, Object.fromEntries(Object.entries(plain).map(([k, v]) => [k, v.replace(/,/g, '')])));
        expect(problems).toEqual([]);
        expect(checked).toBe(Object.keys(stats).length);
      }),
    );
    expect(numberProblems('d.md', 'It has <!--n:specs-->13<!--/n--> specs.', { specs: 20 }).problems).toEqual([
      'd.md: says specs = 13, the repo says 20',
    ]);
  });

  it('flags counts typed by hand, but not tagged ones or code', () => {
    expect(untaggedCounts('d.md', 'There are 13 specs.')).toEqual(['d.md:1: untagged count "13 specs"']);
    expect(untaggedCounts('d.md', 'There are <!--n:specs-->20<!--/n--> specs.')).toEqual([]);
    expect(untaggedCounts('d.md', '```\n13 specs\n```')).toEqual([]);
  });

  it('requires a route and a test for every feature a document names', () => {
    const routes = new Set(['atlas']);
    const exists = (p: string): boolean => p.includes('atlas');
    expect(featureProblems('r.md', 'Spin the globe.', routes, exists)).toEqual([]);
    expect(featureProblems('r.md', 'Take a guided tour.', routes, exists).length).toBe(2);
  });
});
