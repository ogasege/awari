import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EMPTY_PROGRESS, resetForTests, update } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import QuizScreen from '../quiz/QuizScreen.tsx';
import StampsScreen from '../stamps/StampsScreen.tsx';
import SubjectsScreen from './SubjectsScreen.tsx';

/** 21-review-2 Req 16: a print, a strip, tape and a meaningful note on each screen. */
describe('paper furniture on /subjects, /stamps and /quiz', () => {
  beforeEach(async () => {
    servePacksFromDisk();
    resetForTests();
    await update(() => EMPTY_PROGRESS);
  });

  const expectFurniture = (container: HTMLElement) => {
    expect(container.querySelector('.print.page-print img')?.getAttribute('src')).toBeTruthy();
    expect(container.querySelector('.print.page-print img')?.getAttribute('alt')).toBeTruthy();
    expect(container.querySelector('.strip-heading .strip')).not.toBeNull();
    expect(container.querySelector('.print.page-print .tape')).not.toBeNull();
    expect(container.querySelector('.margin-note')?.textContent?.trim().length).toBeGreaterThan(10);
    // Controls stay straight: no rotation on a button, link inside a list of choices, or form control.
    for (const el of container.querySelectorAll('button, input, select')) {
      expect((el as HTMLElement).style.rotate).toBe('');
    }
  };

  it('/subjects', () => {
    const { container } = render(<SubjectsScreen />);
    expectFurniture(container);
  });

  it('/stamps', async () => {
    const { container } = render(<StampsScreen />);
    await screen.findByText(/Your book is empty so far/);
    expectFurniture(container);
  });

  it('/quiz/countries/nigeria', async () => {
    const { container } = render(<QuizScreen params={{ pack: 'countries', id: 'nigeria' }} />);
    await screen.findAllByText(/Question 1 of 5/);
    expectFurniture(container);
  });
});
