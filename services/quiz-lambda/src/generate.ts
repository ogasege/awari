/**
 * Asks the model for questions, keeps only those the shared validator
 * passes, and retries once when fewer than five survive.
 */
import type { Article, Question } from '../../../src/lib/packs/types.ts';
import { fold, validateQuestion } from '../../../src/lib/quiz/validate.ts';
import {
  buildConverseInput,
  extractCandidates,
  toQuestion,
  type Converse,
} from './model.ts';

/** Questions a quiz needs. */
export const QUIZ_SIZE = 5;

/** At most one first call and one retry (cost control). */
export const MAX_CALLS = 2;

/** What `generateQuiz` produced. */
export interface GenerateResult {
  questions: Question[];
  /** Candidates that failed validation or repeated an accepted prompt. */
  rejected: number;
  /** Model calls made (1 or 2). */
  calls: number;
}

/**
 * Generates up to five validated questions for `article`. Throws only
 * when the first model call fails; a failed retry keeps what the first
 * call produced (and throws if that was nothing).
 */
export async function generateQuiz(
  article: Article,
  converse: Converse,
  modelId: string,
): Promise<GenerateResult> {
  const questions: Question[] = [];
  const prompts = new Set<string>();
  let rejected = 0;
  let calls = 0;
  let serial = 0;

  while (calls < MAX_CALLS && questions.length < QUIZ_SIZE) {
    calls += 1;
    let candidates: unknown[];
    try {
      const have = questions.map((q) => q.prompt);
      candidates = extractCandidates(
        await converse(buildConverseInput(modelId, article, have)),
      );
    } catch (error) {
      if (calls === 1 || questions.length === 0) {
        throw error;
      }
      break;
    }
    for (const raw of candidates) {
      serial += 1;
      const q = toQuestion(raw, article, serial);
      if (q === null || !validateQuestion(q, article).ok) {
        rejected += 1;
      } else if (prompts.has(fold(q.prompt))) {
        rejected += 1;
      } else if (questions.length < QUIZ_SIZE) {
        prompts.add(fold(q.prompt));
        questions.push(q);
      }
    }
  }

  return { questions, rejected, calls };
}
