/**
 * `packs/manifest.json`: every generated file with its size, which the
 * service worker precaches from. Its shape is fixed in the spec design.
 */
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { SUBJECT_PACKS } from '../../src/lib/packs/subjects.ts';
import { listFiles } from '../lib/files.ts';

/** Name of the manifest file inside the packs folder. */
export const MANIFEST_FILE = 'manifest.json';

/**
 * The entries of `public/packs` this pipeline generates and replaces.
 * Anything else there (for example `quizzes/`, built afterwards by
 * `scripts/quizzes`) is left alone and is not listed in the manifest.
 */
export const OWNED_ENTRIES: readonly string[] = [
  'countries',
  'physics',
  ...SUBJECT_PACKS,
  'home.json',
  'dictionary',
  'atlas',
  'img',
  'timeline.json',
  MANIFEST_FILE,
];

/** True when a path relative to the packs folder is generated here. */
export function isOwned(rel: string): boolean {
  const top = rel.split('/')[0] ?? '';
  return OWNED_ENTRIES.includes(top);
}

/** The manifest written to `/packs/manifest.json`. */
export interface PacksManifest {
  /** ISO date (YYYY-MM-DD) of the build. */
  built: string;
  totalBytes: number;
  /** URL paths such as "/packs/img/nigeria.jpg", sorted. */
  files: { path: string; bytes: number }[];
}

/**
 * Lists every generated file under `dir` (owned entries only, except the
 * manifest itself) with its size.
 */
export function buildManifest(dir: string, built: string): PacksManifest {
  const files = listFiles(dir)
    .filter((p) => p !== MANIFEST_FILE && isOwned(p))
    .sort()
    .map((p) => ({ path: `/packs/${p}`, bytes: statSync(join(dir, p)).size }));
  return {
    built,
    totalBytes: files.reduce((sum, f) => sum + f.bytes, 0),
    files,
  };
}
