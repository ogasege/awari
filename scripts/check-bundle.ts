/**
 * Fails when the JavaScript needed for the first load is over budget
 * (01-app-shell Req 6.1). Measures, uncompressed, every script and
 * modulepreload file that dist/index.html references, plus the static
 * imports of those files, before any pack is fetched.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const BUDGET_BYTES = 300 * 1000;
const DIST = 'dist';

/** Local JS files referenced by an HTML document. */
export function referencedScripts(html: string): string[] {
  const urls = new Set<string>();
  for (const m of html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)) urls.add(m[1] as string);
  for (const m of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*\shref="([^"]+)"/g)) urls.add(m[1] as string);
  return [...urls].filter((u) => u.startsWith('/') && u.endsWith('.js'));
}

/** Static `import ... from "./x.js"` and `import "./x.js"` targets. */
export function staticImports(code: string): string[] {
  const out: string[] = [];
  for (const m of code.matchAll(/(?:^|[;}\s])(?:import|export)\s*(?:[^'"()]*?from\s*)?["'](\.[^"']+\.js)["']/g)) {
    out.push(m[1] as string);
  }
  return out;
}

function main(): void {
  const indexPath = join(DIST, 'index.html');
  if (!existsSync(indexPath)) {
    console.error('dist/index.html not found. Run npm run build first.');
    process.exit(1);
  }
  const seen = new Map<string, number>();
  const queue = referencedScripts(readFileSync(indexPath, 'utf8')).map((u) => join(DIST, u));
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file) || !existsSync(file)) continue;
    const code = readFileSync(file, 'utf8');
    seen.set(file, Buffer.byteLength(code));
    for (const rel of staticImports(code)) {
      queue.push(join(file, '..', rel));
    }
  }
  const total = [...seen.values()].reduce((a, b) => a + b, 0);
  for (const [f, n] of seen) console.log(`  ${(n / 1000).toFixed(1).padStart(7)} KB  ${f}`);
  console.log(`First-load JavaScript: ${(total / 1000).toFixed(1)} KB (budget ${BUDGET_BYTES / 1000} KB)`);
  if (total > BUDGET_BYTES) {
    console.error('Over the first-load JavaScript budget.');
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('check-bundle.ts')) main();
