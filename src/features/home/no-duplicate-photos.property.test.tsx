/** 22-review-3 Property 3 (Req 9): no photograph appears twice on Home, on any of several days. */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearPackCache } from '../../lib/packs/load.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import Home from './Home.tsx';

const DAYS = [new Date(2026, 0, 3, 12), new Date(2026, 2, 17, 12), new Date(2026, 5, 21, 12), new Date(2026, 8, 9, 12), new Date(2026, 10, 13, 12), new Date(2026, 11, 30, 12)];

describe('Home never repeats a photograph (22-review-3 Req 9)', () => {
  beforeEach(() => {
    clearPackCache();
    servePacksFromDisk();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  for (const day of DAYS) {
    it(`on ${day.toDateString()}`, async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(day);
      const { container } = render(<Home />);
      await screen.findByText('Learn by playing');
      await new Promise((r) => setTimeout(r, 300));
      const srcs = [...container.querySelectorAll('img')].map((i) => i.getAttribute('src') ?? '').filter(Boolean);
      expect(srcs.length).toBeGreaterThan(0);
      expect(srcs.filter((s, i) => srcs.indexOf(s) !== i)).toEqual([]);
      // The castle panel is a drawn door, not a picture.
      expect(container.querySelector('.home-castle svg.home-castle__door')).not.toBeNull();
    });
  }
});
