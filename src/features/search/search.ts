/**
 * Pure search over the bundled packs (13-search). Runs on the device, so
 * it works offline.
 */

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
