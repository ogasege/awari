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
/** More endings that leave the phrase hanging where a cut landed on a function word: "Pakistan is", "with such". */
const DANGLING_MORE =
  /\b(?:is|are|was|were|be|been|being|has|have|had|does|did|can|could|will|would|may|might|must|should|this|these|those|their|its|his|her|your|my|than|then|while|when|who|whom|whose|where|what|how|such|another|same|very|also|if|first|last|next|only|own)$/i;

/** True when a caption stops on a word that needs the next one. */
function endsOnFunctionWord(text: string): boolean {
  const t = text.replace(/…$/, '').replace(/[.,;:\s]+$/, '');
  return DANGLING.test(t) || DANGLING_MORE.test(t);
}

/**
 * The words a caption may stop in front of: a cut there leaves a phrase that reads whole ("A pair of common toads
 * migrating" out of "... migrating in the foliage of the mixed forest"). Used instead of an ellipsis.
 */
const JOINER =
  /\s(?:of|in|on|at|to|by|with|from|for|and|or|but|as|into|near|that|which|who|whom|whose|where|when|while|during|under|over|between|among|across|along|against|behind|beside|below|above|within|without|through|throughout|because|since|than|though|although|until|upon|about|after|before|like|per|via|onto|off)\s/gi;

/** The caption defects the final design review counted (26-final-review D-14 to D-16, D-36 to D-39), in report order. */
export const DEFECTS = ['ellipsis', 'function word', 'first person', 'self-referring', 'processing note', 'date only', 'under three words', 'shouting', 'non-Latin'] as const;
export type Defect = (typeof DEFECTS)[number];

/** A caption is a whole phrase: it is never cut off with an ellipsis. */
const ELLIPSIS = /…|\.\.\./;
/**
 * The uploader talking about themselves: "my letter", "a toad that I found", "this photo is not taken by me",
 * "we see the mountain". "Our Lady" is a church, not a first person, and "mine" is usually a pit, so neither counts.
 */
const PERSON = /(?<!\p{L})(?:my|me|myself|ourselves)(?!\p{L})|(?<!\p{L})our(?!\p{L})(?!\s+(?:Lady|Lord|Saviour|Savior))|(?<!\p{L})we(?!\p{L})\s+\p{Ll}/iu;
const PERSON_I = /(?<!\p{L})I\s+(?:found|took|made|created|photographed|shot|scanned|uploaded|noticed|saw|visited|collapsed|think|believe|like|love|decided|went|got|drove|walked|climbed|caught|spotted|have|am)(?!\p{L})/u;
/** A caption about the picture rather than about what it shows: "the dark region at the center of this image". */
const SELF_REF =
  /(?<!\p{L})(?:this|these|those|that|the above|the following)\s+(?:image|images|photo|photos|photograph|photographs|picture|pictures|file|media|shot|snapshot)(?!\p{L})|(?:pictured|shown|seen|photographed|featured)\s+(?:here|above|below)(?!\p{L})|^here (?:are|is) (?:pictured|shown|seen)(?!\p{L})|^here we see(?!\p{L})/iu;
/** What the uploader did to the file in an editor, never what the picture shows. */
const PROCESSING =
  /\bcropp?ed\b|\bdenois\w*|\bsharpening\b|\blevels adjusted\b|\bwhite[- ]balance\b|\bartifacts? removed\b|\bpost-?process\w*|\bstitched (?:together|from)\b|\bretouch\w*|\bupscal\w*|\brandom\b|\bunedited\b|\bSOOC\b|\brestored version\b|\bsample photo\b|\bcalibrated\b/i;
/** Nothing but a date, however it is punctuated ("6/, Jun 19, 2013"). */
const DATE_LIKE = /^(?:[\d\s,./-]|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)+$/i;

/** A letter a child reading English cannot sound out: another script, or a Greek or maths symbol (β, Ω). */
function hasNonLatinLetter(text: string): boolean {
  return [...text].some((c) => /\p{L}/u.test(c) && !/\p{Script=Latin}/u.test(c) && !/\p{Script=Common}/u.test(c));
}

/** A caption in capitals is shouting ("A4 PAPER"); an abbreviation beside ordinary words is not. */
function isShouting(text: string): boolean {
  const words = text.match(/\p{L}{2,}/gu) ?? [];
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  return words.length > 0 && letters >= 5 && words.every((w) => w === w.toUpperCase());
}

/**
 * Every reason a finished caption is not fit to print under a photograph, in report order; empty when it reads as a
 * plain phrase about what the picture shows. Each caption in the library is checked against these, whatever its
 * source, so a hand-written override is held to the same bar as a Commons description
 * (`scripts/media/caption-quality.test.ts`).
 */
export function captionDefects(text: string): Defect[] {
  const t = collapse(text);
  const bare = t.replace(/[.\s]+$/, '');
  const found: Defect[] = [];
  if (ELLIPSIS.test(t)) found.push('ellipsis');
  if (endsOnFunctionWord(bare)) found.push('function word');
  if (PERSON.test(t) || PERSON_I.test(t)) found.push('first person');
  if (SELF_REF.test(t)) found.push('self-referring');
  if (PROCESSING.test(t)) found.push('processing note');
  if (DATE_LIKE.test(bare) || DATE_ONLY.test(bare)) found.push('date only');
  if ((bare.replace(/…$/, '').match(/[\p{L}\p{N}]+/gu) ?? []).length < 3) found.push('under three words');
  if (isShouting(bare)) found.push('shouting');
  if (hasNonLatinLetter(bare)) found.push('non-Latin');
  return found;
}

/** The first reason a caption is not fit to print, or undefined when it is. */
export function captionDefect(text: string): Defect | undefined {
  return captionDefects(text)[0];
}

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

/**
 * The first sentence, or the first whole phrase, of at most `max` characters: cut at a sentence end, at a clause
 * boundary, or in front of a joining word, so a caption never trails off in an ellipsis (26-final-review D-14).
 * Returns '' when the text has no such stopping place, and the caller then has nothing honest to show.
 */
export function shorten(text: string, max = MAX): string {
  const t = collapse(text).replace(/^["“”']+|["“”']+$/g, '');
  const sentence = /^(.{20,}?[a-z)0-9][.!?])(?:\s|$)/.exec(hideDots(t));
  if (sentence?.[1] && sentence[1].length <= max) return showDots(sentence[1]).replace(/[.]$/, '');
  if (t.length <= max) return t.replace(/[.;:,\s]+$/, '');
  const cut = t.slice(0, max);
  const trim = (s: string): string => s.replace(/[\s,;:(–-]+$/, '');
  const whole = (head: string): boolean =>
    !endsOnFunctionWord(head) &&
    (head.match(/\(/g) ?? []).length === (head.match(/\)/g) ?? []).length &&
    ((head.match(/["“”]/g) ?? []).length % 2 === 0) &&
    // A phrase cut out of a longer sentence needs enough words to say something: "Long ago, an ancestor" does not.
    (head.match(/[\p{L}\p{N}]+/gu) ?? []).length >= 5;
  // A clause ("..., and then ...") is the best place to stop; in front of a joining word is the next best. Both are
  // looked for a few characters past the limit, so a stop that ends exactly at it is still found.
  const window = t.slice(0, max + 12);
  const stops = [...window.matchAll(/[,;]\s|\s[–—-]\s/g), ...window.matchAll(JOINER)].map((m) => m.index ?? 0).filter((i) => i >= 20 && i <= max).sort((a, b) => a - b);
  for (const i of [...stops].reverse()) {
    let head = trim(cut.slice(0, i));
    while (endsOnFunctionWord(head) && head.includes(' ')) head = trim(head.slice(0, head.lastIndexOf(' ')));
    if (whole(head)) return head;
  }
  return '';
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
  if (captionDefect(bare) !== undefined) return false;
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
    looksEnglish(bare) &&
    englishShare(bare) >= 0.5 &&
    !endsOnFunctionWord(bare)
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
