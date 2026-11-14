/** Summarises the Lighthouse JSON reports in docs/final-review/lighthouse into a table (docs/final-review/lighthouse.md). */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'docs/final-review/lighthouse';
const rows: string[] = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const r = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as {
    categories: Record<string, { score: number }>;
    audits: Record<string, { numericValue?: number; score?: number | null; title: string }>;
    finalDisplayedUrl?: string;
    lighthouseVersion: string;
  };
  const c = (k: string): string => String(Math.round((r.categories[k]?.score ?? 0) * 100));
  const a = (k: string): string => ((r.audits[k]?.numericValue ?? 0) / 1000).toFixed(1);
  const kb = Math.round((r.audits['total-byte-weight']?.numericValue ?? 0) / 1024);
  rows.push(`| ${f.replace('.json', '')} | ${c('performance')} | ${c('accessibility')} | ${c('best-practices')} | ${c('seo')} | ${a('first-contentful-paint')} s | ${a('largest-contentful-paint')} s | ${Math.round(r.audits['total-blocking-time']?.numericValue ?? 0)} ms | ${(r.audits['cumulative-layout-shift']?.numericValue ?? 0).toFixed(3)} | ${kb} KB |`);
}
const failing: string[] = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
  const r = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as { audits: Record<string, { score: number | null; title: string; scoreDisplayMode: string }>; categories: Record<string, { auditRefs: Array<{ id: string }> }> };
  for (const cat of ['accessibility', 'best-practices']) {
    for (const ref of r.categories[cat]?.auditRefs ?? []) {
      const au = r.audits[ref.id];
      if (au && au.score !== null && au.score < 1 && au.scoreDisplayMode !== 'notApplicable' && au.scoreDisplayMode !== 'manual') failing.push(`- ${f.replace('.json', '')}: ${au.title}`);
    }
  }
}
writeFileSync(
  'docs/final-review/lighthouse.md',
  ['# Lighthouse (live site, headless Chrome, simulated throttling)', '', '| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Transferred |', '|---|---|---|---|---|---|---|---|---|---|', ...rows, '', '## Audits below 100 in accessibility and best practices', ...(failing.length ? failing : ['- none']), ''].join('\n'),
);
console.log(readFileSync('docs/final-review/lighthouse.md', 'utf8'));
