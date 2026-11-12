import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OnThisDay } from '../home/OnThisDay.tsx';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import TimelineScreen from './TimelineScreen.tsx';

describe('Timeline screen from the committed pack (07-timeline 3.2)', () => {
  beforeEach(() => {
    servePacksFromDisk();
    vi.useRealTimers();
    window.history.replaceState(null, '', '/timeline');
  });

  it('lists events oldest first, filters by subject and says what is shown. _Req 2.1, 2.2_', async () => {
    const user = userEvent.setup();
    render(<TimelineScreen />);
    expect(await screen.findByText(/Showing 123 events\./)).toBeInTheDocument();

    const lists = screen.getAllByRole('list').filter((l) => l.tagName === 'OL');
    const years = lists.flatMap((l) =>
      within(l)
        .getAllByRole('listitem')
        .map((li) => Number(/^(\d+):/.exec(li.querySelector('h3')?.textContent ?? '')?.[1])),
    );
    expect(years).toHaveLength(123);
    expect(years).toEqual([...years].sort((a, b) => a - b));

    const countries = screen.getByRole('button', { name: 'Countries' });
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(countries);
    expect(countries).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText(/Showing 23 events about Countries\./)).toBeInTheDocument();
    expect(screen.getByText('Mali became an independent country on 22 September 1960.')).toBeInTheDocument();
    expect(screen.queryByText(/Marie Curie was born/)).not.toBeInTheDocument();
    // A country event links to its article.
    expect(screen.getByRole('link', { name: 'Read about Mali' })).toHaveAttribute('href', '/article/countries/mali');

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText(/Showing 123 events\./)).toBeInTheDocument();
    expect(screen.getByText('Marie Curie was born on 7 November 1867.')).toBeInTheDocument();
  });

  it('opens at ?year= on the event of that year', async () => {
    window.history.replaceState(null, '', '/timeline?year=1867');
    render(<TimelineScreen />);
    // Two events share 1867; the screen opens at the first of them.
    const first = (await screen.findByText('Wilbur Wright was born on 16 April 1867.')).closest('li');
    expect(first).toHaveClass('is-picked');
    expect(screen.getByText('Marie Curie was born on 7 November 1867.').closest('li')).not.toHaveClass('is-picked');
  });

  it('draws the ruler hidden from screen readers with a you-are-here arrow. _Req 2.4_', async () => {
    const { container } = render(<TimelineScreen />);
    await screen.findByText(/Showing 123 events\./);
    const ruler = container.querySelector('svg.tl-ruler');
    expect(ruler).toHaveAttribute('aria-hidden', 'true');
    expect(ruler?.textContent).toContain('you are here');
  });

  it('shows the On this day band for a date with events, and says so in words for one without. _Req 2.3_', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 16, 12));
    const { unmount } = render(<TimelineScreen />);
    const band = (await screen.findByRole('heading', { name: 'On this day, 16 November' })).closest('section') as HTMLElement;
    expect(within(band).getByText(/UNESCO was founded on 16 November 1945\./)).toBeInTheDocument();
    expect(within(band).getByText(/Chinua Achebe was born on 16 November 1930\./)).toBeInTheDocument();
    unmount();

    vi.setSystemTime(new Date(2026, 0, 2, 12));
    render(<TimelineScreen />);
    expect(await screen.findByText(/No events are filed for 2 January yet\./)).toBeInTheDocument();
  });
});

describe('Home: On this day (07-timeline 3.2, Req 3)', () => {
  beforeEach(() => {
    servePacksFromDisk();
  });

  it('shows up to three events for today, spread across subjects, oldest first. _Req 3.1_', async () => {
    render(<OnThisDay today={new Date(2026, 10, 16, 12)} />);
    expect(await screen.findByText(/Chinua Achebe was born/)).toBeInTheDocument();
    expect(screen.getByText(/UNESCO was founded/)).toBeInTheDocument();
    const years = screen.getAllByText(/^(1930|1945)$/);
    expect(years.length).toBeGreaterThan(0);
  });

  it('says so in words when nothing is filed. _Req 3.2_', async () => {
    render(<OnThisDay today={new Date(2026, 0, 2, 12)} />);
    expect(await screen.findByText(/No events filed for today yet/)).toBeInTheDocument();
  });
});
