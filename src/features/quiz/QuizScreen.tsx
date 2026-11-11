/**
 * The quiz for one article (05-quizzes): five questions, a three-step
 * hint ladder, a proof slip after each answer, drawn progress dots and the
 * best score saved on the device.
 */
import { useEffect, useReducer } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, Doodle, StripHeading } from '../../design/paper.tsx';
import { usePack } from '../../lib/packs/load.ts';
import type { QuizSet } from '../../lib/packs/types.ts';
import { update, withQuizResult } from '../../lib/store/progress.ts';
import { QuestionCard } from './QuestionCard.tsx';
import { initialState, reduce, type QuizState } from './quizMachine.ts';
import './quiz.css';

/** Drawn dots: filled for answered questions, ringed for the current one. */
function Dots({ total, index }: { total: number; index: number }) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${total * 28} 24`} width={total * 28} height={24} className="quiz-dots">
      {Array.from({ length: total }, (_, i) => (
        <circle
          key={i}
          cx={14 + i * 28}
          cy={12}
          r={i === index ? 9 : 7}
          fill={i < index ? '#007A8C' : 'none'}
          stroke="#007A8C"
          strokeWidth={i === index ? 3 : 2}
        />
      ))}
    </svg>
  );
}

function Finished({ quiz, state }: { quiz: QuizSet; state: QuizState }) {
  const total = quiz.questions.length;
  useEffect(() => {
    void update((p) =>
      withQuizResult(p, {
        key: `${quiz.pack}/${quiz.articleId}`,
        correct: state.score,
        total,
        hintsUsed: state.totalHints,
        at: new Date().toISOString(),
      }),
    );
  }, [quiz, state.score, state.totalHints, total]);
  const words =
    state.score === total
      ? 'Every one right. Brilliant reading!'
      : state.score >= total - 2
        ? 'Nearly all of them. The proofs are in the article if you want another look.'
        : 'A good start. Read the article again and try once more.';
  return (
    <section className="quiz-done" aria-labelledby="quiz-done-title">
      <h2 id="quiz-done-title" tabIndex={-1}>
        You got {state.score} out of {total}
      </h2>
      <p>{words}</p>
      <p>
        You used {state.totalHints === 1 ? '1 hint' : `${state.totalHints} hints`}.
      </p>
      <div className="quiz-done__actions">
        <Button to={`/article/${quiz.pack}/${quiz.articleId}`}>Read the article again</Button>
        <Button to="/castle" tone="outline">
          Try the castle
        </Button>
        <Button to="/quizzes" tone="outline">
          Pick another quiz
        </Button>
      </div>
      <Doodle kind="star" seed={`done-${quiz.articleId}`} size={70} color="var(--yellow)" />
    </section>
  );
}

function Quiz({ quiz }: { quiz: QuizSet }) {
  useTitle(`${quiz.title} quiz`);
  const [state, dispatch] = useReducer(
    (s: QuizState, a: Parameters<typeof reduce>[2]) => reduce(quiz.questions, s, a),
    undefined,
    initialState,
  );
  const q = quiz.questions[state.index];
  const total = quiz.questions.length;
  const articleLink = `/article/${quiz.pack}/${quiz.articleId}`;

  return (
    <section className="page squared quiz" aria-labelledby="quiz-title">
      <div className="quiz__head">
        <StripHeading
          id="quiz-title"
          lines={[
            { text: quiz.title, tone: 'paper', tilt: -2 },
            { text: 'quiz', tone: 'yellow', tilt: 2, style: { marginLeft: '0.6em' } },
          ]}
          className="quiz__title"
        />
        <div className="quiz__progress">
          <Dots total={total} index={state.index} />
          <span>{state.status === 'done' ? 'All done' : `Question ${state.index + 1} of ${total}`}</span>
        </div>
      </div>
      {state.status === 'done' || !q ? (
        <Finished quiz={quiz} state={state} />
      ) : (
        <QuestionCard
          key={q.id}
          question={q}
          state={state}
          dispatch={dispatch}
          number={state.index + 1}
          total={total}
          articleTitle={quiz.title}
          articleLink={articleLink}
          nextLabel={state.index + 1 === total ? 'See my score' : 'Next question'}
        />
      )}
      <p className="quiz__credit">
        Questions built from{' '}
        <a href={quiz.source.url} rel="noreferrer">
          {quiz.source.name}
        </a>{' '}
        ({quiz.source.licence}). <Link to={articleLink}>Read the article</Link>
      </p>
    </section>
  );
}

export default function QuizScreen({ params }: { params: Record<string, string> }) {
  const pack = params['pack'] ?? '';
  const id = params['id'] ?? '';
  const ok = pack === 'countries' || pack === 'physics';
  const quiz = usePack<QuizSet>(ok ? `quizzes/${pack}/${id}.json` : null);
  if (!ok || quiz.status === 'error') {
    return (
      <section className="page squared">
        <StripHeading lines={[{ text: 'No quiz here yet', tone: 'yellow', tilt: -2 }]} />
        <p>
          There is no quiz for that page. <Link to="/quizzes">See every quiz</Link>.
        </p>
      </section>
    );
  }
  if (quiz.status === 'loading') return <p className="page">Shuffling the questions…</p>;
  return <Quiz key={`${pack}/${id}`} quiz={quiz.data} />;
}
