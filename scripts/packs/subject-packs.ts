/**
 * Builds the nine subject packs (15-subject-packs): for each pack it goes
 * through the curated candidates in order and keeps the first TARGET that
 * have enough text, a licence-checked Commons photo and a quiz of at
 * least three valid questions. Everything skipped is reported with its
 * reason, so a weak candidate never slips in and a pack that falls short
 * fails the build.
 */
import type { Article, PackIndex, PackIndexItem } from '../../src/lib/packs/types.ts';
import { SUBJECT_PACKS, subjectById, type SubjectPackId } from '../../src/lib/packs/subjects.ts';
import { autoTerms, buildQuiz } from '../../src/lib/quiz/generate.ts';
import { buildArticle } from './articles.ts';
import { type PhotoCredit } from './credits.ts';
import { PHOTO_OVERRIDES } from './photo-overrides.ts';
import { choosePhoto } from './photos.ts';
import { SUBJECT_TOPICS, TARGET, TARGETS, type SubjectTopic } from './subject-topics.ts';
import { wikipediaPackSource } from './sources.ts';

/** Fewest and most articles a subject pack may have (Req 1.1). */
export const MIN_ARTICLES = 25;
export const MAX_ARTICLES = 35;
/** Shortest article text worth a page, in characters. */
export const MIN_TEXT = 1200;

export interface BuiltSubject {
  articles: Article[];
  /** Timeline marker by article id, from the topic list. */
  events: Map<string, SubjectTopic['event']>;
  skipped: Array<{ title: string; reason: string }>;
}

function textLength(a: Article): number {
  return a.sections.reduce((n, s) => n + s.paragraphs.join(' ').length, 0);
}

/** Tries one candidate; returns the article or the reason it was skipped. */
async function tryTopic(
  pack: SubjectPackId,
  topic: SubjectTopic,
  staging: string,
  credits: PhotoCredit[],
): Promise<Article | string> {
  let article: Article;
  try {
    article = await buildArticle(pack, topic.title);
  } catch (error) {
    return `no usable Simple English article (${String((error as Error).message).slice(0, 60)})`;
  }
  if (textLength(article) < MIN_TEXT) {
    return `too short (${textLength(article)} characters)`;
  }
  if (buildQuiz(article, undefined, [], autoTerms(article)).length < 3) {
    return 'fewer than three valid quiz questions';
  }
  let chosen;
  try {
    chosen = await choosePhoto(
      {
        slug: `${pack}-${article.id}`,
        title: article.title,
        wikiTitle: topic.title,
        pack,
        queries: [topic.photoQuery ?? topic.title],
        override: PHOTO_OVERRIDES.get(`${pack}/${article.id}`),
      },
      staging,
    );
  } catch (error) {
    return `photo override failed (${String((error as Error).message).slice(0, 60)})`;
  }
  if (!chosen) {
    return 'no acceptable Commons photo';
  }
  credits.push({ path: `packs/${chosen.photo.file}`, subject: article.title, photo: chosen.photo });
  return { ...article, photos: [chosen.photo] };
}

/** Builds one subject pack from its candidate list. */
export async function buildSubjectPack(
  pack: SubjectPackId,
  staging: string,
  credits: PhotoCredit[],
  log: (message: string) => void,
): Promise<BuiltSubject> {
  const articles: Article[] = [];
  const events = new Map<string, SubjectTopic['event']>();
  const skipped: BuiltSubject['skipped'] = [];
  const ids = new Set<string>();
  for (const topic of SUBJECT_TOPICS[pack]) {
    if (articles.length >= (TARGETS[pack] ?? TARGET)) {
      break;
    }
    const result = await tryTopic(pack, topic, staging, credits);
    if (typeof result === 'string') {
      skipped.push({ title: topic.title, reason: result });
      log(`  ${pack}: skipped "${topic.title}": ${result}`);
      continue;
    }
    if (ids.has(result.id)) {
      skipped.push({ title: topic.title, reason: `repeats ${result.id}` });
      credits.pop();
      continue;
    }
    ids.add(result.id);
    articles.push(result);
    events.set(result.id, topic.event);
  }
  if (articles.length < MIN_ARTICLES) {
    throw new Error(
      `Subject pack "${pack}" has only ${articles.length} usable articles (needs ${MIN_ARTICLES}). ` +
        `Skipped: ${skipped.map((s) => `${s.title} (${s.reason})`).join('; ')}. Add candidates to subject-topics.ts.`,
    );
  }
  return { articles, events, skipped };
}

/** The pack index for a built subject pack. */
export function subjectIndex(pack: SubjectPackId, articles: readonly Article[], retrieved: string): PackIndex {
  const subject = subjectById(pack);
  const items: PackIndexItem[] = articles.map((a) => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    ...(a.photos[0] ? { thumb: a.photos[0].file } : {}),
  }));
  return {
    pack,
    title: subject?.name ?? pack,
    items,
    sources: [wikipediaPackSource(retrieved)],
  };
}

export { SUBJECT_PACKS };
