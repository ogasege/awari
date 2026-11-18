/**
 * The quiz shelf (28-every-screen-like-home task 2). Find-a-quiz at the top; a big "Quiz of the day" print and
 * "Surprise me" on a coral table; one overlapping pile of prints per subject that opens into its quizzes; the countries
 * as continent stamp sheets; the picture rounds as tickets; the full A to Z behind "Show every quiz".
 * Navigation, the search field and buttons stay straight (Rule 7); tilts and tape are decoration.
 */
import { useMemo, useState } from 'react';
import { Link, navigate } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { MarginNote, Print, Stamp, StripHeading } from '../../design/paper.tsx';
import { coverFor } from '../../lib/packs/covers.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { CONTINENTS, SUBJECTS, normaliseContinent } from '../../lib/packs/subjects.ts';
import type { PackId, PackIndex, PackIndexItem } from '../../lib/packs/types.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { PICTURE_QUIZ_SUBJECTS } from '../../lib/quiz/groups.ts';
import { dayNumber } from '../home/today.ts';
import { MakeQuiz } from './MakeQuiz.tsx';
import './quiz.css';
import './quizzes.css';

interface QuizEntry {
  pack: PackId;
  id: string;
  title: string;
  questions: number;
}
interface QuizIndex {
  quizzes: QuizEntry[];
}

const LABEL: Record<string, string> = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.label]));
/** Stamps shown on each continent sheet before "Show all". */
const SHEET_SIZE = 8;
const TILTS = [-4, 3, -2, 5, -3, 2];
const tilt = (i: number): number => TILTS[i % TILTS.length] ?? 0;

/** The thumbnails of one pack, by article id. */
function useThumbs(pack: string): Map<string, PackIndexItem> {
  const index = usePack<PackIndex>(`${pack}/index.json`);
  return useMemo(() => new Map(index.status === 'ready' ? index.data.items.map((i) => [i.id, i]) : []), [index]);
}

function thumbOf(pack: string, item: PackIndexItem | undefined): string {
  return item?.thumb ? packUrl(item.thumb) : (coverFor(pack)?.file ?? '');
}

function QuizOfTheDay({ quiz, all }: { quiz: QuizEntry; all: readonly QuizEntry[] }) {
  const thumbs = useThumbs(quiz.pack);
  return (
    <div className="shelf-today">
      <Print
        className="shelf-today__print"
        src={thumbOf(quiz.pack, thumbs.get(quiz.id))}
        alt=""
        caption={`${quiz.title} quiz`}
        captionSize={34}
        width={380}
        tilt={-3}
        to={`/quiz/${quiz.pack}/${quiz.id}`}
        tape={[
          { left: '8%', width: 110, tilt: -8, tone: 'yellow' },
          { left: '70%', width: 90, tilt: 6, tone: 'clear' },
        ]}
      />
      <p aria-hidden="true" className="shelf-today__note hand">
        ← quiz of the day
      </p>
      <div className="shelf-today__actions">
        <Link className="btn btn--yellow" to={`/quiz/${quiz.pack}/${quiz.id}`}>
          Play the quiz of the day
        </Link>
        <button
          type="button"
          className="btn btn--ink"
          onClick={() => {
            const pick = all[Math.floor(Math.random() * all.length)];
            if (pick) navigate(`/quiz/${pick.pack}/${pick.id}`);
          }}
        >
          Surprise me
        </button>
      </div>
    </div>
  );
}

/** One subject as a pile of three overlapping prints; pressing it lays its quizzes out as prints. */
function Pile({ pack, quizzes, index }: { pack: string; quizzes: readonly QuizEntry[]; index: number }) {
  const thumbs = useThumbs(pack);
  const [open, setOpen] = useState(false);
  const progress = useProgress();
  const top = quizzes.slice(0, 3);
  const done = quizzes.filter((q) => progress.quizzes[`${q.pack}/${q.id}`]).length;
  const panel = `pile-${pack}`;
  return (
    <section className={`shelf-pile shelf-pile--${index % 3}`} aria-labelledby={`${panel}-title`}>
      <button type="button" className="shelf-pile__button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen((o) => !o)}>
        <span aria-hidden="true" className="shelf-pile__stack">
          {top.map((q, i) => (
            <span key={q.id} className="shelf-pile__card" style={{ rotate: `${tilt(index + i * 2)}deg`, translate: `${i * 26 - 26}px ${i * -8}px` }}>
              <img src={thumbOf(pack, thumbs.get(q.id))} alt="" loading="lazy" decoding="async" />
            </span>
          ))}
        </span>
        <span id={`${panel}-title`} className="shelf-pile__label">
          {LABEL[pack]}
        </span>
        <span className="shelf-pile__count">
          {quizzes.length} quizzes{done ? `, ${done} played` : ''} · {open ? 'close the pile' : 'open the pile'}
        </span>
      </button>
      {open ? (
        <ul id={panel} className="shelf-pile__spread">
          {quizzes.map((q, i) => (
            <li key={q.id} style={{ rotate: `${tilt(i) / 2}deg` }}>
              <Link to={`/quiz/${q.pack}/${q.id}`} className="shelf-mini lift">
                <img src={thumbOf(pack, thumbs.get(q.id))} alt="" loading="lazy" decoding="async" />
                <span className="hand">{q.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** The countries as one stamp sheet per continent; each stamp opens that country's quiz. */
function ContinentSheets({ quizzes }: { quizzes: readonly QuizEntry[] }) {
  const thumbs = useThumbs('countries');
  const progress = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const byContinent = (c: string): QuizEntry[] => quizzes.filter((q) => normaliseContinent(thumbs.get(q.id)?.continent) === c);
  if (thumbs.size === 0) return null;
  return (
    <div className="shelf-sheets">
      {CONTINENTS.map((c) => {
        const all = byContinent(c);
        if (all.length === 0) return null;
        const list = open === c ? all : all.slice(0, SHEET_SIZE);
        return (
          <section key={c} className="shelf-sheet" aria-labelledby={`sheet-${c}`}>
            <h3 id={`sheet-${c}`} className="shelf-sheet__title">
              {c} <span className="hand">{all.length} countries</span>
            </h3>
            <ul className="shelf-sheet__stamps">
              {list.map((q, i) => {
                const best = progress.quizzes[`${q.pack}/${q.id}`];
                return (
                  <li key={q.id}>
                    <Stamp
                      name={q.title}
                      caption={best ? `${best.correct}/${best.total}` : 'quiz'}
                      src={thumbOf('countries', thumbs.get(q.id))}
                      alt=""
                      tilt={tilt(i) / 2}
                      to={`/quiz/${q.pack}/${q.id}`}
                    />
                  </li>
                );
              })}
            </ul>
            {all.length > SHEET_SIZE ? (
              <button type="button" className="btn btn--outline shelf-sheet__more" aria-expanded={open === c} onClick={() => setOpen(open === c ? null : c)}>
                {open === c ? `Show fewer` : `Show all ${all.length} in ${c}`}
              </button>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export default function QuizzesScreen() {
  useTitle('Quizzes');
  const index = usePack<QuizIndex>('quizzes/index.json');
  const progress = useProgress();
  const [filter, setFilter] = useState('');
  const [everything, setEverything] = useState(false);
  const quizzes = index.status === 'ready' ? index.data.quizzes : [];
  const term = filter.trim().toLowerCase();
  const shown = quizzes.filter((q) => q.title.toLowerCase().includes(term));
  const total = quizzes.reduce((n, q) => n + q.questions, 0);
  const today = quizzes.length ? quizzes[dayNumber(new Date()) % quizzes.length] : undefined;
  const countries = quizzes.filter((q) => q.pack === 'countries');

  return (
    <section className="page quizzes shelf" aria-labelledby="quizzes-title">
      <div className="shelf__top">
        <StripHeading
          id="quizzes-title"
          lines={[
            { text: 'Pick a quiz', tone: 'paper', tilt: -2 },
            { text: 'any quiz', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
          ]}
        />
        <label className="quizzes__filter shelf__find">
          <span>Find a quiz</span>
          <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Try “Ghana” or “current”" />
        </label>
      </div>

      {term ? (
        <section className="shelf-found" aria-labelledby="shelf-found-title">
          <h2 id="shelf-found-title">
            {shown.length === 0 ? 'No quiz has that in its name' : `${shown.length} ${shown.length === 1 ? 'quiz' : 'quizzes'} found`}
          </h2>
          <ul className="shelf-chips">
            {shown.slice(0, 80).map((q) => (
              <li key={`${q.pack}/${q.id}`}>
                <Link to={`/quiz/${q.pack}/${q.id}`}>{q.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="shelf-table">
        {today ? <QuizOfTheDay quiz={today} all={quizzes} /> : null}
        {total ? (
          <MarginNote tilt={2} size={30} className="shelf-table__note">
            {quizzes.length} quizzes, {total.toLocaleString('en-GB')} questions: capitals, borders, money, biggest country, who was born
            first, true or false, fill the gap
          </MarginNote>
        ) : null}
        <div className="shelf-piles">
          {SUBJECTS.filter((s) => s.id !== 'countries').map((s, i) => (
            <Pile key={s.id} pack={s.id} index={i} quizzes={quizzes.filter((q) => q.pack === s.id)} />
          ))}
        </div>
      </div>

      <section className="shelf-countries" aria-labelledby="shelf-countries-title">
        <h2 id="shelf-countries-title">
          Every country <span className="hand">a stamp for each quiz</span>
        </h2>
        <ContinentSheets quizzes={countries} />
      </section>

      <section className="shelf-rounds" aria-labelledby="quizzes-pictures">
        <h2 id="quizzes-pictures">Picture rounds</h2>
        <p>Look at a picture and say which page it belongs to.</p>
        <ul className="shelf-rounds__tickets">
          {SUBJECTS.filter((s) => PICTURE_QUIZ_SUBJECTS.has(s.id)).map((s, i) => (
            <li key={s.id} style={{ rotate: `${tilt(i) / 2}deg` }}>
              <Link to={`/quiz/pictures/${s.id}`}>{s.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <MakeQuiz />

      <section className="shelf-all" aria-labelledby="shelf-all-title">
        <h2 id="shelf-all-title">Every quiz, A to Z</h2>
        <button type="button" className="btn btn--outline" aria-expanded={everything} onClick={() => setEverything((e) => !e)}>
          {everything ? 'Hide the list' : `Show every quiz (${quizzes.length})`}
        </button>
        {everything ? (
          <ul className="shelf-chips">
            {[...quizzes]
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((q) => {
                const best = progress.quizzes[`${q.pack}/${q.id}`];
                return (
                  <li key={`${q.pack}/${q.id}`}>
                    <Link to={`/quiz/${q.pack}/${q.id}`}>
                      {q.title}
                      {best ? <span className="quizzes__best"> best {best.correct} of {best.total}</span> : null}
                    </Link>
                  </li>
                );
              })}
          </ul>
        ) : null}
      </section>
      {index.status === 'loading' ? <p>Gathering the quizzes…</p> : null}
    </section>
  );
}
