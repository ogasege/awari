/**
 * Takes out of an event sentence the date the screen already shows beside it (26-final-review D-23, D-24, round 2):
 * "Robert Fulton was born on 14 November 1765." under "On this day, 14 November" with the badge 1765 reads
 * "Robert Fulton was born." On the timeline, where only the year is shown, only the year goes:
 * "Born 4 February 1900." becomes "Born 4 February."
 */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parts(isoDate: string): { day: number; month: string; year: number } | null {
  const m = /^(-?\d{1,4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!m) return null;
  return { year: Number(m[1]), month: MONTHS[Number(m[2]) - 1] ?? '', day: Number(m[3]) };
}

/** Removes the whole date (day, month and year) of `isoDate` from the sentence. */
export function withoutDate(text: string, isoDate: string): string {
  const p = parts(isoDate);
  if (!p || !p.month) return text;
  const re = new RegExp(`\\s*(?:\\bon\\s+)?(?:${p.day}\\s+${p.month},?\\s+${p.year}|${p.month}\\s+${p.day},?\\s+${p.year})\\b`, 'i');
  const out = text.replace(re, '').replace(/\s+([.,;!?])/g, '$1').trim();
  return out.length >= 8 && out !== text ? out : text;
}

/** Removes only the year of `isoDate` where it closes a date ("4 February 1900" becomes "4 February"). */
export function withoutYear(text: string, isoDate: string): string {
  const p = parts(isoDate);
  if (!p || !p.month) return text;
  return text.replace(new RegExp(`(\\d{1,2}\\s+${p.month}|${p.month}\\s+\\d{1,2}),?\\s+${p.year}\\b`, 'i'), '$1');
}
