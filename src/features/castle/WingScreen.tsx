/**
 * Playing one wing of the Castle (06-castle Req 2): the wall of twelve
 * doors and the question behind the next dark one.
 */
import { useEffect, useReducer, useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, StripHeading } from '../../design/paper.tsx';
import { loadPack, usePack } from '../../lib/packs/load.ts';
import { normaliseContinent } from '../../lib/packs/subjects.ts';
import type { PackIndex, Question, QuizSet } from '../../lib/packs/types.ts';
import { loadProgress, update, withRoomsLit } from '../../lib/store/progress.ts';
import { QuestionCard } from '../quiz/QuestionCard.tsx';
import type { Action } from '../quiz/quizMachine.ts';
import { buildPool, castleReduce, ROOMS, startCastle, WINGS, type CastleState, type Wing } from './castle.ts';
import { Doors } from './Doors.tsx';
import './castle.css';

interface QuizIndex {
  quizzes: Array<{ pack: string; id: string; title: string }>;
}

type PoolState = { status: 'loading' } | { status: 'ready'; pool: Question[]; titles: Map<string, string> } | { status: 'error' };

/** Loads every quiz set that feeds a wing and interleaves them. */
function useWingPool(wing: Wing): PoolState {
  const quizIndex = usePack<QuizIndex>('quizzes/index.json');
  const countries = usePack<PackIndex>(wing.continent ? 'countries/index.json' : null);
  const [state, setState] = useState<{ wing: string; value: PoolState }>({ wing: wing.id, value: { status: 'loading' } });

  useEffect(() => {
    if (quizIndex.status !== 'ready' || (wing.continent && countries.status !== 'ready')) return;
    const allowed =
      wing.continent && countries.status === 'ready'
        ? new Set(countries.data.items.filter((i) => normaliseContinent(i.continent) === wing.continent).map((i) => i.id))
        : null;
    const entries = quizIndex.data.quizzes.filter((q) => q.pack === wing.pack && (!allowed || allowed.has(q.id)));
    let live = true;
    Promise.all(entries.map((e) => loadPack<QuizSet>(`quizzes/${e.pack}/${e.id}.json`))).then(
      (sets) =>
        live &&
        setState({
          wing: wing.id,
          value: { status: 'ready', pool: buildPool(sets), titles: new Map(sets.map((s) => [s.articleId, s.title])) },
        }),
      () => live && setState({ wing: wing.id, value: { status: 'error' } }),
    );
    return () => {
      live = false;
    };
  }, [quizIndex, countries, wing]);

  return state.wing === wing.id ? state.value : { status: 'loading' };
}

function Play({ wing, pool, titles, savedLit }: { wing: Wing; pool: Question[]; titles: Map<string, string>; savedLit: number }) {
  const [names, setNames] = useState<string[]>([]);
  const [state, dispatch] = useReducer(
    (s: CastleState, a: Action) => castleReduce(pool, s, a),
    undefined,
    () => startCastle(savedLit, pool.length),
  );
  const q = pool[state.quiz.index];

  // Save each newly lit room, and chalk its topic over the door.
  useEffect(() => {
    if (state.lit > savedLit) void update((p) => withRoomsLit(p, wing.id, state.lit));
  }, [state.lit, savedLit, wing.id]);
  const [seenLit, setSeenLit] = useState(state.lit);
  if (state.lit !== seenLit) {
    setSeenLit(state.lit);
    const title = q ? titles.get(q.articleId) : undefined;
    setNames((n) => {
      const next = [...n];
      next[state.lit - 1] = title ?? '';
      return next;
    });
  }

  // Suggest the next wing along the gate, wrapping round after the last.
  const other = WINGS[(WINGS.findIndex((w) => w.id === wing.id) + 1) % WINGS.length];
  // The last answer lights the last room, but its Right! and proof stay on
  // screen until the student walks through, then the finish panel appears.
  const [closed, setClosed] = useState(savedLit >= ROOMS);
  const done = state.lit >= ROOMS && closed;
  const send = (a: Action) => {
    if (state.lit >= ROOMS && a.type === 'next') setClosed(true);
    else dispatch(a);
  };
  const roomNumber = Math.min(ROOMS, state.lit + 1);

  return (
    <>
      <div className="wing__wall">
        <Doors lit={state.lit} names={names} />
        <p className="wing__count" aria-live="polite">
          {state.lit >= ROOMS ? 'Every room is lit!' : `${state.lit} of ${ROOMS} rooms lit`}
        </p>
      </div>
      {done ? (
        <section className="wing__done" aria-labelledby="wing-done">
          <h2 id="wing-done" tabIndex={-1}>
            You lit the whole wing!
          </h2>
          <p>Twelve doors, twelve right answers. The castle is glowing.</p>
          {other ? <Button to={`/castle/${other.id}`}>Try {other.name.toLowerCase()}</Button> : null}
        </section>
      ) : q ? (
        <div className="wing__question">
          <p className="wing__room">Room {roomNumber} of {ROOMS}</p>
          <QuestionCard
            key={`${q.id}-${state.quiz.index}`}
            question={q}
            state={state.quiz}
            dispatch={send}
            number={roomNumber}
            total={ROOMS}
            articleTitle={titles.get(q.articleId) ?? q.articleId}
            articleLink={`/article/${q.pack}/${q.articleId}`}
            nextLabel={state.lit >= ROOMS ? 'Open the last door' : state.quiz.status === 'right' ? 'Walk through the door' : 'Try another question'}
          />
        </div>
      ) : null}
    </>
  );
}

export default function WingScreen({ params }: { params: Record<string, string> }) {
  const wing = WINGS.find((w) => w.id === params['wing']);
  useTitle(wing ? wing.name : 'Castle');
  const pool = useWingPool(wing ?? (WINGS[0] as Wing));
  // Read the saved rooms once per visit; later saves must not restart play.
  const [saved, setSaved] = useState<{ wing: string; lit: number } | null>(null);
  useEffect(() => {
    if (!wing) return;
    let live = true;
    void loadProgress().then((p) => live && setSaved({ wing: wing.id, lit: p.castle[wing.id] ?? 0 }));
    return () => {
      live = false;
    };
  }, [wing]);
  const savedLit = saved && wing && saved.wing === wing.id ? saved.lit : null;

  if (!wing) {
    return (
      <section className="page squared">
        <p>
          That wing is not in the castle. <Link to="/castle">Back to the castle</Link>
        </p>
      </section>
    );
  }
  return (
    <section className="castle-board grain" aria-labelledby="wing-title">
      <div className="wing__head">
        <StripHeading id="wing-title" lines={[{ text: wing.name, tone: 'paper', tilt: -2 }]} className="castle__title" />
        <Link to="/castle" className="wing__back">
          Back to the castle
        </Link>
      </div>
      {pool.status === 'ready' && savedLit !== null ? (
        <Play key={`${wing.id}-${savedLit}`} wing={wing} pool={pool.pool} titles={pool.titles} savedLit={savedLit} />
      ) : (
        <p>{pool.status === 'error' ? 'The castle doors are stuck. Try again when you are online once.' : 'Lighting the torches…'}</p>
      )}
    </section>
  );
}
