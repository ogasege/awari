/**
 * One question with its hint ladder and feedback. Shared by the Quiz
 * screen and the Castle. Right and wrong are always said in words with a
 * drawn tick or cross, never colour alone (05 Req 3.1).
 */
import { useId, useMemo, type Dispatch, type ReactNode } from 'react';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { fold } from '../../lib/quiz/validate.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import { Link } from '../../app/navigation.tsx';
import { sectionId } from '../article/ArticleBody.tsx';
import type { Question } from '../../lib/packs/types.ts';
import { isTwoWay, maxHints, visibleOptions, type Action, type QuizState } from './quizMachine.ts';
import { SafeImg } from '../../design/SafeImg.tsx';
import { Pin } from '../../design/paper.tsx';
import './quiz.css';

/** A hand-drawn light bulb: lit when the hint is still available. */
function Bulb({ lit }: { lit: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 30 40" width="26" height="34" className="bulb">
      <path
        d="M15 3C7.5 3.2 3.4 9 3.6 14.6c.2 4.9 3.6 7.7 5.4 10.6 1 1.6 1.2 3.4 1.2 5.2h9.8c0-1.9.3-3.6 1.4-5.3 1.9-2.9 5.1-5.6 5.1-10.6C26.6 8.6 22.3 2.9 15 3Z"
        fill={lit ? '#FFD23F' : 'none'}
        stroke="#101828"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M10.6 33.6q4.4 1 8.8 0M11.4 37q3.6.8 7.2 0" stroke="#101828" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Tick() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" width="34" height="34">
      <path d="M6 21.5c3.2 2.4 6.6 6.3 9.4 10.6C20.7 21.6 27.8 12.2 35 6.4" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" width="30" height="30">
      <path d="M8 8.6c7.6 6.9 15.8 15.4 23.6 23.2M31.4 7.4C23.9 15.2 15.6 24 8.8 32.2" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A photograph for each ticket when every option is a country or a person the packs have a lead photo for (28, owner
 * feedback 18 Nov). Only for shapes where a photo cannot give the answer away: borders, whose capital, biggest country
 * and who was born first. The library has no flag files, so countries show their lead photograph.
 */
const PICTURE_KINDS = new Set(['neighbour', 'capital-reverse', 'largest', 'first']);

function useOptionPictures(q: Question): string[] | null {
  const wanted = PICTURE_KINDS.has(q.kind ?? '');
  const pack = q.kind === 'first' ? 'people' : 'countries';
  const index = usePack<PackIndex>(wanted ? `${pack}/index.json` : null);
  return useMemo(() => {
    if (!wanted || index.status !== 'ready') return null;
    const byTitle = new Map(index.data.items.filter((i) => i.thumb).map((i) => [fold(i.title), packUrl(i.thumb as string)]));
    const urls = q.options.map((o) => byTitle.get(fold(o)));
    return urls.every((u): u is string => !!u) ? urls : null;
  }, [wanted, index, q.options]);
}

/** A handwritten word on the card that names the kind of question (27-quiz-variety, 28 Req 2.1). */
const SHAPE_WORDS: Record<string, string> = {
  cloze: 'fill the gap',
  capital: 'capital cities',
  'capital-reverse': 'whose capital?',
  continent: 'which continent?',
  currency: 'money',
  language: 'languages',
  neighbour: 'neighbours',
  largest: 'biggest',
  first: 'who came first?',
  truefalse: 'true or false?',
  picture: 'picture round',
};

/** A drawn rubber stamp for the verdict: inked teal for right, a soft coral ring for "not yet". */
function VerdictStamp({ right }: { right: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 150 76" width="150" height="76" className={`verdict__stamp${right ? ' is-right' : ''}`}>
      <rect x="5" y="5" width="140" height="66" rx="12" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray={right ? undefined : '2 0'} />
      <rect x="13" y="13" width="124" height="50" rx="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="75" y="49" textAnchor="middle" fontSize="30" fontWeight="800" fill="currentColor" fontFamily="var(--font-head)">
        {right ? 'RIGHT!' : 'NOT YET'}
      </text>
    </svg>
  );
}

const HINT_LABELS = ['Give me a nudge', 'Where should I look?', 'Take away two answers'];

export function QuestionCard({
  question: q,
  state: s,
  dispatch,
  number,
  total,
  articleTitle,
  articleLink,
  externalUrl,
  nextLabel = 'Next question',
  aside,
}: {
  question: Question;
  state: QuizState;
  dispatch: Dispatch<Action>;
  number: number;
  total: number;
  articleTitle: string;
  articleLink: string;
  /** For quizzes outside the packs: the page to link to instead. */
  externalUrl?: string;
  nextLabel?: string;
  /** Something for the board's side under the hints: the subject's print and a fact (the quiz screen only). */
  aside?: ReactNode;
}) {
  const ref = (children: ReactNode) =>
    externalUrl ? (
      <a href={externalUrl} rel="noreferrer">
        {children}
      </a>
    ) : (
      <Link to={`${articleLink}#${sectionId(q.proofSection)}`}>{children}</Link>
    );
  const groupId = useId();
  const pictures = useOptionPictures(q);
  const visible = visibleOptions(q, s.hintsUsed);
  const answering = s.status === 'asking' || s.status === 'wrong';
  const hintsLeft = maxHints(q) - s.hintsUsed;

  return (
    <div className={`question question--${q.kind ?? 'cloze'}`}>
      <fieldset className="question__card" disabled={!answering}>
        {/* The index card behind the question: tilted and ruled, while the question and answers on it stay straight (Rule 7). */}
        <span aria-hidden="true" className="question__paper" />
        <Pin left="48%" />
        <span aria-hidden="true" className="question__shape hand">
          {SHAPE_WORDS[q.kind ?? 'cloze']}
        </span>
        <legend id={`${groupId}-legend`} className="question__prompt">
          <span className="question__count">
            Question {number} of {total}
          </span>
          {q.prompt}
        </legend>
        {q.image ? <SafeImg className="question__image" src={q.image.src} alt={q.image.alt} /> : null}
        <div className={`question__options${isTwoWay(q) ? ' question__options--two' : ''}${pictures ? ' question__options--pictures' : ''}`}>
          {q.options.map((opt, i) =>
            visible.includes(i) ? (
              <label key={opt} className={`question__option${s.selected === i ? ' is-selected' : ''}${(s.tried ?? []).includes(i) ? ' is-tried' : ''}`}>
                <input
                  type="radio"
                  name={groupId}
                  value={i}
                  checked={s.selected === i}
                  disabled={(s.tried ?? []).includes(i)}
                  onChange={() => dispatch({ type: 'select', option: i })}
                />
                {(s.tried ?? []).includes(i) ? (
                  <span className="question__tried hand">
                    <span aria-hidden="true">✗ </span>tried
                  </span>
                ) : null}
                {pictures ? (
                  <span aria-hidden="true" className="question__stub">
                    <SafeImg src={pictures[i] ?? ''} alt="" loading="lazy" decoding="async" />
                  </span>
                ) : null}
                <span className="question__words">{opt}</span>
                {s.status === 'revealed' && i === q.answer ? <strong className="question__tag"> (the answer)</strong> : null}
              </label>
            ) : (
              <p key={opt} className="question__option is-removed">
                <s>{opt}</s> <span className="sr-only">(taken away by a hint)</span>
              </p>
            ),
          )}
        </div>
        {answering ? (
          <button
            type="button"
            className={`btn question__check ${s.selected === null ? 'btn--outline is-waiting' : 'btn--yellow'}`}
            onClick={() => dispatch({ type: 'check' })}
            disabled={s.selected === null}
          >
            Check my answer
          </button>
        ) : (
          // Keeps the button's space once the question is answered, so nothing under the card moves (owner feedback).
          <span aria-hidden="true" className="question__check-space" />
        )}
      </fieldset>

      <div className="question__feedback" aria-live="polite">
        {s.status === 'wrong' ? (
          <p className="verdict verdict--wrong">
            <Cross /> <strong>Not quite.</strong> {isTwoWay(q) ? '' : 'Try again, or take a hint.'}
          </p>
        ) : null}
        {s.status === 'right' || s.status === 'revealed' ? (
          <>
            <VerdictStamp right={s.status === 'right'} />
            {s.status === 'right' ? (
              <p className="verdict verdict--right">
                <Tick /> <strong>Right!</strong> The answer is {q.options[q.answer]}.
              </p>
            ) : (
              <p className="verdict verdict--wrong">
                <Cross /> <strong>Not this time.</strong> The answer is {q.options[q.answer]}.
              </p>
            )}
            <figure className="proof-slip">
              <span aria-hidden="true" className="tape tape--clear proof-slip__tape" />
              <blockquote>{q.proof}</blockquote>
              <figcaption>
                The proof, from{' '}
                {ref(
                  <>
                    {articleTitle}
                    {q.proofSection ? `: ${q.proofSection}` : ''}
                  </>,
                )}
              </figcaption>
            </figure>
            <button type="button" className="btn btn--yellow" onClick={() => dispatch({ type: 'next' })}>
              {nextLabel}
            </button>
          </>
        ) : null}
      </div>

      <section className="hints" aria-label="Hints">
        <p className="hints__left">
          <span className="hints__bulbs">
            {Array.from({ length: maxHints(q) }, (_, i) => i).map((i) => (
              <Bulb key={i} lit={i >= s.hintsUsed} />
            ))}
          </span>
          {hintsLeft === 1 ? '1 hint left' : `${hintsLeft} hints left`}
        </p>
        {answering && s.hintsUsed < maxHints(q) ? (
          <button type="button" className="btn btn--outline hints__button" onClick={() => dispatch({ type: 'hint' })}>
            {HINT_LABELS[s.hintsUsed]}
          </button>
        ) : null}
        <ol className="hints__list">
          {s.hintsUsed >= 1 ? <li className="hand">{q.hints.nudge}</li> : null}
          {s.hintsUsed >= 2 ? (
            <li className="hand">
              {ref(q.hints.whereToLook)}
            </li>
          ) : null}
          {s.hintsUsed >= 3 ? <li className="hand">Two wrong answers are crossed out.</li> : null}
        </ol>
      </section>
      {aside ? <div className="question__aside">{aside}</div> : null}
    </div>
  );
}
