/**
 * Write-up checks behind `npm run submission-check` (rules-alignment
 * brief, item 9): the Kiro prompts the rules ask about, banned phrases,
 * standard MIT text, third-party names in the video script, numbers that
 * must match the generated stats, and features that need a route.
 */

/** The eight write-up prompts in the Kiroween rules, in their order. */
export const KIRO_PROMPTS = [
  { id: 'surfaces', heading: /Kiro (IDE, CLI, Web|surfaces)/i },
  { id: 'agents', heading: /custom agents/i },
  { id: 'hooks', heading: /agent hooks/i },
  { id: 'specs', heading: /spec-driven development/i },
  { id: 'steering', heading: /steering/i },
  { id: 'mcp', heading: /\bMCP\b/ },
  { id: 'pbt', heading: /property-based testing/i },
  { id: 'powers', heading: /Kiro powers/i },
] as const;

export type PromptId = (typeof KIRO_PROMPTS)[number]['id'];

/** Markdown headings (any level) of a document. */
export function headings(markdown: string): string[] {
  return markdown
    .split(/\r?\n/)
    .filter((l) => /^#{2,4}\s/.test(l))
    .map((l) => l.replace(/^#+\s*/, '').trim());
}

/**
 * Problems with the "how Kiro was used" part of a write-up: every prompt
 * in `used` must have its own heading, the headings must follow the rules'
 * order, and the phrases that overclaim must not appear.
 */
export function writeupProblems(name: string, markdown: string, used: readonly PromptId[]): string[] {
  const problems: string[] = [];
  const hs = headings(markdown);
  let last = -1;
  for (const p of KIRO_PROMPTS) {
    const at = hs.findIndex((h) => p.heading.test(h));
    if (used.includes(p.id) && at === -1) {
      problems.push(`${name}: no heading for the "${p.id}" prompt`);
    }
    if (at !== -1) {
      if (at < last) problems.push(`${name}: the "${p.id}" heading is out of the rules' order`);
      last = Math.max(last, at);
    }
  }
  if (/end[\s-]to[\s-]end/i.test(markdown)) {
    problems.push(`${name}: says "end to end"`);
  }
  if (/everything was built[^.]*with Kiro/i.test(markdown)) {
    problems.push(`${name}: says "everything was built with Kiro"`);
  }
  return problems;
}

/** The standard MIT licence text GitHub detects, minus the copyright line. */
const MIT_BODY = [
  'Permission is hereby granted, free of charge, to any person obtaining a copy',
  'of this software and associated documentation files (the "Software"), to deal',
  'in the Software without restriction, including without limitation the rights',
  'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell',
  'copies of the Software, and to permit persons to whom the Software is',
  'furnished to do so, subject to the following conditions:',
  'The above copyright notice and this permission notice shall be included in all',
  'copies or substantial portions of the Software.',
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR',
];

/** True when a LICENSE file is the standard MIT text. */
export function isStandardMit(text: string): boolean {
  const flat = text.replace(/\s+/g, ' ');
  return /^MIT License\s+Copyright \(c\) \d{4}/.test(text.trim()) && MIT_BODY.every((l) => flat.includes(l.replace(/\s+/g, ' ')));
}

/**
 * Third-party brands and tracks the video must not name. Kiro is the tool
 * the rules ask to show; AWS appears only in plain technical words, so it
 * is not on this list.
 */
export const VIDEO_BANNED = [
  /\bYouTube\b/i, /\bSpotify\b/i, /\bApple Music\b/i, /\bCoca-?Cola\b/i, /\bDisney\b/i, /\bNike\b/i,
  /\bGoogle\b/i, /\bChrome\b/i, /\bMicrosoft\b/i, /\bWindows\b/i, /\bWikipedia logo\b/i, /\bfeat\./i,
  /\bsong\b/i, /\bsoundtrack\b/i, /\bcover version\b/i,
];

/** Banned names in a video script, with line numbers. */
export function videoNameProblems(script: string): string[] {
  const problems: string[] = [];
  script.split(/\r?\n/).forEach((line, i) => {
    for (const re of VIDEO_BANNED) {
      if (re.test(line) && !/no (third-party|copyrighted)/i.test(line) && !/never shown/i.test(line)) {
        problems.push(`docs/video-script.md:${i + 1}: names "${line.match(re)?.[0] ?? ''}"`);
      }
    }
  });
  return problems;
}

/**
 * Numbers in a write-up written as `<!--n:key-->123<!--/n-->` must equal
 * the generated stat. Returns the mismatches and the number of tagged
 * numbers checked.
 */
export function numberProblems(name: string, markdown: string, stats: Readonly<Record<string, number | string>>): { problems: string[]; checked: number } {
  const problems: string[] = [];
  let checked = 0;
  for (const m of markdown.matchAll(/<!--n:([A-Za-z_]+)-->([^<]*)<!--\/n-->/g)) {
    checked += 1;
    const key = m[1] as string;
    const shown = (m[2] ?? '').replace(/,/g, '').trim();
    const want = stats[key];
    if (want === undefined) {
      problems.push(`${name}: number "${key}" is not a generated stat`);
    } else if (shown !== String(want)) {
      problems.push(`${name}: says ${key} = ${shown}, the repo says ${want}`);
    }
  }
  return { problems, checked };
}

/** Replaces every tagged number with the current generated value. */
export function fillNumbers(markdown: string, stats: Readonly<Record<string, number | string>>): string {
  return markdown.replace(/<!--n:([A-Za-z_]+)-->([^<]*)<!--\/n-->/g, (all, key: string) => {
    const v = stats[key];
    if (v === undefined) return all;
    const text = typeof v === 'number' && v >= 10_000 ? v.toLocaleString('en-GB') : String(v);
    return `<!--n:${key}-->${text}<!--/n-->`;
  });
}

/**
 * A plain number written next to a counted noun, without a tag, such as
 * "197 countries". The gate fails on these so every count is generated.
 */
export const UNTAGGED_COUNT =
  /(?<![\w>:-])\d[\d,]*\s+(specs?|properties|tests|commits|countries|articles|photos|quizzes|questions|events|lemmas|wings|tours|stops|subjects|hooks|agents|steering files|MCP servers)\b/i;

/** Untagged counts in a markdown document (code blocks and tables of commands are skipped). */
export function untaggedCounts(name: string, markdown: string): string[] {
  const out: string[] = [];
  let code = false;
  markdown.split(/\r?\n/).forEach((line, i) => {
    if (line.startsWith('```')) code = !code;
    if (code) return;
    const plain = line.replace(/<!--n:[^>]*-->[^<]*<!--\/n-->/g, 'N');
    const m = UNTAGGED_COUNT.exec(plain);
    if (m && !/(\b(Africa|Oceania|Asia|Europe|America)\b.*\d+ countries)|of 197 countries|N of N/.test(plain)) {
      out.push(`${name}:${i + 1}: untagged count "${m[0]}"`);
    }
  });
  return out;
}

/** A feature a document names, and the route or test that must exist for it. */
export interface Feature {
  name: RegExp;
  route?: string;
  test: string;
}

/** Features the write-up, README and video name; each needs a route and a test file. */
export const FEATURES: readonly Feature[] = [
  { name: /tap any word|tap-a-word|side card/i, route: 'article', test: 'src/features/article/article.test.tsx' },
  { name: /any (topic|article)|open(s)? any|on demand/i, route: 'article', test: 'src/features/article/wiki.test.tsx' },
  { name: /globe/i, route: 'atlas', test: 'src/features/atlas/atlas.test.tsx' },
  { name: /stamp book|postage stamp/i, route: 'stamps', test: 'src/features/stamps/stamps.test.tsx' },
  { name: /hint ladder|three hints|a nudge/i, route: 'quiz', test: 'src/features/quiz/quiz.test.tsx' },
  { name: /castle/i, route: 'wing', test: 'src/features/castle/castle.test.tsx' },
  { name: /timeline|on this day/i, route: 'timeline', test: 'src/features/timeline/timeline.test.tsx' },
  { name: /guided tours?|great rivers|ring of fire/i, route: 'tour', test: 'src/features/tours/tours.component.test.tsx' },
  { name: /subject (page|packs?)|step into a subject/i, route: 'subject', test: 'src/features/subject/subject.test.tsx' },
  { name: /search/i, route: 'search', test: 'src/features/search/search.test.tsx' },
  { name: /airplane mode|offline/i, test: 'scripts/offline-check.ts' },
  { name: /quiz service|Bedrock/i, test: 'services/quiz-lambda/test/handler.test.ts' },
];

/** Features named in a document that lack a route or a test. */
export function featureProblems(
  name: string,
  markdown: string,
  routes: ReadonlySet<string>,
  exists: (path: string) => boolean,
): string[] {
  const out: string[] = [];
  for (const f of FEATURES) {
    if (!f.name.test(markdown)) continue;
    if (f.route && !routes.has(f.route)) out.push(`${name}: names a feature (${f.name.source}) with no "${f.route}" route`);
    if (!exists(f.test)) out.push(`${name}: names a feature (${f.name.source}) with no test at ${f.test}`);
  }
  return out;
}
