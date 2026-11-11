/**
 * `packs/manifest.json`: every generated file with its size, which the
 * service worker precaches from. Its shape is fixed in the spec design.
 */
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { listFiles } from '../lib/files.ts';

/** Name of the manifest file inside the packs folder. */
export const MANIFEST_FILE = 'manifest.json';

/** The manifest written to `/packs/manifest.json`. */
export interface PacksManifest {
  /** ISO date (YYYY-MM-DD) of the build. */
  built: string;
  totalBytes: number;
  /** URL paths such as "/packs/img/nigeria.jpg", sorted. */
  files: { path: string; bytes: number }[];
}

/** Lists every file under `dir` (except the manifest) with its size. */
export function buildManifest(dir: string, built: string): PacksManifest {
  const files = listFiles(dir)
    .filter((p) => p !== MANIFEST_FILE)
    .sort()
    .map((p) => ({ path: `/packs/${p}`, bytes: statSync(join(dir, p)).size }));
  return {
    built,
    totalBytes: files.reduce((sum, f) => sum + f.bytes, 0),
    files,
  };
}
