/**
 * "Make a quiz from any article" (05-quizzes Req 4). Only drawn when a
 * quiz service endpoint is configured. It fetches a Simple English
 * Wikipedia article, asks the service for questions, and plays them with
 * the same hint ladder. Every question was re-validated in the app by
 * `fetchRemoteQuiz`. When anything fails, the bundled quizzes carry on.
 */
import { useState, type FormEvent } from 'react';
import { MarginNote } from '../../design/paper.tsx';
import { fetchRemoteQuiz } from '../../lib/quiz/remote.ts';
import { fetchWikipediaText } from '../../lib/quiz/wikipedia.ts';
import type { QuizSet } from '../../lib/packs/types.ts';
import { Quiz } from './QuizScreen.tsx';

/** Where the quiz service lives, from the build environment. */
export function configuredEndpoint(): string {
  const value = import.meta.env['VITE_QUIZ_ENDPOINT'] as string | undefined;
  return value?.trim() ?? '';
}

type State =
  | { status: 'idle' }
  | { status: 'working' }
  | { status: 'failed'; reason: 'offline' | 'article' | 'service' }
  | { status: 'ready'; quiz: QuizSet; url: string };

const MESSAGES: Record<'offline' | 'article' | 'service', string> = {
  offline:
    'Extra quizzes need a connection, and you are offline. The quizzes below work without one.',
  article:
    'I could not find a long enough Simple English Wikipedia article with that name. Try another title.',
  service:
    'The quiz maker could not write fair questions for that article just now. The quizzes below still work.',
};

export function MakeQuiz({
  endpoint = configuredEndpoint(),
  fetchImpl = fetch,
}: {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}) {
  const [title, setTitle] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });
  if (endpoint === '') return null;

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setState({ status: 'failed', reason: 'offline' });
      return;
    }
    setState({ status: 'working' });
    const article = await fetchWikipediaText(title, fetchImpl);
    if (!article) {
      setState({ status: 'failed', reason: 'article' });
      return;
    }
    const questions = await fetchRemoteQuiz(endpoint, article.title, article.text, fetchImpl, {
      pack: 'countries',
    });
    if (!questions) {
      setState({ status: 'failed', reason: 'service' });
      return;
    }
    const quiz: QuizSet = {
      articleId: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      pack: 'countries',
      title: article.title,
      questions,
      source: {
        name: `Simple English Wikipedia: ${article.title}`,
        url: article.url,
        licence: 'CC BY-SA 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        retrieved: new Date().toISOString().slice(0, 10),
      },
    };
    setState({ status: 'ready', quiz, url: article.url });
  }

  return (
    <section className="make-quiz" aria-labelledby="make-quiz-title">
      <h2 id="make-quiz-title">Make a quiz from any article</h2>
      <p>
        Type the name of a Simple English Wikipedia article. A quiz maker writes five questions, and
        the app checks every one against the article before you see it.
      </p>
      <form onSubmit={(e) => void submit(e)} className="make-quiz__form">
        <label>
          <span>Article name</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Try “Volcano” or “Elephant”"
          />
        </label>
        <button type="submit" className="btn btn--ink" disabled={title.trim() === '' || state.status === 'working'}>
          Make my quiz
        </button>
      </form>
      <MarginNote className="deco" decorative tilt={-3} size={28}>
        it can take half a minute!
      </MarginNote>
      <p role="status" aria-live="polite" className="make-quiz__status">
        {state.status === 'working'
          ? 'Reading the article and writing questions…'
          : state.status === 'failed'
            ? MESSAGES[state.reason]
            : ''}
      </p>
      {state.status === 'ready' ? <Quiz key={state.quiz.articleId} quiz={state.quiz} externalUrl={state.url} /> : null}
    </section>
  );
}
