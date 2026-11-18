/**
 * The content-pack contract shared by the build pipeline
 * (`scripts/packs`), the app and the quiz Lambda. Every record that
 * reaches a student carries a `Source` naming where it came from and
 * under which licence.
 */

import type { BundledPackId } from './subjects.ts';

/** Licences Awari accepts for bundled content. */
export type Licence =
  | 'CC BY-SA 4.0'
  | 'CC BY-SA 3.0'
  | 'CC BY-SA 2.5'
  | 'CC BY-SA 2.0'
  | 'CC BY 4.0'
  | 'CC BY 3.0'
  | 'CC BY 2.5'
  | 'CC BY 2.0'
  | 'CC0'
  | 'Public domain';

/** Where a record came from and how it may be reused. */
export interface Source {
  /** Human name, e.g. "Simple English Wikipedia: Nigeria". */
  name: string;
  /** Canonical page for the record (article, entity, file page). */
  url: string;
  licence: Licence;
  licenceUrl: string;
  /** Author or rights holder, required for photos. */
  author?: string;
  /** ISO date (YYYY-MM-DD) the data was fetched, or the release date. */
  retrieved: string;
}

/** The packs Awari ships, plus `wiki` for articles loaded on demand. */
export type PackId = BundledPackId | 'wiki';

/** A photo shown as a physical print. Paths are relative to `/packs/`. */
export interface Photo {
  /** e.g. "img/nigeria-1.jpg"; served from `/packs/img/nigeria-1.jpg`. */
  file: string;
  width: number;
  height: number;
  /** Plain description for screen readers. */
  alt: string;
  /** Short handwritten caption (a few words). */
  caption: string;
  credit: Source;
}

export interface ArticleSection {
  /** Empty string for the lead section. */
  heading: string;
  paragraphs: string[];
}

/**
 * A handwritten margin note. A `fact` note must be backed by `proof`, an
 * exact sentence from the article it sits beside.
 */
export interface MarginNote {
  kind: 'fact' | 'question';
  text: string;
  /** Exact sentence from the article that backs a fact. */
  proof?: string;
}

export interface Article {
  /** URL slug, unique within the pack, e.g. "nigeria". */
  id: string;
  pack: PackId;
  title: string;
  /** First sentence or two, for cards and the atlas. */
  summary: string;
  sections: ArticleSection[];
  photos: Photo[];
  notes: MarginNote[];
  /** Wikidata QID when the article has one, e.g. "Q1033". */
  qid?: string;
  source: Source;
}

/** Facts about a country from Wikidata. */
export interface CountryFacts {
  /** Same slug as the country's article. */
  id: string;
  qid: string;
  name: string;
  /** ISO 3166-1 alpha-3, used to join with Natural Earth shapes. */
  iso3: string;
  continent: string;
  capital?: string;
  population?: number;
  /** Year the population figure refers to. */
  populationYear?: number;
  areaKm2?: number;
  currency?: string;
  languages: string[];
  /** ISO date of independence or inception, when known. */
  independence?: string;
  /** Slugs of neighbouring countries. */
  neighbours: string[];
  source: Source;
}

/** One entry in a pack index, enough to list and link an article. */
export interface PackIndexItem {
  id: string;
  title: string;
  summary: string;
  /** Thumbnail photo path relative to `/packs/`, if any. */
  thumb?: string;
  /** For countries: continent name, used by the stamp book. */
  continent?: string;
}

/** `/packs/<pack>/index.json`. Articles live at `/packs/<pack>/<id>.json`. */
export interface PackIndex {
  pack: PackId;
  title: string;
  items: PackIndexItem[];
  sources: Source[];
}

/** `/packs/countries/facts.json`: facts for every country on the globe. */
export interface FactsPack {
  countries: CountryFacts[];
  source: Source;
}

/** One sense of a word from Open English WordNet. */
export interface WordSense {
  /** n, v, a (adjective), s (satellite adjective), r (adverb). */
  pos: 'n' | 'v' | 'a' | 's' | 'r';
  gloss: string;
  example?: string;
}

/**
 * `/packs/dictionary/<shard>.json`, where `<shard>` is the first letter
 * of the lemma (a–z) or `other`. Maps lowercase lemma to its senses.
 */
export interface DictionaryShard {
  shard: string;
  entries: Record<string, WordSense[]>;
  source: Source;
}

/** The three-step hint ladder for one question. */
export interface HintLadder {
  /** Step 1: a gentle nudge that does not give the answer away. */
  nudge: string;
  /** Step 2: which section of the article to read. */
  whereToLook: string;
  /** Step 3: indexes of the two wrong options to remove. */
  removed: [number, number] | [];
}

/** The shape of a question (27-quiz-variety). A missing `kind` means fill-the-gap, so older files load unchanged. */
export type QuizShape =
  | 'cloze'
  | 'capital'
  | 'capital-reverse'
  | 'continent'
  | 'currency'
  | 'language'
  | 'neighbour'
  | 'largest'
  | 'first'
  | 'truefalse'
  | 'picture';

export interface Question {
  id: string;
  /** What kind of question this is; missing means fill-the-gap. */
  kind?: QuizShape;
  articleId: string;
  pack: PackId;
  prompt: string;
  /** Exactly four options. */
  options: string[];
  /** Index of the correct option. */
  answer: number;
  hints: HintLadder;
  /** Exact sentence from the article that proves the answer. */
  proof: string;
  /** Heading of the section the proof sentence is in ("" for the lead). */
  proofSection: string;
  /** A picture to look at before answering (picture questions from the media library). */
  image?: { src: string; alt: string };
}

/** `/packs/quizzes/<pack>/<articleId>.json`: five questions. */
export interface QuizSet {
  articleId: string;
  pack: PackId;
  title: string;
  questions: Question[];
  source: Source;
}

/** Subjects a timeline event can be filtered by: the bundled pack ids. */
export type TimelineSubject = BundledPackId;

export interface TimelineEvent {
  /** Wikidata QID of the event or subject. */
  id: string;
  /** ISO date YYYY-MM-DD (years are CE). */
  date: string;
  label: string;
  /** One short sentence saying what happened. */
  text: string;
  subject: TimelineSubject;
  /** Continent of the event or person, when Wikidata or a curator names one. */
  continent?: string;
  /** Optional link into a pack article, e.g. "countries/angola". */
  link?: string;
  source: Source;
}

/** `/packs/timeline.json`. */
export interface TimelinePack {
  events: TimelineEvent[];
  source: Source;
}
