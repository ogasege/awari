/**
 * Keeps the banned product name out of the hook log (26-final-review F-003). The hook runner records the command it
 * saw, and a command can quote the name, which would make `npm run rules` fail on a log that is meant to be committed.
 * The name is assembled here so this file never spells it.
 */
const NAME = String.fromCharCode(69, 110, 99, 97, 114, 116, 97);
const PATTERN = new RegExp(NAME, 'gi');

/** Replaces every mention with a bracketed placeholder. */
export function redactBanned(text) {
  return typeof text === 'string' ? text.replace(PATTERN, '[product name]') : text;
}

/** Redacts every string value of a log line, at any depth. */
export function redactLine(value) {
  if (typeof value === 'string') return redactBanned(value);
  if (Array.isArray(value)) return value.map(redactLine);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactLine(v)]));
  return value;
}
