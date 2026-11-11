import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  TEXT_PAIRS,
  contrastRatio,
  palette,
  requiredRatio,
} from './contrast.ts';

const hex = fc
  .integer({ min: 0, max: 0xffffff })
  .map((n) => `#${n.toString(16).padStart(6, '0')}`);

describe('contrast (01-app-shell)', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 1);
  });

  it('Property 6: every declared text pair meets WCAG AA (Req 3.3)', () => {
    for (const pair of TEXT_PAIRS) {
      const ratio = contrastRatio(palette[pair.text], palette[pair.on]);
      expect(
        ratio,
        `${pair.text} on ${pair.on} (${pair.use}) = ${ratio.toFixed(2)}`,
      ).toBeGreaterThanOrEqual(requiredRatio(pair));
    }
  });

  it('Property 6b: contrast is symmetric and between 1 and 21', () => {
    fc.assert(
      fc.property(hex, hex, (a, b) => {
        const r = contrastRatio(a, b);
        expect(r).toBeCloseTo(contrastRatio(b, a), 10);
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(21 + 1e-9);
      }),
    );
  });
});
