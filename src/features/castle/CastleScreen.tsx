/** The castle gate: choose a wing, with each wing's doors drawn lit. */
import { useTitle } from '../../app/useTitle.ts';
import { Button, MarginNote, StripHeading } from '../../design/paper.tsx';
import { useProgress } from '../../lib/store/useProgress.ts';
import { ROOMS, WINGS } from './castle.ts';
import { Doors } from './Doors.tsx';
import './castle.css';

export default function CastleScreen() {
  useTitle('The Castle');
  const progress = useProgress();
  return (
    <section className="castle-board grain" aria-labelledby="castle-title">
      <div className="castle__intro">
        <img className="castle__photo" src="/photos/castle.jpg" alt="A stone castle tower in Gondar, Ethiopia" />
        <div>
          <StripHeading
            id="castle-title"
            lines={[
              { text: 'The', tone: 'paper', tilt: -3 },
              { text: 'Castle', tone: 'yellow', tilt: 2, style: { marginLeft: '0.4em' } },
            ]}
            className="castle__title"
          />
          <p className="castle__lead">
            Every door asks a question. Answer it and the next room lights up. Light all twelve to
            finish a wing. Stuck? Every question has three hints.
          </p>
        </div>
      </div>
      <div className="castle__wings">
        {WINGS.map((w, i) => {
          const lit = progress.castle[w.id] ?? 0;
          return (
            <section key={w.id} className="castle__wing" aria-labelledby={`wing-${w.id}`} style={{ rotate: i % 2 ? '1deg' : '-1deg' }}>
              <h2 id={`wing-${w.id}`}>{w.name}</h2>
              <p>{w.blurb}</p>
              <Doors lit={lit} compact />
              <p className="castle__wing-count">
                {lit === ROOMS ? 'All 12 rooms lit' : `${lit} of ${ROOMS} rooms lit`}
              </p>
              <Button to={`/castle/${w.id}`}>{lit === 0 ? 'Open the first door' : lit === ROOMS ? 'Visit again' : 'Keep going'}</Button>
            </section>
          );
        })}
      </div>
      <MarginNote className="castle__note crowding" decorative color="var(--yellow)" tilt={-4} size={30}>
        who do you think lived in a castle like this?
      </MarginNote>
    </section>
  );
}
