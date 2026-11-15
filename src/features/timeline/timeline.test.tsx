import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TimelinePack } from '../../lib/packs/types.ts';
import { clearPackCache } from '../../lib/packs/load.ts';
import { onThisDay } from '../home/today.ts';
import { OnThisDay } from '../home/OnThisDay.tsx';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import TimelineScreen, { shortText } from './TimelineScreen.tsx';
import { withoutDate, withoutYear } from '../../lib/text/dates.ts';

const pack = JSON.parse(readFileSync('public/packs/timeline.json', 'utf8')) as TimelinePack;
const TOTAL = pack.events.length;
const COUNTRIES = pack.events.filter((e) => e.subject === 'countries').length;
const OCEANIA = pack.events.filter((e) => e.continent === 'Oceania').length;
const showing = (n: number, tail = ''): RegExp => new RegExp(`Showing ${n} events${tail}\\.`);

describe('Timeline screen from the committed pack (07-timeline 3.2, 18-world-timeline 4)', () => {
  beforeEach(() => {
    clearPackCache();
    servePacksFromDisk();
    vi.useRealTimers();
    window.history.replaceState(null, '', '/timeline');
  });

  it('lists events oldest first, filters by subject and says what is shown. _Req 2.1, 2.2_', async () => {
    const user = userEvent.setup();
    render(<TimelineScreen />);
    expect(await screen.findByText(showing(TOTAL))).toBeInTheDocument();

    const lists = screen.getAllByRole('list').filter((l) => l.tagName === 'OL');
    const years = lists.flatMap((l) =>
      within(l)
        .getAllByRole('listitem')
        .map((li) => Number(/^(\d+):/.exec(li.querySelector('h3')?.textContent ?? '')?.[1])),
    );
    // One century at a time (21-review-2 Req 17): the 1900s, a mix of at most 60.
    expect(years.length).toBeGreaterThan(0);
    expect(years.length).toBeLessThanOrEqual(60);
    expect(years.every((y) => y >= 1900 && y < 2000)).toBe(true);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(screen.getByRole('heading', { name: 'The 1900s' })).toBeInTheDocument();
    const everything = async (): Promise<void> => {
      const more = screen.queryByRole('button', { name: /^Show all \d+ events/ });
      if (more) await user.click(more);
    };

    const countries = screen.getByRole('button', { name: 'Countries' });
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(countries);
    await everything();
    expect(countries).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText(showing(COUNTRIES, ' about Countries'))).toBeInTheDocument();
    expect(screen.getByText('Mali became an independent country on 22 September.')).toBeInTheDocument();
    // Subject and continent together (18-world-timeline Req 6).
    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.click(screen.getByRole('button', { name: 'Oceania' }));
    expect(screen.getByRole('button', { name: 'Oceania' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(showing(OCEANIA, ' in Oceania'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Everywhere' }));
    await user.click(countries);
    await everything();
    expect(screen.queryByText(/Born 7 November 1867/)).not.toBeInTheDocument();
    // A country event links to its article.
    expect(screen.getByRole('link', { name: 'Read about Mali' })).toHaveAttribute('href', '/article/countries/mali');

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText(showing(TOTAL))).toBeInTheDocument();
    // Marie Curie is in the 1800s: move there with the century chip, then show the whole century.
    await user.click(screen.getByRole('button', { name: '1800s' }));
    expect(screen.getByRole('heading', { name: 'The 1800s' })).toBeInTheDocument();
    await everything();
    // Marie Curie's note: her name is the heading, so the sentence keeps only what it adds.
    expect(screen.getByRole('heading', { name: /Marie Curie/ }).closest('li')?.textContent).toContain('Born 7 November.');
    // The previous and next controls walk to the neighbouring centuries.
    await user.click(screen.getByRole('button', { name: '1900s →' }));
    expect(screen.getByRole('heading', { name: 'The 1900s' })).toBeInTheDocument();
  }, 20_000);

  it('shows fewer births than other events by default (21-review-2 Req 18)', async () => {
    const { container } = render(<TimelineScreen />);
    await screen.findByText(showing(TOTAL));
    const items = [...container.querySelectorAll('ol.timeline__list li')];
    const births = items.filter((li) => /was born|^Born /.test(li.textContent ?? '')).length;
    expect(items.length).toBeGreaterThan(10);
    expect(births * 2).toBeLessThan(items.length);
  });

  it('opens at ?year= on the event of that year', async () => {
    window.history.replaceState(null, '', '/timeline?year=1867');
    render(<TimelineScreen />);
    // Several events share 1867; the screen opens at the first of them.
    const firstEvent = pack.events.find((e) => e.date.startsWith('1867'));
    expect(firstEvent).toBeDefined();
    const first = (await screen.findByText(withoutYear(shortText(firstEvent?.label ?? '', firstEvent?.text ?? ''), firstEvent?.date ?? ''))).closest('li');
    expect(first).toHaveClass('is-picked');
    expect(screen.getByRole('heading', { name: 'The 1800s' })).toBeInTheDocument();
  });

  it('draws the ruler hidden from screen readers with a you-are-here arrow. _Req 2.4_', async () => {
    const { container } = render(<TimelineScreen />);
    await screen.findByText(showing(TOTAL));
    const ruler = container.querySelector('svg.tl-ruler');
    expect(ruler).toHaveAttribute('aria-hidden', 'true');
    expect(ruler?.textContent).toContain('you are here');
  });

  it('shows the On this day band for a date with events, and says so in words for one without. _Req 2.3_', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 16, 12));
    const { unmount } = render(<TimelineScreen />);
    const band = (await screen.findByRole('heading', { name: 'On this day, 16 November' })).closest('section') as HTMLElement;
    const items = await within(band).findAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
    for (const li of items) {
      expect(li.textContent).toMatch(/16 November/);
    }
    unmount();

  });

  it('says so in words when a day has nothing filed (pack with no 2 January events)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 0, 2, 12));
    servePacksFromDisk({
      '/packs/timeline.json': { ...pack, events: pack.events.filter((e) => e.date.slice(5, 10) !== '01-02') },
    });
    render(<TimelineScreen />);
    expect(await screen.findByText(/No events are filed for 2 January yet\./)).toBeInTheDocument();
  });
});

describe('Home: On this day (07-timeline 3.2, Req 3)', () => {
  beforeEach(() => {
    clearPackCache();
    servePacksFromDisk();
  });

  it('shows up to three events for today, spread across subjects, oldest first. _Req 3.1_', async () => {
    render(<OnThisDay today={new Date(2026, 10, 16, 12)} />);
    const todays = pack.events.filter((e) => e.date.slice(5, 10) === '11-16');
    expect(todays.length).toBeGreaterThanOrEqual(2);
    const shown = onThisDay(pack.events, new Date(2026, 10, 16, 12), 3);
    expect(shown.length).toBe(3);
    for (const e of shown) {
      expect(await screen.findByText(withoutDate(e.text, e.date))).toBeInTheDocument();
    }
    // Every card is a real event of 16 November; none says "Coming up".
    expect(screen.queryByText(/^Coming up/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/^\d{3,4}$/).length).toBeGreaterThanOrEqual(2);
  });

  it('fills a day with nothing filed with the next events, and says so in words. _Req 3.2; 19-home-world Req 5_', async () => {
    const noJan2 = { ...pack, events: pack.events.filter((e) => e.date.slice(5, 10) !== '01-02') };
    servePacksFromDisk({ '/packs/timeline.json': noJan2 });
    render(<OnThisDay today={new Date(2026, 0, 2, 12)} />);
    expect((await screen.findAllByText(/^Coming up: \d{1,2} [A-Z][a-z]+$/)).length).toBeGreaterThan(0);
  });
});
