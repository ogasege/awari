/**
 * Applies the lead rules (26-final-review D-17 to D-22) to the articles
 * already in `public/packs`, without fetching anything: each article's
 * lead section goes through `cleanLead`, then its hand-written override,
 * then the summary is derived again and copied into the pack index. New
 * builds are clean already, because `buildArticle` applies the same
 * functions.
 *
 *   npx tsx scripts/packs/clean-leads.ts [--dry]
 *
 * Run `npx tsx scripts/packs/rebuild-home.ts` afterwards: Home's notes
 * and the manifest follow the text.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Article, PackIndex } from '../../src/lib/packs/types.ts';
import { SUBJECTS } from '../../src/lib/packs/subjects.ts';
import { cleanLead } from '../../src/lib/text/leads.ts';
import { MANIFEST_FILE, buildManifest } from './manifest.ts';
import { applyLeadTextOverride } from './lead-text-overrides.ts';
import { summarise } from './text.ts';

const DIR = join('public', 'packs');
const dry = process.argv.includes('--dry');
let leads = 0;
let summaries = 0;

for (const subject of SUBJECTS) {
  const dir = join(DIR, subject.id);
  const indexPath = join(dir, 'index.json');
  const index = JSON.parse(readFileSync(indexPath, 'utf8')) as PackIndex;
  const byId = new Map(index.items.map((item) => [item.id, item]));
  let indexChanged = false;

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json') || file === 'index.json' || file === 'facts.json') {
      continue;
    }
    const path = join(dir, file);
    const article = JSON.parse(readFileSync(path, 'utf8')) as Article;
    if (!Array.isArray(article.sections)) {
      continue;
    }
    const key = `${subject.id}/${article.id}`;
    const sections = cleanLead(article.sections);
    const lead = sections[0];
    if (lead) {
      lead.paragraphs = [
        applyLeadTextOverride(key, lead.paragraphs[0] ?? ''),
        ...lead.paragraphs.slice(1),
      ];
    }
    const summary = summarise(sections);
    const leadChanged =
      JSON.stringify(sections[0]) !== JSON.stringify(article.sections[0]);
    if (!leadChanged && summary === article.summary) {
      continue;
    }
    if (leadChanged) {
      leads += 1;
      console.log(`lead ${key}`);
      console.log(`  -- ${article.sections[0]?.paragraphs[0] ?? ''}`);
      console.log(`  ++ ${lead?.paragraphs[0] ?? ''}`);
    }
    if (summary !== article.summary) {
      summaries += 1;
    }
    const item = byId.get(article.id);
    if (item && item.summary !== summary) {
      item.summary = summary;
      indexChanged = true;
    }
    if (!dry) {
      writeFileSync(path, `${JSON.stringify({ ...article, summary, sections })}\n`);
    }
  }
  if (indexChanged && !dry) {
    writeFileSync(indexPath, `${JSON.stringify(index)}\n`);
  }
}

if (!dry) {
  const previous = JSON.parse(readFileSync(join(DIR, MANIFEST_FILE), 'utf8')) as { built: string };
  writeFileSync(
    join(DIR, MANIFEST_FILE),
    `${JSON.stringify(buildManifest(DIR, previous.built))}\n`,
  );
}
console.log(`${leads} leads and ${summaries} summaries changed${dry ? ' (dry run)' : ''}`);
