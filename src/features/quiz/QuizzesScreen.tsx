/** Every quiz, grouped by pack, with the student's best score. */
import { useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { StripHeading } from '../../design/paper.tsx';
import { usePack } from '../../lib/packs/load.ts';
import type { PackId } from '../../lib/packs/types.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import './quiz.css';

interface QuizIndex {
  quizzes: Array<{ pack: PackId; id: string; title: string; questions: number }>;
}

const PACK_NAMES: Record<PackId, string> = { physics: 'Electricity', countries: 'Countries' };

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
      <label className="quizzes__filter">
        <span>Find a quiz</span>
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Try “Ghana” or “current”" />
      </label>
      {(['physics', 'countries'] as const).map((pack) => {
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
