import { describe, expect, it } from 'vitest';
import { offlineStateText } from './CreditsScreen.tsx';

describe('saved state on the Credits screen (25-desktop task 8)', () => {
  it('says whether this device has the site saved', () => {
    expect(offlineStateText('ready')).toBe('On this device: saved. Awari works without a connection.');
    expect(offlineStateText('preparing')).toMatch(/still saving/);
    expect(offlineStateText('unsupported')).toMatch(/not saved/);
  });
});
