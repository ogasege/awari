/**
 * Bundles the quiz Lambda (and the shared validator it imports from
 * ../../src/lib/quiz) into dist/index.mjs for the nodejs22.x runtime.
 */
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.mjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  minify: true,
  sourcemap: false,
  legalComments: 'eof',
  // Some AWS SDK dependencies call require() for Node built-ins.
  banner: {
    js: "import { createRequire } from 'node:module';" +
      'const require = createRequire(import.meta.url);',
  },
});
console.log('Built dist/index.mjs');
