/**
 * Captions for library pictures (23-media-library Req 13, 14, Property 4): a short, honest shortening of what
 * Commons says about the file. Nothing is invented: a caption is cut from the Commons description or from the
 * file title, or is the article's own title when both are unusable.
 */

export type CaptionSource = 'description' | 'title' | 'article';

export interface Caption {
  text: string;
  source: CaptionSource;
}

const MAX = 90;
const JUNK = /https?:|\{\{|\}\}|wikidata|category:|\bq\d{3,}\b|\.jpe?g|\.png|\bimg[_ ]?\d|\bdsc[_n ]?\d|\bcopyright\b|\bphoto by\b|\buploaded\b|\bsource:|\bown work\b/i;

const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** The English part of a multilingual Commons description ("English: ... Deutsch: ..."). */
export function englishPart(description: string): string {
  const d = collapse(description);
  const m = /\bEnglish\s*:\s*(.+?)(?=\s+(?:Deutsch|Fran[cç]ais|Espa[nñ]ol|Italiano|Portugu[eê]s|Nederlands|Polski|Русский|日本語|中文|Svenska|Čeština|Català)\s*:|$)/.exec(d);
  return collapse(m?.[1] ?? d);
}

/** The first sentence, or the first words, of at most `max` characters, cut at a word and never mid-word. */
export function shorten(text: string, max = MAX): string {
  const t = collapse(text).replace(/^["“”']+|["“”']+$/g, '');
  const sentence = /^(.{20,}?[a-z)0-9][.!?])(?:\s|$)/.exec(t);
  if (sentence?.[1] && sentence[1].length <= max) return sentence[1].replace(/[.]$/, '');
  if (t.length <= max) return t.replace(/[.;:,\s]+$/, '');
  const cut = t.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${cut.slice(0, space > 20 ? space : max).replace(/[\s,;:(–-]+$/, '')}…`;
}

/** A readable name from a Commons file title, or '' when it is mostly numbers and camera codes. */
export function nameFromTitle(title: string): string {
  const base = title
    .replace(/^File:/i, '')
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/_/g, ' ')
    .replace(/\(\d{6,}\)/g, ' ')
    .replace(/\b(?:img|dsc|dscn|dsf|p)[ _-]?\d+\b/gi, ' ')
    .replace(/\s+\d{1,3}$/, '');
  const name = collapse(base);
  const letters = (name.match(/\p{L}/gu) ?? []).length;
  return name.split(' ').length >= 2 && letters >= name.length * 0.6 ? name : '';
}

/** Takes the boilerplate off the front of a description ("This is a photo of ...", "object type: ... description: ..."). */
export function tidy(description: string): string {
  let d = englishPart(description);
  const keyed = /^[a-z ]{3,24}:\s/i.test(d) ? /\bdescription\s*:\s*(.+)$/i.exec(d) : null;
  if (/^(?:object type|title|name|object|inscription)\s*:/i.test(d)) d = keyed?.[1] ? collapse(keyed[1]) : '';
  d = d.replace(/^(?:this is (?:an?|the) (?:photo|picture|image|photograph) (?:of|showing)\s+|(?:photo|picture|image|photograph) of\s+)/i, '');
  return d.charAt(0).toUpperCase() + d.slice(1);
}

/** The caption for one picture. */
export function captionFor(description: string, title: string, articleTitle: string): Caption {
  const d = tidy(description);
  if (d.length >= 12 && d.split(' ').length >= 3 && !JUNK.test(d)) {
    return { text: shorten(d), source: 'description' };
  }
  const n = nameFromTitle(title);
  if (n !== '' && !JUNK.test(n)) return { text: shorten(n), source: 'title' };
  return { text: articleTitle, source: 'article' };
}

/** Whether a caption can be traced to its sources: the description, the file title, or the article title. */
export function isTraceable(caption: Caption, description: string, title: string, articleTitle: string): boolean {
  const c = caption.text.replace(/…$/, '').trim();
  const norm = (s: string): string => collapse(s).toLowerCase();
  if (c === '') return false;
  switch (caption.source) {
    case 'description':
      return norm(englishPart(description)).replace(/^["“”']+/, '').includes(norm(c).replace(/^["“”']+/, ''));
    case 'title':
      return norm(nameFromTitle(title)).includes(norm(c));
    case 'article':
      return c === articleTitle;
  }
}
