/** 23-media-library Req 20: a picture quiz plays like any other quiz, and says who took each picture after the answer. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearMediaCache } from '../../lib/media/media.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import QuizScreen from './QuizScreen.tsx';

function rightTitle(): string | undefined {
  const src = document.querySelector('.question__image')?.getAttribute('src') ?? '';
  const id = /\/img\/([0-9a-f]+)\.webp/.exec(src)?.[1];
  const file = JSON.parse(readFileSync('public/media/ancient.json', 'utf8')) as { items: Array<{ id: string; articleTitle: string }> };
  return file.items.find((m) => m.id === id)?.articleTitle;
}

describe('picture quiz', () => {
  beforeEach(() => {
    clearMediaCache();
    servePacksFromDisk();
  });

  it('shows a picture with four page names, accepts the right one and credits the picture', async () => {
    const user = userEvent.setup();
    const { container } = render(<QuizScreen params={{ pack: 'pictures', id: 'ancient' }} />);
    await screen.findAllByText(/Question 1 of 5/);
    expect(container.querySelector('.question__image')).not.toBeNull();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    await user.click(screen.getByRole('radio', { name: rightTitle() as string }));
    await user.click(screen.getByRole('button', { name: 'Check my answer' }));
    expect(screen.getByText('Right!')).toBeInTheDocument();
    expect(container.textContent).toMatch(/Wikimedia Commons\)/);
  });

  it('says so in words for a subject that has no pictures', async () => {
    render(<QuizScreen params={{ pack: 'pictures', id: 'nothing' }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('There is no picture quiz for that subject.');
  });
});
