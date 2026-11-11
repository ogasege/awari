/**
 * Derives handwritten margin notes from an article. A note is always an
 * article sentence quoted word for word (only its final full stop becomes
 * "!"), so it can never say more than the sentence it is proved by.
 */
import type { ArticleSection, MarginNote } from '../../src/lib/packs/types.ts';
import { splitSentences } from './text.ts';

/** Notes per article, at most. */
export const MAX_NOTES = 2;

/** Notes must be shorter than this many characters. */
export const NOTE_LIMIT = 70;

const PRONOUN_START =
  /^(it|its|it's|they|their|them|this|these|that|those|he|she|his|her|there|we|our|you|your|one)\b/i;
const BRACKETS_OR_QUOTES = /[()[\]{}"“”‘’«»]/;

/** The note text for a proof sentence, or null when it does not qualify. */
export function noteFor(sentence: string): string | null {
  if (
    !sentence.endsWith('.') ||
    !/\d/.test(sentence) ||
    PRONOUN_START.test(sentence) ||
    BRACKETS_OR_QUOTES.test(sentence) ||
    sentence.split(' ').length < 4 ||
    !/^[A-Z]/.test(sentence)
  ) {
    return null;
  }
  const text = `${sentence.slice(0, -1)}!`;
  return text.length < NOTE_LIMIT ? text : null;
}

/** Up to two fact notes, taken from sentences in reading order. */
export function deriveNotes(sections: readonly ArticleSection[]): MarginNote[] {
  const notes: MarginNote[] = [];
  for (const section of sections) {
    for (const paragraph of section.paragraphs) {
      for (const sentence of splitSentences(paragraph)) {
        const text = noteFor(sentence);
        if (text && !notes.some((n) => n.proof === sentence)) {
          notes.push({ kind: 'fact', text, proof: sentence });
          if (notes.length === MAX_NOTES) {
            return notes;
          }
        }
      }
    }
  }
  return notes;
}
