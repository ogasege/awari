/**
 * Checks every committed quiz against its article (05-quizzes
 * Properties 1 and 2). Runs on the real files in public/packs.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Article, QuizSet } from '../packs/types.ts';
import { fold, validateQuestion } from './validate.ts';

const ROOT = 'public/packs';
const read = <T>(p: string): T => JSON.parse(readFileSync(`${ROOT}/${p}`, 'utf8')) as T;

const quizFiles = (['countries', 'physics'] as const).flatMap((pack) =>
  existsSync(`${ROOT}/quizzes/${pack}`)
    ? readdirSync(`${ROOT}/quizzes/${pack}`).map((f) => ({ pack, file: f }))
    : [],
);

describe('bundled quizzes', () => {
  it('exist for Nigeria and electricity', () => {
    expect(existsSync(`${ROOT}/quizzes/countries/nigeria.json`)).toBe(true);
    expect(existsSync(`${ROOT}/quizzes/physics/electricity.json`)).toBe(true);
  });

  it('Property 1: every bundled question passes the validator (Req 1.2)', () => {
    let checked = 0;
    for (const { pack, file } of quizFiles) {
      const quiz = read<QuizSet>(`quizzes/${pack}/${file}`);
      const article = read<Article>(`${pack}/${quiz.articleId}.json`);
      for (const q of quiz.questions) {
        const verdict = validateQuestion(q, article);
        expect(verdict, `${q.id}: ${JSON.stringify(verdict)}`).toEqual({ ok: true });
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(500);
  });

  it('Property 2: quizzes have distinct prompts and answers; Nigeria has five (Req 1.1, 1.5)', () => {
    for (const { pack, file } of quizFiles) {
      const quiz = read<QuizSet>(`quizzes/${pack}/${file}`);
      expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
      expect(quiz.questions.length).toBeLessThanOrEqual(5);
      // The same country can answer two different shapes (its capital and its area); never twice in one shape.
      const answers = quiz.questions.map((q) => `${q.kind ?? 'cloze'}|${q.prompt.startsWith('True') ? q.prompt : ''}|${fold(q.options[q.answer] ?? '')}`);
      expect(new Set(answers).size).toBe(answers.length);
      expect(new Set(quiz.questions.map((q) => q.prompt)).size).toBe(quiz.questions.length);
      expect(quiz.source.licence).toBe('CC BY-SA 4.0');
    }
    expect(read<QuizSet>('quizzes/countries/nigeria.json').questions).toHaveLength(5);
  });
});
