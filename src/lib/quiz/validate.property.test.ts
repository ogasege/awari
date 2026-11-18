import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Article, ArticleSection, Question } from '../packs/types.ts';
import {
  articleFromText,
  articleText,
  fold,
  normalise,
  validateQuestion,
} from './validate.ts';

/** Filler words: lowercase letters only, so they never contain an option. */
const word = fc.stringMatching(/^[a-z]{2,8}$/);
const phrase = fc
  .array(word, { minLength: 1, maxLength: 8 })
  .map((ws) => ws.join(' '));

/**
 * Option texts that cannot occur in filler (they hold digits) and cannot
 * contain each other (the trailing `z` ends every number).
 */
const optionTexts = fc
  .uniqueArray(fc.nat({ max: 9999 }), { minLength: 4, maxLength: 4 })
  .map((ns) => ns.map((n) => `Item${n}z`));

interface Case {
  article: Article;
  question: Question;
}

/** A random article with a valid question about one of its sections. */
const validCase: fc.Arbitrary<Case> = fc
  .record({
    sections: fc.array(fc.array(phrase, { minLength: 1, maxLength: 3 }), {
      minLength: 1,
      maxLength: 4,
    }),
    sectionPick: fc.nat(),
    options: optionTexts,
    answer: fc.integer({ min: 0, max: 3 }),
    removedPick: fc.integer({ min: 0, max: 2 }),
    before: phrase,
    after: phrase,
    prompt: phrase,
    nudge: phrase,
    whereToLook: phrase,
  })
  .map((r) => {
    const sections: ArticleSection[] = r.sections.map((paragraphs, i) => ({
      heading: i === 0 ? '' : `Part ${i}`,
      paragraphs: [...paragraphs],
    }));
    const target = sections[r.sectionPick % sections.length];
    const answerText = r.options[r.answer] ?? '';
    const proof = `${r.before} ${answerText} ${r.after}.`;
    target?.paragraphs.push(proof);
    const wrong = [0, 1, 2, 3].filter((i) => i !== r.answer);
    const removed: [number, number] = [
      wrong[r.removedPick] ?? 0,
      wrong[(r.removedPick + 1) % 3] ?? 0,
    ];
    const article: Article = {
      id: 'a',
      pack: 'countries',
      title: 'A',
      summary: '',
      sections,
      photos: [],
      notes: [],
      source: {
        name: 'Test',
        url: 'https://example.org',
        licence: 'CC0',
        licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        retrieved: '2026-11-11',
      },
    };
    const question: Question = {
      id: 'a-1',
      articleId: 'a',
      pack: 'countries',
      prompt: `${r.prompt}?`,
      options: r.options,
      answer: r.answer,
      hints: { nudge: r.nudge, whereToLook: r.whereToLook, removed },
      proof,
      proofSection: target?.heading ?? '',
    };
    return { article, question };
  });

const ok = (c: Case): boolean => validateQuestion(c.question, c.article).ok;

describe('validateQuestion properties', () => {
  it('generator sanity: every generated case is valid', () => {
    fc.assert(
      fc.property(validCase, (c) => {
        expect(validateQuestion(c.question, c.article)).toEqual({ ok: true });
      }),
    );
  });

  it('Property 1: shuffling options with answer and removed remapped stays valid (Req 1.1-1.10)', () => {
    const order = fc.shuffledSubarray([0, 1, 2, 3], {
      minLength: 4,
      maxLength: 4,
    });
    fc.assert(
      fc.property(validCase, order, ({ article, question: q }, perm) => {
        const moved = (oldIndex: number): number => perm.indexOf(oldIndex);
        const shuffled: Question = {
          ...q,
          options: perm.map((old) => q.options[old] ?? ''),
          answer: moved(q.answer),
          hints: {
            ...q.hints,
            removed: [moved(q.hints.removed[0] ?? 0), moved(q.hints.removed[1] ?? 0)],
          },
        };
        expect(ok({ article, question: shuffled })).toBe(true);
      }),
    );
  });

  it('Property 2: a proof that is not in the article always fails (Req 1.4)', () => {
    fc.assert(
      fc.property(validCase, fc.string(), ({ article, question }, proof) => {
        fc.pre(
          normalise(proof) === '' ||
            !articleText(article).includes(normalise(proof)),
        );
        expect(ok({ article, question: { ...question, proof } })).toBe(false);
      }),
    );
  });

  it('Property 3: an answer that is missing from the proof always fails (Req 1.5)', () => {
    fc.assert(
      fc.property(validCase, fc.string(), ({ article, question }, text) => {
        fc.pre(!fold(question.proof).includes(fold(text)));
        const options = [...question.options];
        options[question.answer] = text;
        expect(ok({ article, question: { ...question, options } })).toBe(
          false,
        );
      }),
    );
  });

  it('Property 4: a wrong option taken from the proof always fails (Req 1.6)', () => {
    fc.assert(
      fc.property(
        validCase,
        fc.nat(),
        fc.nat(),
        fc.integer({ min: 0, max: 2 }),
        ({ article, question }, start, length, pick) => {
          const from = start % question.proof.length;
          const piece = question.proof.slice(
            from,
            from + 1 + (length % (question.proof.length - from)),
          );
          const wrong = [0, 1, 2, 3].filter((i) => i !== question.answer);
          const options = [...question.options];
          options[wrong[pick] ?? 0] = piece;
          expect(ok({ article, question: { ...question, options } })).toBe(
            false,
          );
        },
      ),
    );
  });

  it('Property 5: removing the answer or one option twice always fails (Req 1.8)', () => {
    const index = fc.integer({ min: 0, max: 3 });
    fc.assert(
      fc.property(validCase, index, index, ({ article, question }, a, b) => {
        fc.pre(a === b || a === question.answer || b === question.answer);
        const hints = { ...question.hints, removed: [a, b] as [number, number] };
        expect(ok({ article, question: { ...question, hints } })).toBe(false);
      }),
    );
  });

  it('Property 6: putting the answer in the prompt or a hint always fails (Req 1.9, 1.10)', () => {
    const field = fc.constantFrom('prompt', 'nudge', 'whereToLook');
    fc.assert(
      fc.property(
        validCase,
        field,
        fc.nat(),
        ({ article, question: q }, which, at) => {
          const answer = q.options[q.answer] ?? '';
          const insert = (s: string): string => {
            const k = at % (s.length + 1);
            return s.slice(0, k) + answer + s.slice(k);
          };
          const leaky: Question =
            which === 'prompt'
              ? { ...q, prompt: insert(q.prompt) }
              : { ...q, hints: { ...q.hints, [which]: insert(q.hints[which]) } };
          expect(ok({ article, question: leaky })).toBe(false);
        },
      ),
    );
  });

  it('Property 7: re-spacing the proof does not change the verdict (Req 1.4)', () => {
    const gap = fc.constantFrom(' ', '  ', '\t', '\n', ' \n\t ');
    fc.assert(
      fc.property(
        validCase,
        fc.array(gap, { minLength: 64, maxLength: 64 }),
        ({ article, question }, gaps) => {
          const words = normalise(question.proof).split(' ');
          const proof =
            (gaps[0] ?? '') +
            words.map((w, i) => w + (gaps[i + 1] ?? ' ')).join('');
          expect(ok({ article, question: { ...question, proof } })).toBe(
            true,
          );
        },
      ),
    );
  });

  it('Property 8: ok exactly when there are no reasons, and never throws (Req 1.11)', () => {
    const anyQuestion: fc.Arbitrary<Question> = fc.record({
      id: fc.string(),
      articleId: fc.string(),
      pack: fc.constantFrom('countries' as const, 'physics' as const),
      prompt: fc.string(),
      options: fc.array(fc.string(), { maxLength: 6 }),
      answer: fc.oneof(fc.integer({ min: -3, max: 8 }), fc.double()),
      hints: fc.record({
        nudge: fc.string(),
        whereToLook: fc.string(),
        removed: fc.tuple(
          fc.oneof(fc.integer({ min: -2, max: 6 }), fc.double()),
          fc.oneof(fc.integer({ min: -2, max: 6 }), fc.double()),
        ),
      }),
      proof: fc.string(),
      proofSection: fc.string(),
    });
    fc.assert(
      fc.property(validCase, anyQuestion, ({ article }, question) => {
        const verdict = validateQuestion(question, article);
        if (!verdict.ok) {
          expect(verdict.reasons.length).toBeGreaterThan(0);
        }
      }),
    );
  });
});

describe('articleFromText properties', () => {
  it('Property 9: rendering sections as == Heading == text and parsing round-trips (Req 2.2, 2.3)', () => {
    const section = fc.record({
      heading: phrase,
      paragraphs: fc.array(phrase, { minLength: 1, maxLength: 3 }),
    });
    fc.assert(
      fc.property(
        fc.array(phrase, { maxLength: 3 }),
        fc.array(section, { maxLength: 4 }),
        fc.constantFrom(2, 3, 4),
        (lead, sections, level) => {
          const marks = '='.repeat(level);
          const text = [
            lead.join('\n\n'),
            ...sections.map(
              (s) =>
                `${marks} ${s.heading} ${marks}\n${s.paragraphs.join('\n\n')}`,
            ),
          ].join('\n\n');
          const expected = [
            ...(lead.length > 0 ? [{ heading: '', paragraphs: lead }] : []),
            ...sections,
          ];
          expect(articleFromText('T', text).sections).toEqual(expected);
        },
      ),
    );
  });
});
