/**
 * Lead cleaning for Simple English Wikipedia extracts (26-final-review
 * D-17 to D-22). The plain-text extract drops the audio, IPA and
 * native-name templates but keeps their brackets and labels, so the
 * first thing a student read was often noise:
 *
 *   "Cape Verde ( ()) or Cabo Verde ( (), ) (Portuguese: Cabo Verde,
 *    pronounced: [ˈkabu ˈveɾdɨ]), officially the Republic of Cabo Verde,
 *    is an island country in Africa."
 *
 * Every rule here only ever *removes* material that the stripped
 * templates left behind, or joins a paragraph the extract split in the
 * middle of a sentence. No fact and no wording is invented, so the text
 * stays the Simple English Wikipedia text under CC BY-SA 4.0.
 */
import type { ArticleSection } from '../packs/types.ts';
import { splitSentences } from './sections.ts';

/** A citation marker the extract left in: "in Southeast Asia.[4]". */
const CITATION = /\[\d{1,3}\]/g;

/**
 * Scripts an English reader cannot sound out (Greek to Khmer, CJK,
 * Hangul, Arabic presentation forms, and anything above the BMP such as
 * Adlam). Latin Extended Additional (U+1E00–U+1EFF, Vietnamese) and
 * general punctuation are deliberately outside the ranges.
 */
const NON_LATIN =
  /[\u0370-\u1DFF\u2C00-\u2DFF\u2E80-\uA6FF\uA800-\uABFF\uAC00-\uD7FF\uF900-\uFDFF\uFE70-\uFEFF\uFF00-\uFFEF]|[\u{10000}-\u{10FFFF}]/u;

/** A run of non-Latin characters, with the spaces between them. */
const NON_LATIN_RUN = new RegExp(`(?:${NON_LATIN.source})(?:[\\s\u00A0]*(?:${NON_LATIN.source}))*`, 'gu');

/**
 * Letters only the International Phonetic Alphabet uses: IPA
 * Extensions (ɡ, ʋ, ɨ) and the spacing modifiers (ˈ, ˌ, ː, ʰ).
 */
const IPA_CHARS = /[\u0250-\u02FF]/u;

/** A bracketed transcription: "[ˈkabu ˈveɾdɨ]" but not "[4]" or "[see]". */
const BRACKETED = /\[[^[\]]*\]/g;
/** A slashed transcription: "/ˈkɒsəvoʊ/". */
const SLASHED = /\/[^/]{2,}\//g;

/** A label that introduces a name, spelling or transcription. */
const LABEL = /^\s*\p{L}[\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*){0,3}\s*:/u;
/** The same without a colon: "pronounced [ˈpraha]", "Romanized as Nihon". */
const TRANSCRIPTION =
  /^\s*(?:pronounced|pronunciation|ipa|rtgs|pinyin|romani[sz]ed|romani[sz]ation|transliterated|transliteration|lit\.?|literally\s+["“]|audio|listen)\b/i;

/** An etymology bracket: "(from the Ancient Greek τῆλε, tele "far" …)". */
const ETYMOLOGY =
  /^\s*(?:from|derived from|short for|after)\b[^)]{0,100}?\b(?:greek|latin|sanskrit|arabic|hebrew|chinese|japanese|persian|hindi|french|german|italian|spanish|portuguese|russian|turkish|egyptian|ge'ez|nahuatl|swahili)\b/i;

/**
 * A pronunciation respelling: a hyphenated token with a shouted
 * syllable, such as "al-BAY-nee-ə", "nah-OO-roo" or "TY-land".
 */
const RESPELLING =
  /\p{L}*[A-Z]{2,}\p{L}*(?:-\p{L}+)+|\p{L}+(?:-\p{L}*[A-Z]{2,}\p{L}*)+/u;

/** Words that carry no meaning on their own inside a bracket. */
const FILLER = new Set([
  'or',
  'and',
  'listen',
  'help',
  'info',
  'audio',
  'english',
  'uk',
  'us',
  'also',
  'see',
  'in',
]);

/** A finite verb: a segment with one is a clause, never a name label. */
const HAS_VERB = /\b(?:is|are|was|were|has|have|had|became|makes|make|means|mean|lies|lie|sits|sit|stands|stand|covers|cover)\b/i;

/** True when `text` holds a transcription in brackets or slashes. */
function hasTranscription(text: string): boolean {
  for (const match of [...text.matchAll(BRACKETED), ...text.matchAll(SLASHED)]) {
    if (IPA_CHARS.test(match[0])) {
      return true;
    }
  }
  return false;
}

/** The letters of `text` as lower-case words, punctuation dropped. */
function letterWords(text: string): string[] {
  return text
    .replace(/[^\p{L}\s]/gu, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '');
}

/**
 * True for a piece of a bracket that only ever held a native name, a
 * transcription or the remains of a stripped template. A piece with a
 * finite verb in it is a clause and is always kept.
 */
export function isNameNoise(segment: string): boolean {
  const text = segment.trim();
  if (text === '' || !/\p{L}|\d/u.test(text)) {
    return true; // "", ";", "( )," — what a stripped template left
  }
  if (HAS_VERB.test(text)) {
    return false;
  }
  if (NON_LATIN.test(text) || hasTranscription(text) || IPA_CHARS.test(text)) {
    return true;
  }
  if (TRANSCRIPTION.test(text) || LABEL.test(text)) {
    return true;
  }
  const words = letterWords(text);
  if (words.length > 0 && !/\d/.test(text) && words.every((w) => FILLER.has(w))) {
    return true;
  }
  return words.length <= 4 && !/\d/.test(text) && RESPELLING.test(text);
}

/** Removes transcriptions and native scripts from a piece that is kept. */
function tidyKept(segment: string): string {
  return segment
    .replace(BRACKETED, (m) => (IPA_CHARS.test(m) ? '' : m))
    .replace(SLASHED, (m) => (IPA_CHARS.test(m) ? '' : m))
    .replace(NON_LATIN_RUN, '')
    .replace(TRANSCRIPTION, '')
    .trim();
}

interface Segment {
  /** The "," or ";" in front of this piece ("" for the first). */
  separator: string;
  text: string;
}

/**
 * Splits bracket content on the "," and ";" that are not nested. A
 * comma between digits belongs to a number ("3,287,612 sq mi") and is
 * not a separator. `text` keeps its original spacing so that content
 * nothing was dropped from can be rebuilt character for character.
 */
function segments(content: string): Segment[] {
  const out: Segment[] = [];
  let depth = 0;
  let start = 0;
  let separator = '';
  for (let i = 0; i < content.length; i += 1) {
    const c = content[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
    else if (
      (c === ',' || c === ';') &&
      depth === 0 &&
      !(c === ',' && /\d/.test(content[i - 1] ?? '') && /\d/.test(content[i + 1] ?? ''))
    ) {
      out.push({ separator, text: content.slice(start, i) });
      separator = c;
      start = i + 1;
    }
  }
  out.push({ separator, text: content.slice(start) });
  return out;
}

/**
 * The pieces of bracket content worth keeping. A piece that follows a
 * dropped label and is one or two words long is part of the same list
 * of names ("old spelling: Rumania, Roumania") and goes with it.
 */
function keptSegments(content: string): Segment[] {
  const kept: Segment[] = [];
  let droppedLabel = false;
  for (const segment of segments(content)) {
    const noise = isNameNoise(segment.text);
    const continuation =
      droppedLabel &&
      !HAS_VERB.test(segment.text) &&
      !/\d/.test(segment.text) &&
      letterWords(segment.text).length <= 2;
    if (noise || continuation) {
      droppedLabel = noise && LABEL.test(segment.text.trim());
      continue;
    }
    droppedLabel = false;
    const tidied = tidyKept(segment.text);
    const space = /^\s*/.exec(segment.text)?.[0] ?? '';
    kept.push({ ...segment, text: tidied === '' ? '' : `${space}${tidied}` });
  }
  return kept.filter((s) => s.text.trim() !== '');
}

/** Rebuilds bracket content from the pieces that were kept. */
function rejoin(kept: readonly Segment[]): string {
  return kept
    .map((s, i) => (i === 0 ? s.text.trim() : `${s.separator}${s.text.replace(/\s+$/, '')}`))
    .join('')
    .trim();
}

/** Tidies the punctuation a removal left behind. */
function tidy(text: string): string {
  let out = text;
  let previous = '';
  while (out !== previous) {
    previous = out;
    out = out
      .replace(/\(\s*[,;:/]*\s*\)/g, '')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s+([,;.:!?])(?=\s|$)/g, '$1')
      .replace(/([,;])\s*[,;]/g, '$1')
      .replace(/([(,;])\s*([,;])/g, '$1')
      .replace(/\s{2,}/g, ' ');
  }
  return out.replace(/^[\s,;:]+/, '').trim();
}

/**
 * Punctuation that only makes sense with the names that have gone:
 * "Chad, is a landlocked country" and "Mali, officially the Republic of
 * Mali; is a landlocked country". Only applied to a lead something was
 * removed from, so that an article's own missing comma is left alone.
 */
function repairPunctuation(text: string): string {
  const verb = '(?:is|are|was|were|has|have|had)';
  return text
    .replace(new RegExp(`^([^,]{1,80}),\\s+(${verb})\\b`), '$1 $2')
    .replace(new RegExp(`;\\s+(?=${verb}\\b)`, 'g'), ' ');
}

/** The bracket positions the extract left without a partner. */
function unmatched(text: string): { openers: number[]; closers: number[] } {
  const openers: number[] = [];
  const closers: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '(') openers.push(i);
    else if (text[i] === ')') {
      if (openers.length > 0) openers.pop();
      else closers.push(i);
    }
  }
  return { openers, closers };
}

/** Replaces every balanced bracket, innermost first, with what is kept. */
function balancedPass(text: string): string {
  let out = text;
  let changed = true;
  while (changed) {
    changed = false;
    let depth = 0;
    let open = -1;
    for (let i = 0; i < out.length; i += 1) {
      const c = out[i];
      if (c === '(') {
        if (depth === 0) open = i;
        depth += 1;
      } else if (c === ')' && depth > 0) {
        depth -= 1;
        if (depth === 0 && open >= 0) {
          const content = out.slice(open + 1, i);
          const kept = ETYMOLOGY.test(content) ? [] : keptSegments(content);
          const replacement = kept.length === 0 ? '' : `(${rejoin(kept)})`;
          const before = out.slice(0, open).replace(/ $/, replacement === '' ? '' : ' ');
          const next = `${before}${replacement}${out.slice(i + 1)}`;
          if (next !== out) {
            out = next;
            changed = true;
            break;
          }
        }
      }
    }
  }
  return out;
}

/**
 * Repairs one bracket the extract left without a partner.
 *
 * A closing bracket with no opener ("…officially Commonwealth of New
 * Zealand) is an island country") closes a piece of the name list in
 * front of it: that piece goes if it is only names, otherwise the
 * bracket becomes the comma the sentence needs. An opening bracket with
 * no closer ("Ukraine (Ukrainian: Україна, romanized: Ukraïna,
 * pronounced […] is a country") loses the names it held.
 */
function repairUnbalanced(text: string): string {
  const { openers, closers } = unmatched(text);
  const closer = closers[0];
  if (closer !== undefined) {
    const head = text.slice(0, closer);
    const boundary = Math.max(head.lastIndexOf(';'), head.lastIndexOf(')'), head.lastIndexOf('('));
    const span = text.slice(boundary + 1, closer);
    const after = text.slice(closer + 1);
    if (boundary >= 0 && isNameNoise(span)) {
      return `${text.slice(0, boundary + 1)}${after}`;
    }
    if (/^\s*$|^[.,;:!?]/.test(after)) {
      return `${head}${after}`;
    }
    return `${head},${after}`;
  }
  const opener = openers.at(-1);
  if (opener === undefined) {
    return text;
  }
  const rest = segments(text.slice(opener + 1));
  let i = 0;
  while (i < rest.length && isNameNoise(rest[i]?.text ?? '')) i += 1;
  const tail = rest.slice(i);
  const first = tail[0];
  const body =
    tail.length === 0
      ? ''
      : [tidyKept(first?.text ?? ''), ...tail.slice(1).map((s) => `${s.separator}${s.text}`)].join('');
  return `${text.slice(0, opener)}${body === '' ? '' : ` ${body}`}`;
}

/**
 * One paragraph with the leftovers of stripped templates removed: empty
 * and name-only brackets, transcriptions, native scripts and citation
 * markers. Brackets the extract left without a partner are repaired, and
 * the passes run until nothing changes, so a bracket that only becomes
 * reachable once its neighbour has gone is cleaned too.
 */
export function stripLeadArtifacts(text: string): string {
  const original = text;
  let out = text.replace(CITATION, '');
  for (let pass = 0; pass < 6; pass += 1) {
    const before = out;
    out = repairUnbalanced(balancedPass(out));
    if (out === before) {
      break;
    }
  }
  const cleaned = tidy(
    out
      .replace(BRACKETED, (m) => (IPA_CHARS.test(m) ? '' : m))
      .replace(SLASHED, (m) => (IPA_CHARS.test(m) ? '' : m)),
  );
  return cleaned === original ? cleaned : repairPunctuation(cleaned);
}

/**
 * A Wikipedia hatnote: the note at the top of a page that says what the
 * page is *not* about. It is never a definition (D-18).
 */
export function isHatnote(paragraph: string): boolean {
  return /^\s*(?:not to be (?:mistaken|confused)|this (?:article|page) is about|for (?:other|the) [^.]{0,40}\bsee\b|see also\b|main article\b|redirect)/i.test(
    paragraph,
  );
}

/** Sentence-final punctuation, allowing a closing quote or bracket. */
const ENDS_SENTENCE = /[.!?]["”’)]?$/;

/** The last sentence of `paragraph` and everything before it. */
function splitLast(paragraph: string, sentences: readonly string[]): { head: string; last: string } {
  const last = sentences.at(-1) ?? paragraph;
  return { head: paragraph.slice(0, paragraph.length - last.length).trim(), last };
}

/** A sentence the extract cut on a word that cannot end one. */
const DANGLING =
  /\b(?:at|of|and|or|the|an?|in|on|to|with|without|from|off|up|for|by|as|than|into|over|about|between|is|was|are|were)$/i;

/**
 * The lead section with the extract's damage repaired, in this order:
 *
 * 1. a hatnote paragraph is dropped (D-18);
 * 2. a paragraph that ends in a colon introduces a list the extract did
 *    not carry: that sentence goes, and with it the paragraph when it
 *    was the only one (D-20);
 * 3. a paragraph the extract cut in the middle of a sentence is joined
 *    to the next one when that one carries on in lower case or with a
 *    number (D-19);
 * 4. the first paragraph loses the leftovers of stripped templates
 *    (D-17, D-21, D-22);
 * 5. a paragraph still left without its closing full stop gets one
 *    back, unless it stops on a word that cannot end a sentence, in
 *    which case that fragment goes (D-19).
 */
export function cleanLeadSection(paragraphs: readonly string[]): string[] {
  let out = paragraphs.map((p) => p.trim()).filter((p) => p !== '');
  for (let guard = 0; guard < 8; guard += 1) {
    const first = out[0];
    if (first === undefined) break;
    if (isHatnote(first)) {
      out = out.slice(1);
      continue;
    }
    if (first.endsWith(':')) {
      const { head } = splitLast(first, splitSentences(first));
      out = head === '' ? out.slice(1) : [head, ...out.slice(1)];
      continue;
    }
    const next = out[1];
    if (!ENDS_SENTENCE.test(first) && next !== undefined && /^[a-z0-9]/.test(next)) {
      out = [`${first} ${next}`, ...out.slice(2)];
      continue;
    }
    break;
  }
  const lead = out[0];
  if (lead === undefined) return [...paragraphs];
  const cleaned = stripLeadArtifacts(lead);
  return [closeSentence(cleaned === '' ? lead : cleaned), ...out.slice(1)];
}

/** Gives a cut paragraph back its full stop, or drops the fragment. */
function closeSentence(paragraph: string): string {
  if (ENDS_SENTENCE.test(paragraph)) {
    return paragraph;
  }
  const sentences = splitSentences(paragraph);
  const { head, last } = splitLast(paragraph, sentences);
  if (DANGLING.test(last.trim()) && head !== '') {
    return head;
  }
  return `${paragraph.replace(/[\s,;:]+$/, '')}.`;
}

/** The lead section of `sections`, cleaned; other sections are untouched. */
export function cleanLead(sections: readonly ArticleSection[]): ArticleSection[] {
  return sections.map((section, i) =>
    i === 0 && section.heading === ''
      ? { ...section, paragraphs: cleanLeadSection(section.paragraphs) }
      : { ...section },
  );
}
