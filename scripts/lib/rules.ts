/**
 * Pure checks behind `npm run rules` and `npm run credits`, kept free of
 * file-system access so they can be unit and property tested.
 */

/** The banned product name, assembled so this file never spells it. */
export const BANNED_NAME = String.fromCharCode(
  69, 110, 99, 97, 114, 116, 97,
);

/** Files allowed to mention the banned name because they state the rule. */
export const BANNED_NAME_ALLOWLIST = new Set([
  'KICKOFF.md',
  'docs/brief.md',
  '.kiro/steering/hackathon-rules.md',
]);

/**
 * Files that may say once, in plain words, what inspired Awari (hard
 * rule 2 in KICKOFF.md).
 */
export const ONE_MENTION_FILES = new Set(['README.md', 'docs/devpost.md']);

/** Returns the paths whose text mentions the banned name too often. */
export function findBannedMentions(
  files: ReadonlyArray<{ path: string; text: string }>,
): string[] {
  const pattern = new RegExp(BANNED_NAME, 'gi');
  return files
    .filter((f) => !BANNED_NAME_ALLOWLIST.has(f.path))
    .filter((f) => {
      const count = f.text.match(pattern)?.length ?? 0;
      return count > (ONE_MENTION_FILES.has(f.path) ? 1 : 0);
    })
    .map((f) => f.path);
}

/** Returns true when a .gitignore body would ignore the `.kiro` folder. */
export function gitignoreHidesKiro(gitignore: string): boolean {
  return gitignore
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .some((line) => /^(\/)?\.kiro(\/.*)?$/.test(line) || line === '.*');
}

/** Extensions treated as bundled photos or data needing a credit. */
export const CREDITED_EXTENSIONS = [
  '.json',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
];

/**
 * Lists the bundled files that have no entry in CREDITS.md. A file is
 * credited when its path relative to `public/` appears in the text, or
 * when a directory glob line such as `packs/countries/*.json` covers it.
 */
export function uncreditedFiles(
  bundled: readonly string[],
  credits: string,
): string[] {
  const globs = [...credits.matchAll(/`([^`]*\*[^`]*)`/g)].map((m) =>
    globToRegExp(m[1] ?? ''),
  );
  return bundled.filter((path) => {
    if (!CREDITED_EXTENSIONS.some((ext) => path.endsWith(ext))) {
      return false;
    }
    if (credits.includes(path)) {
      return false;
    }
    return !globs.some((re) => re.test(path));
  });
}

/** Converts a simple `*` glob (no `**`) to an anchored regular expression. */
export function globToRegExp(glob: string): RegExp {
  const escaped = glob
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${escaped}$`);
}
