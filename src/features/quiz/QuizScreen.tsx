/**
 * The quiz for one article (05-quizzes): five questions, a three-step
 * hint ladder, a proof slip after each answer, drawn progress dots and the
 * best score saved on the device.
 */
import { useEffect, useMemo, useReducer } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, Doodle, MarginNote, Print, StripHeading } from '../../design/paper.tsx';
import { coverFor } from '../../lib/packs/covers.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { useMedia, type MediaFile } from '../../lib/media/media.ts';
import { SUBJECTS, isBundledPack } from '../../lib/packs/subjects.ts';
import type { Article, QuizSet } from '../../lib/packs/types.ts';
import { autoTerms, buildQuiz } from '../../lib/quiz/generate.ts';
import { pictureQuestions } from '../../lib/quiz/picture.ts';
import { update, withQuizResult } from '../../lib/store/progress.ts';
import { errorWords, useWikiArticle } from '../article/useWikiArticle.ts';
import { dayNumber } from '../home/today.ts';
import { QuestionCard } from './QuestionCard.tsx';
import { initialState, reduce, type QuizState } from './quizMachine.ts';
import './quiz.css';

/** Drawn dots: filled for answered questions, ringed for the current one. */
const SUBJECT_IDS = new Set<string>(SUBJECTS.map((x) => x.id));
const SUBJECT_LABELS = new Map<string, string>(SUBJECTS.map((x) => [x.id as string, x.label]));

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

function Finished({ quiz, state, externalUrl }: { quiz: QuizSet; state: QuizState; externalUrl?: string }) {
  const total = quiz.questions.length;
  useEffect(() => {
    if (externalUrl) return; // quizzes made on the fly are not saved
    void update((p) =>
      withQuizResult(p, {
        key: `${quiz.pack}/${quiz.articleId}`,
        correct: state.score,
        total,
        hintsUsed: state.totalHints,
        at: new Date().toISOString(),
      }),
    );
  }, [quiz, state.score, state.totalHints, total, externalUrl]);
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
        {externalUrl ? (
          <a className="btn btn--yellow" href={externalUrl} rel="noreferrer">
            Read the article again
          </a>
        ) : (
          <Button to={`/article/${quiz.pack}/${quiz.articleId}`}>Read the article again</Button>
        )}
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

export function Quiz({ quiz, externalUrl }: { quiz: QuizSet; externalUrl?: string }) {
  useTitle(`${quiz.title} quiz`);
  const [state, dispatch] = useReducer(
    (s: QuizState, a: Parameters<typeof reduce>[2]) => reduce(quiz.questions, s, a),
    undefined,
    initialState,
  );
  const q = quiz.questions[state.index];
  const total = quiz.questions.length;
  const articleLink = `/article/${quiz.pack}/${quiz.articleId}`;
  // The quiz's own article photograph; the subject's cover when the article has none (or is not bundled).
  const lead = usePack<Article>(isBundledPack(quiz.pack) ? `${quiz.pack}/${quiz.articleId}.json` : null);
  const photo = lead.status === 'ready' ? lead.data.photos[0] : undefined;
  const cover = coverFor(quiz.pack);
  const print = photo
    ? { src: packUrl(photo.file), alt: photo.alt }
    : cover
      ? { src: cover.file, alt: cover.alt }
      : undefined;

  return (
    <section className="page squared quiz" aria-labelledby="quiz-title">
      {print ? (
        <Print
          className="page-print quiz__print"
          src={print.src}
          alt={print.alt}
          caption={quiz.title}
          captionSize={24}
          width={220}
          tilt={3}
          tape={[{ left: '36%', width: 96, tilt: -4, tone: 'yellow' }]}
        />
      ) : null}
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
      <MarginNote tilt={-2} size={28} className="quiz__note crowding" style={{ color: 'var(--teal-ink)' }}>
        Stuck? Every question has three hints.
      </MarginNote>
      {state.status === 'done' || !q ? (
        <Finished quiz={quiz} state={state} externalUrl={externalUrl} />
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
          externalUrl={externalUrl}
          nextLabel={state.index + 1 === total ? 'See my score' : 'Next question'}
        />
      )}
      <p className="quiz__credit">
        {quiz.pack === ('pictures' as never) ? (
          <>
            Pictures from{' '}
            <a href={quiz.source.url} rel="noreferrer">
              Wikimedia Commons
            </a>
            ; each picture's author and licence are shown with its answer. <Link to="/media">Look at all the pictures</Link>
          </>
        ) : (
          <>
            Questions built from{' '}
            <a href={quiz.source.url} rel="noreferrer">
              {quiz.source.name}
            </a>{' '}
            ({quiz.source.licence}).{' '}
            {externalUrl ? (
              <a href={externalUrl} rel="noreferrer">
                Read the article
              </a>
            ) : (
              <Link to={articleLink}>Read the article</Link>
            )}
          </>
        )}
      </p>
    </section>
  );
}

export function NoQuiz({ words }: { words: string }) {
  return (
    <section className="page squared">
      <StripHeading lines={[{ text: 'No quiz here yet', tone: 'yellow', tilt: -2 }]} />
      <p role="alert">{words}</p>
      <p>
        <Link to="/quizzes">See every quiz</Link>.
      </p>
    </section>
  );
}

/** A quiz made on the device from an article read on demand (14-any-article Req 5.2). */
function WikiQuiz({ title }: { title: string }) {
  const state = useWikiArticle(title);
  const quiz = useMemo<QuizSet | null>(() => {
    if (state.status !== 'ready') return null;
    const a = { ...state.article, id: title };
    const questions = buildQuiz(a, undefined, [], autoTerms(a));
    return questions.length >= 3
      ? { articleId: title, pack: 'wiki', title: a.title, questions, source: a.source }
      : null;
  }, [state, title]);
  if (state.status === 'loading') return <p className="page">Shuffling the questions…</p>;
  if (state.status === 'error') return <NoQuiz words={errorWords(state.reason, title)} />;
  if (!quiz) {
    return <NoQuiz words="This article is too short to make a fair quiz from. Try reading it, or pick another article." />;
  }
  return <Quiz key={`wiki/${title}`} quiz={quiz} />;
}

/** Five picture questions from the media library for one subject (23-media-library Req 20). */
function PictureQuiz({ subject }: { subject: string }) {
  const file = useMedia<MediaFile>(SUBJECT_IDS.has(subject) ? `${subject}.json` : null);
  const quiz = useMemo<QuizSet | null>(() => {
    if (file.status !== 'ready') return null;
    const questions = pictureQuestions(file.data.items, 5, dayNumber(new Date()) + subject.length);
    return questions.length >= 3
      ? {
          articleId: subject,
          pack: 'pictures' as never,
          title: `${SUBJECT_LABELS.get(subject) ?? subject} pictures`,
          questions,
          source: { name: 'Wikimedia Commons pictures, each credited in its answer', url: 'https://commons.wikimedia.org/', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', retrieved: '2026-11-14' },
        }
      : null;
  }, [file, subject]);
  if (!SUBJECT_IDS.has(subject)) return <NoQuiz words="There is no picture quiz for that subject." />;
  if (file.status === 'loading') return <p className="page">Shuffling the pictures…</p>;
  if (file.status === 'error' || !quiz) return <NoQuiz words="The pictures could not be opened for a quiz. Try again when you are online once." />;
  return <Quiz key={`pictures/${subject}`} quiz={quiz} externalUrl="/media" />;
}

export default function QuizScreen({ params }: { params: Record<string, string> }) {
  const pack = params['pack'] ?? '';
  const id = params['id'] ?? '';
  const ok = isBundledPack(pack);
  const quiz = usePack<QuizSet>(ok ? `quizzes/${pack}/${id}.json` : null);
  if (pack === 'wiki') return <WikiQuiz title={id} />;
  if (pack === 'pictures') return <PictureQuiz subject={id} />;
  if (!ok || quiz.status === 'error') {
    return <NoQuiz words="There is no quiz for that page." />;
  }
  if (quiz.status === 'loading') return <p className="page">Shuffling the questions…</p>;
  return <Quiz key={`${pack}/${id}`} quiz={quiz.data} />;
}
