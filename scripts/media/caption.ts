/**
 * Captions for library pictures (23-media-library Req 13, 14, Property 4; 24-review-4 Req 1): a short, honest
 * shortening of what Commons says about the file. Nothing is invented. A caption comes from a hand-checked override,
 * the English Commons description or the Commons structured caption, never from the file name; when none says
 * anything usable the picture has no caption and is not used at all (the
 * article's own title is never borrowed, because it can describe the wrong thing: a portrait of Lavoisier
 * captioned "Chemical reaction").
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type CaptionSource = 'description' | 'structured' | 'override';

export interface Caption {
  text: string;
  source: CaptionSource;
}

const MAX = 90;

/** Hand-checked captions (`null` drops the picture) and Commons structured captions, both keyed by Commons file title. */
interface Sources {
  overrides: Record<string, string | null>;
  labels: Record<string, string>;
}
let sources: Sources | undefined;
const OVERRIDE_FILE = join('scripts', 'media', 'captions-override.json');
const STRUCTURED_FILE = join('scripts', 'media', 'structured-captions.json');

function readSources(): Sources {
  if (sources) return sources;
  const read = <T>(f: string, pick: (j: any) => T, empty: T): T => (existsSync(f) ? pick(JSON.parse(readFileSync(f, 'utf8'))) : empty); // eslint-disable-line @typescript-eslint/no-explicit-any
  sources = { overrides: read(OVERRIDE_FILE, (j) => j.captions ?? {}, {}), labels: read(STRUCTURED_FILE, (j) => j.labels ?? {}, {}) };
  return sources;
}

/** For tests: replace the caption sources (or pass undefined to read the files again). */
export function useSources(s: Sources | undefined): void {
  sources = s;
}

/** The options of a caption lookup: `onlyDescription` ignores overrides and structured captions (used to find what still needs a label). */
export interface CaptionOptions {
  onlyDescription?: boolean;
}

/** Text that is about the file, the upload or the catalogue record, not about the picture. Tested on the shortened candidate. */
const JUNK =
  /https?:|\{\{|\}\}|wikidata|category:|\bq\d{3,}\b|\.jpe?g|\.png|\.tiff?\b|\bimg[_ ]?\d|\bdsc[_n ]?\d|\bcopyright\b|\bphoto by\b|\bphotos? by\b|\bphotographs? by\b|\buploaded\b|\bsource:|\bown work\b|\bversion \d|textbook|\bpublished\b|\bfig(?:ure)?\.? ?\d|\d{4}-\d{2}-\d{2}|\bretrieved\b|\bvia\b|\bscan(?:ned)?\b|\bfile:|persistent url|\b[a-z0-9-]+\.(?:com|org|edu|net|gov|nl|de|fr|es|it|ru|uk)\b|\bsubject \(tgm\)|\bidentifier\b|\binventory\b|\baccession\b|\b(?:identified )?(?:by|with) id\b|\bunknown\b|\[|\]|\(translated\)|\bsheet \d+ out of\b|\bpl\.?\)?$|\bsic\b|\bidentificatie\b|\bobjecttype\b|\bobjectnummer\b|\bobject ?number\b|\b\d+ ?mm\b|\blens\b|\bf\/\d|\bcaption:|\bconnexions\b|\billustration from\b|\bcredit\b|\bcourtesy\b|\w*nummer\b|\bnr\.?\s*\d|\b\d{2,}-\d{3,}\b|:\s*\d/i;

/** A description that talks about the file itself ("This media has been taken in ...", "This photograph captures ...") says nothing about the picture. */
const SELF =
  /^(?:this|these|the following|here is|here are|appears to|seems to|a media|media|file|image|photo|picture|photograph|diagram|illustration|map)\b[^.]{0,40}\b(?:is|are|was|were|has|have|been|demonstrates?|shows?|depicts?|illustrates?|represents?|appears?|seems?|taken|made|created|uploaded|captures?|features?|portrays?|presents?|displays?|contains?|includes?)\b/i;

/** First person ("a map that i created, based on ...") and panel markers ("• LEFT: ...") are about making the file. */
const MAKING = /\b(?:i|we) (?:created|made|drew|took|designed|scanned|uploaded|photographed)\b|\bmy own\b|\bi've\b/i;
const PANEL = /^(?:[•·▪-]\s|(?:left|right|top|bottom|upper|lower)\s*:)/i;

/** A photographer's name and a year ("Morgan Sessions 2015") says nothing about the picture. */
const NAME_YEAR = /^\p{Lu}[\p{L}.'-]+(?: \p{Lu}[\p{L}.'-]+){0,2},? ?(?:19|20)\d\d$/u;

const ENGLISH = /(?<!\p{L})(?:the|of|in|a|an|and|from|with|at|on|is|are|was|by|to|near|view)(?!\p{L})/giu;
const FOREIGN =
  /(?<!\p{L})(?:der|die|das|und|von|mit|f[üu]r|anl[äa]sslich|im|zum|le|la|les|des|du|une|un|et|dans|sur|qui|sa|son|ses|el|los|las|del|una|con|por|il|lo|gli|di|che|het|een|voor|og|av|på|do|da|em|um|uma|os|as|de|en|che|pour|nel|della|sul|ao|na|no|ne|ja|ir|et|ei|jo)(?!\p{L})/giu;

/** A caption must not end on a word that needs a next word. */
const DANGLING = /\b(?:from|of|in|at|on|to|by|with|and|or|the|a|an|for|as|into|near|that|which|during|under|over|between|after|before|about)$/i;

let words: Set<string> | undefined;

/** The Open English WordNet lemmas bundled with the app (`public/packs/dictionary/*.json`). */
function dictionary(): Set<string> {
  if (words) return words;
  words = new Set<string>();
  const dir = join('public', 'packs', 'dictionary');
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const shard = JSON.parse(readFileSync(join(dir, f), 'utf8')) as { entries?: Record<string, unknown> };
      for (const w of Object.keys(shard.entries ?? {})) words.add(w);
    }
  }
  return words;
}

function known(w: string): boolean {
  const d = dictionary();
  if (d.size === 0) return true; // no dictionary: do not guess
  const x = w.toLowerCase();
  const stems = [x, x.replace(/s$/, ''), x.replace(/es$/, ''), x.replace(/ies$/, 'y'), x.replace(/ed$/, ''), x.replace(/ed$/, 'e'), x.replace(/d$/, ''), x.replace(/ing$/, ''), x.replace(/ing$/, 'e'), x.replace(/ly$/, ''), x.replace(/er$/, ''), x.replace(/'s$/, '')];
  return stems.some((s) => s.length >= 3 && d.has(s));
}

/**
 * True when a text reads as English: Latin script; and, when it has at least two lower-case words of four letters
 * or more, most of them are English words (Open English WordNet); otherwise no German, French, Spanish or Italian
 * small words and no accented letters without an English small word beside them.
 */
export function looksEnglish(text: string): boolean {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false;
  const latin = letters.filter((c) => /\p{Script=Latin}/u.test(c)).length;
  if (latin / letters.length < 0.95) return false;
  const lower = (text.match(/[\p{L}'’-]+/gu) ?? []).filter((w) => w.length >= 4 && w === w.toLowerCase());
  const en = (text.match(ENGLISH) ?? []).length;
  const other = (text.match(FOREIGN) ?? []).length;
  if (/[àâäçéèêëîïôöùûüÿñãõåæøßšžčěřğıąęłśźżő]/i.test(text) && en === 0) return false;
  if (lower.length >= 1) {
    const ok = lower.filter(known).length;
    if (ok / lower.length < 0.7) return false;
  }
  return other === 0 || en > other;
}

const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** The full stop of an abbreviation ("c.", "St.", "Oct.", "R.") is not the end of a sentence: hide it while sentences are cut. */
const ABBREV = /(?<![\p{L}\p{N}])(?:c|ca|st|mt|dr|mr|mrs|ms|jr|sr|vs|jan|feb|mar|apr|aug|sep|sept|oct|nov|dec|approx|no|nr|prof|gen|col|fr|ft|inc|ltd|[a-z])\.(?=\s)/giu;
const hideDots = (t: string): string => t.replace(ABBREV, (m) => m.replace('.', '\u0001'));
const showDots = (t: string): string => t.split('\u0001').join('.');

/** The English part of a multilingual Commons description ("English: ... Deutsch: ..."). */
export function englishPart(description: string): string {
  const d = collapse(description);
  const m = /\bEnglish\s*:\s*(.+?)(?=\s+(?:Deutsch|Fran[cç]ais|Espa[nñ]ol|Italiano|Portugu[eê]s|Nederlands|Polski|Русский|日本語|中文|Svenska|Čeština|Català)\s*:|$)/.exec(d);
  return collapse(m?.[1] ?? d);
}

/** The first sentence, or the first words, of at most `max` characters, cut at a word and never on a word that needs another. */
export function shorten(text: string, max = MAX): string {
  const t = collapse(text).replace(/^["“”']+|["“”']+$/g, '');
  const sentence = /^(.{20,}?[a-z)0-9][.!?])(?:\s|$)/.exec(hideDots(t));
  if (sentence?.[1] && sentence[1].length <= max) return showDots(sentence[1]).replace(/[.]$/, '');
  if (t.length <= max) return t.replace(/[.;:,\s]+$/, '');
  const cut = t.slice(0, max);
  // Prefer to stop at a clause ("..., and then ..."), which needs no ellipsis, over a cut in the middle of one.
  const clause = [...cut.matchAll(/[,;]\s|\s[–—-]\s/g)].map((m) => m.index ?? 0).filter((i) => i >= 28).pop();
  if (clause !== undefined) {
    const head = cut.slice(0, clause).replace(/[\s,;:(–-]+$/, '');
    if (!DANGLING.test(head) && (head.match(/\(/g) ?? []).length === (head.match(/\)/g) ?? []).length) return head;
  }
  const space = cut.lastIndexOf(' ');
  let out = cut.slice(0, space > 20 ? space : max).replace(/[\s,;:(–-]+$/, '');
  // Back off over a trailing preposition or article: "... during" is not where a caption may stop.
  while (DANGLING.test(out) && out.includes(' ')) out = out.slice(0, out.lastIndexOf(' ')).replace(/[\s,;:(–-]+$/, '');
  return `${out}…`;
}

/** A readable name from a Commons file title, or '' when it is mostly numbers and camera codes. */
export function nameFromTitle(title: string): string {
  let base = title
    .replace(/^File:/i, '')
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/_/g, ' ')
    .replace(/\([^)]*\)/g, ' ') // "(cropped)", "(27758444591)", "(1)"
    .replace(/\s*[-–]\s*(?:flickr|google art project|google cultural institute|wikimedia|wikipedia|geograph)\b.*$/i, ' ')
    .replace(/\bwellcome [a-z]\d+\b/gi, ' ')
    .replace(/\bPIA\d+\b|\bSTScI-[\d-]+\b|\bNASA\d+\b/g, ' ')
    .replace(/^\d{6,8}\s+/, '')
    .replace(/^(?:dfc|dsc|dscn|img|imgp|dsf|p)[ _-]?\d+\s+/i, '')
    .replace(/\b(?:img|dsc|dscn|dsf|p)[ _-]?\d+\b/gi, ' ');
  // A name written with hyphens and no spaces ("Mt-Grizim-national-park-7920").
  if (!base.trim().includes(' ')) base = base.replace(/-+/g, ' ');
  base = base
    .replace(/([a-z])\d+$/, '$1') // "Castelul Bran2"
    .replace(/\s+(?:en|de|fr|es|it|nl|pt|ru|pl|sv|dz)$/i, '') // a language code left on a map name
    .replace(/\s+[-–]\s*(?:1[0-9]|20)\d\d$/, '') // " - 2009": a date suffix after a dash
    .replace(/\s+\d{1,4}$/, (m) => (/^\s+(?:1[0-9]|20)\d\d$/.test(m) ? m : '')) // a trailing counter goes, a trailing year stays
    .replace(/[,\s]+(?:photo|image|picture)$/i, '') // "Guinea-Bissau, photo 3" once the 3 is gone
    .replace(/\s+[-–]\s*$/, '')
    .replace(/\s+([,.;:!?])/g, '$1');
  const name = collapse(base);
  const letters = (name.match(/\p{L}/gu) ?? []).length;
  // Digits in a name ("Canada in 2014") count against the letter share, so half is enough.
  return name.split(' ').length >= 2 && letters >= name.length * 0.5 ? name : '';
}

/** Takes the boilerplate off the front of a description ("This is a photo of ...", "Original caption from NASA: ..."). */
export function tidy(description: string): string {
  let d = englishPart(description);
  const keyed = /^[a-z ]{3,24}:\s/i.test(d) ? /\bdescription\s*:\s*(.+)$/i.exec(d) : null;
  if (/^(?:object type|title|name|object|inscription)\s*:/i.test(d)) d = keyed?.[1] ? collapse(keyed[1]) : '';
  d = d.replace(/^[*•\s]+/, '');
  // Archive and pipeline residue at the front of a description.
  d = d.replace(/^(?:\([^)]{0,80}\)\s*)+(?=\p{L})/u, '');
  d = d.replace(/^(?:depicted (?:person|people|place|object)|abstract|summary|translation of (?:the )?original description|(?:\d+px|flickr|wikipedia|google|geograph|nasa|esa) (?:provided )?description|html|description|beschreibung)\s*[:–-]?\s+/i, '');
  d = d.replace(/^[A-Z]{0,4}\d{5,}[A-Z0-9-]*\s*[-–:]?\s+/, '');
  d = d.replace(/^caption\s*:\s*/i, '');
  d = d.replace(/^original caption(?: from [^:]{1,40})?\s*:\s*/i, '');
  d = d.replace(/^(?:this is (?:an?|the) (?:photo|picture|image|photograph) (?:of|showing)\s+|(?:photo|picture|image|photograph) of\s+)/i, '');
  d = d.replace(/\s*\((?:cropped|crop|edit\d*|detail|retouched|restored)\)/gi, '');
  d = d.replace(/\s+([,.;:!?])/g, '$1');
  // An odd number of double quotes is a quotation cut in half: drop them.
  if (((d.match(/["“”]/g) ?? []).length) % 2 === 1) d = d.replace(/["“”]/g, '');
  // Upper-case the first letter only of a script that has case.
  return /^\p{Ll}/u.test(d) && /^\p{Script=Latin}/u.test(d) ? d.charAt(0).toUpperCase() + d.slice(1) : d;
}

/** More words that only a caption in German, French, Spanish, Portuguese or a Nordic language holds. */
const FOREIGN_MORE = /\b(?:und|auf|dem|mit|für|zur|zum|och|med|les|des|aux|avec|pour|sur|dans|con|por|para|una|uma|não|nad|pri|bei|über|nach|vom|vor|ist|sind|einer?|eines|ein)\b/i;
const shouted = (s: string): boolean => {
  const letters = s.replace(/[^\p{L}]/gu, '');
  return letters.length >= 8 && letters === letters.toUpperCase();
};

/** Characters that never belong in a caption: handles, prices, markup, separators ("British Museum.FotoThalerTamas", "Sundy event@"). */
const ODD_CHARS = /[@$#%^*_=<>|~\\]|\w\.\p{Lu}|\p{Ll}\p{Lu}\p{Ll}+\p{Lu}/u;
const ODD_WORDS = /\b(?:foto|translated|version|file|google art project|art project)/i;

/** A catalogue or camera number left in a caption: a run of five or more digits, or a letter code with a dotted number ("M.2000.179"). */
const NUMBERED = /\b\d{5,}\b|\b[A-Z]{1,3}[ .]?\d{2,}\.\d+\b|\b[A-Z]\d{3,}\b/;

/**
 * The shape of a fragment, a credit or a bare date rather than a caption: it starts with a bracket, a lower-case
 * letter or an initial ("S. Marine Corps"), starts with "By" or "Photo", ends with a frame number ("... 13",
 * "Pto 0610 004", "Mongolia18"), or is only a date.
 */
const FRAGMENT = /^[^\p{L}\p{N}"“'‘]|^\d+\s+(?:The|A|An|Of)\b|^\p{Ll}|^\p{Lu}\.\s|^(?:By|Pic by|Photo|Credit|Source|Obtained|Made in|Vintage)\b|\)\s*\d{1,3}$|\b(?:Pto|No|Nr|Photo|Image|Picture|Pic|Img)\.?\s*\d[\d ]*$|\p{L}\d{1,3}$|\s0\d+(?: \d+)*$/u;
const DATE_ONLY = /^(?:\d{1,2} )?(?:january|february|march|april|may|june|july|august|september|october|november|december)(?: \d{1,2},?)?(?: \d{4})?$|^\d{1,2}[ ./-]\w+[ ./-]\d{2,4}$/i;

/** A bracket that is opened and not closed (or the reverse) is a cut sentence. */
const unbalanced = (t: string): boolean => (t.match(/\(/g) ?? []).length !== (t.match(/\)/g) ?? []).length;

/** Words that mark Spanish, Indonesian, Dutch, German, French or Portuguese names and phrases. */
const FOREIGN_WORDS = /(?<!\p{L})(?:acceso|coliseo|puente|vista|iglesia|plaza|calle|monte|cerro|rio|río|catedral|castillo|medieval[ae]s?|cahaya|pertama|puncak|menyinari|gunung|danau|pulau|selbstversorgung|ackerbau|zur|auf|bei|zum|stadt|berg|kirche|schloss|ville|château|pont|vue|rue|mont|lac|igreja|ponte|praia|monte|dichtbij|bij|kerk|brug|zicht)(?!\p{L})/iu;

/**
 * The share of the common words (four letters or more) that are English words (Open English WordNet). A capitalised
 * word inside the text is a name (Benidorm, Mérida) and is neutral; the first word counts, so "Acceso a Abai" and
 * "Cahaya Pertama Menyinari Puncak" are not English.
 */
function englishShare(text: string): number {
  const ws = (text.match(/[\p{L}'’-]+/gu) ?? []).map((w, i) => ({ w, first: i === 0 })).filter(({ w }) => w.length >= 4);
  const counted = ws.filter(({ w, first }) => first || w === w.toLowerCase());
  if (counted.length === 0) return 1;
  return counted.filter(({ w }) => known(w)).length / counted.length;
}

/** Whether a candidate caption is fit to show. `min` is the fewest words a caption may have. */
function usable(text: string, min = 3): boolean {
  const bare = text.replace(/…$/, '').trim();
  if (FRAGMENT.test(bare) || DATE_ONLY.test(bare) || unbalanced(bare)) return false;
  const quotes = (bare.match(/["“”]/g) ?? []).length;
  return (
    bare.length >= (min === 3 ? 12 : 8) &&
    bare.split(' ').length >= min &&
    quotes % 2 === 0 &&
    !JUNK.test(bare) &&
    !ODD_CHARS.test(bare) &&
    !ODD_WORDS.test(bare) &&
    !NUMBERED.test(bare) &&
    !(FOREIGN_WORDS.test(bare) && (bare.match(ENGLISH) ?? []).length < 2) &&
    !FOREIGN_MORE.test(bare) &&
    !NAME_YEAR.test(bare) &&
    (bare.match(FOREIGN) ?? []).length === 0 &&
    !shouted(bare) &&
    looksEnglish(bare) &&
    englishShare(bare) >= 0.5 &&
    !DANGLING.test(bare)
  );
}

/**
 * The caption for one picture, or undefined when nothing honest can be said: the picture is then not used. Order:
 * a hand-checked override (`null` drops the picture), the English Commons description (judged as it stands for
 * self-reference; its sentences are tried in order), then the Commons structured caption. A file name is never a
 * caption (24-review-4 Req 1).
 */
export function captionFor(description: string, title: string, opts: CaptionOptions = {}): Caption | undefined {
  const full = captionWithBasis(description, title, opts);
  return full ? { text: full.text, source: full.source } : undefined;
}

/** The caption and the exact text it was cut from (stored in the record, so it can always be traced). */
export function captionWithBasis(description: string, title: string, opts: CaptionOptions = {}): (Caption & { basis: string }) | undefined {
  const src = readSources();
  if (opts.onlyDescription !== true && Object.hasOwn(src.overrides, title)) {
    const o = src.overrides[title];
    return o ? { text: o, source: 'override', basis: o } : undefined;
  }
  const raw = englishPart(description);
  // "This is a photo of X" is a plain way to introduce X (tidy takes it off); other talk about the file is refused.
  const introduces = /^this is (?:an?|the) (?:photo|picture|image|photograph) (?:of|showing)\s/i.test(raw);
  if (raw !== '' && (introduces || !SELF.test(raw)) && !/^appears to\b/i.test(raw) && !MAKING.test(raw.slice(0, 160)) && !PANEL.test(raw)) {
    const tidied = tidy(description);
    const sentences = (hideDots(tidied).match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) ?? [tidied]).map(showDots);
    for (const s of sentences.slice(0, 2)) {
      const piece = collapse(s);
      if (piece === '' || SELF.test(piece) || MAKING.test(piece)) continue;
      const candidate = shorten(piece);
      if (usable(candidate)) return { text: candidate, source: 'description', basis: piece };
    }
  }
  if (opts.onlyDescription === true) return undefined;
  const label = src.labels[title];
  if (label) {
    const piece = collapse(label);
    const candidate = shorten(piece);
    if (!SELF.test(piece) && !MAKING.test(piece) && usable(candidate, 2)) return { text: candidate, source: 'structured', basis: piece };
  }
  return undefined;
}

/** Whether a caption can be traced to its source: an override, the English description or the structured caption. */
export function isTraceable(caption: Caption, description: string, title: string): boolean {
  const c = caption.text.replace(/…$/, '').trim();
  // Spaces before punctuation, stray quotes and "(cropped)" are tidied in a caption, so compare with all of them removed on each side.
  const norm = (s: string): string =>
    collapse(s)
      .toLowerCase()
      .replace(/\s*\((?:cropped|crop|edit\d*|detail|retouched|restored)\)/g, '')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/["“”]/g, '');
  if (c === '') return false;
  const src = readSources();
  if (caption.source === 'override') return src.overrides[title] === caption.text;
  if (caption.source === 'structured') return norm(src.labels[title] ?? '').includes(norm(c));
  return norm(englishPart(description)).includes(norm(c)) || norm(tidy(description)).includes(norm(c));
}

/** True when an override, the description or a structured caption gives something honest to show. */
export function hasCaption(description: string, title: string): boolean {
  return captionFor(description, title) !== undefined;
}
