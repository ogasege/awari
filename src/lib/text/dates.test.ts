import { describe, expect, it } from 'vitest';
import { withoutDate, withoutYear } from './dates.ts';

describe('dates already shown beside an event are not repeated (26-final-review D-23, D-24)', () => {
  it('On this day: drops the full date', () => {
    expect(withoutDate('Robert Fulton was born on 14 November 1765.', '1765-11-14')).toBe('Robert Fulton was born.');
    expect(withoutDate('The Berlin Wall fell on November 9, 1989.', '1989-11-09')).toBe('The Berlin Wall fell.');
  });
  it('leaves a sentence alone when the date is not in it, or when too little would remain', () => {
    expect(withoutDate('Ghana became independent.', '1957-03-06')).toBe('Ghana became independent.');
    expect(withoutDate('On 6 March 1957.', '1957-03-06')).toBe('On 6 March 1957.');
  });
  it('timeline: drops only the year that closes the date', () => {
    expect(withoutYear('Born 4 February 1900.', '1900-02-04')).toBe('Born 4 February.');
    expect(withoutYear('Marie Curie was born on 7 November 1867.', '1867-11-07')).toBe('Marie Curie was born on 7 November.');
    expect(withoutYear('Founded in 1900.', '1900-02-04')).toBe('Founded in 1900.');
  });
});
