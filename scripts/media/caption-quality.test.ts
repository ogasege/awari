/**
 * 26-final-review, fix batch 1 package C: the caption bar (D-2, D-3, D-14 to D-16, D-36 to D-39).
 *
 * A caption under a print is a plain phrase about what the picture shows. It is never cut off with an ellipsis or
 * on a function word, never the uploader talking about themselves or about the file, never a note about cropping or
 * denoising, never a bare date, never shorter than three words, never shouting, and never in letters a child
 * reading English cannot sound out. The strings below are the ten worst captions of the final design review and its
 * runners-up, quoted as the reviewer found them; each is checked twice, as a Commons description and as a Commons
 * structured label, and then the committed library is checked as a whole.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { captionDefect, captionDefects, captionFor, shorten, useSources } from './caption.ts';
import { LEAD_PINS, pinLead, pinnedLead } from './leads.ts';

/** The ten worst captions in docs/final-review/design-review.md, with the reason each one may never be shown. */
const WORST: ReadonlyArray<readonly [string, string]> = [
  ['Cropped, with artifacts removed, mild denoising/sharpening, and levels adjusted', 'processing note'],
  ['A plate of nachos with salsa sauce and a glass of beer', 'dropped by hand: not a cinema, and alcohol'],
  ['Gross pathology of lung showing centrilobular emphysema characteristic of smoking', 'dropped by hand: not suitable'],
  ['6/, Jun 19, 2013', 'date only'],
  ['A random toad that I found on the ground', 'first person'],
  ['Unbelievable, instead of sending my letter to Granada (Spain), USPS sent it to Grenada', 'first person'],
  ['Shiraz wine is the most famous wine previously produced in Iran', 'dropped by hand: the wrong country'],
  ['NASA The dark region at the center of this image', 'self-referring'],
  ['Afghanistan countryside, this photo is not taken by me', 'first person'],
  ['Ambhibians in Ayyanmada cave', 'dropped by hand: misspelt'],
];

/** The runners-up the review said deserve the same fix. */
const RUNNERS_UP: ReadonlyArray<readonly [string, string]> = [
  ['So exhausted, I collapsed', 'first person'],
  ['I noticed this contrast between two smiles', 'first person'],
  ['Stonehenge on my birthday', 'first person'],
  ['A4 PAPER', 'shouting'],
  ['Kenyan Landscapes', 'under three words'],
  ['Common road', 'under three words'],
  ['Abandoned Schoolhouse - Pripyat Ghost Town - Chernobyl Exclusion Zone', 'dropped by hand: the wrong subject'],
  ['Postprocessed photo (fusion of two) of β cells in pancreas stained by phaloidin+TRITC', 'processing note'],
];

/** The captions that a rule, not a hand decision, must refuse. */
const BY_RULE = [...WORST, ...RUNNERS_UP].filter(([, reason]) => !reason.startsWith('dropped by hand'));

/** Every picture in the committed library. */
interface Row {
  article: string;
  title: string;
  caption: string;
  captionFrom: string;
  thumb: string;
  lead: boolean;
}

function library(): Row[] {
  const dir = join('public', 'media');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && !['index.json', 'daily.json', 'licences.json'].includes(f));
  return files.flatMap((f) => (JSON.parse(readFileSync(join(dir, f), 'utf8')) as { items: Row[] }).items);
}

describe('caption quality (26-final-review D-14 to D-16, D-36 to D-39)', () => {
  beforeEach(() => useSources({ overrides: {}, labels: {} }));
  afterEach(() => useSources(undefined));

  it.each(BY_RULE)('refuses "%s" (%s)', (text, reason) => {
    expect(captionDefects(text), `${text} should be refused as a ${reason}`).toContain(reason);
    // The same text as a Commons description, and as a Commons structured label, yields no caption at all.
    expect(captionFor(text, 'File:X.jpg'), text).toBeUndefined();
    useSources({ overrides: {}, labels: { 'File:X.jpg': text } });
    expect(captionFor('', 'File:X.jpg'), text).toBeUndefined();
  });

  it.each([...WORST, ...RUNNERS_UP])('"%s" is nowhere in the library (%s)', (text) => {
    const found = library().filter((m) => m.caption === text || m.caption === `${text}…`);
    expect(found.map((m) => `${m.article}: ${m.caption}`)).toEqual([]);
  });

  it('a plain phrase about the picture is still a caption', () => {
    for (const good of ['Interior of Cinema 9, Hoyts movie theater, Westfield Carousel, Cannington', 'Diamond and graphite shown side by side, for illustrating carbon', 'A koala climbing up a tree, Great Otway National Park', 'The majestic Mount Kilimanjaro']) {
      expect(captionDefect(good), good).toBeUndefined();
      expect(captionFor(good, 'File:Y.jpg')?.text, good).toBe(good);
    }
  });

  it('stops at a clause or in front of a joining word instead of trailing off', () => {
    expect(shorten('A pair of common toads migrating in the foliage of the mixed forest of the hills above the little town')).toBe('A pair of common toads migrating in the foliage of the mixed forest of the hills');
    expect(shorten('Highlights some areas of the brain known to be central to initial formation of long-term memory and recall')).toBe('Highlights some areas of the brain known to be central to initial formation');
    // Nothing to stop on, so nothing is shown: a run of one long word has no clause and no joining word.
    expect(shorten(`${'Averylongwordwithnobreaks'.repeat(5)}`)).toBe('');
    for (const text of ['The Punchaucancha temple, or "Temple of the Sun" was built by the Inca King Tupac Yupanqui in about 1450', 'On top of the ridge at the foot of the hill called Huayna Picchu and protected on all sides by steep slopes']) {
      const s = shorten(text);
      expect(captionDefects(s), `${text} -> ${s}`).toEqual([]);
      expect(text.startsWith(s)).toBe(true);
    }
  });

  it('every caption in the committed library is fit to print, whatever its source', () => {
    const bad = library()
      .filter((m) => captionDefect(m.caption) !== undefined)
      .map((m) => `${m.article} [${m.captionFrom}] ${m.caption} -- ${captionDefect(m.caption) ?? ''}`);
    expect(bad).toEqual([]);
  });

  it('the hand-written overrides are held to the same bar', () => {
    useSources(undefined);
    const file = join('scripts', 'media', 'captions-override.json');
    const captions = (JSON.parse(readFileSync(file, 'utf8')) as { captions: Record<string, string | null> }).captions;
    const bad = Object.entries(captions)
      .filter(([, text]) => text !== null && captionDefect(text) !== undefined)
      .map(([title, text]) => `${title}: ${text ?? ''} -- ${captionDefect(text ?? '') ?? ''}`);
    expect(bad).toEqual([]);
  });
});

describe('lead pictures (26-final-review D-2, D-3, D-12, D-13, D-16, D-27)', () => {
  it('moves the pinned picture to the front and leaves the rest in order', () => {
    const chosen = [{ title: 'File:A.jpg' }, { title: 'File:Topeng Bali.jpg' }, { title: 'File:C.jpg' }];
    expect(pinLead('arts/mask', chosen).map((c) => c.title)).toEqual(['File:Topeng Bali.jpg', 'File:A.jpg', 'File:C.jpg']);
    // A pin for a picture that is not there, and an article with no pin, change nothing.
    expect(pinLead('arts/mask', [{ title: 'File:A.jpg' }]).map((c) => c.title)).toEqual(['File:A.jpg']);
    expect(pinLead('arts/theatre', chosen).map((c) => c.title)).toEqual(chosen.map((c) => c.title));
  });

  it('every pinned article leads on its pinned picture in the committed library', () => {
    const items = library();
    for (const [article, title] of LEAD_PINS) {
      const own = items.filter((m) => m.article === article);
      expect(own.length, `${article} has no pictures`).toBeGreaterThan(0);
      expect(own.filter((m) => m.lead).map((m) => m.title), article).toEqual([title]);
      expect(own[0]?.title, `${article} does not open on its lead`).toBe(title);
      expect(pinnedLead(article)).toBe(title);
    }
  });

  it('the ten articles the review named lead on a picture of their own subject', () => {
    const named = ['arts/movie-theatre', 'science/carbon', 'body/brain', 'body/digestion', 'arts/olympic-games', 'ancient/industrial-revolution', 'arts/jesse-owens', 'wildlife/frog', 'inventions/paper', 'arts/mask'];
    for (const a of named) expect(pinnedLead(a), a).toBeDefined();
    const items = library();
    // The pictures the review named as the wrong lead are no longer in their article at all.
    const gone = [
      ['arts/movie-theatre', 'File:Nachos and beer at a Finnkino movie theatre in Itäkeskus.jpg'],
      ['science/carbon', 'File:Centrilobular emphysema 865 lores.jpg'],
      ['body/brain', 'File:Brain Sensor.jpg'],
      ['body/brain', 'File:Brains Season 2 Poster.jpg'],
      ['arts/mask', 'File:A Korean Mask.jpg'],
      ['inventions/paper', 'File:Abandoned Schoolhouse - Pripyat Ghost Town - Chernobyl Exclusion Zone - Northern Ukraine - 08 (27099339605).jpg'],
      ['countries/australia', 'File:Shiraz Wein.jpg'],
      ['earth/mount-kilimanjaro', 'File:IMAGES-7551 11.jpg'],
    ];
    for (const [article, title] of gone) expect(items.filter((m) => m.article === article && m.title === title), `${article ?? ''} ${title ?? ''}`).toEqual([]);
  });

  it('a pinned lead has its thumbnail on disk', () => {
    const items = library();
    for (const [article] of LEAD_PINS) {
      const lead = items.find((m) => m.article === article && m.lead);
      expect(lead, article).toBeDefined();
      expect(existsSync(join('public', 'media', lead?.thumb ?? '')), `${article}: ${lead?.thumb ?? ''}`).toBe(true);
    }
  });
});
