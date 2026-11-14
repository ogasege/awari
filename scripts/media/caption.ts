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
const JUNK = /https?:|\{\{|\}\}|wikidata|category:|\bq\d{3,}\b|\.jpe?g|\.png|\bimg[_ ]?\d|\bdsc[_n ]?\d|\bcopyright\b|\bphoto by\b|\buploaded\b|\bsource:|\bown work\b|\bversion \d|textbook|\bpublished\b|\bfig(?:ure)?\.? ?\d|\d{4}-\d{2}-\d{2}|\bretrieved\b|\bvia\b|\bscan(?:ned)?\b|\bcrop(?:ped)?\b|\bdetail of\b|\bfile:/i;

/** A description that talks about the file itself ("This media has been taken in ...") says nothing about the picture. */
const SELF = /^(?:this|these|the following|here is|here are|appears to|seems to|a media|media|file|image|photo|picture|photograph|diagram|illustration|map)\b[^.]{0,40}\b(?:is|are|was|were|has|have|been|demonstrates?|shows?|depicts?|illustrates?|represents?|appears?|seems?|taken|made|created|uploaded)\b/i;

const ENGLISH = /\b(?:the|of|in|a|an|and|from|with|at|on|is|are|was|by|to|near|view)\b/gi;
const FOREIGN = /\b(?:der|die|das|und|von|mit|f[üu]r|anl[äa]sslich|im|zum|le|la|les|des|du|une|et|dans|sur|el|los|las|del|una|con|por|il|lo|gli|di|che|het|een|voor)\b/gi;

/** True when a text reads as English: more English small words than German, French, Spanish or Italian ones. */
export function looksEnglish(text: string): boolean {
  const en = (text.match(ENGLISH) ?? []).length;
  const other = (text.match(FOREIGN) ?? []).length;
  return other === 0 || en > other;
}

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
  d = d.replace(/\s+([,.;:!?])/g, '$1');
  return d.charAt(0).toUpperCase() + d.slice(1);
}

/** The caption for one picture. */
export function captionFor(description: string, title: string, articleTitle: string): Caption {
  const d = tidy(description);
  if (d.length >= 12 && d.split(' ').length >= 3 && !JUNK.test(d) && !SELF.test(d) && !/^appears to\b/i.test(d) && looksEnglish(d)) {
    return { text: shorten(d), source: 'description' };
  }
  const n = nameFromTitle(title);
  if (n !== '' && !JUNK.test(n)) return { text: shorten(n), source: 'title' };
  return { text: articleTitle, source: 'article' };
}

/** Whether a caption can be traced to its sources: the description, the file title, or the article title. */
export function isTraceable(caption: Caption, description: string, title: string, articleTitle: string): boolean {
  const c = caption.text.replace(/…$/, '').trim();
  // Spaces before punctuation are closed up in a caption ("Garden , fresco"), so compare with them closed up on both sides.
  const norm = (s: string): string => collapse(s).toLowerCase().replace(/\s+([,.;:!?])/g, '$1');
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
