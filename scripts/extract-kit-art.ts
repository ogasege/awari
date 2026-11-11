/**
 * Copies the decorative doodle layers from the design kit's Home
 * reference (`design/home.html`) into `src/features/home/kitArt.ts`, so
 * Home draws exactly the strokes the art director drew. Also copies the
 * kit logo files into `public/` unchanged (design steering: use the logo
 * as it is). Run with `npx tsx scripts/extract-kit-art.ts`.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('design/home.html', 'utf8');

/** Returns every `<svg class="aw-deco" …>…</svg>` block in order. */
export function decoLayers(source: string): Array<{ viewBox: string; inner: string; attrs: string }> {
  const out: Array<{ viewBox: string; inner: string; attrs: string }> = [];
  const re = /<svg class="aw-deco"([^>]*)>([\s\S]*?)<\/svg>/g;
  for (const m of source.matchAll(re)) {
    const attrs = m[1] ?? '';
    const viewBox = /viewBox="([^"]+)"/.exec(attrs)?.[1] ?? '0 0 100 100';
    const keep = [...attrs.matchAll(/(fill|stroke|stroke-width|stroke-opacity|stroke-linecap|stroke-linejoin)="([^"]+)"/g)]
      .map((a) => `${a[1]}="${a[2]}"`)
      .join(' ');
    out.push({ viewBox, inner: (m[2] ?? '').trim(), attrs: keep });
  }
  return out;
}

const names = ['hero', 'subjects', 'onThisDay', 'stampBook', 'playing'];
const layers = decoLayers(html);

/**
 * The kit draws twelve castle doors (five lit) as closed paths ending in
 * "Z". Home draws them from real progress instead, so they are removed
 * from the static layer.
 */
export function withoutDoors(svg: string): string {
  return svg.replace(/<path d="M[\d.]+ [\d.]+L[\d.]+ [\d.]+C[^"]*Z"( fill="[^"]*")?><\/path>/g, '');
}
const playing = layers[4];
if (playing) {
  const before = playing.inner.length;
  playing.inner = withoutDoors(playing.inner);
  if (playing.inner.length === before) {
    throw new Error('Expected to remove the kit door drawings');
  }
}
if (layers.length !== names.length) {
  throw new Error(`Expected ${names.length} deco layers, found ${layers.length}`);
}

const body = layers
  .map(
    (l, i) =>
      `  ${names[i]}: {\n    viewBox: ${JSON.stringify(l.viewBox)},\n` +
      `    attrs: ${JSON.stringify(l.attrs)},\n    svg: ${JSON.stringify(l.inner)},\n  },`,
  )
  .join('\n');

writeFileSync(
  'src/features/home/kitArt.ts',
  `/**
 * Doodle layers drawn by the art director for Home, extracted from
 * design/home.html by scripts/extract-kit-art.ts. Do not edit by hand.
 * The markup is a trusted build-time constant (no user input).
 */
export interface KitLayer {
  viewBox: string;
  attrs: string;
  svg: string;
}

export const kitArt: Record<${names.map((n) => `'${n}'`).join(' | ')}, KitLayer> = {
${body}
};
`,
);

mkdirSync('public/logo', { recursive: true });
for (const f of ['awari-logo.svg', 'awari-icon.svg', 'awari-icon.png']) {
  copyFileSync(`design/logo/${f}`, `public/logo/${f}`);
}
console.log(`Extracted ${layers.length} layers and copied the logo files.`);
