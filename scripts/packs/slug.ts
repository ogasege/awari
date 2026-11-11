/**
 * Slugs and titles for pack articles. The rule is documented in
 * `.kiro/specs/02-content-packs/requirements.md` (Requirement 2.3) so the
 * app and the pipeline always agree on article ids.
 */

/** Removes a trailing disambiguation such as " (country)". */
export function stripParenthetical(title: string): string {
  return title.replace(/\s*\([^()]*\)\s*$/, '').trim();
}

/**
 * Turns a title into a URL slug: accents folded to ASCII, lowercase,
 * apostrophes deleted, other non-alphanumeric runs replaced by a single
 * hyphen, hyphens trimmed. "Côte d'Ivoire" becomes "cote-divoire".
 */
export function slugify(title: string): string {
  return stripParenthetical(title)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
