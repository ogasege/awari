import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Article, QuizSet } from '../../lib/packs/types.ts';
import { MakeQuiz } from './MakeQuiz.tsx';

const article = JSON.parse(readFileSync('public/packs/countries/nigeria.json', 'utf8')) as Article;
const quiz = JSON.parse(readFileSync('public/packs/quizzes/countries/nigeria.json', 'utf8')) as QuizSet;
const extract = article.sections
  .map((s) => (s.heading ? `== ${s.heading} ==\n` : '') + s.paragraphs.join('\n\n'))
  .join('\n\n');

function fakeFetch(serviceStatus: number): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('https://simple.wikipedia.org/')) {
      return new Response(JSON.stringify({ query: { pages: [{ title: 'Nigeria', extract }] } }), { status: 200 });
    }
    if (serviceStatus !== 200) return new Response('no', { status: serviceStatus });
    return new Response(JSON.stringify({ questions: quiz.questions }), { status: 200 });
  }) as typeof fetch;
}

describe('Make a quiz from any article (05-quizzes 3.1)', () => {
  it('is not drawn when no endpoint is configured', () => {
    const { container } = render(<MakeQuiz endpoint="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('writes, validates and plays a quiz, linking proofs to Wikipedia', async () => {
    const user = userEvent.setup();
    render(<MakeQuiz endpoint="/api/quiz" fetchImpl={fakeFetch(200)} />);
    await user.type(screen.getByLabelText('Article name'), 'Nigeria');
    await user.click(screen.getByRole('button', { name: 'Make my quiz' }));
    const first = quiz.questions[0]!;
    await user.click(await screen.findByRole('radio', { name: first.options[first.answer] as string }));
    await user.click(screen.getByRole('button', { name: 'Check my answer' }));
    expect(screen.getByText('Right!')).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /Nigeria/ });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute('href', expect.stringContaining('simple.wikipedia.org'));
    }
  });

  it('says in words that the bundled quizzes still work when the service fails', async () => {
    const user = userEvent.setup();
    render(<MakeQuiz endpoint="/api/quiz" fetchImpl={fakeFetch(502)} />);
    await user.type(screen.getByLabelText('Article name'), 'Nigeria');
    await user.click(screen.getByRole('button', { name: 'Make my quiz' }));
    expect(await screen.findByText(/still work/)).toBeInTheDocument();
  });
});
