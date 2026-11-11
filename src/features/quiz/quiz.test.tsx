import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import type { QuizSet } from '../../lib/packs/types.ts';
import { getProgress, resetForTests } from '../../lib/store/progress.ts';
import { servePacksFromDisk } from '../../test/packFetch.ts';
import QuizScreen from './QuizScreen.tsx';

const nigeria = JSON.parse(
  readFileSync('public/packs/quizzes/countries/nigeria.json', 'utf8'),
) as QuizSet;

describe('Nigeria quiz from the pack (05-quizzes)', () => {
  beforeEach(() => {
    servePacksFromDisk();
    resetForTests();
  });

  it('plays five questions with hints, words for right and wrong, proofs and a saved score', async () => {
    const user = userEvent.setup();
    render(<QuizScreen params={{ pack: 'countries', id: 'nigeria' }} />);
    expect(await screen.findByText('Question 1 of 5', { selector: '.question__count' })).toBeInTheDocument();

    for (const [i, q] of nigeria.questions.entries()) {
      const answer = q.options[q.answer] as string;
      if (i === 0) {
        // Climb the whole hint ladder on the first question.
        expect(screen.getByText('3 hints left')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Give me a nudge' }));
        expect(screen.getByText(q.hints.nudge)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Where should I look?' }));
        expect(screen.getByText(q.hints.whereToLook)).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Take away two answers' }));
        expect(screen.getAllByRole('radio')).toHaveLength(2);
        expect(screen.getByText('0 hints left')).toBeInTheDocument();
      }
      if (i === 1) {
        // A wrong answer is said in words.
        const wrong = q.options.find((_, j) => j !== q.answer) as string;
        await user.click(screen.getByRole('radio', { name: wrong }));
        await user.click(screen.getByRole('button', { name: 'Check my answer' }));
        expect(screen.getByText('Not quite.')).toBeInTheDocument();
      }
      await user.click(screen.getByRole('radio', { name: answer }));
      await user.click(screen.getByRole('button', { name: 'Check my answer' }));
      expect(screen.getByText('Right!')).toBeInTheDocument();
      expect(screen.getByText(q.proof)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: i === 4 ? 'See my score' : 'Next question' }));
    }

    expect(screen.getByRole('heading', { name: 'You got 5 out of 5' })).toBeInTheDocument();
    await waitFor(() =>
      expect(getProgress().quizzes['countries/nigeria']).toMatchObject({ correct: 5, total: 5, hintsUsed: 3 }),
    );
  });
});
