/** Pure helpers for article credits and the facts card. */
import type { Article, CountryFacts, Source } from '../../lib/packs/types.ts';

export interface CreditLine {
  text: string;
  source: Source;
}

/** Credit lines for an article's text and every photo on it. */
export function articleCredits(article: Article): CreditLine[] {
  const lines: CreditLine[] = [
    {
      text: `Text adapted (split into sections) from “${article.source.name}”, licensed ${article.source.licence}.`,
      source: article.source,
    },
  ];
  for (const photo of article.photos) {
    lines.push({
      text: `Photo: ${photo.caption || photo.alt}, by ${photo.credit.author ?? 'unknown author'}, ${photo.credit.licence}.`,
      source: photo.credit,
    });
  }
  return lines;
}

const NUMBER = new Intl.NumberFormat('en-GB');

/** Formats a whole number with separators, or null if not usable. */
export function formatNumber(n: number | undefined): string | null {
  return n !== undefined && Number.isFinite(n) ? NUMBER.format(Math.round(n)) : null;
}

/** Rows for the facts card, skipping anything unknown. */
export function factRows(f: CountryFacts): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string | null }> = [
    { label: 'Capital', value: f.capital ?? null },
    {
      label: 'People',
      value: formatNumber(f.population)
        ? `${formatNumber(f.population)}${f.populationYear ? ` (${f.populationYear})` : ''}`
        : null,
    },
    { label: 'Area', value: formatNumber(f.areaKm2) ? `${formatNumber(f.areaKm2)} km²` : null },
    { label: f.languages.length > 1 ? 'Languages' : 'Language', value: f.languages.join(', ') || null },
    // Wikidata writes currency names in lower case ("naira"); a facts card reads like the labels around it (round 3, D-32).
    { label: 'Money', value: f.currency ? f.currency.charAt(0).toUpperCase() + f.currency.slice(1) : null },
    { label: 'Continent', value: f.continent || null },
  ];
  return rows.filter((r): r is { label: string; value: string } => r.value !== null);
}
