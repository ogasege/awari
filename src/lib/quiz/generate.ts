/**
 * Builds the five-question quiz for a pack article from its text and,
 * for countries, its Wikidata facts. Every question is checked with the
 * shared validator before it is kept, and all choices are seeded so the
 * same packs always build the same quizzes (05-quizzes).
 *
 * Fairness rules added after the final design review (26-final-review):
 * rung one of the hint ladder never singles out an option (D-1, see
 * `hints.ts`); the four options always share their capitalisation and
 * their kind, so neither the shape of a word nor its capital letter can
 * answer the question (D-5, D-6); wrong answers for a place come from
 * the same corner of the world (D-7); and the proof is a second
 * sentence from the article where the article has one, rather than the
 * gap sentence filled in (D-8).
 */
import { rng, seedFrom } from '../../design/wobble.ts';
import type { Article, CountryFacts, Question, QuizShape, TimelineEvent } from '../packs/types.ts';
import { safeNudge, type QuestionKind } from './hints.ts';
import { heuristicPos, sameKind, type PosOf } from './pos.ts';
import { sentencesOf, splitSentences, type Located } from './sentences.ts';
import { articleText, fold, LISTS_ALL_SHAPES, validateQuestion } from './validate.ts';
import { unsuitableTopic } from '../text/suitability.ts';

export { nudgeFor } from './hints.ts';

export const QUIZ_LENGTH = 5;

/** How many candidate questions of the old shapes are kept before the mix picks five. */
const CANDIDATE_LIMIT = 7;

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
  kind: QuestionKind;
  prompt: string;
  answer: string;
  distractors: string[];
  proof: Located;
  /** A content word standing beside the gap, for the nudge. */
  beside?: string;
  /** False when the sentence has nothing to do with its own heading. */
  fitsSection: boolean;
}

/**
 * "Look in the “History” part…" without naming the answer. When the
 * sentence has nothing to do with its own heading, the hint says where
 * the sentence is on the page instead of claiming what it is about: the
 * Biafra war really is written up inside Nigeria's "Religion" section,
 * and "Look in the Religion part" sent students after the wrong idea
 * (26-final-review).
 */
export function whereToLookFor(section: string, title: string, fitsSection = true): string {
  if (section === '') {
    return `Look in the opening paragraphs of the ${title} article.`;
  }
  return fitsSection
    ? `Look in the “${section}” part of the ${title} article.`
    : `It is further down the ${title} article, under the heading “${section}”.`;
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

/** True when a word is written as a name, e.g. "Pyramids" but not "palaces". */
const isName = (term: string): boolean => /^[A-Z]/.test(term.trim());

/**
 * Two place names crammed into one value, as Wikidata gives for countries with
 * more than one seat of government: "Sri Jayawardenepura Kotte, Colombo",
 * "Sucre, La Paz". "Washington, D.C." is one name and stays (26-final-review D-7).
 */
export function isTwoNames(value: string): boolean {
  const parts = value.split(',').map((p) => p.trim());
  return parts.length > 1 && parts.every((p) => p.replace(/[^A-Za-z]/g, '').length >= 3 && !p.includes('.'));
}

/**
 * A value no student should ever be offered: two names crammed into one
 * option ("Sri Jayawardenepura Kotte, Colombo"), or a sign language
 * among spoken ones (26-final-review D-7).
 */
function usableOption(term: string, answer: string): boolean {
  if (term.trim() === '' || isTwoNames(term)) return false;
  return !/\bsign language\b/i.test(term) || /\bsign language\b/i.test(answer);
}

/** Picks three distractors of the same kind that the proof does not mention. */
function pickDistractors(
  pool: readonly string[],
  answer: string,
  proof: string,
  next: () => number,
): string[] | null {
  const seen = new Set([fold(answer)]);
  const ok = shuffle(pool, next).filter((d) => {
    const f = fold(d);
    if (f === '' || seen.has(f) || !usableOption(d, answer)) return false;
    // Wrong answers must read as the same sort of word as the right one, so
    // neither a capital letter nor a plural "s" can answer the question.
    if (isName(d) !== isName(answer)) return false;
    if (mentions(proof, d) || mentions(d, answer) || mentions(answer, d)) return false;
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

/** Words that say nothing about what a sentence is about. */
const COMMON = new Set(
  ('about after also another because been before being both called came come could each every first from have here ' +
    'into just like made make many more most much must only other over said same some such than that their them then ' +
    'there these they this those through time very were what when where which while will with would your').split(' '),
);

/** The content words of a text, folded, for comparing two sentences. */
const keyWords = (text: string): string[] =>
  (text.match(/[A-Za-z][A-Za-z'-]{3,}/g) ?? []).map(fold).filter((w) => !COMMON.has(w));

/**
 * Whether a sentence belongs under its own heading by its own words. A
 * sentence about the Biafra war sitting in the "Religion" section does
 * not, and a "Look in the Religion part" hint would send a student to
 * the wrong idea, so those sentences are used last (26-final-review).
 */
function fitsItsSection(s: Located): boolean {
  const keys = keyWords(s.section).map((k) => k.replace(/(?:ies|s)$/, ''));
  if (keys.length === 0) return true; // the lead, or a heading of common words
  const text = fold(s.sentence);
  return keys.some((k) => text.includes(k));
}

/**
 * Island states with no land border, which Wikidata still lists as neighbours of the countries across the water
 * (round 3: Bahrain offered as Saudi Arabia's border). They are never the answer to a border question.
 */
const ISLAND_STATES = new Set(
  [
    'Bahrain', 'Singapore', 'Sri Lanka', 'Maldives', 'Japan', 'Philippines', 'Taiwan', 'Cuba', 'Jamaica', 'The Bahamas',
    'Bahamas', 'Barbados', 'Trinidad and Tobago', 'Grenada', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Antigua and Barbuda', 'Dominica', 'Saint Kitts and Nevis', 'Iceland', 'Malta', 'Cyprus', 'Madagascar', 'Mauritius',
    'Seychelles', 'Comoros', 'Cape Verde', 'São Tomé and Príncipe', 'Australia', 'New Zealand', 'Fiji', 'Samoa', 'Tonga',
    'Vanuatu', 'Solomon Islands', 'Kiribati', 'Tuvalu', 'Nauru', 'Palau', 'Marshall Islands',
    'Federated States of Micronesia', 'Micronesia',
  ].map(fold),
);

function factCandidates(
  article: Article,
  facts: CountryFacts,
  all: readonly CountryFacts[],
  sentences: readonly Located[],
): Candidate[] {
  // Wrong answers come from the same corner of the world as the country asked
  // about, so no child can rule out Lesotho or Cape Verde without the map (D-7).
  const region = regionOf(facts.id, all);
  const others = region.length >= 6 ? region : all.filter((c) => c.id !== facts.id);
  const nameOf = new Map(all.map((c) => [c.id, c.name]));
  const out: Candidate[] = [];
  const add = (
    kind: QuestionKind,
    prompt: string,
    answer: string | undefined,
    pool: string[],
    also?: RegExp,
  ): void => {
    if (!answer) return;
    const proof = proofFor(sentences, answer, also);
    // The proof must name the answer as a whole word: "euro" is not proved by a sentence about Austria (round 3 R-1).
    const whole = new RegExp(`(^|[^\\p{L}])${answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}])`, 'iu');
    if (proof && whole.test(proof.sentence)) out.push({ kind, prompt, answer, distractors: pool, proof, fitsSection: true });
  };
  add(
    'capital',
    `What is the capital city of ${article.title}?`,
    facts.capital,
    others.map((c) => c.capital ?? '').filter(Boolean),
    /capital/i,
  );
  // A border question needs a sentence in the article that names the neighbour AND talks about a land border; a
  // country with no land neighbours (an island nation) gets none (26-final-review N-1). "Water borders", "maritime
  // borders" and "near" describe the sea, not a border you can walk across, so they do not count (round 3).
  const borderProof = (n: string): Located | null =>
    ISLAND_STATES.has(fold(n))
      ? null
      : (sentences.find(
          (s) =>
            mentions(s.sentence, n) &&
            /\bborder(s|ed|ing)?\b/i.test(s.sentence) &&
            !/\b(water|maritime|sea|ocean|marine)\s+border/i.test(s.sentence) &&
            !/\b(near|across the|causeway|strait|gulf|island)\b/i.test(s.sentence) &&
            !new RegExp(`${n}[^.;]{0,20}disputed|disputed[^.;]{0,20}${n}`, 'i').test(s.sentence),
        ) ?? null);
  const neighbour =
    facts.neighbours.length > 0 ? facts.neighbours.map((n) => nameOf.get(n)).find((n) => n && borderProof(n)) : undefined;
  if (neighbour) {
    const proof = borderProof(neighbour);
    if (proof) {
      out.push({
        kind: 'neighbour',
        prompt: `Which of these countries shares a border with ${article.title}?`,
        answer: neighbour,
        distractors: others.filter((c) => !facts.neighbours.includes(c.id)).map((c) => c.name),
        proof,
        fitsSection: true,
      });
    }
  }
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

/** Country ids within `hops` shared borders of `id`, including itself. */
function nearbyIds(id: string, all: readonly CountryFacts[], hops: number): Set<string> {
  const graph = new Map(all.map((c) => [c.id, c.neighbours]));
  const seen = new Set([id]);
  let edge = new Set([id]);
  for (let h = 0; h < hops; h += 1) {
    const next = new Set<string>();
    for (const c of edge) {
      for (const n of graph.get(c) ?? []) if (!seen.has(n)) { seen.add(n); next.add(n); }
    }
    edge = next;
  }
  return seen;
}

/** How many borders away a wrong answer about a place may be (26-final-review D-7). */
export const REGION_HOPS = 3;

/**
 * The countries a student could reasonably confuse with a given one: those
 * within three shared borders. An island has no land neighbours, so for those
 * the whole continent is the region.
 */
export function regionOf(id: string, all: readonly CountryFacts[]): CountryFacts[] {
  const near = nearbyIds(id, all, REGION_HOPS);
  const out = all.filter((c) => c.id !== id && near.has(c.id));
  if (out.length >= REGION_HOPS) return out;
  const continent = all.find((c) => c.id === id)?.continent;
  return all.filter((c) => c.id !== id && c.continent === continent);
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

/** The content word next to the gap, for a nudge that points the eye at it. */
function besideGap(blanked: string): string | undefined {
  const words = blanked.split(/\s+/).map((w) => w.replace(/[^A-Za-z'-]/g, ''));
  const at = blanked.split(/\s+/).findIndex((w) => w.includes('_____'));
  if (at < 0) return undefined;
  for (const i of [at - 1, at + 1, at - 2, at + 2]) {
    const w = words[i];
    if (w && w.length >= 4 && !COMMON.has(fold(w))) return w;
  }
  return undefined;
}

/** The same four digits, within the same century where the article allows it. */
function yearPool(year: string): string[] {
  const y = Number(year);
  const all = [-30, -12, -5, 7, 15, 25, 40]
    .map((d) => y + d)
    .filter((v) => v <= LATEST_YEAR && v > 0);
  const century = (v: number): number => Math.floor((v - 1) / 100);
  const sameCentury = all.filter((v) => century(v) === century(y));
  return (sameCentury.length >= 3 ? sameCentury : all).map(String);
}

/** Wrong answers for a place name, or null when the word is not a place. */
type PlacePool = (answer: string) => string[] | null;

/** Whether two place names are the same sort of place: a country, or a city. */
type SameSort = (candidate: string, answer: string) => boolean;

/**
 * A country is never offered where a city belongs, in any pack: "The largest
 * city is _____, Mauritania's capital" must not list Egypt and Morocco (D-7).
 */
function placeSorter(all: readonly CountryFacts[]): SameSort {
  const countries = new Set(all.map((c) => fold(c.name)));
  const cities = new Set(all.flatMap((c) => (c.capital ? [fold(c.capital)] : [])));
  const sortOf = (term: string): 'country' | 'city' | 'other' => {
    const f = fold(term);
    if (countries.has(f) && !cities.has(f)) return 'country';
    if (cities.has(f) && !countries.has(f)) return 'city';
    return 'other'; // Luxembourg and Singapore are both at once
  };
  return (candidate, answer) => {
    const wanted = sortOf(answer);
    return wanted === 'other' || sortOf(candidate) !== (wanted === 'country' ? 'city' : 'country');
  };
}

/** Countries against countries of their region, capitals against capitals of theirs. */
function placePoolFor(all: readonly CountryFacts[]): PlacePool {
  return (answer) => {
    const country = all.find((c) => fold(c.name) === fold(answer));
    if (country) return regionOf(country.id, all).map((c) => c.name);
    const owner = all.find((c) => c.capital && fold(c.capital) === fold(answer));
    if (owner) {
      return regionOf(owner.id, all)
        .map((c) => c.capital ?? '')
        .filter(Boolean);
    }
    return null;
  };
}

/** Gap-fill: blank one key term out of a sentence. */
function gapCandidates(
  article: Article,
  sentences: readonly Located[],
  termPool: readonly string[],
  posOf: PosOf,
  names: ReadonlySet<string>,
  placePool?: PlacePool,
  sameSort?: SameSort,
): Candidate[] {
  const out: Candidate[] = [];
  const surface = new Map(termPool.map((t) => [fold(t), t]));
  const termSet = new Set(termPool.map(fold));
  for (const s of sentences) {
    if (s.sentence.length < 40 || s.sentence.length > 220) continue;
    const words = s.sentence.match(/[A-Za-z][A-Za-z'-]*|\d{4}/g) ?? [];
    const year = findYear(s.sentence);
    // A sentence that runs into a list ("The different _____ of ancient
    // Egyptian history are:") is a heading, not a statement a student can
    // judge. A date in one is still a fair question.
    if (!year && s.sentence.trimEnd().endsWith(':')) continue;
    // Only nouns and names are blanked. Blanking an adjective asks which word
    // sounds best ("For such a _____ empire": prolific, richest, wealthiest),
    // which is a question about style, not about the article (D-6).
    const at = words.findIndex(
      (w, i) =>
        termSet.has(fold(w)) &&
        !mentions(article.title, w) &&
        w.length > 3 &&
        (names.has(fold(w)) || posOf(w) === 'noun') &&
        // A word right after "that", "it", "to", "will" ... is usually a verb in this sentence, whatever the dictionary lists first.
        !VERB_CUES.has((words[i - 1] ?? '').toLowerCase()),
    );
    const term = at >= 0 ? words[at] : undefined;
    const answer = year ?? term;
    if (!answer) continue;
    const blanked = s.sentence.replace(new RegExp(`\\b${answer}\\b`, 'i'), '_____');
    if (blanked === s.sentence || mentions(blanked, answer)) continue;
    // "Bamako, Djenné and Timbuktu" must not become "Bamako, _____é and
    // Timbuktu": the accent falls outside the word pattern, so the gap would
    // cut the name in half.
    if (/\p{L}_____|_____\p{L}/u.test(blanked)) continue;
    // A name followed straight by another capitalised word is part of a longer name here ("France Prešeren" is a poet,
    // "Mexico City" is a city), so blanking only the first word asks the wrong question (26-final-review N-6).
    if (!year && /^\p{Lu}/u.test(answer) && /_____ \p{Lu}/u.test(blanked)) continue;
    let pool: string[];
    if (year) {
      pool = yearPool(year);
    } else {
      // A place is only ever offered against places of its own sort from its own
      // corner of the world: countries for a country, capitals for a capital (D-7).
      // Otherwise wrong answers must fit the gap: the same part of speech, and
      // plural for plural (24-review-4 Req 8).
      pool =
        placePool?.(answer) ??
        termPool.filter(
          (t) =>
            fold(t) !== fold(answer) &&
            sameKind(t, answer, posOf) &&
            (sameSort?.(t, answer) ?? true),
        );
    }
    out.push({
      kind: year ? 'year' : 'term',
      prompt: `Fill the gap: “${blanked}”`,
      // The article's own spelling of the word, so a capital letter mid-sentence
      // marks a name and not the right answer (D-5).
      answer: year ?? surface.get(fold(answer)) ?? answer,
      distractors: pool,
      proof: s,
      beside: besideGap(blanked),
      fitsSection: fitsItsSection(s),
    });
  }
  return out;
}

/** True when the gap stands at the start of its sentence. */
const gapAtStart = (prompt: string): boolean => /^Fill the gap: “_____/.test(prompt);

/**
 * The four options as a student should read them: capitalised when the
 * gap opens the sentence, and otherwise in the article's own spelling,
 * so the odd capital letter never marks the answer (D-5).
 */
function caseForGap(options: readonly string[], atStart: boolean): string[] {
  return options.map((o) =>
    atStart ? o.charAt(0).toUpperCase() + o.slice(1) : o,
  );
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
  extras: QuizExtras = {},
): Question[] {
  const next = rng(seedFrom(`quiz:${article.pack}/${article.id}`));
  const sentences = sentencesOf(article);
  // Place names are fair gaps even when a dictionary calls them adjectives.
  const names = new Set(
    article.pack === 'countries'
      ? allFacts.flatMap((c) => [fold(c.name), ...(c.capital ? [fold(c.capital)] : [])])
      : [],
  );
  const gaps = gapCandidates(
    article,
    sentences,
    termPool,
    posOf,
    names,
    article.pack === 'countries' && allFacts.length > 0 ? placePoolFor(allFacts) : undefined,
    allFacts.length > 0 ? placeSorter(allFacts) : undefined,
  );
  // Outside the countries pack a country or capital in a gap ("_____ and England fought", "Lake _____") has no fair
  // set of wrong answers, and a capital's name can be a lake's (Victoria), so such gaps are not used (26-final-review).
  const placeNames = new Set(allFacts.flatMap((c) => [fold(c.name), ...(c.capital ? [fold(c.capital)] : [])]));
  const terms = gaps.filter((g) => g.kind === 'term' && (article.pack === 'countries' || !placeNames.has(fold(g.answer))));
  const years = gaps.filter((g) => g.kind === 'year');
  const candidates = [
    ...(facts ? factCandidates(article, facts, allFacts, sentences) : []),
    // Named terms make better questions than dates, so they come first, and a
    // sentence that sits oddly under its own heading comes last.
    ...shuffle(terms.filter((g) => g.fitsSection), next),
    ...shuffle(years.filter((g) => g.fitsSection), next),
    ...shuffle(terms.filter((g) => !g.fitsSection), next),
    ...shuffle(years.filter((g) => !g.fitsSection), next),
  ];
  const questions: Question[] = [];
  const usedAnswers = new Set<string>();
  const usedProofs = new Set<string>();
  for (const c of candidates) {
    if (questions.length >= CANDIDATE_LIMIT) break;
    if (usedAnswers.has(fold(c.answer)) || usedProofs.has(c.proof.sentence)) continue;
    const distractors = pickDistractors(c.distractors, c.answer, c.proof.sentence, next);
    if (!distractors) continue;
    const atStart = c.kind === 'term' && gapAtStart(c.prompt);
    const options = caseForGap(shuffle([c.answer, ...distractors], next), atStart);
    const answerText = atStart ? c.answer.charAt(0).toUpperCase() + c.answer.slice(1) : c.answer;
    const answer = options.indexOf(answerText);
    if (answer < 0) continue;
    const wrong = shuffle(options.map((_, i) => i).filter((i) => i !== answer), next);
    const nudge = safeNudge(
      { kind: c.kind, answer: answerText, title: article.title, beside: c.beside, proper: isName(c.answer) },
      options,
    );
    if (!nudge) continue;
    // A cloze question's proof is the very sentence its gap was cut from, so the proof always proves that answer
    // (26-final-review N-3: a "same fact" sentence from elsewhere sometimes proved something else, or a different century).
    const proof = c.proof;
    // Nothing unsuitable for an 8 to 14 year old is put to a child as a question (26-final-review N-2).
    if (unsuitableTopic(`${c.prompt} ${proof.sentence} ${options.join(' ')}`)) continue;
    const q: Question = {
      id: `${article.pack}/${article.id}/${questions.length + 1}`,
      kind: c.kind === 'term' || c.kind === 'year' ? 'cloze' : (c.kind as QuizShape),
      articleId: article.id,
      pack: article.pack,
      prompt: c.prompt,
      options,
      answer,
      hints: {
        nudge,
        whereToLook: whereToLookFor(proof.section, article.title, proof === c.proof ? c.fitsSection : fitsItsSection(proof)),
        removed: [wrong[0] as number, wrong[1] as number],
      },
      proof: proof.sentence,
      proofSection: proof.section,
    };
    if (validateQuestion(q, article).ok) {
      questions.push(q);
      usedAnswers.add(fold(c.answer));
      usedProofs.add(c.proof.sentence);
      usedProofs.add(proof.sentence);
    }
  }
  // New shapes (27-quiz-variety), then a round-robin mix so no quiz is a run of one shape.
  const specs: ShapeSpec[] = [];
  if (facts) specs.push(...countrySpecs(article, facts, allFacts, sentences, next));
  if (extras.events) {
    const first = firstSpec(article, extras.events, next);
    if (first) specs.push(first);
  }
  if (!facts && extras.packTerms) {
    const articleWords = new Set(articleText(article).toLowerCase().match(/[\p{L}]+/gu) ?? []);
    specs.push(...clozeTrueFalse(article, terms, extras.packTerms, articleWords, posOf, next));
  }
  const fresh: Question[] = [];
  const seenShapeAnswer = new Set<string>();
  for (const spec of specs) {
    const q = questionFromSpec(article, spec, next);
    const key = q ? `${q.kind}|${q.prompt}` : '';
    if (q && !seenShapeAnswer.has(key)) {
      seenShapeAnswer.add(key);
      fresh.push(q);
    }
  }
  return mixShapes([...questions, ...fresh], next);
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
 *
 * Each word keeps the spelling the article uses away from the start of a
 * sentence, so "Pyramids" stays a name and "palaces" stays an everyday
 * word, and the four options of a question can be made to match (D-5).
 */
export function autoTerms(article: Pick<Article, 'title' | 'sections'>, max = 60): string[] {
  const paragraphs = article.sections.flatMap((s) => s.paragraphs);
  const counts = new Map<string, number>();
  const caps = new Map<string, number>();
  const plain = new Map<string, number>();
  const bump = (map: Map<string, number>, key: string): void => {
    map.set(key, (map.get(key) ?? 0) + 1);
  };
  /** Whole words only: "Djenné" must not be counted as the word "Djenn". */
  const wholeWords = (text: string): Array<{ word: string; at: number }> =>
    [...text.matchAll(/[A-Za-z][a-z]{4,}/g)]
      .filter((m) => {
        const before = text.charAt((m.index ?? 0) - 1);
        const after = text.charAt((m.index ?? 0) + m[0].length);
        return !/\p{L}/u.test(before) && !/\p{L}/u.test(after);
      })
      .map((m) => ({ word: m[0], at: m.index ?? 0 }));

  for (const sentence of paragraphs.flatMap(splitSentences)) {
    for (const { word, at } of wholeWords(sentence)) {
      // The first word of a sentence is capitalised whatever it is, so it says
      // nothing about whether the word is a name.
      if (at === 0) continue;
      bump(/^[A-Z]/.test(word) ? caps : plain, fold(word));
    }
  }
  for (const { word } of wholeWords(paragraphs.join(' '))) {
    const f = fold(word);
    if (STOPWORDS.has(f) || mentions(article.title, f) || f.endsWith('ing') || f.endsWith('ed')) continue;
    bump(counts, f);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([w]) => ((caps.get(w) ?? 0) > (plain.get(w) ?? 0) ? w.charAt(0).toUpperCase() + w.slice(1) : w));
}

// ---------------------------------------------------------------------------------------------------------------------
// 27-quiz-variety: more question shapes from facts the packs already hold. Every shape is pass-or-drop.
// ---------------------------------------------------------------------------------------------------------------------

/** Extra data a build can hand to `buildQuiz` for the new shapes. */
export interface QuizExtras {
  /** Timeline events, for "who was born first". */
  events?: readonly TimelineEvent[];
  /** Every noun-ish term used anywhere in the article's pack, for the swapped word of a false statement. */
  packTerms?: readonly string[];
}

/** What the generators for one new shape agree on before a question is made. */
interface ShapeSpec {
  shape: QuizShape;
  kind: QuestionKind;
  prompt: string;
  /** The right option. For true or false: 'True' or 'False'. */
  answer: string;
  distractors: string[];
  /** Fact line or article sentence that proves the answer. */
  proof: string;
  proofSection?: string;
  whereToLook: string;
}


const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

/** Countries that Wikidata puts on one continent but that a student could fairly place on two (27 Req 1.2). */
const TRANSCONTINENTAL = new Set(
  [
    'Turkey', 'Russia', 'Egypt', 'Kazakhstan', 'Azerbaijan', 'Georgia', 'Armenia', 'Cyprus', 'Indonesia', 'Panama',
    'Yemen', 'Spain', 'Mexico', 'Iran', 'Chile', 'Papua New Guinea',
  ].map(fold),
);

const withCommas = (n: number): string => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** The first article sentence that names `neighbour` and talks about a border you can walk across (26 N-1). */
function borderSentence(sentences: readonly Located[], neighbour: string): Located | null {
  if (ISLAND_STATES.has(fold(neighbour))) return null;
  return (
    sentences.find(
      (s) =>
        mentions(s.sentence, neighbour) &&
        /\bborder(s|ed|ing)?\b/i.test(s.sentence) &&
        !/\b(water|maritime|sea|ocean|marine)\s+border/i.test(s.sentence) &&
        !/\b(near|across the|causeway|strait|gulf|island)\b/i.test(s.sentence) &&
        !new RegExp(`${neighbour}[^.;]{0,20}disputed|disputed[^.;]{0,20}${neighbour}`, 'i').test(s.sentence),
    ) ?? null
  );
}

const TF_PROMPT = (statement: string): string => `True or false: “${statement}”`;

function countrySpecs(
  article: Article,
  facts: CountryFacts,
  all: readonly CountryFacts[],
  sentences: readonly Located[],
  next: () => number,
): ShapeSpec[] {
  const out: ShapeSpec[] = [];
  const region = regionOf(facts.id, all);
  const others = region.length >= 6 ? region : all.filter((c) => c.id !== facts.id);
  const nameOf = new Map(all.map((c) => [c.id, c.name]));
  const capitalOk =
    !!facts.capital &&
    !isTwoNames(facts.capital) &&
    !all.some((c) => c.id !== facts.id && fold(c.capital ?? '') === fold(facts.capital ?? ''));

  if (facts.capital && capitalOk) {
    out.push({
      shape: 'capital-reverse',
      kind: 'capital-reverse',
      prompt: `Which country has the capital city ${facts.capital}?`,
      answer: facts.name,
      distractors: others.map((c) => c.name),
      proof: `The capital city of ${facts.name} is ${facts.capital}.`,
      whereToLook: 'Look on the Atlas: find the city, then see which country it sits in.',
    });
  }

  if (CONTINENTS.includes(facts.continent) && !TRANSCONTINENTAL.has(fold(facts.name))) {
    out.push({
      shape: 'continent',
      kind: 'continent',
      prompt: `Which continent is ${article.title} in?`,
      answer: facts.continent,
      distractors: CONTINENTS.filter((c) => c !== facts.continent),
      proof: `${facts.name} is in ${facts.continent}.`,
      whereToLook: `Find ${article.title} on the Atlas and see which land mass it sits on.`,
    });
  }

  const money = facts.currency;
  if (money && !/\d/.test(money) && !isTwoNames(money)) {
    const sharing = new Set(all.filter((c) => fold(c.currency ?? '') === fold(money)).map((c) => c.id));
    out.push({
      shape: 'currency',
      kind: 'currency',
      prompt: `What money is used in ${article.title}?`,
      answer: money,
      distractors: [...new Set(others.filter((c) => !sharing.has(c.id)).map((c) => c.currency ?? '').filter(Boolean))],
      proof: `The money used in ${facts.name} is the ${money}.`,
      whereToLook: 'Look in the part of the article about the economy, or at the facts for the country.',
    });
  }

  const area = facts.areaKm2;
  if (area && area > 0) {
    const smaller = others.filter((c) => c.areaKm2 && c.areaKm2 > 0 && c.areaKm2 * 1.25 <= area);
    if (smaller.length >= 3) {
      const three = shuffle(smaller, next).slice(0, 3);
      const rows = [facts, ...three].sort((a, b) => (b.areaKm2 ?? 0) - (a.areaKm2 ?? 0));
      out.push({
        shape: 'largest',
        kind: 'largest',
        prompt: 'Which of these countries covers the most ground?',
        answer: facts.name,
        distractors: three.map((c) => c.name),
        proof: `By area: ${rows.map((c) => `${c.name} about ${withCommas(c.areaKm2 ?? 0)} square kilometres`).join('; ')}.`,
        whereToLook: 'Compare the four on the Atlas. Area means how much ground a country covers.',
      });
    }
  }

  // True or false about the capital: half of the statements swap in another country's capital.
  if (facts.capital && capitalOk) {
    const truth = next() < 0.5;
    const wrong = shuffle(others.map((c) => c.capital ?? '').filter((c) => c && !isTwoNames(c) && fold(c) !== fold(facts.capital ?? '')), next)[0];
    if (truth || wrong) {
      out.push({
        shape: 'truefalse',
        kind: 'truefalse',
        prompt: TF_PROMPT(`The capital city of ${facts.name} is ${truth ? facts.capital : wrong}.`),
        answer: truth ? 'True' : 'False',
        distractors: [],
        proof: `The capital city of ${facts.name} is ${facts.capital}.`,
        whereToLook: `Look in the opening paragraphs of the ${article.title} article, or on the Atlas.`,
      });
    }
  }

  // True or false about a land border: the true one is proved by an article sentence; the false one names a country
  // two or three borders away and the proof lists the real neighbours.
  const realNeighbours = facts.neighbours.map((n) => nameOf.get(n)).filter((n): n is string => !!n);
  if (realNeighbours.length > 0 && !realNeighbours.some((n) => ISLAND_STATES.has(fold(n))) && !ISLAND_STATES.has(fold(facts.name))) {
    const near = nearbyIds(facts.id, all, 1);
    const far = nearbyIds(facts.id, all, 3);
    const farOnly = all.filter((c) => far.has(c.id) && !near.has(c.id) && !ISLAND_STATES.has(fold(c.name)));
    const truth = next() < 0.5;
    const trueN = realNeighbours.find((n) => borderSentence(sentences, n));
    if (truth && trueN) {
      const s = borderSentence(sentences, trueN) as Located;
      out.push({
        shape: 'truefalse',
        kind: 'truefalse',
        prompt: TF_PROMPT(`${facts.name} shares a land border with ${trueN}.`),
        answer: 'True',
        distractors: [],
        proof: s.sentence,
        proofSection: s.section,
        whereToLook: whereToLookFor(s.section, article.title),
      });
    } else if (!truth && farOnly.length > 0 && realNeighbours.length <= 8) {
      const m = shuffle(farOnly, next)[0] as CountryFacts;
      out.push({
        shape: 'truefalse',
        kind: 'truefalse',
        prompt: TF_PROMPT(`${facts.name} shares a land border with ${m.name}.`),
        answer: 'False',
        distractors: [],
        proof: `${facts.name} borders ${realNeighbours.join(', ')}.`,
        whereToLook: 'Look at the Atlas and see which countries touch it.',
      });
    }
  }
  return out;
}

/** "Who was born first?" for an article about a person on the timeline (27 Req 1.7). */
function firstSpec(article: Article, events: readonly TimelineEvent[], next: () => number): ShapeSpec | null {
  const born = (e: TimelineEvent): boolean => / was born on /.test(e.text) && /^\d{4}-/.test(e.date);
  const mine = events.find((e) => born(e) && e.label === article.title);
  if (!mine) return null;
  const year = (e: TimelineEvent): number => Number(e.date.slice(0, 4));
  const pool = events.filter((e) => born(e) && e.label !== mine.label && !mine.label.includes(e.label) && !e.label.includes(mine.label));
  const rank = (e: TimelineEvent): number => (e.subject === mine.subject ? 0 : 1);
  const pick = (list: TimelineEvent[]): TimelineEvent[] => {
    const seen = new Set<number>();
    const distinct = shuffle(list, next).filter((e) => (seen.has(year(e)) ? false : (seen.add(year(e)), true)));
    return distinct.sort((a, b) => rank(a) - rank(b)).slice(0, 3);
  };
  const later = pick(pool.filter((e) => year(e) >= year(mine) + 10));
  const earlier = pick(pool.filter((e) => year(e) <= year(mine) - 10));
  const first = later.length === 3;
  const three = first ? later : earlier;
  if (three.length < 3) return null;
  const rows = [mine, ...three].sort((a, b) => year(a) - year(b));
  return {
    shape: 'first',
    kind: 'first',
    prompt: first ? 'Which of these people was born first?' : 'Which of these people was born most recently?',
    answer: mine.label,
    distractors: three.map((e) => e.label),
    proof: `Born: ${rows.map((e) => `${e.label} in ${year(e)}`).join('; ')}.`,
    whereToLook: 'Look in the Timeline: every entry shows its date.',
  };
}

/** A true or false statement from an article sentence: the sentence itself, or the sentence with one word swapped. */
function clozeTrueFalse(
  article: Article,
  gaps: readonly Candidate[],
  packTerms: readonly string[],
  articleWords: ReadonlySet<string>,
  posOf: PosOf,
  next: () => number,
): ShapeSpec[] {
  const out: ShapeSpec[] = [];
  for (const g of gaps) {
    if (g.kind !== 'term' || !g.fitsSection || g.proof.sentence.length > 150) continue;
    if (/_____/.test(g.proof.sentence)) continue;
    // A statement that opens with a pronoun cannot stand alone without its article.
    if (/^(He|She|It|They|This|These|Those|His|Her|Its|Their|There|Such|However|But|And|Also)\b/.test(g.proof.sentence)) continue;
    let truth = next() < 0.55;
    let statement = g.proof.sentence;
    if (!truth) {
      // A swapped word must come from the pack's vocabulary, never occur in this article, and fit the same slot, so the
      // false statement is false with near certainty (27 Req 1.8). Proper names are never swapped; when no word fits,
      // the sentence is offered as it stands, which is true.
      const swap = isName(g.answer)
        ? undefined
        : shuffle(
            packTerms.filter((t) => !articleWords.has(fold(t)) && sameKind(t, g.answer, posOf) && usableOption(t, g.answer) && t.length > 3),
            next,
          )[0];
      const replaced = swap ? statement.replace(new RegExp(`\\b${g.answer}\\b`, 'i'), swap) : statement;
      if (swap && replaced !== statement) statement = replaced;
      else truth = true;
    }
    out.push({
      shape: 'truefalse',
      kind: 'truefalse',
      prompt: TF_PROMPT(statement),
      answer: truth ? 'True' : 'False',
      distractors: [],
      proof: g.proof.sentence,
      proofSection: g.proof.section,
      whereToLook: whereToLookFor(g.proof.section, article.title, g.fitsSection),
    });
  }
  return out;
}

/** Turns a shape spec into a validated question, or null when it cannot be made cleanly. */
function questionFromSpec(article: Article, spec: ShapeSpec, next: () => number): Question | null {
  if (unsuitableTopic(`${spec.prompt} ${spec.proof} ${spec.answer} ${spec.distractors.join(' ')}`)) return null;
  let options: string[];
  let answer: number;
  let removed: [number, number] | [];
  if (spec.shape === 'truefalse') {
    options = ['True', 'False'];
    answer = spec.answer === 'True' ? 0 : 1;
    removed = [];
  } else {
    const d = pickDistractors(spec.distractors, spec.answer, LISTS_ALL_SHAPES.has(spec.shape) ? '' : spec.proof, next);
    if (!d) return null;
    options = shuffle([spec.answer, ...d], next);
    answer = options.indexOf(spec.answer);
    const wrong = shuffle(options.map((_, i) => i).filter((i) => i !== answer), next);
    removed = [wrong[0] as number, wrong[1] as number];
  }
  const nudge = safeNudge(
    { kind: spec.kind, answer: options[answer] as string, title: article.title, proper: isName(spec.answer) },
    options,
  );
  if (!nudge) return null;
  const q: Question = {
    id: '',
    kind: spec.shape,
    articleId: article.id,
    pack: article.pack,
    prompt: spec.prompt,
    options,
    answer,
    hints: { nudge, whereToLook: spec.whereToLook, removed },
    proof: spec.proof,
    proofSection: spec.proofSection ?? '',
  };
  return validateQuestion(q, article).ok ? q : null;
}

/** Per-shape caps in one quiz of five (27 Req 5.3): no shape more than two of five, which is 40%. */
const SHAPE_ORDER: QuizShape[] = [
  'capital', 'capital-reverse', 'continent', 'largest', 'neighbour', 'currency', 'language', 'first', 'truefalse', 'cloze',
];
const shapeCap = (_shape: QuizShape): number => 2;

/** Mixes candidate questions round-robin across shapes so no quiz is a run of one shape; cloze only fills the rest. */
export function mixShapes(pool: readonly Question[], next: () => number): Question[] {
  const queues = new Map<QuizShape, Question[]>();
  for (const q of pool) {
    const k = q.kind ?? 'cloze';
    queues.set(k, [...(queues.get(k) ?? []), q]);
  }
  const picked: Question[] = [];
  const count = (k: QuizShape): number => picked.filter((q) => (q.kind ?? 'cloze') === k).length;
  const take = (k: QuizShape, ignoreCap: boolean): boolean => {
    const queue = queues.get(k);
    // The same question can arrive from an article sentence and from a fact line; keep one.
    while (queue && queue.length > 0 && picked.some((p) => p.prompt === queue[0]?.prompt)) queue.shift();
    if (!queue || queue.length === 0 || picked.length >= QUIZ_LENGTH) return false;
    if (!ignoreCap && count(k) >= shapeCap(k)) return false;
    picked.push(queue.shift() as Question);
    return true;
  };
  let progress = true;
  while (progress && picked.length < QUIZ_LENGTH) {
    progress = false;
    for (const k of SHAPE_ORDER.filter((s) => s !== 'cloze')) progress = take(k, false) || progress;
  }
  while (take('cloze', false)) {
    /* up to two gap-fill questions */
  }
  for (const k of ['cloze' as QuizShape, ...SHAPE_ORDER]) while (take(k, true)) {
    /* only when the quiz would otherwise be short */
  }
  return shuffle(picked, next).map((q, i) => ({ ...q, id: `${q.pack}/${q.articleId}/${i + 1}` }));
}
