/**
 * The castle gate as a hand-drawn floor plan (28-every-screen-like-home task 5): sixteen rooms round a courtyard, one
 * per wing, each in its own colour with its landmark print and its lit rooms drawn as small doors. A child taps a
 * room to open that wing. Rooms are real links, straight and at least 44 px tall (Rule 7).
 */
import { useTitle } from '../../app/useTitle.ts';
import { MarginNote, StripHeading } from '../../design/paper.tsx';
import { useProgress } from '../../lib/store/useProgress.ts';
import { ROOMS, WINGS, wingPrint, type Wing } from './castle.ts';
import { wingLook } from './castle-look.ts';
import { Link } from '../../app/navigation.tsx';
import './castle.css';

/** Places on a 6 x 4 plan, clockwise from the top left: top row, right side, bottom row, left side. */
const SPOTS: ReadonlyArray<readonly [col: number, row: number]> = [
  [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
  [6, 2], [6, 3],
  [6, 4], [5, 4], [4, 4], [3, 4], [2, 4], [1, 4],
  [1, 3], [1, 2],
];

function Room({ wing, index, lit }: { wing: Wing; index: number; lit: number }) {
  const look = wingLook(wing.id);
  const print = wingPrint(wing);
  const [col, row] = SPOTS[index] ?? [1, 1];
  const done = lit >= ROOMS;
  return (
    <Link
      to={`/castle/${wing.id}`}
      className={`plan__room plan__room--${look.shape}`}
      style={{ gridColumn: col, gridRow: row, background: look.colour }}
      aria-label={`${wing.name}: ${done ? 'all 12 rooms lit' : `${lit} of ${ROOMS} rooms lit`}`}
    >
      {print ? <img className="plan__print" src={print.src} alt="" loading="lazy" decoding="async" /> : null}
      <span className="plan__name">{wing.name.replace(/^The /, '').replace(/ wing$/, '').replace(/^./, (c) => c.toUpperCase())}</span>
      <span aria-hidden="true" className="plan__doors">
        {Array.from({ length: ROOMS }, (_, i) => (
          <i key={i} className={i < lit ? 'is-lit' : ''} />
        ))}
      </span>
      <span aria-hidden="true" className="plan__count hand">
        {done ? 'all lit!' : lit === 0 ? 'open the door' : `${lit} of ${ROOMS}`}
      </span>
    </Link>
  );
}

export default function CastleScreen() {
  useTitle('The Castle');
  const progress = useProgress();
  return (
    <section className="castle-board grain castle-gate" aria-labelledby="castle-title">
      <div className="plan">
        <div className="plan__yard">
          <img className="castle__photo" src="/photos/castle.jpg" alt="A stone castle tower in Gondar, Ethiopia" />
          <StripHeading
            id="castle-title"
            lines={[
              { text: 'The', tone: 'paper', tilt: -3 },
              { text: 'Castle', tone: 'yellow', tilt: 2, style: { marginLeft: '0.4em' } },
            ]}
            className="castle__title"
          />
          <p className="castle__lead">
            Every door asks a question. Answer it and the next room lights up. Light all twelve to finish a wing. Stuck? Every
            question has three hints.
          </p>
          <MarginNote className="castle__note" decorative color="var(--yellow)" tilt={-3} size={28}>
            tap a room to walk in
          </MarginNote>
        </div>
        {WINGS.map((w, i) => (
          <Room key={w.id} wing={w} index={i} lit={progress.castle[w.id] ?? 0} />
        ))}
      </div>
      <p className="plan__legend hand" aria-hidden="true">
        the top row is the six continents, the other ten rooms are subjects
      </p>
    </section>
  );
}
