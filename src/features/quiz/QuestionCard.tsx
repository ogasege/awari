/**
 * One question with its hint ladder and feedback. Shared by the Quiz
 * screen and the Castle. Right and wrong are always said in words with a
 * drawn tick or cross, never colour alone (05 Req 3.1).
 */
import { useId, type Dispatch, type ReactNode } from 'react';
import { Link } from '../../app/navigation.tsx';
import { sectionId } from '../article/ArticleBody.tsx';
import type { Question } from '../../lib/packs/types.ts';
import { isTwoWay, maxHints, visibleOptions, type Action, type QuizState } from './quizMachine.ts';
import { SafeImg } from '../../design/SafeImg.tsx';
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
  const visible = visibleOptions(q, s.hintsUsed);
  const answering = s.status === 'asking' || s.status === 'wrong';
  const hintsLeft = maxHints(q) - s.hintsUsed;

  return (
    <div className="question">
      <fieldset className="question__card" disabled={!answering}>
        <span aria-hidden="true" className="tape tape--yellow question__tape" />
        <legend id={`${groupId}-legend`} className="question__prompt">
          <span className="question__count">
            Question {number} of {total}
          </span>
          {q.prompt}
        </legend>
        {q.image ? <SafeImg className="question__image" src={q.image.src} alt={q.image.alt} /> : null}
        <div className={`question__options${isTwoWay(q) ? ' question__options--two' : ''}`}>
          {q.options.map((opt, i) =>
            visible.includes(i) ? (
              <label key={opt} className={`question__option${s.selected === i ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name={groupId}
                  value={i}
                  checked={s.selected === i}
                  onChange={() => dispatch({ type: 'select', option: i })}
                />
                <span>{opt}</span>
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
          <button type="button" className="btn btn--yellow" onClick={() => dispatch({ type: 'check' })} disabled={s.selected === null}>
            Check my answer
          </button>
        ) : null}
      </fieldset>

      <div className="question__feedback" aria-live="polite">
        {s.status === 'wrong' ? (
          <p className="verdict verdict--wrong">
            <Cross /> <strong>Not quite.</strong> {isTwoWay(q) ? '' : 'Try again, or take a hint.'}
          </p>
        ) : null}
        {s.status === 'right' || s.status === 'revealed' ? (
          <>
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
    </div>
  );
}
