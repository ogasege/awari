import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BANNED_NAME } from '../lib/rules.ts';
import { redactBanned, redactLine } from './redact.mjs';

describe('hook log redaction (26-final-review F-003)', () => {
  it('brackets the banned name in any case', () => {
    expect(redactBanned(`like ${BANNED_NAME} and ${BANNED_NAME.toUpperCase()}`)).toBe('like [product name] and [product name]');
  });
  it('redacts nested values and leaves other fields alone', () => {
    const line = { at: '2026', tool: `ran ${BANNED_NAME}`, files: [`x/${BANNED_NAME}.md`], ok: true, n: 3 };
    expect(redactLine(line)).toEqual({ at: '2026', tool: 'ran [product name]', files: ['x/[product name].md'], ok: true, n: 3 });
  });
  it('the committed hook log has no mention left', () => {
    expect(readFileSync('docs/kiro-evidence/hook-firings.jsonl', 'utf8').toLowerCase()).not.toContain(BANNED_NAME.toLowerCase());
  });
  it('the runner redacts before it writes', () => {
    const runner = readFileSync('scripts/hooks/kiro-hook.mjs', 'utf8');
    expect(runner).toMatch(/redactLine\(line\)/);
  });
});
