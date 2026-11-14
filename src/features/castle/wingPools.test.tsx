import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync, readdirSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { SUBJECTS, normaliseContinent } from '../../lib/packs/subjects.ts';
import type { PackIndex, Question, QuizSet } from '../../lib/packs/types.ts';
import { getProgress, resetForTests, update } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import { isPictureQuestion, pictureAnswer } from '../../test/pictureAnswer.ts';
import { ROOMS, WINGS } from './castle.ts';
import WingScreen from './WingScreen.tsx';

/** Every question in the committed bank that feeds a wing. */
function questionsFor(wingId: string): Question[] {
  const wing = WINGS.find((w) => w.id === wingId);
  if (!wing) throw new Error(`no wing ${wingId}`);
  const dir = `public/packs/quizzes/${wing.pack}`;
  let allowed: Set<string> | null = null;
  if (wing.continent) {
    const index = JSON.parse(readFileSync('public/packs/countries/index.json', 'utf8')) as PackIndex;
    allowed = new Set(index.items.filter((i) => normaliseContinent(i.continent) === wing.continent).map((i) => i.id));
  }
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && (!allowed || allowed.has(f.replace(/\.json$/, ''))))
    .flatMap((f) => (JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as QuizSet).questions);
}

describe('every castle wing can be completed (17-castle-wings)', () => {
  it('Property 2: every wing draws at least twelve questions from the committed packs. _Req 3_', () => {
    expect(WINGS.length).toBe(16);
    for (const w of WINGS) {
      expect(questionsFor(w.id).length, w.id).toBeGreaterThanOrEqual(ROOMS);
    }
    expect(SUBJECTS.length).toBe(11);
  });

  describe('Property 3: a full wing of twelve rooms can be played from its pool', () => {
    beforeEach(async () => {
      servePacksFromDisk();
      resetForTests();
      await update((p) => ({ ...p, castle: {} }));
      resetForTests();
    });

    it.each(['oceania', 'south-america', 'space', 'people'])('lights all twelve rooms of the %s wing', async (wingId) => {
      const user = userEvent.setup();
      const answers = new Map(questionsFor(wingId).map((q) => [q.prompt, q.options[q.answer] as string]));
      render(<WingScreen params={{ wing: wingId }} />);
      expect(await screen.findByText('0 of 12 rooms lit')).toBeInTheDocument();
      for (let room = 1; room <= ROOMS; room += 1) {
        expect(await screen.findByText(`Room ${room} of 12`, { selector: '.wing__room' })).toBeInTheDocument();
        const legend = document.querySelector('.question__prompt') as HTMLElement;
        const prompt = (legend.lastChild?.textContent ?? '').trim();
        const answer = isPictureQuestion() ? pictureAnswer(WINGS.find((w) => w.id === wingId)?.pack ?? '') : answers.get(prompt);
        expect(answer, `answer for "${prompt}"`).toBeDefined();
        await user.click(screen.getByRole('radio', { name: answer as string }));
        await user.click(screen.getByRole('button', { name: 'Check my answer' }));
        expect(screen.getByText('Right!'), `room ${room}: ${prompt}`).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: room === ROOMS ? 'Open the last door' : 'Walk through the door' }));
      }
      expect(await screen.findByRole('heading', { name: 'You lit the whole wing!' })).toBeInTheDocument();
      await waitFor(() => expect(getProgress().castle[wingId]).toBe(ROOMS));
    }, 60_000);
  });
});
