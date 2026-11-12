/**
 * Guided tours (20-tours): `/tours` lists the three tours, and
 * `/tours/:id?stop=n` turns the globe to one stop at a time, shows its
 * article summary and opens the article. The globe moves only when the
 * student presses a button or drags it; nothing animates on its own.
 */
import { useState } from 'react';
import { Link, usePath } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, Doodle, Print, StripHeading } from '../../design/paper.tsx';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import type { Article } from '../../lib/packs/types.ts';
import { Globe, type Shapes } from '../atlas/Globe.tsx';
import type { Rotation } from '../atlas/globeMath.ts';
import { TOURS, stopFromPath, stopHref, stopRotation, tourById, type Tour } from './tours.ts';
import './tours.css';

const NO_DISCOVERED: ReadonlySet<string> = new Set();

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
    <section className="tour atlas-board grain" aria-labelledby="tour-title">
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
        {TOURS.map((t) => (
          <li key={t.id} className="tours__card">
            <h2>{t.title}</h2>
            <p>{t.blurb}</p>
            <p className="tours__stops">{t.stops.map((s) => s.title).join(' · ')}</p>
            <Button to={`/tours/${t.id}`}>Start the tour ({t.stops.length} stops)</Button>
          </li>
        ))}
      </ul>
      <Doodle kind="arrow" seed="tours" size={60} color="var(--teal-ink)" className="crowding tours__arrow" />
    </section>
  );
}
