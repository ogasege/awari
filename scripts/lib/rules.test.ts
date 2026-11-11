import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  BANNED_NAME,
  findBannedMentions,
  gitignoreHidesKiro,
  uncreditedFiles,
} from './rules.ts';

describe('hackathon rule checks', () => {
  it('flags the banned name in any case outside the allowlist', () => {
    const files = [
      { path: 'src/a.ts', text: `like ${BANNED_NAME.toUpperCase()}` },
      { path: 'docs/brief.md', text: BANNED_NAME },
      { path: 'src/b.ts', text: 'Awari' },
    ];
    expect(findBannedMentions(files)).toEqual(['src/a.ts']);
  });

  it('allows one plain mention in README and the write-up, not two', () => {
    const once = `Inspired by ${BANNED_NAME}.`;
    expect(
      findBannedMentions([
        { path: 'README.md', text: once },
        { path: 'docs/devpost.md', text: `${once} ${once}` },
      ]),
    ).toEqual(['docs/devpost.md']);
  });

  it('detects .gitignore lines that would hide .kiro', () => {
    expect(gitignoreHidesKiro('node_modules\n.kiro/\n')).toBe(true);
    expect(gitignoreHidesKiro('/.kiro')).toBe(true);
    expect(gitignoreHidesKiro('# .kiro\nnode_modules')).toBe(false);
    expect(gitignoreHidesKiro('.kirofoo')).toBe(false);
  });

  it('accepts files listed by path or by a backticked glob', () => {
    const credits = 'packs/a.json\n`packs/img/*.webp`';
    const files = ['packs/a.json', 'packs/img/x.webp', 'packs/b.json'];
    expect(uncreditedFiles(files, credits)).toEqual(['packs/b.json']);
  });

  it('Property 1: every listed file is credited (rules)', () => {
    const name = fc.stringMatching(/^[a-z0-9-]{1,12}$/);
    fc.assert(
      fc.property(fc.array(name, { maxLength: 20 }), (names) => {
        const files = names.map((n) => `packs/${n}.json`);
        expect(uncreditedFiles(files, files.join('\n'))).toEqual([]);
      }),
    );
  });

  it('Property 2: a file missing from the credits is always reported', () => {
    const name = fc.stringMatching(/^[a-z0-9-]{1,12}$/);
    fc.assert(
      fc.property(name, fc.array(name), (missing, others) => {
        fc.pre(!others.includes(missing));
        const path = `packs/${missing}.webp`;
        const credits = others.map((o) => `packs/${o}.webp`).join('\n');
        expect(uncreditedFiles([path], credits)).toEqual([path]);
      }),
    );
  });
});
