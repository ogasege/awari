import { describe, expect, it } from 'vitest';
import { WINGS } from '../castle/castle.ts';
import { castlePanel, enterLabel } from './castlePanel.ts';

describe('castle panel (22-review-3 Req 8)', () => {
  it('writes every button label in sentence case', () => {
    for (const wing of WINGS) {
      expect(enterLabel(wing)).toMatch(/^Enter the /);
      expect(enterLabel(wing)).not.toContain('Enter The');
    }
    expect(enterLabel(undefined)).toBe('Enter the castle');
  });

  it('is a drawn door for every wing, never a photograph', () => {
    for (const wing of WINGS) {
      const panel = castlePanel(wing);
      expect(panel.kind).toBe('door');
      expect(panel).not.toHaveProperty('photo');
      expect(panel.label.length).toBeGreaterThan(2);
      expect(panel.alt).toContain(panel.label);
    }
  });
});
