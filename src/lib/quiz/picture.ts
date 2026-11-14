/**
 * Picture questions made from the media library (23-media-library Req 20, Property 6): "What is this a picture
 * of?" (or "Which country ...?") with four article titles of the same kind, built from photographs of one clear subject only. Pure and seeded, so a
 * test can replay any question.
 */
import type { MediaItem } from '../media/media.ts';
import { thumbUrl } from '../media/media.ts';
import type { PackId, Question } from '../packs/types.ts';
import { groupOf } from './groups.ts';

/** A small seeded generator (mulberry32). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

const norm = (s: string): string => s.trim().toLowerCase();

/** Words that mean a picture is not one photograph of one subject: a diagram, chart, map, comparison, artwork or collage. */
const NOT_A_PHOTO = /diagram|chart|graph\b|\bmaps?\b|compar|illustration|artist|concept|render|timeline|infographic|poster|collage|montage|\bmodel\b|schem|\bsizes?\b|logo|stamp|\bcoins?\b|painting|drawing|engraving|sketch|\bscale\b|screenshot|simulat|animation|\bvs\.?\b|\bversus\b|\bcomposite\b|panorama|\bsatellite\b|infrared|ultraviolet|spectrum|\bimage of the\b.*\band\b/i;

/** The words of an article title that a caption should contain (four letters or more, the first five letters of each). */
function titleStems(title: string): string[] {
  return (title.toLowerCase().match(/[\p{L}]{4,}/gu) ?? []).filter((w) => !['mount', 'river', 'lake', 'ocean', 'great', 'republic', 'islands'].includes(w)).map((w) => w.slice(0, 5));
}

/**
 * Whether a picture can carry a picture question (24-review-4 Req 7, Property 2): a photograph of one clear subject
 * (not a diagram, map, chart, comparison, artwork or collage; not a wide panorama), of an article that has a group,
 * whose caption names the subject, so the answer is the picture's own article and not just something in the frame.
 */
export function isQuizPhoto(m: Pick<MediaItem, 'kind' | 'article' | 'articleTitle' | 'caption' | 'title' | 'tw' | 'th'>): boolean {
  if (m.kind !== 'photo' || !groupOf(m.article)) return false;
  const ratio = m.tw / Math.max(1, m.th);
  if (ratio < 0.55 || ratio > 2.1) return false;
  if (NOT_A_PHOTO.test(`${m.caption} ${m.title}`)) return false;
  const stems = titleStems(m.articleTitle);
  const caption = m.caption.toLowerCase();
  return stems.length === 0 || stems.some((s) => caption.includes(s));
}

/**
 * One picture question, or undefined when the picture does not qualify or fewer than three other articles of the same
 * kind are available. The wrong answers are other articles of the same group (all planets, all animals, all
 * landmarks), taken from `pool`.
 */
export function pictureQuestion(picture: MediaItem, pool: readonly MediaItem[], random: () => number): Question | undefined {
  const group = groupOf(picture.article);
  if (!group || !isQuizPhoto(picture)) return undefined;
  const pack = picture.article.split('/')[0] ?? '';
  const seen = new Set<string>([norm(picture.articleTitle)]);
  const others: string[] = [];
  for (const m of shuffle(pool, random)) {
    if (m.article === picture.article || seen.has(norm(m.articleTitle)) || groupOf(m.article)?.id !== group.id) continue;
    seen.add(norm(m.articleTitle));
    others.push(m.articleTitle);
    if (others.length === 3) break;
  }
  if (others.length < 3) return undefined;
  const options = shuffle([picture.articleTitle, ...others], random);
  const answer = options.indexOf(picture.articleTitle);
  const wrong = options.map((_, i) => i).filter((i) => i !== answer);
  const removed: [number, number] = [wrong[0] as number, wrong[1] as number];
  return {
    id: `picture/${picture.id}`,
    articleId: picture.article.split('/')[1] ?? picture.article,
    pack: pack as PackId,
    prompt: group.prompt,
    options,
    answer,
    hints: {
      nudge: `The answer starts with “${picture.articleTitle.charAt(0)}” and has ${picture.articleTitle.length} letters.`,
      whereToLook: 'Look at the colours, the shapes and the place. What would someone write a page about?',
      removed,
    },
    proof: `The picture is “${picture.caption}” (${picture.author || 'unknown author'}, ${picture.licence}, Wikimedia Commons).`,
    proofSection: '',
    image: { src: thumbUrl(picture.thumb), alt: 'A picture to name. Choose what it shows.' },
  };
}

/** Up to `count` picture questions from `items`, each from a different article, each from a photograph that qualifies. */
export function pictureQuestions(items: readonly MediaItem[], count: number, seed: number): Question[] {
  const random = seeded(seed);
  const ranked = shuffle(items.filter(isQuizPhoto), random);
  const out: Question[] = [];
  const articles = new Set<string>();
  for (const m of ranked) {
    if (out.length >= count) break;
    if (articles.has(m.article)) continue;
    const q = pictureQuestion(m, items, random);
    if (q) {
      out.push(q);
      articles.add(m.article);
    }
  }
  return out;
}

/** Puts `extra` questions into `pool`, one after every `every` questions, keeping the order of both. */
export function weave(pool: readonly Question[], extra: readonly Question[], every = 3): Question[] {
  const out: Question[] = [];
  let next = 0;
  pool.forEach((q, i) => {
    out.push(q);
    if ((i + 1) % every === 0 && extra[next]) out.push(extra[next++] as Question);
  });
  while (next < extra.length) out.push(extra[next++] as Question);
  return out;
}
