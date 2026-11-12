/**
 * Pure helpers behind `npm run submission-check` (12-submission-pack):
 * a secret scan and a check that the video script's shot list adds up.
 * File-system access lives in the script, so these can be tested.
 */

/** One kind of secret the scan knows. */
export interface SecretPattern {
  name: string;
  pattern: RegExp;
}

/**
 * Patterns are assembled from pieces so this file never contains a
 * string that matches them.
 */
const P = (...parts: string[]): string => parts.join('');

export const SECRET_PATTERNS: readonly SecretPattern[] = [
  { name: 'AWS access key id', pattern: new RegExp(P('\\b(?:AK', 'IA|AS', 'IA)[0-9A-Z]{16}\\b')) },
  {
    name: 'AWS secret access key',
    pattern: new RegExp(P('aws_secret_access', '_key\\s*[=:]\\s*["\']?[A-Za-z0-9/+=]{30,}'), 'i'),
  },
  { name: 'private key block', pattern: new RegExp(P('-----BEGIN (?:[A-Z]+ )?PRIV', 'ATE KEY-----')) },
  { name: 'GitHub token', pattern: new RegExp(P('\\bgh[pousr]_', '[A-Za-z0-9]{36,}\\b')) },
  { name: 'Slack token', pattern: new RegExp(P('\\bxox[abprs]-', '[A-Za-z0-9-]{10,}')) },
  {
    name: 'bearer token',
    pattern: new RegExp(P('authorization\\s*[:=]\\s*["\']?bea', 'rer\\s+[A-Za-z0-9._-]{20,}'), 'i'),
  },
];

/** A secret found in a file. The value itself is never reported. */
export interface SecretFinding {
  path: string;
  line: number;
  kind: string;
}

/** Scans file texts and reports where secrets are (kind and line only). */
export function findSecrets(
  files: ReadonlyArray<{ path: string; text: string }>,
): SecretFinding[] {
  const found: SecretFinding[] = [];
  for (const file of files) {
    const lines = file.text.split(/\r?\n/);
    lines.forEach((text, i) => {
      for (const { name, pattern } of SECRET_PATTERNS) {
        if (pattern.test(text)) {
          found.push({ path: file.path, line: i + 1, kind: name });
        }
      }
    });
  }
  return found;
}

/** Files that must exist for the submission (Requirement 1.1). */
export const REQUIRED_DOCS: readonly string[] = [
  'README.md',
  'CREDITS.md',
  'LICENSE',
  'docs/devpost.md',
  'docs/video-script.md',
  'docs/judges.md',
  'docs/blog-post.md',
  'docs/social-post.md',
  'docs/runbook.md',
  'docs/kiro-log.md',
];

/** Length the video must have, in seconds (2:55). */
export const VIDEO_SECONDS = 175;

/** "m:ss" as seconds, or undefined. */
export function clock(text: string): number | undefined {
  const m = /^(\d+):([0-5]\d)$/.exec(text.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : undefined;
}

export interface Shot {
  from: number;
  to: number;
  text: string;
}

/**
 * Reads shot-list rows such as `| 0:00 – 0:10 | Cold open | … |` from the
 * video script's markdown.
 */
export function parseShots(markdown: string): Shot[] {
  const shots: Shot[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const m = /^\|\s*(\d+:\d\d)\s*[–-]\s*(\d+:\d\d)\s*\|(.*)\|\s*$/.exec(line);
    const from = m?.[1] ? clock(m[1]) : undefined;
    const to = m?.[2] ? clock(m[2]) : undefined;
    if (m && from !== undefined && to !== undefined) {
      shots.push({ from, to, text: m[3] ?? '' });
    }
  }
  return shots;
}

/**
 * Problems with a shot list: it must start at 0:00, have no gaps or
 * overlaps, end at 2:55, and spend at least 40 seconds on rows marked
 * `[KIRO]`.
 */
export function shotListProblems(shots: readonly Shot[], total = VIDEO_SECONDS): string[] {
  const problems: string[] = [];
  if (shots.length === 0) {
    return ['the video script has no shot list rows like "| 0:00 – 0:10 | … |"'];
  }
  let at = 0;
  for (const s of shots) {
    if (s.from !== at) {
      problems.push(`shot list has a gap or overlap at ${s.from}s (expected ${at}s)`);
    }
    if (s.to <= s.from) {
      problems.push(`shot starting at ${s.from}s does not end after it starts`);
    }
    at = s.to;
  }
  if (at !== total) {
    problems.push(`shot list ends at ${at}s, expected ${total}s`);
  }
  const kiro = shots.filter((s) => s.text.includes('[KIRO]')).reduce((sum, s) => sum + (s.to - s.from), 0);
  if (kiro < 40) {
    problems.push(`only ${kiro}s of the video shows Kiro at work, needs at least 40s`);
  }
  return problems;
}
