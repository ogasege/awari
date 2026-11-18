/**
 * The rules every quiz question must pass before a student sees it,
 * shared by the pack pipeline, the app and the quiz Lambda so all three
 * agree on what a fair question is. Pure TypeScript: no Node or DOM APIs.
 *
 * A question is fair when it can be answered from the article alone:
 * its proof sentence is really in the article, names the right answer
 * and none of the wrong ones, and its hints never give the answer away.
 */
import type {
  Article,
  ArticleSection,
  PackId,
  Question,
} from '../packs/types.ts';

/** The verdict of `validateQuestion`. */
export type Verdict = { ok: true } | { ok: false; reasons: string[] };

/** Every pack id, for runtime checks of untrusted input. */
export const PACK_IDS: readonly PackId[] = ['countries', 'physics'];

/** Collapses every whitespace run to one space and trims the ends. */
export function normalise(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Normalises and lower-cases, for case-insensitive comparisons. */
export function fold(text: string): string {
  return normalise(text).toLowerCase();
}

/** True when `needle` appears in `haystack`, ignoring case and spacing. */
function mentions(haystack: string, needle: string): boolean {
  const n = fold(needle);
  return n !== '' && fold(haystack).includes(n);
}

/** The normalised text of one section's paragraphs. */
function sectionText(section: ArticleSection): string {
  return normalise(section.paragraphs.join(' '));
}

/**
 * The full reading text of an article: every paragraph of every
 * section, joined with single spaces and normalised. Headings, captions
 * and margin notes are not part of it.
 */
export function articleText(article: Article): string {
  return normalise(article.sections.map(sectionText).join(' '));
}

/**
 * Returns the heading of the first section that contains `sentence`
 * (after whitespace normalisation), `""` for the lead, or `null` when no
 * single section contains it.
 */
export function sectionOfSentence(
  article: Article,
  sentence: string,
): string | null {
  const wanted = normalise(sentence);
  if (wanted === '') {
    return null;
  }
  const found = article.sections.find((s) =>
    sectionText(s).includes(wanted),
  );
  return found ? found.heading : null;
}

function isIndex(value: unknown, length: number): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < length
  );
}

/**
 * Shapes whose proof is a fact line built from the pack data ("The capital of Chad is N'Djamena.") and not a sentence of
 * the article. The fact test in `scripts/quizzes/facts.test.ts` re-derives each answer from the packs (27 Req 5.4).
 */
export const FACT_LINE_SHAPES: ReadonlySet<string> = new Set(['capital-reverse', 'continent', 'largest', 'first', 'currency']);

/** Shapes whose proof lists every option's figure, so a proof naming wrong options is the point (27 Req 2.3). */
export const LISTS_ALL_SHAPES: ReadonlySet<string> = new Set(['first', 'largest']);

/** A true or false question: two options, one try, a proof that is the true fact (27 Req 1.8, 2.2). */
function validateTrueFalse(q: Question, article: Article): Verdict {
  const reasons: string[] = [];
  if (q.options.length !== 2 || q.options[0] !== 'True' || q.options[1] !== 'False') {
    reasons.push('true or false needs exactly the options True and False');
  }
  if (q.answer !== 0 && q.answer !== 1) reasons.push('answer must be 0 or 1');
  if (q.hints.removed.length !== 0) reasons.push('true or false has no removed options');
  if (normalise(q.prompt) === '' || normalise(q.proof) === '') reasons.push('prompt and proof must not be empty');
  if (normalise(q.hints.nudge) === '' || normalise(q.hints.whereToLook) === '') reasons.push('hints must not be empty');
  const proof = normalise(q.proof);
  if (q.proofSection !== '' && !articleText(article).includes(proof)) {
    reasons.push('proof is not an exact sentence from the article');
  }
  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

/**
 * Checks a question against the article it claims to come from and
 * returns every rule it breaks. Never throws for a structurally typed
 * question, whatever its values.
 */
export function validateQuestion(q: Question, article: Article): Verdict {
  if (q.kind === 'truefalse') return validateTrueFalse(q, article);
  const factLine = q.kind !== undefined && FACT_LINE_SHAPES.has(q.kind);
  const reasons: string[] = [];
  const options = q.options;

  if (options.length !== 4) {
    reasons.push(`expected 4 options, got ${options.length}`);
  }
  if (options.some((o) => normalise(o) === '')) {
    reasons.push('every option must be non-empty');
  }
  const folded = options.map(fold);
  if (new Set(folded).size !== folded.length) {
    reasons.push('options must be unique (ignoring case and spacing)');
  }

  const answerOk = isIndex(q.answer, options.length);
  if (!answerOk) {
    reasons.push(`answer index ${String(q.answer)} is out of range`);
  }
  const answerText = answerOk ? (options[q.answer] ?? '') : '';

  const proof = normalise(q.proof);
  if (proof === '') {
    reasons.push('proof is empty');
  } else if (!factLine && !articleText(article).includes(proof)) {
    reasons.push('proof is not an exact sentence from the article');
  } else if (!factLine) {
    const section = sectionOfSentence(article, proof);
    if (section === null) {
      reasons.push('proof does not sit inside a single section');
    } else if (section !== q.proofSection) {
      reasons.push(
        `proofSection is "${q.proofSection}" but the proof is in ` +
          `"${section}"`,
      );
    }
  }

  if (answerOk && normalise(answerText) !== '') {
    if (!mentions(q.proof, answerText)) {
      reasons.push('proof does not contain the correct answer');
    }
    if (mentions(q.prompt, answerText)) {
      reasons.push('prompt gives away the answer');
    }
    if (mentions(q.hints.nudge, answerText)) {
      reasons.push('nudge gives away the answer');
    }
    if (mentions(q.hints.whereToLook, answerText)) {
      reasons.push('whereToLook gives away the answer');
    }
  }
  options.forEach((option, i) => {
    if (i !== q.answer && !(q.kind && LISTS_ALL_SHAPES.has(q.kind)) && mentions(q.proof, option)) {
      reasons.push(`proof contains wrong option ${i} ("${option}")`);
    }
  });

  if (normalise(q.prompt) === '') {
    reasons.push('prompt is empty');
  }
  if (normalise(q.hints.nudge) === '') {
    reasons.push('nudge is empty');
  }
  if (normalise(q.hints.whereToLook) === '') {
    reasons.push('whereToLook is empty');
  }

  const removed: readonly unknown[] = q.hints.removed;
  const [r1, r2] = removed;
  if (
    removed.length !== 2 ||
    !isIndex(r1, options.length) ||
    !isIndex(r2, options.length)
  ) {
    reasons.push('hints.removed must be two option indexes');
  } else if (r1 === r2) {
    reasons.push('hints.removed must name two different options');
  } else if (r1 === q.answer || r2 === q.answer) {
    reasons.push('hints.removed must not remove the correct answer');
  }

  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Runtime type guard for a `Question` from an untrusted source (the
 * model or the network). Checks shape only; `validateQuestion` checks
 * the content.
 */
export function isQuestionShape(value: unknown): value is Question {
  if (!isRecord(value) || !isRecord(value.hints)) {
    return false;
  }
  const { hints } = value;
  const strings = ['id', 'articleId', 'prompt', 'proof', 'proofSection'];
  return (
    strings.every((key) => typeof value[key] === 'string') &&
    PACK_IDS.includes(value.pack as PackId) &&
    Array.isArray(value.options) &&
    value.options.every((o) => typeof o === 'string') &&
    typeof value.answer === 'number' &&
    typeof hints.nudge === 'string' &&
    typeof hints.whereToLook === 'string' &&
    Array.isArray(hints.removed) &&
    (hints.removed.length === 2 || (value.kind === 'truefalse' && hints.removed.length === 0)) &&
    hints.removed.every((r) => typeof r === 'number')
  );
}

/** Turns a title into a URL slug, e.g. "Côte d'Ivoire" -> "c-te-d-ivoire". */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
  return slug === '' ? 'article' : slug;
}

const HEADING = /^\s*(={2,6})\s*(.+?)\s*\1\s*$/;

/** Options for `articleFromText`. */
export interface ArticleFromTextOptions {
  pack?: PackId;
  /** ISO date the text was retrieved; defaults to today (UTC). */
  retrieved?: string;
}

/**
 * Builds an `Article` from a title and plain text in the format of
 * Wikipedia's plain-text extracts: `== Heading ==` lines start sections,
 * blank lines separate paragraphs, text before the first heading is the
 * lead. Empty sections are dropped. The quiz Lambda and the app call
 * this with the same input so they validate against the same article.
 */
export function articleFromText(
  title: string,
  text: string,
  options: ArticleFromTextOptions = {},
): Article {
  const sections: ArticleSection[] = [];
  let current: ArticleSection = { heading: '', paragraphs: [] };
  let buffer: string[] = [];

  const flushParagraph = (): void => {
    const paragraph = normalise(buffer.join(' '));
    if (paragraph !== '') {
      current.paragraphs.push(paragraph);
    }
    buffer = [];
  };
  const flushSection = (): void => {
    flushParagraph();
    if (current.paragraphs.length > 0) {
      sections.push(current);
    }
  };

  for (const line of text.split(/\r?\n/)) {
    const heading = HEADING.exec(line);
    if (heading) {
      flushSection();
      current = { heading: normalise(heading[2] ?? ''), paragraphs: [] };
    } else if (line.trim() === '') {
      flushParagraph();
    } else {
      buffer.push(line);
    }
  }
  flushSection();

  const cleanTitle = normalise(title);
  const page = encodeURIComponent(cleanTitle.replace(/ /g, '_'));
  return {
    id: slugify(cleanTitle),
    pack: options.pack ?? 'countries',
    title: cleanTitle,
    summary: sections[0]?.paragraphs[0] ?? '',
    sections,
    photos: [],
    notes: [],
    source: {
      name: `Wikipedia: ${cleanTitle}`,
      url: `https://en.wikipedia.org/wiki/${page}`,
      licence: 'CC BY-SA 4.0',
      licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      retrieved:
        options.retrieved ?? new Date().toISOString().slice(0, 10),
    },
  };
}
