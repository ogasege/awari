import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync, readdirSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Question, QuizSet } from '../../lib/packs/types.ts';
import { getProgress, resetForTests, update } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import CastleScreen from './CastleScreen.tsx';
import WingScreen from './WingScreen.tsx';

/** Every country question in the committed bank, by its prompt text. */
function answersByPrompt(): Map<string, string> {
  const dir = 'public/packs/quizzes/countries';
  const map = new Map<string, string>();
  for (const f of readdirSync(dir)) {
    const set = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as QuizSet;
    set.questions.forEach((q: Question) => map.set(q.prompt, q.options[q.answer] as string));
  }
  return map;
}

/** The right page for the picture on screen: its file name is the picture's id in the library. */
function pictureAnswer(pack: string): string | undefined {
  const src = document.querySelector('.question__image')?.getAttribute('src') ?? '';
  const id = /\/img\/([0-9a-f]+)\.webp/.exec(src)?.[1];
  const file = JSON.parse(readFileSync(`public/media/${pack}.json`, 'utf8')) as { items: Array<{ id: string; articleTitle: string }> };
  return file.items.find((m) => m.id === id)?.articleTitle;
}

describe('The Castle from the committed packs (06-castle)', () => {
  beforeEach(async () => {
    servePacksFromDisk();
    resetForTests();
    await update((p) => ({ ...p, castle: {} }));
    resetForTests();
  });

  it('lets a student light all twelve rooms of the Africa wing, saves progress and offers the next wing', async () => {
    const user = userEvent.setup();
    const answers = answersByPrompt();
    render(<WingScreen params={{ wing: 'africa' }} />);
    expect(await screen.findByText('0 of 12 rooms lit')).toBeInTheDocument();

    for (let room = 1; room <= 12; room += 1) {
      expect(await screen.findByText(`Room ${room} of 12`, { selector: '.wing__room' })).toBeInTheDocument();
      const legend = document.querySelector('.question__prompt') as HTMLElement;
      const prompt = (legend.lastChild?.textContent ?? '').trim();
      const answer = prompt.startsWith('Which page does this picture') ? pictureAnswer('countries') : answers.get(prompt);
      expect(answer, `answer for "${prompt}"`).toBeDefined();
      await user.click(screen.getByRole('radio', { name: answer as string }));
      await user.click(screen.getByRole('button', { name: 'Check my answer' }));
      expect(screen.getByText('Right!'), `room ${room}: ${prompt} -> ${answer}`).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: room === 12 ? 'Open the last door' : 'Walk through the door' }));
    }

    expect(await screen.findByRole('heading', { name: 'You lit the whole wing!' })).toBeInTheDocument();
    expect(screen.getByText('Every room is lit!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Try the Asia wing/i })).toBeInTheDocument();
    await waitFor(() => expect(getProgress().castle['africa']).toBe(12));
  });

  it('shows each wing at the gate with its lit rooms in words', async () => {
    render(<CastleScreen />);
    const africa = (await screen.findByRole('heading', { name: 'The Africa wing' })).closest('section') as HTMLElement;
    expect(within(africa).getByText('0 of 12 rooms lit')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Electricity wing' })).toBeInTheDocument();
  });
});
