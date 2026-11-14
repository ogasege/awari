/** Every quiz, grouped by pack, with the student's best score. */
import { useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { StripHeading } from '../../design/paper.tsx';
import { usePack } from '../../lib/packs/load.ts';
import { SUBJECTS } from '../../lib/packs/subjects.ts';
import type { PackId } from '../../lib/packs/types.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { PICTURE_QUIZ_SUBJECTS } from '../../lib/quiz/groups.ts';
import { MakeQuiz } from './MakeQuiz.tsx';
import './quiz.css';

interface QuizIndex {
  quizzes: Array<{ pack: PackId; id: string; title: string; questions: number }>;
}

const PACK_NAMES: Record<string, string> = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.name]));

export default function QuizzesScreen() {
  useTitle('Quizzes');
  const index = usePack<QuizIndex>('quizzes/index.json');
  const progress = useProgress();
  const [filter, setFilter] = useState('');
  const quizzes = index.status === 'ready' ? index.data.quizzes : [];
  const shown = quizzes.filter((q) => q.title.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <section className="page squared quizzes" aria-labelledby="quizzes-title">
      <StripHeading
        id="quizzes-title"
        lines={[
          { text: 'Pick a quiz', tone: 'paper', tilt: -2 },
          { text: 'any quiz', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
        ]}
      />
      <p className="quizzes__lead">
        Every quiz has five questions and three hints for each one. Read the article first, or dive
        straight in.
      </p>
      <section className="quizzes__pictures" aria-labelledby="quizzes-pictures">
        <h2 id="quizzes-pictures">Picture quizzes</h2>
        <p>Look at a picture and say which page it belongs to.</p>
        <ul className="quizzes__picture-list">
          {SUBJECTS.filter((s) => PICTURE_QUIZ_SUBJECTS.has(s.id)).map((s) => (
            <li key={s.id}>
              <Link to={`/quiz/pictures/${s.id}`}>{s.label}</Link>
            </li>
          ))}
        </ul>
      </section>
      <MakeQuiz />
      <label className="quizzes__filter">
        <span>Find a quiz</span>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Try “Ghana” or “current”" />
      </label>
      {SUBJECTS.map((s) => s.id).map((pack) => {
        const list = shown.filter((q) => q.pack === pack);
        if (list.length === 0) return null;
        return (
          <section key={pack} aria-labelledby={`quizzes-${pack}`}>
            <h2 id={`quizzes-${pack}`}>{PACK_NAMES[pack]}</h2>
            <ul className="quizzes__list">
              {list.map((q) => {
                const best = progress.quizzes[`${q.pack}/${q.id}`];
                return (
                  <li key={q.id}>
                    <Link to={`/quiz/${q.pack}/${q.id}`}>{q.title}</Link>
                    <span className="quizzes__best">
                      {best ? `best ${best.correct} of ${best.total}` : `${q.questions} questions`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {index.status === 'loading' ? <p>Gathering the quizzes…</p> : null}
    </section>
  );
}
