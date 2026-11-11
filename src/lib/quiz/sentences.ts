/** Splits article paragraphs into sentences, keeping exact text. */
import type { Article } from '../packs/types.ts';
import { normalise } from './validate.ts';

export interface Located {
  sentence: string;
  section: string;
}

/**
 * Splits a paragraph at sentence ends (. ! ?) followed by a space and a
 * capital letter or digit. Abbreviations like "U.S." stay whole because
 * the next character is not a space-then-capital.
 */
export function splitSentences(paragraph: string): string[] {
  const text = normalise(paragraph);
  if (text === '') return [];
  const out: string[] = [];
  let start = 0;
  const re = /[.!?](?=\s+["“(]?[A-Z0-9])/g;
  for (const m of text.matchAll(re)) {
    const end = (m.index ?? 0) + 1;
    const s = text.slice(start, end).trim();
    if (s) out.push(s);
    start = end;
  }
  const last = text.slice(start).trim();
  if (last) out.push(last);
  return out;
}

/** Every sentence in the article with the heading of its section. */
export function sentencesOf(article: Article): Located[] {
  return article.sections.flatMap((s) =>
    s.paragraphs.flatMap((p) =>
      splitSentences(p).map((sentence) => ({ sentence, section: s.heading })),
    ),
  );
}
