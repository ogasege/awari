import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { fold, validateQuestion } from '../../../src/lib/quiz/validate.ts';
import { generateQuiz, QUIZ_SIZE } from '../src/generate.ts';
import {
  buildConverseInput,
  extractCandidates,
  MAX_OUTPUT_TOKENS,
  toQuestion,
} from '../src/model.ts';
import { ARTICLE, BAD, fakeConverse, GOOD, toolOutput } from './fixtures.ts';

const MODEL = 'anthropic.claude-haiku-5-5';

describe('model helpers', () => {
  it('every GOOD fixture passes and every BAD one fails', () => {
    GOOD.forEach((raw, i) => {
      const q = toQuestion(raw, ARTICLE, i);
      expect(q && validateQuestion(q, ARTICLE)).toEqual({ ok: true });
    });
    BAD.forEach((raw, i) => {
      const q = toQuestion(raw, ARTICLE, i);
      expect(q === null || !validateQuestion(q, ARTICLE).ok).toBe(true);
    });
  });

  it('computes proofSection and fills ids from the article', () => {
    const q = toQuestion(GOOD[4], ARTICLE, 9);
    expect(q).toMatchObject({
      id: 'ghana-ai-9',
      articleId: 'ghana',
      pack: 'countries',
      proofSection: 'Economy',
    });
  });

  it('builds a capped, tool-based Converse request', () => {
    const input = buildConverseInput(MODEL, ARTICLE, ['Old question?']);
    expect(input.modelId).toBe(MODEL);
    expect(input.inferenceConfig?.maxTokens).toBe(MAX_OUTPUT_TOKENS);
    expect(input.toolConfig?.toolChoice).toEqual({ auto: {} });
    expect(input.toolConfig?.tools?.[0]?.toolSpec?.name).toBe(
      'submit_questions',
    );
    const text = input.messages?.[0]?.content?.[0]?.text ?? '';
    expect(text).toContain('== Geography ==');
    expect(text).toContain('- Old question?');
    expect(text.startsWith('<article title="Ghana">')).toBe(true);
  });

  it('extracts candidates only from the submit_questions tool', () => {
    expect(extractCandidates(toolOutput([1, 2]))).toEqual([1, 2]);
    expect(extractCandidates({ $metadata: {} } as never)).toEqual([]);
    const other = toolOutput([1]);
    const block = other.output?.message?.content?.[1];
    if (block?.toolUse) {
      block.toolUse.name = 'something_else';
    }
    expect(extractCandidates(other)).toEqual([]);
  });
});

describe('generateQuiz', () => {
  it('stops after one call when five questions pass', async () => {
    const converse = fakeConverse([[...GOOD.slice(0, 5), BAD[0]]]);
    const result = await generateQuiz(ARTICLE, converse, MODEL);
    expect(result.questions).toHaveLength(5);
    expect(result.rejected).toBe(1);
    expect(converse.calls).toBe(1);
  });

  it('retries once, skipping repeated prompts', async () => {
    const converse = fakeConverse([
      [GOOD[0], GOOD[1], BAD[1], BAD[2]],
      [GOOD[0], GOOD[2], GOOD[3], GOOD[4], GOOD[5]],
    ]);
    const result = await generateQuiz(ARTICLE, converse, MODEL);
    expect(converse.calls).toBe(2);
    expect(result.questions.map((q) => q.prompt)).toEqual(
      [0, 1, 2, 3, 4].map((i) => GOOD[i]?.prompt),
    );
    expect(result.rejected).toBe(3);
  });

  it('returns fewer than five after the retry rather than calling again', async () => {
    const converse = fakeConverse([[GOOD[0]], [BAD[0]], [GOOD[1]]]);
    const result = await generateQuiz(ARTICLE, converse, MODEL);
    expect(result.questions).toHaveLength(1);
    expect(converse.calls).toBe(2);
  });

  it('throws when the first call fails', async () => {
    const converse = async () => {
      throw new Error('throttled');
    };
    await expect(generateQuiz(ARTICLE, converse, MODEL)).rejects.toThrow(
      'throttled',
    );
  });

  it('keeps first-call questions when only the retry fails', async () => {
    let calls = 0;
    const converse = async () => {
      calls += 1;
      if (calls === 2) {
        throw new Error('timeout');
      }
      return toolOutput([GOOD[0], GOOD[1]]);
    };
    const result = await generateQuiz(ARTICLE, converse, MODEL);
    expect(result.questions).toHaveLength(2);
    expect(result.calls).toBe(2);
  });

  const pool = [...GOOD, ...BAD];
  const batch = fc.array(fc.constantFrom(...pool), { maxLength: 10 });
  const distinctGood = (items: unknown[]): Set<string> =>
    new Set(
      items
        .filter((x) => GOOD.includes(x as (typeof GOOD)[number]))
        .map((x) => fold((x as (typeof GOOD)[number]).prompt)),
    );

  it('Property 10: returned questions are valid, unique, capped and accounted for (Req 4.2-4.4)', async () => {
    await fc.assert(
      fc.asyncProperty(batch, batch, async (first, second) => {
        const converse = fakeConverse([first, second]);
        const result = await generateQuiz(ARTICLE, converse, MODEL);
        const seen = converse.calls === 1 ? first : [...first, ...second];

        for (const q of result.questions) {
          expect(validateQuestion(q, ARTICLE)).toEqual({ ok: true });
        }
        const prompts = result.questions.map((q) => fold(q.prompt));
        expect(new Set(prompts).size).toBe(prompts.length);
        expect(result.questions.length).toBe(
          Math.min(QUIZ_SIZE, distinctGood(seen).size),
        );
        expect(result.questions.length + result.rejected).toBeLessThanOrEqual(
          seen.length,
        );
      }),
    );
  });

  it('Property 11: one call when the first yields five, exactly two otherwise (Req 4.3, 5.1)', async () => {
    await fc.assert(
      fc.asyncProperty(batch, batch, async (first, second) => {
        const converse = fakeConverse([first, second, GOOD]);
        await generateQuiz(ARTICLE, converse, MODEL);
        const expected = distinctGood(first).size >= QUIZ_SIZE ? 1 : 2;
        expect(converse.calls).toBe(expected);
      }),
    );
  });
});
