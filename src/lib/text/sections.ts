/**
 * Pure text helpers that turn a Simple English Wikipedia plain-text
 * extract into article sections, sentences and a summary.
 */
import type { ArticleSection } from '../packs/types.ts';

/** Section headings that are never bundled (compared in lower case). */
export const DROPPED_HEADINGS: ReadonlySet<string> = new Set([
  'related pages',
  'references',
  'other websites',
  'notes',
  'sources',
  'see also',
  'external links',
  'further reading',
  'footnotes',
  'bibliography',
  'citations',
  'gallery',
]);

const HEADING = /^(={2,})\s*(.+?)\s*\1$/;

/** Collapses runs of whitespace to one space and trims. */
export function collapseSpaces(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * True for a line that is a broken rendering of a formula, such as
 * "I=VRorV=IRorR=VI." or a stray `{\displaystyle …}`.
 */
export function isBrokenFormula(line: string): boolean {
  if (line.includes('{\\displaystyle')) {
    return true;
  }
  const spaces = line.match(/ /g)?.length ?? 0;
  return line.includes('=') && spaces < 3;
}

/**
 * Splits an extract into sections at its `==` headings. The lead has an
 * empty heading. Dropped headings take their sub-sections with them;
 * sections left without paragraphs are removed.
 */
export function splitSections(extract: string): ArticleSection[] {
  const sections: ArticleSection[] = [{ heading: '', paragraphs: [] }];
  let dropLevel = 0;
  for (const raw of extract.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1]?.length ?? 2;
      const title = collapseSpaces(heading[2] ?? '');
      if (dropLevel > 0 && level > dropLevel) {
        continue;
      }
      dropLevel = 0;
      if (DROPPED_HEADINGS.has(title.toLowerCase())) {
        dropLevel = level;
        continue;
      }
      sections.push({ heading: title, paragraphs: [] });
      continue;
    }
    if (dropLevel > 0 || line === '' || isBrokenFormula(line)) {
      continue;
    }
    sections.at(-1)?.paragraphs.push(collapseSpaces(line));
  }
  return sections.filter((s) => s.paragraphs.length > 0);
}

/** Abbreviations after which a full stop does not end a sentence. */
const ABBREVIATIONS = new Set([
  'mr',
  'mrs',
  'ms',
  'dr',
  'st',
  'mt',
  'u.s',
  'u.k',
  'e.g',
  'i.e',
  'etc',
  'c',
  'ca',
  'no',
  'vs',
  'jr',
  'sr',
]);

/**
 * Splits a paragraph into sentences. A sentence ends at ".", "!" or "?"
 * followed by whitespace and an upper-case letter, digit or opening
 * quote, unless the full stop closes a known abbreviation or a single
 * initial. Every returned sentence is an exact substring of the input.
 */
export function splitSentences(paragraph: string): string[] {
  const out: string[] = [];
  const boundary = /[.!?]["”’)]?(?=\s+["“‘(]?[A-Z0-9])/g;
  let start = 0;
  for (const match of paragraph.matchAll(boundary)) {
    const end = (match.index ?? 0) + match[0].length;
    const before = paragraph.slice(start, match.index);
    const lastWord = (/([A-Za-z.]+)$/.exec(before)?.[1] ?? '').toLowerCase();
    if (
      match[0].startsWith('.') &&
      (ABBREVIATIONS.has(lastWord) || /^[a-z]$/.test(lastWord))
    ) {
      continue;
    }
    const sentence = paragraph.slice(start, end).trim();
    if (sentence !== '') {
      out.push(sentence);
    }
    start = end;
  }
  const rest = paragraph.slice(start).trim();
  if (rest !== '') {
    out.push(rest);
  }
  return out;
}

/** The first one or two sentences of the lead, at most `max` chars. */
export function summarise(sections: ArticleSection[], max = 300): string {
  const lead = sections[0]?.paragraphs[0] ?? '';
  const sentences = splitSentences(lead);
  const first = sentences[0] ?? '';
  const two = sentences.slice(0, 2).join(' ');
  if (two.length <= max) {
    return two;
  }
  if (first.length <= max) {
    return first;
  }
  return `${first.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/** All paragraphs of an article joined, for substring checks. */
export function articleText(sections: ArticleSection[]): string {
  return sections.map((s) => s.paragraphs.join('\n')).join('\n');
}
