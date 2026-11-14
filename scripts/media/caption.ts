/**
 * Captions for library pictures (23-media-library Req 13, 14, Property 4): a short, honest shortening of what
 * Commons says about the file. Nothing is invented. A caption is cut from the English Commons description or from
 * the file name; when neither says anything usable the picture has no caption and is not used at all (the
 * article's own title is never borrowed, because it can describe the wrong thing: a portrait of Lavoisier
 * captioned "Chemical reaction").
 */

export type CaptionSource = 'description' | 'title';

export interface Caption {
  text: string;
  source: CaptionSource;
}

const MAX = 90;

/** Text that is about the file or the upload, not about the picture. Tested on the shortened candidate. */
const JUNK =
  /https?:|\{\{|\}\}|wikidata|category:|\bq\d{3,}\b|\.jpe?g|\.png|\.tiff?\b|\bimg[_ ]?\d|\bdsc[_n ]?\d|\bcopyright\b|\bphoto by\b|\buploaded\b|\bsource:|\bown work\b|\bversion \d|textbook|\bpublished\b|\bfig(?:ure)?\.? ?\d|\d{4}-\d{2}-\d{2}|\bretrieved\b|\bvia\b|\bscan(?:ned)?\b|\bfile:|persistent url|\b[a-z0-9-]+\.(?:com|org|edu|net|gov|nl|de|fr|es|it|ru|uk)\b|\bsubject \(tgm\)|\bidentifier\b|\binventory\b|\baccession\b|\b(?:identified )?(?:by|with) id\b|\bunknown\b|\[|\]|\(translated\)|\bsheet \d+ out of\b|\bpl\.?\)?$|\bphotos? by\b|\bphotographs? by\b|\bsic\b/i;

/** A description that talks about the file itself ("This media has been taken in ...", "This photograph captures ...") says nothing about the picture. */
const SELF =
  /^(?:this|these|the following|here is|here are|appears to|seems to|a media|media|file|image|photo|picture|photograph|diagram|illustration|map)\b[^.]{0,40}\b(?:is|are|was|were|has|have|been|demonstrates?|shows?|depicts?|illustrates?|represents?|appears?|seems?|taken|made|created|uploaded|captures?|features?|portrays?|presents?|displays?|contains?|includes?)\b/i;

/** First person ("a map that i created, based on ...") and panel markers ("• LEFT: ...") are about making the file. */
const MAKING = /\b(?:i|we) (?:created|made|drew|took|designed|scanned|uploaded|photographed)\b|\bmy own\b|\bi've\b/i;
const PANEL = /^(?:[•*·▪-]\s|(?:left|right|top|bottom|upper|lower)\s*:)/i;

// `\b` treats accented letters as non-word characters ("garçon" would contain "on"), so use letter lookarounds.
const ENGLISH = /(?<!\p{L})(?:the|of|in|a|an|and|from|with|at|on|is|are|was|by|to|near|view)(?!\p{L})/giu;
const FOREIGN =
  /(?<!\p{L})(?:der|die|das|und|von|mit|f[üu]r|anl[äa]sslich|im|zum|le|la|les|des|du|une|un|et|dans|sur|qui|sa|son|ses|el|los|las|del|una|con|por|il|lo|gli|di|che|het|een|voor|og|av|på|do|da|em|um|uma|os|as)(?!\p{L})/giu;

/** A caption must not end on a word that needs a next word. */
const DANGLING = /\b(?:from|of|in|at|on|to|by|with|and|or|the|a|an|for|as|into|near|that|which)$/i;

/** A photographer's name and a year ("Morgan Sessions 2015") says nothing about the picture. */
const NAME_YEAR = /^\p{Lu}[\p{L}.'-]+(?: \p{Lu}[\p{L}.'-]+){0,2},? ?(?:19|20)\d\d$/u;

/** True when a text reads as English: more English small words than German, French, Spanish or Italian ones. */
export function looksEnglish(text: string): boolean {
  const en = (text.match(ENGLISH) ?? []).length;
  const other = (text.match(FOREIGN) ?? []).length;
  // Accented letters with no English small word at all: a French, Spanish, Portuguese or Norwegian phrase.
  if (/[àâäçéèêëîïôöùûüÿñãõåæøßšžčěřğı]/i.test(text) && en === 0) return false;
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
  let base = title
    .replace(/^File:/i, '')
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/_/g, ' ')
    .replace(/\([^)]*\)/g, ' ') // "(cropped)", "(27758444591)", "(1)"
    .replace(/^(?:dfc|dsc|dscn|img|imgp|dsf|p)[ _-]?\d+\s+/i, '')
    .replace(/\b(?:img|dsc|dscn|dsf|p)[ _-]?\d+\b/gi, ' ');
  // A name written with hyphens and no spaces ("Mt-Grizim-national-park-7920").
  if (!base.trim().includes(' ')) base = base.replace(/-+/g, ' ');
  base = base.replace(/\s+\d{1,4}$/, '');
  const name = collapse(base);
  const letters = (name.match(/\p{L}/gu) ?? []).length;
  return name.split(' ').length >= 2 && letters >= name.length * 0.6 ? name : '';
}

/** Takes the boilerplate off the front of a description ("This is a photo of ...", "Original caption from NASA: ..."). */
export function tidy(description: string): string {
  let d = englishPart(description);
  const keyed = /^[a-z ]{3,24}:\s/i.test(d) ? /\bdescription\s*:\s*(.+)$/i.exec(d) : null;
  if (/^(?:object type|title|name|object|inscription)\s*:/i.test(d)) d = keyed?.[1] ? collapse(keyed[1]) : '';
  d = d.replace(/^[*•\s]+/, '');
  d = d.replace(/^original caption(?: from [^:]{1,40})?\s*:\s*/i, '');
  d = d.replace(/^(?:this is (?:an?|the) (?:photo|picture|image|photograph) (?:of|showing)\s+|(?:photo|picture|image|photograph) of\s+)/i, '');
  d = d.replace(/\s+([,.;:!?])/g, '$1');
  // An odd number of double quotes is a quotation cut in half: drop them.
  if (((d.match(/["“”]/g) ?? []).length) % 2 === 1) d = d.replace(/["“”]/g, '');
  return d.charAt(0).toUpperCase() + d.slice(1);
}

/** Whether a candidate caption is fit to show. */
function usable(text: string): boolean {
  const bare = text.replace(/…$/, '').trim();
  return bare.length >= 12 && bare.split(' ').length >= 3 && !JUNK.test(bare) && !NAME_YEAR.test(bare) && looksEnglish(bare) && !DANGLING.test(bare);
}

/**
 * The caption for one picture, or undefined when Commons gives nothing honest to say: the picture is then not
 * used. The description is judged as it stands (untidied) for self-reference, then the shortened candidate for
 * junk, so good text is not thrown away for boilerplate further down.
 */
export function captionFor(description: string, title: string): Caption | undefined {
  const raw = englishPart(description);
  // "This is a photo of X" is a plain way to introduce X (tidy takes it off); other talk about the file is refused.
  const introduces = /^this is (?:an?|the) (?:photo|picture|image|photograph) (?:of|showing)\s/i.test(raw);
  if (raw !== '' && (introduces || !SELF.test(raw)) && !/^appears to\b/i.test(raw) && !MAKING.test(raw.slice(0, 160)) && !PANEL.test(raw)) {
    const candidate = shorten(tidy(description));
    if (usable(candidate)) return { text: candidate, source: 'description' };
  }
  const n = nameFromTitle(title);
  if (n !== '') {
    const candidate = shorten(n);
    if (usable(candidate) || (candidate.split(' ').length >= 2 && !JUNK.test(candidate) && !NAME_YEAR.test(candidate) && looksEnglish(candidate) && !DANGLING.test(candidate) && candidate.length >= 8)) {
      return { text: candidate, source: 'title' };
    }
  }
  return undefined;
}

/** Whether a caption can be traced to its sources: the English description or the file title. */
export function isTraceable(caption: Caption, description: string, title: string): boolean {
  const c = caption.text.replace(/…$/, '').trim();
  // Spaces before punctuation and stray quotes are tidied in a caption, so compare with both closed up on each side.
  const norm = (s: string): string =>
    collapse(s)
      .toLowerCase()
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/["“”]/g, '');
  if (c === '') return false;
  return caption.source === 'description' ? norm(englishPart(description)).includes(norm(c)) : norm(nameFromTitle(title)).includes(norm(c));
}

/** True when the description or the file name gives something honest to caption. */
export function hasCaption(description: string, title: string): boolean {
  return captionFor(description, title) !== undefined;
}
