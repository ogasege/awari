/**
 * 21-review-2 Req 1. The tour page once drew the globe as a solid black
 * shape: `atlas.css` was only pulled in by the Atlas route, so opening
 * `/tours/:id` directly left every `fill` at the SVG default. Two things
 * keep that from coming back: the globe's sea and land fills are named
 * design tokens (so a missing token is a visible teal/paper mismatch, not
 * black), and `Globe.tsx` imports its own stylesheet, so any screen that
 * renders a globe gets it.
 */
import { readFileSync } from 'node:fs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

const atlasCss = readFileSync('src/features/atlas/atlas.css', 'utf8');
const tokensCss = readFileSync('src/design/tokens.css', 'utf8');
const globeSource = readFileSync('src/features/atlas/Globe.tsx', 'utf8');

/** The `fill` or `stroke` declared for a selector in `atlas.css`. */
function paintOf(selector: string, property: 'fill' | 'stroke'): string {
  const block = new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`).exec(atlasCss);
  expect(block, `no rule for ${selector}`).not.toBeNull();
  const found = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`).exec(block?.[1] ?? '');
  expect(found, `no ${property} for ${selector}`).not.toBeNull();
  return (found?.[1] ?? '').trim();
}

/** The globe's painted parts and the token each must use. */
const PAINTED = [
  { selector: '.globe__ocean', property: 'fill' as const, token: '--globe-sea' },
  { selector: '.globe__land', property: 'fill' as const, token: '--globe-land' },
  { selector: '.globe__land:hover', property: 'fill' as const, token: '--globe-land-lit' },
  { selector: '.globe__graticule', property: 'stroke' as const, token: '--globe-grid' },
];

describe('Globe styling (21-review-2)', () => {
  it('Property 1: the globe’s sea and land take their fills from design tokens. _Req 1_', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PAINTED), ({ selector, property, token }) => {
        const paint = paintOf(selector, property);
        // A token, not a raw colour: a hex, rgb() or colour name would let
        // the shape render black when the stylesheet is missing entirely.
        expect(paint).toBe(`var(${token})`);
        expect(tokensCss).toMatch(new RegExp(`${token}\\s*:\\s*\\S`));
      }),
      { numRuns: PAINTED.length * 4 },
    );
  });

  it('no globe paint is a raw colour. _Req 1_', () => {
    for (const { selector, property } of PAINTED) {
      expect(paintOf(selector, property)).not.toMatch(/#[0-9a-f]{3,8}|^rgb|^hsl/i);
    }
  });

  it('the globe loads its own stylesheet, so every screen styles it. _Req 1_', () => {
    expect(globeSource).toMatch(/import\s+'\.\/atlas\.css'/);
  });
});
