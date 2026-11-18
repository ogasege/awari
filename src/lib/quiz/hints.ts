/**
 * Rung one of the hint ladder: the "nudge" (05-quizzes Req 2; 26-final-review D-1).
 *
 * The first rung used to read "It starts with the letter A and has 5 letters.", which with four
 * options leaves exactly one standing: the answer. A nudge here says something about the subject
 * or about the kind of word the gap needs, and every nudge is checked against the four options
 * before it is kept, so no nudge can single one out on its own.
 *
 * Pure TypeScript: no Node or DOM APIs, so the pipeline, the app and the quiz Lambda share it.
 */
import { looksPlural } from './pos.ts';
import { fold } from './validate.ts';

/** The kinds of question the pack pipeline builds. */
export type QuestionKind =
  | 'capital'
  | 'neighbour'
  | 'language'
  | 'currency'
  | 'year'
  | 'term'
  | 'capital-reverse'
  | 'continent'
  | 'largest'
  | 'first'
  | 'truefalse';

const ORDINALS = [
  'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth',
  'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first',
] as const;

/** "twentieth" for 1967; "distant" for a year the list does not reach. */
export function centuryName(year: number): string {
  return ORDINALS[Math.floor((year - 1) / 100) - 9] ?? 'distant';
}

const centuryOf = (option: string): string | null =>
  /^\d{4}$/.test(option) ? centuryName(Number(option)) : null;

const lettersIn = (text: string): number => text.replace(/[^A-Za-z]/g, '').length;
const digitsIn = (text: string): number => text.replace(/\D/g, '').length;
const wordsIn = (text: string): number => text.trim().split(/\s+/).length;

/**
 * Every mechanical rule a nudge states about the answer, as filters over an option. A nudge that
 * states no rule returns an empty list: it cannot single an option out by shape alone.
 */
export function constraintsOf(nudge: string): Array<(option: string) => boolean> {
  const out: Array<(option: string) => boolean> = [];
  const letter = /starts with the letter ([A-Za-z])/.exec(nudge);
  if (letter) {
    const want = (letter[1] as string).toUpperCase();
    out.push((o) => o.trim().charAt(0).toUpperCase() === want);
  }
  const length = /has (\d+) letters/.exec(nudge);
  if (length) {
    const want = Number(length[1]);
    out.push((o) => lettersIn(o) === want);
  }
  const words = /is (\d+) words long/.exec(nudge);
  if (words) {
    const want = Number(words[1]);
    out.push((o) => wordsIn(o) === want);
  }
  const digits = /number with (\d+) digits?/.exec(nudge);
  if (digits) {
    const want = Number(digits[1]);
    out.push((o) => digitsIn(o) === want);
  }
  const decade = /in the (\d0)s of the ([a-z-]+) century/.exec(nudge);
  if (decade) {
    const want = Number(decade[1]);
    out.push((o) => /^\d{4}$/.test(o) && Math.floor((Number(o) % 100) / 10) * 10 === want);
  }
  const early = /early in the ([a-z-]+) century/.exec(nudge);
  if (early) {
    out.push((o) => /^\d{4}$/.test(o) && Number(o) % 100 < 10);
  }
  const century = /the ([a-z-]+) century/.exec(nudge);
  if (century) {
    const want = century[1] as string;
    out.push((o) => centuryOf(o) === want);
  }
  if (/names more than one thing/.test(nudge)) out.push((o) => looksPlural(o));
  if (/names one thing/.test(nudge)) out.push((o) => !looksPlural(o));
  return out;
}

/** True when the nudge alone leaves exactly one of the options standing. */
export function narrowsToOne(nudge: string, options: readonly string[]): boolean {
  const rules = constraintsOf(nudge);
  if (rules.length === 0) return false;
  return options.filter((o) => rules.every((r) => r(o))).length === 1;
}

/** What the builder knows about a question when it writes rung one. */
export interface NudgeContext {
  kind: QuestionKind;
  /** The right answer, so a nudge that names it can be thrown away. */
  answer: string;
  /** The article's title, for a nudge that talks about the subject. */
  title: string;
  /** A content word standing next to the gap, to point the eye at it. */
  beside?: string;
  /** True when the answer is a name (a place, a people, a person). */
  proper?: boolean;
}

const LAST_RESORT = 'Read the sentence again: only one of the four choices makes it true.';

/**
 * A kind-free nudge, used for questions built in the browser and as the end of the ladder of
 * candidates. Never contains the answer.
 */
export function nudgeFor(answer: string): string {
  if (/^\d{4}$/.test(answer)) {
    return `It is a year in the ${centuryName(Number(answer))} century.`;
  }
  if (/^[\d,.]+$/.test(answer)) {
    return 'It is a number. Find the sentence in the article and read it slowly.';
  }
  return LAST_RESORT;
}

/** Rung-one wordings for a question, most useful first. */
export function nudgeCandidates(ctx: NudgeContext): string[] {
  const { kind, answer, title, beside, proper } = ctx;
  const plural = looksPlural(answer);
  const out: string[] = [];
  switch (kind) {
    case 'capital':
      out.push(
        'A capital city is where a country’s government meets. The other three are capital cities too, of other countries.',
      );
      break;
    case 'neighbour':
      out.push(
        `Two countries are neighbours when you can walk from one into the other. Picture ${title} on the globe and look at what it touches.`,
      );
      break;
    case 'language':
      out.push(
        'An official language is the one used in schools, courts and government. The other three are spoken in other countries.',
      );
      break;
    case 'currency':
      out.push(
        'Money names often come from a country’s own words. The other three are spent in other countries.',
      );
      break;
    case 'capital-reverse':
      out.push('Every country has one capital city. Find the city in the question on a map, then see which country it sits in.');
      break;
    case 'continent':
      out.push(`A continent is one of the great land masses of the world. Find ${title} on the Atlas and see which land mass it sits on.`);
      break;
    case 'largest':
      out.push('Area is how much ground a country covers, not how many people live there. A small crowded country can still be small.');
      break;
    case 'first':
      out.push('Think about which one is the oldest. The dates in the Timeline run from the earliest to the latest.');
      break;
    case 'truefalse':
      out.push('Read the statement slowly. Does it match what the article says, or has one word been swapped for another?');
      break;
    case 'year':
      if (/^\d{4}$/.test(answer)) out.push(`It is a year in the ${centuryName(Number(answer))} century.`);
      out.push('All four are years. Only one of them fits what the article says happened.');
      break;
    case 'term':
      if (beside) {
        out.push(
          `In the sentence the missing word sits beside “${beside}”. It ${plural ? 'names more than one thing' : 'names one thing'}, not an action.`,
        );
      }
      if (proper) {
        out.push('The missing word is a name, not an everyday word. Only one of these names makes the sentence true.');
      }
      out.push(
        plural
          ? 'The missing word names more than one thing. Read the whole sentence and ask which of them the article is talking about.'
          : 'The missing word names one thing, not an action. The words on each side of the gap show what kind of thing fits.',
      );
      break;
  }
  out.push(LAST_RESORT);
  return out;
}

/**
 * The first candidate nudge that is safe to show: it never names the answer, never quotes one of
 * the four options, and never leaves exactly one option standing. `null` when nothing is safe,
 * which tells the builder to drop the question.
 */
export function safeNudge(ctx: NudgeContext, options: readonly string[]): string | null {
  const says = (nudge: string, text: string): boolean => fold(text) !== '' && fold(nudge).includes(fold(text));
  for (const nudge of nudgeCandidates(ctx)) {
    if (says(nudge, ctx.answer)) continue;
    if (options.some((o) => says(nudge, o))) continue;
    if (narrowsToOne(nudge, options)) continue;
    return nudge;
  }
  return null;
}
