/**
 * Guided tours (20-tours): `/tours` lists the three tours, and
 * `/tours/:id?stop=n` turns the globe to one stop at a time, shows its
 * article summary and opens the article. The globe moves only when the
 * student presses a button or drags it; nothing animates on its own.
 */
import { useState } from 'react';
import { Link, usePath } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, Doodle, MarginNote, Print, StripHeading, TornEdge } from '../../design/paper.tsx';
import { seedFrom, wobblyLine } from '../../design/wobble.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import type { Article } from '../../lib/packs/types.ts';
import { Globe, type Shapes } from '../atlas/Globe.tsx';
import type { Rotation } from '../atlas/globeMath.ts';
import { TOURS, stopFromPath, stopHref, stopRotation, tourById, type Tour } from './tours.ts';
import './tours.css';

const NO_DISCOVERED: ReadonlySet<string> = new Set();

/** The journey drawn as a hand-inked line with a dot per stop, filled up to here (design rule 6). */
function Route({ count, index, seed }: { count: number; index: number; seed: string }) {
  const W = 40 + (count - 1) * 64;
  const x = (i: number): number => 20 + i * 64;
  return (
    <svg aria-hidden="true" className="tour__route" viewBox={`0 0 ${W} 40`} width={W} height={40}>
      <path d={wobblyLine({ x: 12, y: 20 }, { x: W - 12, y: 20 }, seedFrom(seed), 2)} />
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={x(i)} cy={20} r={i === index ? 11 : 8} className={i <= index ? 'is-done' : ''} />
      ))}
    </svg>
  );
}

function TourPlay({ tour }: { tour: Tour }) {
  const path = usePath();
  const index = stopFromPath(path, tour.stops.length);
  const stop = tour.stops[index] as Tour['stops'][number];
  const shapes = usePack<Shapes>('atlas/countries.json');
  const article = usePack<Article>(`${stop.article}.json`);
  const [view, setView] = useState<{ index: number; rotation: Rotation }>({ index, rotation: stopRotation(stop) });
  if (view.index !== index) {
    setView({ index, rotation: stopRotation(stop) });
  }
  const last = index === tour.stops.length - 1;
  const lead = article.status === 'ready' ? article.data.photos[0] : undefined;

  return (
    <section className="tour" aria-labelledby="tour-title">
      <div className="tour__board atlas-board grain">
      <div className="tour__head">
        <StripHeading id="tour-title" lines={[{ text: tour.title, tone: 'paper', tilt: -2 }]} className="tour__title" />
        <Link to="/tours" className="tour__back">
          All tours
        </Link>
      </div>
      <p className="tour__count" role="status" aria-live="polite">
        Stop {index + 1} of {tour.stops.length}: {stop.title}, {stop.place}.
      </p>

      <div className="tour__body">
        <div className="tour__globe">
          <div className="tour__note crowding">
            <MarginNote decorative tilt={-4} size={30} color="var(--yellow)">
              {last ? 'last stop! where would you go next?' : 'the red ring marks this stop'}
            </MarginNote>
          </div>
          {!last && (
            <div className="tour__pointer crowding">
              <Doodle kind="arrow" seed={`tour-${tour.id}`} size={260} color="var(--yellow)" from={{ x: 8, y: 8 }} to={{ x: 215, y: 225 }} />
            </div>
          )}
          {shapes.status === 'ready' ? (
            <Globe
              shapes={shapes.data}
              rotation={view.rotation}
              onRotate={(r) => setView({ index, rotation: r })}
              discovered={NO_DISCOVERED}
              selected={null}
              onSelect={() => undefined}
              marker={{ lon: stop.lon, lat: stop.lat }}
              label={`Globe turned to ${stop.title}, ${stop.place}. Drag it or use the arrow keys to look around.`}
            />
          ) : (
            <p>Winding up the globe…</p>
          )}
        </div>

        <article className="tour__card" aria-labelledby="tour-stop">
          <h2 id="tour-stop">
            <span className="strip strip--navy">{stop.title}</span>
          </h2>
          <p className="tour__place">{stop.place}</p>
          {lead ? (
            <Print
              src={packUrl(lead.file)}
              alt={lead.alt}
              caption={lead.caption}
              tilt={3}
              aspect={`${lead.width} / ${lead.height}`}
              captionSize={26}
              className="tour__print"
            />
          ) : null}
          <p className="tour__summary">{article.status === 'ready' ? article.data.summary : 'Opening the page…'}</p>
          <div className="tour__buttons">
            <Button to={stopHref(tour, index)}>Open the article</Button>
            {index > 0 ? (
              <Button to={`/tours/${tour.id}?stop=${index}`} tone="outline">
                Previous stop
              </Button>
            ) : null}
            {last ? (
              <Button to="/tours" tone="outline">
                Finish the tour
              </Button>
            ) : (
              <Button to={`/tours/${tour.id}?stop=${index + 2}`} tone="outline">
                Next stop
              </Button>
            )}
          </div>
        </article>
      </div>

      <TornEdge color="var(--paper)" seed={`tour-edge-${tour.id}`} height={30} />
      </div>
      <div className="tour__paper squared">
      <Route count={tour.stops.length} index={index} seed={tour.id} />
      <ol className="tour__stops" aria-label="Stops on this tour">
        {tour.stops.map((s, i) => (
          <li key={s.article}>
            <Link to={`/tours/${tour.id}?stop=${i + 1}`} aria-current={i === index ? 'step' : undefined}>
              <span aria-hidden="true" className="hand tour__stops-num">
                {i + 1}
              </span>
              {s.title}
            </Link>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}

export default function TourScreen({ params }: { params: Record<string, string> }) {
  const tour = tourById(params['id'] ?? '');
  useTitle(tour?.title);
  if (!tour) {
    return (
      <section className="page squared">
        <StripHeading lines={[{ text: 'No such tour', tone: 'yellow', tilt: -2 }]} />
        <p role="alert">
          There is no tour with that name. <Link to="/tours">See every tour</Link>.
        </p>
      </section>
    );
  }
  return <TourPlay tour={tour} />;
}

/** `/tours`: the three tours as cards. */
export function ToursList() {
  useTitle('Guided tours');
  return (
    <section className="page squared tours" aria-labelledby="tours-title">
      <StripHeading
        id="tours-title"
        lines={[
          { text: 'Guided tours', tone: 'paper', tilt: -2 },
          { text: 'around the globe', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
        ]}
      />
      <p className="tours__lead">Hop from stop to stop. The globe turns to each place and opens its article.</p>
      <ul className="tours__list">
        {TOURS.map((t, i) => (
          <li key={t.id} className="tours__card">
            <Print
              className="tours__print"
              src={packUrl(t.cover.file)}
              alt={t.cover.alt}
              width={220}
              tilt={i % 2 === 0 ? -2.5 : 2}
              tape={[{ left: '34%', width: 90, tilt: i % 2 === 0 ? -5 : 5, tone: 'yellow' }]}
            />
            <h2>{t.title}</h2>
            <p>{t.blurb}</p>
            <p className="tours__stops">{t.stops.map((s) => s.title).join(' · ')}</p>
            <Button to={`/tours/${t.id}`}>Start the tour ({t.stops.length} stops)</Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
