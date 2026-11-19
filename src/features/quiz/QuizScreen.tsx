const SUBJECT_IDS = new Set<string>(SUBJECTS.map((x) => x.id));
const SUBJECT_LABELS = new Map<string, string>(SUBJECTS.map((x) => [x.id as string, x.label]));

/**
 * The quiz for one article (05-quizzes): five questions, a three-step
 * hint ladder, a proof slip after each answer, drawn progress dots and the
 * best score saved on the device.
 */
import { useEffect, useMemo, useReducer } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Loading } from '../../app/Loading.tsx';
import { Button, Doodle, MarginNote, Print, StripHeading } from '../../design/paper.tsx';
import { coverFor } from '../../lib/packs/covers.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { useMedia, type MediaFile } from '../../lib/media/media.ts';
import { SUBJECTS, isBundledPack } from '../../lib/packs/subjects.ts';
import type { Article, FactsPack, PackIndex, QuizSet } from '../../lib/packs/types.ts';
import { relatedQuizzes } from './related.ts';
import { splitSentences } from '../../lib/quiz/sentences.ts';
import { unsuitableTopic } from '../../lib/text/suitability.ts';
import { autoTerms, buildQuiz } from '../../lib/quiz/generate.ts';
import { pictureQuestions } from '../../lib/quiz/picture.ts';
import { update, withQuizResult } from '../../lib/store/progress.ts';
import { errorWords, useWikiArticle } from '../article/useWikiArticle.ts';
import { dayNumber } from '../home/today.ts';
import { QuestionCard } from './QuestionCard.tsx';
import { initialState, reduce, type QuizState } from './quizMachine.ts';
import './quiz.css';

/** Five drawn postage stamps along the top of the board: inked for each answered question, ringed for the current one. */
function Dots({ total, index }: { total: number; index: number }) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${total * 52} 52`} width={total * 52} height={52} className="quiz-dots">
      {Array.from({ length: total }, (_, i) => {
        const x = 4 + i * 52;
        const done = i < index;
        return (
          <g key={i} transform={`rotate(${(i % 2 ? 4 : -5) + (i === index ? 0 : 0)} ${x + 22} 26)`}>
            <rect x={x} y={4} width={44} height={44} rx={3} fill={done ? '#FF8662' : '#FFFDF5'} stroke={i === index ? '#FFD23F' : '#FFFDF5'} strokeWidth={i === index ? 4 : 2} strokeDasharray="3 3" />
            {done ? (
              <path d={`M${x + 11} ${27}l8 8 15-17`} fill="none" stroke="#2E0D00" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <text x={x + 22} y={33} textAnchor="middle" fontSize={20} fontWeight={800} fill="#0B1B4D">
                {i + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** The article's first sentence when it is short enough to write by hand beside the print (28, owner feedback). */
function shortFact(article: Article): string | undefined {
  const first = article.sections[0]?.paragraphs[0];
  const sentence = first ? splitSentences(first)[0] : undefined;
  if (!sentence || sentence.length > 130 || unsuitableTopic(sentence)) return undefined;
  return sentence;
}

/** Two more quizzes from the same subject, as prints on the certificate (28 Req 2.1). */
function NextQuizzes({ pack, id }: { pack: string; id: string }) {
  const index = usePack<PackIndex>(isBundledPack(pack) ? `${pack}/index.json` : null);
  const facts = usePack<FactsPack>(pack === 'countries' ? 'countries/facts.json' : null);
  if (index.status !== 'ready') return null;
  const next = relatedQuizzes(index.data.items, id, facts.status === 'ready' ? facts.data.countries : []);
  if (next.length === 0) return null;
  return (
    <div className="quiz-done__next">
      <p className="hand quiz-done__next-note">{pack === 'countries' ? 'Try a country nearby' : 'Try one of these next'}</p>
      {next.map((item, k) => (
        <Print
          key={item.id}
          className="quiz-done__print"
          src={item.thumb ? packUrl(item.thumb) : (coverFor(pack)?.file ?? '')}
          alt=""
          caption={`${item.title} quiz`}
          captionSize={22}
          width={190}
          tilt={k ? 3 : -3}
          to={`/quiz/${pack}/${item.id}`}
          tape={[{ left: '34%', width: 70, tilt: k ? 5 : -5, tone: 'yellow' }]}
        />
      ))}
    </div>
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
      <span aria-hidden="true" className="quiz-done__seal hand">
        {state.score}/{total}
      </span>
      <p className="quiz-done__kicker hand">Certificate of reading</p>
      <h2 id="quiz-done-title" tabIndex={-1}>
        You got {state.score} out of {total}
      </h2>
      <p>{words}</p>
      <p>
        You used {state.totalHints === 1 ? '1 hint' : `${state.totalHints} hints`}.
      </p>
      <svg aria-hidden="true" className="quiz-done__stamps" viewBox={`0 0 ${total * 56} 56`} width={total * 56} height={56}>
        {Array.from({ length: total }, (_, i) => (
          <g key={i} transform={`rotate(${i % 2 ? 6 : -6} ${28 + i * 56} 28)`}>
            <circle cx={28 + i * 56} cy={28} r={22} fill={i < state.score ? '#FF8662' : 'none'} stroke={i < state.score ? '#2E0D00' : '#98A2B3'} strokeWidth={3} strokeDasharray={i < state.score ? undefined : '4 4'} />
            {i < state.score ? <path d={`M${16 + i * 56} 29l8 8 15-17`} fill="none" stroke="#2E0D00" strokeWidth={4} strokeLinecap="round" /> : null}
          </g>
        ))}
      </svg>
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
      {externalUrl ? null : <NextQuizzes pack={quiz.pack} id={quiz.articleId} />}
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
  // A true fact about the subject for the board's side, in the article's own words: its first short sentence.
  const fact = lead.status === 'ready' ? shortFact(lead.data) : undefined;
  const cover = coverFor(quiz.pack);
  const print = photo
    ? { src: packUrl(photo.file), alt: photo.alt }
    : cover
      ? { src: cover.file, alt: cover.alt }
      : undefined;

  return (
    <section className="page quiz quiz--board" aria-labelledby="quiz-title">
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
          <p aria-hidden="true" className="quiz__stamp-note hand">
            each right answer inks a stamp
          </p>
          <Dots total={total} index={state.index} />
          <span>{state.status === 'done' ? 'All done' : `Question ${state.index + 1} of ${total}`}</span>
        </div>
      </div>
      <MarginNote tilt={-2} size={28} className="quiz__note crowding" style={{ color: 'var(--yellow)' }}>
        How many can you get without a hint?
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
          aside={
            print ? (
              <div className="quiz__aside">
                <Print
                  className="quiz__print"
                  src={print.src}
                  alt={print.alt}
                  caption={quiz.title}
                  captionSize={26}
                  width={300}
                  tilt={3}
                  tape={[{ left: '36%', width: 110, tilt: -4, tone: 'yellow' }]}
                />
                {fact ? <p className="quiz__fact hand">{fact}</p> : null}
              </div>
            ) : null
          }
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
  if (state.status === 'loading') return <Loading route="quiz" />;
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
  if (file.status === 'loading') return <Loading route="quiz" words="Shuffling the pictures…" />;
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
  if (quiz.status === 'loading') return <Loading route="quiz" />;
  return <Quiz key={`${pack}/${id}`} quiz={quiz.data} />;
}
