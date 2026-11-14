/**
 * Builds the five-question quiz for a pack article from its text and,
 * for countries, its Wikidata facts. Every question is checked with the
 * shared validator before it is kept, and all choices are seeded so the
 * same packs always build the same quizzes (05-quizzes).
 */
import { rng, seedFrom } from '../../design/wobble.ts';
import type { Article, CountryFacts, Question } from '../packs/types.ts';
import { heuristicPos, sameKind, type PosOf } from './pos.ts';
import { sentencesOf, type Located } from './sentences.ts';
import { fold, validateQuestion } from './validate.ts';

export const QUIZ_LENGTH = 5;

/** Key words for gap-fill questions in the Physics pack. */
export const PHYSICS_TERMS = [
  'electron', 'electrons', 'proton', 'protons', 'neutron', 'atom', 'atoms',
  'charge', 'current', 'voltage', 'resistance', 'circuit', 'conductor',
  'conductors', 'insulator', 'insulators', 'battery', 'batteries', 'ampere',
  'amperes', 'volt', 'volts', 'ohm', 'ohms', 'watt', 'watts', 'energy',
  'magnet', 'magnetic', 'metal', 'metals', 'copper', 'lightning', 'static',
  'positive', 'negative', 'friction', 'generator', 'wire', 'wires',
  'heat', 'light', 'power', 'electricity', 'thunder', 'cloud', 'clouds',
  'rubber', 'plastic', 'glass', 'water', 'ground', 'switch', 'motor',
];

interface Candidate {
  kind: string;
  prompt: string;
  answer: string;
  distractors: string[];
  proof: Located;
  nudge: string;
}

/** A clue about a word or name that never contains it. */
export function nudgeFor(answer: string): string {
  if (/^\d{4}$/.test(answer)) {
    // In words, so the hint never contains the year itself.
    const y = Number(answer);
    const centuries = ['tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth',
      'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first'];
    const century = centuries[Math.floor((y - 1) / 100) - 9] ?? 'distant';
    const decade = Math.floor((y % 100) / 10) * 10;
    const part = decade === 0 ? 'early in' : `in the ${decade}s of`;
    return `It is a year ${part} the ${century} century.`;
  }
  if (/^[\d,.]+$/.test(answer)) {
    const digits = answer.replace(/\D/g, '').length;
    return `It is a number with ${digits} digit${digits === 1 ? '' : 's'}.`;
  }
  const letters = answer.replace(/[^A-Za-z]/g, '').length;
  const words = answer.trim().split(/\s+/).length;
  const first = answer.trim().charAt(0).toUpperCase();
  return words > 1
    ? `It is ${words} words long and starts with the letter ${first}.`
    : `It starts with the letter ${first} and has ${letters} letters.`;
}

/** "Look in the “History” part…" without naming the answer. */
export function whereToLookFor(section: string, title: string): string {
  return section
    ? `Look in the “${section}” part of the ${title} article.`
    : `Look in the opening paragraphs of the ${title} article.`;
}

/** Deterministic Fisher–Yates shuffle. */
function shuffle<T>(items: readonly T[], next: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

const mentions = (text: string, needle: string): boolean =>
  fold(needle) !== '' && fold(text).includes(fold(needle));

/** Picks three distractors that the proof sentence does not mention. */
function pickDistractors(
  pool: readonly string[],
  answer: string,
  proof: string,
  next: () => number,
): string[] | null {
  const seen = new Set([fold(answer)]);
  const ok = shuffle(pool, next).filter((d) => {
    const f = fold(d);
    if (f === '' || seen.has(f) || mentions(proof, d) || mentions(d, answer) || mentions(answer, d)) {
      return false;
    }
    seen.add(f);
    return true;
  });
  return ok.length >= 3 ? ok.slice(0, 3) : null;
}

/** The first sentence that contains `answer`. */
function proofFor(sentences: readonly Located[], answer: string, also?: RegExp): Located | null {
  return (
    sentences.find((s) => mentions(s.sentence, answer) && (!also || also.test(s.sentence))) ??
    sentences.find((s) => mentions(s.sentence, answer)) ??
    null
  );
}

function factCandidates(
  article: Article,
  facts: CountryFacts,
  all: readonly CountryFacts[],
  sentences: readonly Located[],
): Candidate[] {
  const near = all.filter((c) => c.id !== facts.id && c.continent === facts.continent);
  const others = near.length >= 6 ? near : all.filter((c) => c.id !== facts.id);
  const nameOf = new Map(all.map((c) => [c.id, c.name]));
  const out: Candidate[] = [];
  const add = (kind: string, prompt: string, answer: string | undefined, pool: string[], also?: RegExp): void => {
    if (!answer) return;
    const proof = proofFor(sentences, answer, also);
    if (proof) out.push({ kind, prompt, answer, distractors: pool, proof, nudge: nudgeFor(answer) });
  };
  add(
    'capital',
    `What is the capital city of ${article.title}?`,
    facts.capital,
    others.map((c) => c.capital ?? '').filter(Boolean),
    /capital/i,
  );
  const neighbour = facts.neighbours.map((n) => nameOf.get(n)).find((n) => n && proofFor(sentences, n, /border/i));
  add(
    'neighbour',
    `Which of these countries shares a border with ${article.title}?`,
    neighbour,
    others.filter((c) => !facts.neighbours.includes(c.id)).map((c) => c.name),
    /border/i,
  );
  const language = facts.languages.find((l) => proofFor(sentences, l, /language|speak/i));
  add(
    'language',
    `Which language is an official language of ${article.title}?`,
    language,
    [...new Set(others.flatMap((c) => c.languages))],
    /language|speak/i,
  );
  if (facts.currency) {
    add(
      'currency',
      `What money is used in ${article.title}?`,
      facts.currency,
      [...new Set(others.map((c) => c.currency ?? '').filter(Boolean))],
    );
  }
  return out;
}

/** The latest year the packs can talk about, for year distractors. */
const LATEST_YEAR = 2025;

/**
 * A four-digit year used as a date ("in 1960", "since 1999", "1 October
 * 1960"), not a measurement ("1497 km").
 */
export function findYear(sentence: string): string | undefined {
  const re =
    /(?:\b(?:in|since|until|from|by|between|and|before|after|around|year|January|February|March|April|May|June|July|August|September|October|November|December)\s+|^)(1[0-9]{3}|20[0-2][0-9])\b(?!\s*(?:km|m|kg|metres|meters|miles|people|square|ft|%))/;
  if ((sentence.match(/\b\d{4}\b/g) ?? []).length >= 3) {
    return undefined; // a list of years makes a guessing game, not a question
  }
  const m = re.exec(sentence);
  return m && Number(m[1]) <= LATEST_YEAR ? m[1] : undefined;
}

/** Words after which a plain word is a verb ("that orbits", "it takes", "to make"). */
const VERB_CUES = new Set('that which who it he she they we you to will would can could may might must shall should also then not often usually only just always never'.split(' '));

/** Gap-fill: blank one key term out of a sentence. */
function gapCandidates(
  article: Article,
  sentences: readonly Located[],
  termPool: readonly string[],
  posOf: PosOf,
): Candidate[] {
  const out: Candidate[] = [];
  const termSet = new Set(termPool.map(fold));
  for (const s of sentences) {
    if (s.sentence.length < 40 || s.sentence.length > 220) continue;
    const words = s.sentence.match(/[A-Za-z][A-Za-z'-]*|\d{4}/g) ?? [];
    const year = findYear(s.sentence);
    // Only nouns and adjectives are blanked: a verb or a number word has too few look-alikes in an article to make fair wrong answers.
    const at = words.findIndex(
      (w, i) =>
        termSet.has(fold(w)) &&
        !mentions(article.title, w) &&
        w.length > 3 &&
        ['noun', 'adj'].includes(posOf(w)) &&
        // A word right after "that", "it", "to", "will" ... is usually a verb in this sentence, whatever the dictionary lists first.
        !VERB_CUES.has((words[i - 1] ?? '').toLowerCase()),
    );
    const term = at >= 0 ? words[at] : undefined;
    const answer = year ?? term;
    if (!answer) continue;
    const blanked = s.sentence.replace(new RegExp(`\\b${answer}\\b`, 'i'), '_____');
    if (blanked === s.sentence || mentions(blanked, answer)) continue;
    let pool: string[];
    if (year) {
      const y = Number(year);
      pool = [-30, -12, -5, 7, 15, 25, 40]
        .map((d) => String(y + d))
        .filter((v) => Number(v) <= LATEST_YEAR);
    } else {
      // Wrong answers must fit the gap: the same part of speech, and plural for plural (24-review-4 Req 8).
      pool = termPool.filter((t) => fold(t) !== fold(answer) && sameKind(t, answer, posOf));
    }
    out.push({
      kind: year ? 'year' : 'term',
      prompt: `Fill the gap: “${blanked}”`,
      answer: year ?? answer,
      distractors: pool,
      proof: s,
      nudge: nudgeFor(answer),
    });
  }
  return out;
}

/**
 * Builds up to five validated questions for an article. Fact questions
 * come first; gap-fill questions top the quiz up. Each prompt and each
 * answer is used once.
 */
export function buildQuiz(
  article: Article,
  facts: CountryFacts | undefined,
  allFacts: readonly CountryFacts[],
  termPool: readonly string[],
  posOf: PosOf = heuristicPos,
): Question[] {
  const next = rng(seedFrom(`quiz:${article.pack}/${article.id}`));
  const sentences = sentencesOf(article);
  const gaps = gapCandidates(article, sentences, termPool, posOf);
  const candidates = [
    ...(facts ? factCandidates(article, facts, allFacts, sentences) : []),
    // Named terms make better questions than dates, so they come first.
    ...shuffle(gaps.filter((g) => g.kind === 'term'), next),
    ...shuffle(gaps.filter((g) => g.kind === 'year'), next),
  ];
  const questions: Question[] = [];
  const usedAnswers = new Set<string>();
  const usedProofs = new Set<string>();
  for (const c of candidates) {
    if (questions.length >= QUIZ_LENGTH) break;
    if (usedAnswers.has(fold(c.answer)) || usedProofs.has(c.proof.sentence)) continue;
    const distractors = pickDistractors(c.distractors, c.answer, c.proof.sentence, next);
    if (!distractors) continue;
    const options = shuffle([c.answer, ...distractors], next);
    const answer = options.indexOf(c.answer);
    const wrong = shuffle(options.map((_, i) => i).filter((i) => i !== answer), next);
    const q: Question = {
      id: `${article.pack}/${article.id}/${questions.length + 1}`,
      articleId: article.id,
      pack: article.pack,
      prompt: c.prompt,
      options,
      answer,
      hints: {
        nudge: c.nudge,
        whereToLook: whereToLookFor(c.proof.section, article.title),
        removed: [wrong[0] as number, wrong[1] as number],
      },
      proof: c.proof.sentence,
      proofSection: c.proof.section,
    };
    if (validateQuestion(q, article).ok) {
      questions.push(q);
      usedAnswers.add(fold(c.answer));
      usedProofs.add(c.proof.sentence);
    }
  }
  return questions;
}

/** Common words that make poor answers or distractors. */
const STOPWORDS = new Set(
  (
    'about above after again against almost along already also although always among another because become becomes ' +
    'became before being below between both called cannot could country different during each either enough even ever ' +
    'every first following found from further great have having here however include includes included including into ' +
    'itself known large later least less like likely made make makes many might more most much must near never next ' +
    'often only other others over part parts people place places quite rather really same second several should since ' +
    'small some something still such than that their them then there these they thing things this those though three ' +
    'through together took under until upon used uses using usually very want well went were what when where whether ' +
    'which while whole will with within without would years young'
  ).split(' '),
);

/**
 * Key words for gap-fill questions about any article: the longest, most
 * repeated plain words in its own text, without common words or the
 * title. Wrong choices come from the same article, so they are at least
 * plausible (05-quizzes; used for subject packs and on-demand articles).
 */
export function autoTerms(article: Pick<Article, 'title' | 'sections'>, max = 60): string[] {
  const text = article.sections.flatMap((s) => s.paragraphs).join(' ');
  const counts = new Map<string, number>();
  for (const w of text.match(/[A-Za-z][a-z]{4,}/g) ?? []) {
    const f = fold(w);
    if (STOPWORDS.has(f) || mentions(article.title, f) || f.endsWith('ing') || f.endsWith('ed')) continue;
    counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([w]) => w);
}
