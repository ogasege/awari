/**
 * One population figure per country article (22-review-3 Req 11): the facts
 * card carries the checked figure with its year and Wikidata source, so a
 * sentence in the article body that gives the country's own headcount as a
 * different number is removed. Sentences about a city or a group are kept.
 */

/** Countries whose body text states the national headcount without naming the country in that sentence. */
const ODD_PHRASING = new Set(['democratic-republic-of-the-congo', 'saudi-arabia', 'vietnam']);

const CLAIM = /population (?:of|is|was)[^.]{0,40}?(\d[\d,]*(?:\.\d+)?)\s*(million|billion)?|(?:male|female) population is\s*(\d[\d,]*)|(\d[\d,]*(?:\.\d+)?)\s*(million)\s+people living in/gi;

/** The headcounts a sentence gives (people, not percentages). */
export function populationClaims(sentence: string): number[] {
  const out: number[] = [];
  for (const m of sentence.matchAll(CLAIM)) {
    const raw = (m[1] ?? m[3] ?? m[4] ?? '').replace(/,/g, '');
    const unit = (m[2] ?? m[5] ?? '').toLowerCase();
    const n = Number(raw) * (unit === 'million' ? 1e6 : unit === 'billion' ? 1e9 : 1);
    if (Number.isFinite(n) && n > 100_000) out.push(n);
  }
  return out;
}

/** True when the sentence is about the whole country and gives a count that is not the checked one. */
export function conflictsWithFact(sentence: string, id: string, title: string, population: number): boolean {
  const claims = populationClaims(sentence);
  if (claims.length === 0) return false;
  const named = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const own = new RegExp(`population of (?:the )?${named}\\b|${named} (?:has|had|have) (?:an? )?(?:estimated |approximate )?population|${named}'s population`, 'i');
  const countryLevel = own.test(sentence) || ODD_PHRASING.has(id);
  return countryLevel && claims.some((n) => Math.abs(n - population) / population >= 0.15);
}

/**
 * Drops the conflicting sentences from each paragraph. A paragraph with none
 * is returned exactly as it was; one left empty is dropped.
 */
export function withoutConflictingPopulation(paragraphs: readonly string[], id: string, title: string, population: number): string[] {
  const out: string[] = [];
  for (const p of paragraphs) {
    const sentences = p.match(/[^.!?]*(?:\d\.\d|[^.!?])*[.!?]+(?:\s+|$)|[^.!?]+$/g) ?? [p];
    if (!sentences.some((s) => conflictsWithFact(s, id, title, population))) {
      out.push(p);
      continue;
    }
    const rest = sentences.filter((s) => !conflictsWithFact(s, id, title, population));
    // What follows a removed opening sentence may refer to it ("25.2% of these people"): drop the paragraph then.
    const orphaned = conflictsWithFact(sentences[0] ?? '', id, title, population) && /^\s*(\d|these\b|those\b|of these\b)/i.test(rest[0] ?? '');
    const text = orphaned ? '' : rest.join('').trim();
    if (text) out.push(text);
  }
  return out;
}
