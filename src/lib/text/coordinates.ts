/**
 * Coordinate strings in article text and search results (22-review-3 Req 13, 24-review-4 Req 11). Wikipedia
 * summaries carry the position of a place as text ("30°54′N 31°07′E / 30.900°N 31.117°E / 30.900; 31.117"); the
 * pieces left after a first cut ("117°E / 30.900; 31.117") read as noise. A coordinate run is removed whole: two or
 * more coordinate tokens in a row (degrees with a hemisphere, or a decimal number with at least two decimals),
 * separated by spaces, commas, semicolons or slashes. One token alone ("30°S" in "south to about 30°S") is prose and
 * stays.
 */

const DMS = String.raw`[-+]?\d{1,3}(?:\.\d+)?\s*[°º](?:\s*\d{1,2}(?:\.\d+)?\s*['’′])?(?:\s*\d{1,2}(?:\.\d+)?\s*["”″])?\s*[NSEW]\b`;
const DEC = String.raw`[-+]?\d{1,3}\.\d{2,}(?![\d°º])`;
const TOKEN = `(?:${DMS}|${DEC})`;

/** Two or more tokens in a row: "34°39′N 135°30′E", "117°E / 30.900; 31.117", "30.900°N 31.117°E". A word like "at" that introduced them goes too. */
const RUN_BODY = String.raw`${TOKEN}(?:\s*[\/,;]?\s*${TOKEN})+`;
const RUN = new RegExp(String.raw`(?:\s+(?:at|near))?\s*${RUN_BODY}`, 'g');

/** A bracketed position ("(approximate coordinates 36°27′N, 28°13′E)"): the brackets go with it. */
const BRACKETED = new RegExp(String.raw`\s*\((?:[^()]*?coordinates?\s*)?${RUN_BODY}\s*\)`, 'g');

/**
 * Text with the coordinate strings cut out and nothing else changed: for article text, where every other character
 * ("615 ft / 640 Roman feet", the spacing) must stay as it was.
 */
export function stripCoordinates(text: string): string {
  return text
    .replace(BRACKETED, '')
    .replace(new RegExp(String.raw`,\s+(?:at|near)\s+${RUN_BODY},`, 'g'), '') // "Bequia, at 13°00′N 61°14′W, is" -> "Bequia, is"
    .replace(RUN, '');
}

/** Text without coordinate strings, whitespace tidied: for snippets, which are display-only. */
export function withoutCoordinates(text: string): string {
  return stripCoordinates(text)
    .replace(/\(\s*[/,;]?\s*\)/g, '') // brackets the cut left empty
    .replace(/\s+\/\s*(?=[.,;:)]|$)/g, '') // a slash left at the end of a clause
    .replace(/(^|\s)\/\s+/g, '$1') // a slash left at the start of one
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:)])/g, '$1')
    .trim();
}
