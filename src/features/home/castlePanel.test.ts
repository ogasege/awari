import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { WINGS } from '../castle/castle.ts';
import { castlePanel, enterLabel } from './castlePanel.ts';

describe('castle panel (21-review-2 Req 12)', () => {
  it('writes every button label in sentence case', () => {
    for (const wing of WINGS) {
      expect(enterLabel(wing)).toMatch(/^Enter the /);
      expect(enterLabel(wing)).not.toContain('Enter The');
    }
    expect(enterLabel(undefined)).toBe('Enter the castle');
  });

  it('never shows the Gondar castle for a wing outside Africa', () => {
    for (const wing of WINGS) {
      const panel = castlePanel(wing);
      if (panel.photo === '/photos/castle.jpg') expect(wing.continent).toBe('Africa');
      expect(existsSync(`public${panel.photo}`), panel.photo).toBe(true);
    }
  });

  it('shows a subject wing its own subject cover', () => {
    const wildlife = WINGS.find((w) => w.id === 'wildlife');
    expect(castlePanel(wildlife).photo).toBe('/photos/covers/wildlife.jpg');
  });
});
