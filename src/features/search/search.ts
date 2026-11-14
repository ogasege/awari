/**
 * Pure search over the bundled packs (13-search). Runs on the device, so
 * it works offline.
 */
import { withoutCoordinates } from '../../lib/text/coordinates.ts';

export { withoutCoordinates };

export type DocKind = 'article' | 'event';

export interface SearchDoc {
  kind: DocKind;
  /** Unique within its kind. */
  id: string;
  title: string;
  /** Summary or sentence searched beside the title. */
  text: string;
  /** In-app path of the result. */
  to: string;
}

export interface SearchHit extends SearchDoc {
  score: number;
}

/** Lowercase words of a query, without punctuation. */
export function tokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t !== '');
}

function scoreWord(word: string, title: string, text: string): number {
  if (title === word || title.startsWith(word)) {
    return 10;
  }
  if (title.includes(word)) {
    return 6;
  }
  return text.includes(word) ? 2 : 0;
}

/**
 * Documents that contain every query word in their title or text, best
 * first: by score, then alphabetically by title, then by id.
 */
export function searchDocs(docs: readonly SearchDoc[], query: string): SearchHit[] {
  const words = tokens(query);
  if (words.length === 0) {
    return [];
  }
  const hits: SearchHit[] = [];
  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const text = doc.text.toLowerCase();
    let score = 0;
    let all = true;
    for (const w of words) {
      const s = scoreWord(w, title, text);
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (all) {
      hits.push({ ...doc, score });
    }
  }
  return hits.sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title) || a.id.localeCompare(b.id),
  );
}

/**
 * A short piece of `text` for a search result (22-review-3 Req 13): around
 * the first query word, starting at a word boundary, ending at the end of a
 * sentence when one fits and otherwise at a word with an ellipsis, and with
 * no coordinate strings.
 */
export function snippetOf(text: string, query: string, max = 160): string {
  const clean = withoutCoordinates(text);
  if (clean.length <= max) {
    // A summary that stops without a full stop is marked as cut.
    return /[.!?:)"”’']$/.test(clean) || clean === '' ? clean : `${clean}…`;
  }
  const lower = clean.toLowerCase();
  const at = tokens(query)
    .map((w) => lower.indexOf(w))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  let start = 0;
  if (at !== undefined && at > max / 3) {
    // Begin at the start of the sentence holding the match, else at a word.
    const sentence = Math.max(clean.lastIndexOf('. ', at), clean.lastIndexOf('! ', at), clean.lastIndexOf('? ', at));
    start = sentence >= 0 && at - sentence < max ? sentence + 2 : at;
    if (start === at && start > 0) {
      const space = clean.lastIndexOf(' ', at);
      start = space >= 0 && at - space < 40 ? space + 1 : at;
    }
  }
  let body = clean.slice(start);
  if (body.length > max) {
    const window = body.slice(0, max);
    const stop = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
    if (stop >= max * 0.5) {
      body = window.slice(0, stop + 1);
      return `${start > 0 ? '… ' : ''}${body}`;
    }
    const space = window.lastIndexOf(' ');
    body = `${window.slice(0, space > 0 ? space : max).replace(/[\s,;:(–-]+$/, '')}…`;
  }
  return `${start > 0 ? '… ' : ''}${body}`;
}
