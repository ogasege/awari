/** Small file-system helpers shared by the check scripts. */
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Lists every file below `root`, as POSIX paths relative to `base`. */
export function listFiles(root: string, base: string = root): string[] {
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const full = join(root, name);
    if (statSync(full).isDirectory()) {
      return listFiles(full, base);
    }
    return [relative(base, full).split(sep).join('/')];
  });
}
