/**
 * Timeline and On this day (07-timeline): subject toggles, today's
 * events, a drawn century ruler with a "you are here" arrow, and every
 * event as a note in an ordered list, oldest first, grouped by century.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Doodle, MarginNote, StripHeading, Tape } from '../../design/paper.tsx';
import { seedFrom, wobblyLine } from '../../design/wobble.ts';
import { usePack } from '../../lib/packs/load.ts';
import type { TimelineEvent, TimelinePack } from '../../lib/packs/types.ts';
import { onThisDay } from '../home/today.ts';
import {
  FILTERS,
  filterBySubject,
  groupByCentury,
  positionOf,
  rulerMarks,
  yearOf,
  yearRange,
  type SubjectFilter,
} from './filter.ts';
import './timeline.css';

const NOTE_STYLES = ['lined', 'teal', 'sticky'] as const;

/** Article link such as "countries/mali" as an in-app path. */
function articlePath(link: string): string {
  return `/article/${link}`;
}

function EventNote({ event, index, picked }: { event: TimelineEvent; index: number; picked: boolean }) {
  const year = yearOf(event);
  return (
    <li
      id={`event-${event.id}`}
      className={`tl-note tl-note--${NOTE_STYLES[index % NOTE_STYLES.length]}${picked ? ' is-picked' : ''}`}
    >
      <span aria-hidden="true" className="tl-note__year hand">
        {year}
      </span>
      <div className="tl-note__body">
        <h3 className="tl-note__label">
          <span className="sr-only">{year}: </span>
          {event.label}
        </h3>
        <p>{event.text}</p>
        {event.link ? (
          <Link to={articlePath(event.link)} className="tl-note__link">
            Read about {event.label}
          </Link>
        ) : null}
      </div>
    </li>
  );
}

function Ruler({ events, todayYear }: { events: readonly TimelineEvent[]; todayYear: number }) {
  const range = yearRange(events);
  if (!range) {
    return null;
  }
  const { min, max } = range;
  const W = 1000;
  const x = (year: number): number => 40 + positionOf(year, min, max) * (W - 80);
  const here = x(todayYear);
  return (
    <svg
      aria-hidden="true"
      className="tl-ruler crowding"
      viewBox={`0 0 ${W} 150`}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={wobblyLine({ x: 30, y: 90 }, { x: W - 30, y: 90 }, seedFrom('ruler'), 2.5)} />
      {events.map((e) => (
        <circle key={e.id} cx={x(yearOf(e))} cy={90} r={3.5} className="tl-ruler__tick" />
      ))}
      {rulerMarks(min, max).map((year) => (
        <g key={year}>
          <path d={wobblyLine({ x: x(year), y: 78 }, { x: x(year), y: 106 }, year, 1.5)} />
          <text x={x(year)} y={132} textAnchor="middle" className="tl-ruler__year">
            {year}
          </text>
        </g>
      ))}
      <g className="tl-ruler__here">
        <path d={wobblyLine({ x: here, y: 70 }, { x: here, y: 40 }, 7, 1.5)} />
        <path d={wobblyLine({ x: here - 9, y: 52 }, { x: here, y: 70 }, 8, 1)} />
        <path d={wobblyLine({ x: here + 9, y: 52 }, { x: here, y: 70 }, 9, 1)} />
        <text x={Math.min(here, W - 70)} y={30} textAnchor="middle" className="tl-ruler__here-text">
          you are here
        </text>
      </g>
    </svg>
  );
}

export default function TimelineScreen() {
  useTitle('Timeline');
  const pack = usePack<TimelinePack>('timeline.json');
  const [filter, setFilter] = useState<SubjectFilter>('all');
  const today = useMemo(() => new Date(), []);
  const wantedYear = useMemo(() => {
    const y = new URLSearchParams(window.location.search).get('year');
    return y && /^\d{1,4}$/.test(y) ? Number(y) : null;
  }, []);

  const all = useMemo(() => (pack.status === 'ready' ? pack.data.events : []), [pack]);
  const shown = useMemo(() => filterBySubject(all, filter), [all, filter]);
  const groups = useMemo(() => groupByCentury(shown), [shown]);
  const todays = useMemo(() => onThisDay(all, today, 6), [all, today]);
  const picked = useMemo(
    () => (wantedYear === null ? undefined : all.find((e) => yearOf(e) === wantedYear)),
    [all, wantedYear],
  );

  useEffect(() => {
    if (!picked) {
      return;
    }
    document.getElementById(`event-${picked.id}`)?.scrollIntoView?.({ block: 'center' });
  }, [picked]);

  const filterName = FILTERS.find((f) => f.id === filter)?.label ?? 'All';
  const dayText = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  return (
    <section className="page squared timeline" aria-labelledby="timeline-title">
      <StripHeading
        id="timeline-title"
        lines={[
          { text: 'Timeline', tone: 'paper', tilt: -2 },
          { text: 'walk through the years', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
        ]}
      />
      <p className="timeline__lead">
        Every note here is a date taken from Wikidata. Pick a subject, or look at what happened on
        today’s date.
      </p>
      <MarginNote decorative tilt={-3} size={30} className="deco-note crowding" style={{ color: 'var(--teal-ink)' }}>
        Which of these happened on your birthday?
      </MarginNote>

      <section className="timeline__today" aria-labelledby="timeline-today">
        <Tape left="6%" width={110} tilt={-5} tone="yellow" />
        <h2 id="timeline-today">On this day, {dayText}</h2>
        {pack.status === 'loading' ? <p>Turning the pages…</p> : null}
        {pack.status === 'error' ? <p>The timeline could not be opened. Try again when you are online.</p> : null}
        {pack.status === 'ready' && todays.length === 0 ? (
          <p>No events are filed for {dayText} yet. Wander through the years below.</p>
        ) : null}
        {todays.length > 0 ? (
          <ul className="timeline__today-list">
            {todays.map((e) => (
              <li key={e.id}>
                <strong>{yearOf(e)}</strong> {e.text}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="timeline__filters" role="group" aria-label="Show events about">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="timeline__chip"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
        <Doodle kind="arrow" seed="chips" size={56} color="var(--teal-ink)" className="crowding timeline__chip-arrow" />
      </div>
      <p className="timeline__count" role="status" aria-live="polite">
        {pack.status === 'ready'
          ? `Showing ${shown.length} ${shown.length === 1 ? 'event' : 'events'}${filter === 'all' ? '' : ` about ${filterName}`}.`
          : ''}
      </p>

      <Ruler events={shown} todayYear={today.getFullYear()} />

      {groups.map((g) => (
        <section key={g.label} className="timeline__century" aria-labelledby={`century-${g.label}`}>
          <h2 id={`century-${g.label}`} className="timeline__century-title">
            {g.label}
          </h2>
          <ol className="timeline__list">
            {g.events.map((e, i) => (
              <EventNote key={e.id} event={e} index={i} picked={picked?.id === e.id} />
            ))}
          </ol>
        </section>
      ))}
      {pack.status === 'ready' && shown.length === 0 ? <p>Nothing filed under {filterName} yet.</p> : null}

      <p className="timeline__credit">
        Dates and names: <a href="https://www.wikidata.org/">Wikidata</a> (CC0). Each sentence is a fixed template
        filled with those fields.
      </p>
    </section>
  );
}
