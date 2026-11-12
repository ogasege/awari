// @vitest-environment node
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  clock,
  findSecrets,
  parseShots,
  shotListProblems,
  type Shot,
} from './submission.ts';

// Fake secrets are assembled so this file does not itself contain one.
const fakeAwsKey = `${'AK'}${'IA'}${'ABCDEFGHIJKLMNOP'}`;
const fakePrivate = `-----BEGIN ${'PRIV'}ATE KEY-----`;
const fakeGithub = `${'ghp'}_${'a'.repeat(36)}`;

describe('secret scan (12-submission-pack 2.4, 2.6)', () => {
  it('finds each kind of secret and reports where, not what', () => {
    const found = findSecrets([
      { path: 'a.ts', text: `const k = "${fakeAwsKey}";` },
      { path: 'b.pem', text: `x\n${fakePrivate}\ny` },
      { path: 'c.md', text: `token ${fakeGithub}` },
      { path: 'd.env', text: `${'aws_secret_access'}_key = ${'abcdEFGH1234'.repeat(3)}` },
    ]);
    expect(found.map((f) => [f.path, f.line, f.kind])).toEqual([
      ['a.ts', 1, 'AWS access key id'],
      ['b.pem', 2, 'private key block'],
      ['c.md', 1, 'GitHub token'],
      ['d.env', 1, 'AWS secret access key'],
    ]);
    expect(JSON.stringify(found)).not.toContain(fakeAwsKey);
  });

  it('finds nothing in ordinary text, code and docs', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 300 }), (text) => {
        fc.pre(!/AKIA|ASIA|PRIVATE KEY|gh[pousr]_|xox[abprs]-|bearer|aws_secret/i.test(text));
        expect(findSecrets([{ path: 'x.txt', text }])).toEqual([]);
      }),
    );
    expect(
      findSecrets([
        {
          path: 'README.md',
          text: 'Use `export AWS_PROFILE=personal`; never commit keys. Authorization is checked by CloudFront.',
        },
      ]),
    ).toEqual([]);
  });
});

describe('video shot list (12-submission-pack 1.3)', () => {
  const good: Shot[] = [
    { from: 0, to: 100, text: 'demo' },
    { from: 100, to: 150, text: '[KIRO] at work' },
    { from: 150, to: 175, text: 'close' },
  ];

  it('reads clock times and table rows', () => {
    expect(clock('2:55')).toBe(175);
    expect(clock('0:05')).toBe(5);
    expect(clock('2:75')).toBeUndefined();
    expect(parseShots('| 0:00 – 0:10 | Open | text |\n| 0:10 - 0:20 | Next | [KIRO] |\nnot a row')).toEqual([
      { from: 0, to: 10, text: ' Open | text ' },
      { from: 10, to: 20, text: ' Next | [KIRO] ' },
    ]);
  });

  it('accepts a list that adds up to 2:55 with 40 s of Kiro', () => {
    expect(shotListProblems(good)).toEqual([]);
  });

  it('rejects gaps, a wrong total, too little Kiro and an empty list', () => {
    expect(shotListProblems([{ ...good[0]!, to: 90 }, ...good.slice(1)]).join()).toContain('gap or overlap');
    expect(shotListProblems(good.slice(0, 2)).join()).toContain('expected 175s');
    expect(shotListProblems([{ from: 0, to: 175, text: 'no kiro' }]).join()).toContain('needs at least 40s');
    expect(shotListProblems([])[0]).toContain('no shot list');
  });

  it('property: contiguous shots that end at the total pass the timing checks', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 1, max: 60 }), { minLength: 1, maxLength: 12 }), (lengths) => {
        let at = 0;
        const shots = lengths.map((n): Shot => {
          const s = { from: at, to: at + n, text: '[KIRO]' };
          at += n;
          return s;
        });
        const problems = shotListProblems(shots, at);
        expect(problems.filter((p) => p.includes('gap') || p.includes('expected'))).toEqual([]);
      }),
    );
  });
});
