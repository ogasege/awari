import { describe, expect, it } from 'vitest';
import { comingUpLabel } from './today.ts';

describe('comingUpLabel (21-review-2 Property 6)', () => {
  const today = new Date(2026, 10, 13); // 13 November

  it('labels an event on another day with its day and month', () => {
    expect(comingUpLabel('1765-11-14', today)).toBe('Coming up: 14 November');
    expect(comingUpLabel('1840-12-01', today)).toBe('Coming up: 1 December');
  });

  it('does not label an event on today\'s date, whatever its year', () => {
    expect(comingUpLabel('1866-11-13', today)).toBeUndefined();
    expect(comingUpLabel('1000-11-13', today)).toBeUndefined();
  });
});
