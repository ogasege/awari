/**
 * Picture questions made from the media library (23-media-library Req 20, Property 6): "What is this a picture
 * of?" (or "Which country ...?") with four article titles, built from photographs only. Pure and seeded, so a
 * test can replay any question.
 */
import type { MediaItem } from '../media/media.ts';
import { thumbUrl } from '../media/media.ts';
import type { PackId, Question } from '../packs/types.ts';

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

/** One picture question, or undefined when fewer than four different articles are available. */
export function pictureQuestion(picture: MediaItem, pool: readonly MediaItem[], random: () => number): Question | undefined {
  const pack = picture.article.split('/')[0] ?? '';
  const seen = new Set<string>([norm(picture.articleTitle)]);
  const others: string[] = [];
  for (const m of shuffle(pool, random)) {
    if (m.article === picture.article || seen.has(norm(m.articleTitle))) continue;
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
    prompt: pack === 'countries' ? 'Which country is this a picture of?' : 'What is this a picture of?',
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

/**
 * Up to `count` picture questions from `items`, each from a different article. Photographs and art with a real
 * caption are preferred; maps and flags are used only when nothing else is left.
 */
export function pictureQuestions(items: readonly MediaItem[], count: number, seed: number): Question[] {
  const random = seeded(seed);
  // Only photographs: a painting, map or diagram cannot carry the fact the question asks for (a crescent moon in
  // The Starry Night would make "Moon" a fair answer to a question about something else).
  const photos = items.filter((m) => m.kind === 'photo');
  const ranked = shuffle(photos, random).sort((a, b) => Number(['photo', 'art'].includes(b.kind)) - Number(['photo', 'art'].includes(a.kind)));
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
