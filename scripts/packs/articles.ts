/**
 * Builds pack `Article` records from Simple English Wikipedia extracts,
 * shared by the Countries and Physics packs.
 */
import type { Article, PackId } from '../../src/lib/packs/types.ts';
import { cleanLead } from '../../src/lib/text/leads.ts';
import { applyLeadTextOverride } from './lead-text-overrides.ts';
import { deriveNotes } from './notes.ts';
import { stripParenthetical, slugify } from './slug.ts';
import { isoDate, wikipediaSource } from './sources.ts';
import { splitSections, summarise } from './text.ts';
import { getExtract } from './wikipedia.ts';

/** Fetches and converts one article. Photos are added later. */
export async function buildArticle(
  pack: PackId,
  wikiTitle: string,
): Promise<Article> {
  const extract = await getExtract(wikiTitle);
  const id = slugify(extract.title);
  // The extract keeps the brackets and labels of the templates it strips,
  // so the lead needs cleaning before anything is derived from it
  // (26-final-review D-17 to D-22).
  const sections = cleanLead(splitSections(extract.extract));
  const lead = sections[0];
  if (lead) {
    const repaired = applyLeadTextOverride(`${pack}/${id}`, lead.paragraphs[0] ?? '');
    lead.paragraphs = [repaired, ...lead.paragraphs.slice(1)];
  }
  if (sections.length === 0) {
    throw new Error(`Article "${wikiTitle}" has no usable sections`);
  }
  const title = stripParenthetical(extract.title);
  return {
    id,
    pack,
    title,
    summary: summarise(sections),
    sections,
    photos: [],
    notes: deriveNotes(sections),
    ...(extract.qid ? { qid: extract.qid } : {}),
    source: wikipediaSource(extract.title, isoDate(extract.fetched)),
  };
}

/** Throws when two articles in a pack share a slug. */
export function assertUniqueIds(articles: readonly Article[]): void {
  const seen = new Map<string, string>();
  for (const a of articles) {
    const other = seen.get(a.id);
    if (other !== undefined) {
      throw new Error(`Slug "${a.id}" is used by "${other}" and "${a.title}"`);
    }
    seen.set(a.id, a.title);
  }
}
