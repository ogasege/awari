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
  CONTINENT_FILTERS,
  FILTERS,
  balancedCentury,
  centuriesWith,
  filterEvents,
  EVENT_KIND_GROUPS,
  inCentury,
  kindOf,
  rulerStep,
  nearestCentury,
  positionOf,
  rulerMarks,
  startCentury,
  yearOf,
  yearRange,
  type ContinentFilter,
  type SubjectFilter,
} from './filter.ts';
import './timeline.css';
import { withoutYear } from '../../lib/text/dates.ts';


/** Article link such as "countries/mali" as an in-app path. */
function articlePath(link: string): string {
  return `/article/${link}`;
}

/**
 * The note's own sentence repeats its heading and its year ("X was born on 4 February 1900." under the heading X and
 * the badge 1900). When the sentence starts with the label, show only what it adds: "Born 4 February 1900."
 */
export function shortText(label: string, text: string): string {
  if (!text.startsWith(label)) return text;
  const rest = text.slice(label.length).trim();
  const m = /^was (\w+) on (.+)$/i.exec(rest);
  if (!m?.[1]) return text;
  return `${m[1].charAt(0).toUpperCase()}${m[1].slice(1)} ${m[2]}`;
}

function EventNote({ event, picked }: { event: TimelineEvent; picked: boolean }) {
  const year = yearOf(event);
  return (
    <li id={`event-${event.id}`} className={`tl-note tl-note--${kindOf(event)}${picked ? ' is-picked' : ''}`}>
      <span aria-hidden="true" className="tl-note__year hand">
        {year}
      </span>
      <div className="tl-note__body">
        <h3 className="tl-note__label">
          <span className="sr-only">{year}: </span>
          {event.label}
        </h3>
        <p>{withoutYear(shortText(event.label, event.text), event.date)}</p>
        {event.continent ? <p className="tl-note__where">{event.continent}</p> : null}
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
      {rulerMarks(min, max, rulerStep(min, max)).map((year) => (
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
  const [filter, setFilter] = useState<SubjectFilter>(() => {
    const wanted = new URLSearchParams(window.location.search).get('subject');
    return FILTERS.some((f) => f.id === wanted) ? (wanted as SubjectFilter) : 'all';
  });
  const [continent, setContinent] = useState<ContinentFilter>('all');
  const today = useMemo(() => new Date(), []);
  const wantedYear = useMemo(() => {
    const y = new URLSearchParams(window.location.search).get('year');
    return y && /^\d{1,4}$/.test(y) ? Number(y) : null;
  }, []);

  const all = useMemo(() => (pack.status === 'ready' ? pack.data.events : []), [pack]);
  const shown = useMemo(() => filterEvents(all, filter, continent), [all, filter, continent]);
  const [century, setCentury] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const centuries = useMemo(() => centuriesWith(shown), [shown]);
  // One century at a time: the one the student chose, else the one the link asked for, else the 1900s.
  const current =
    century === null ? startCentury(centuries, wantedYear) : nearestCentury(centuries, century);
  const index = current === undefined ? -1 : centuries.indexOf(current);
  const previous = index > 0 ? centuries[index - 1] : undefined;
  const next = index >= 0 ? centuries[index + 1] : undefined;
  const inThis = useMemo(() => (current === undefined ? [] : inCentury(shown, current)), [shown, current]);
  const visible = useMemo(() => {
    if (showAll) return inThis;
    const mix = balancedCentury(inThis);
    // A link to a particular year must show that year's event even if the mix left it out.
    const target = wantedYear === null ? undefined : inThis.find((e) => yearOf(e) === wantedYear);
    return target && !mix.includes(target) ? inThis.filter((e) => e === target || mix.includes(e)) : mix;
  }, [showAll, inThis, wantedYear]);
  const goTo = (c: number): void => {
    setCentury(c);
    setShowAll(false);
  };
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
  const continentName = CONTINENT_FILTERS.find((f) => f.id === continent)?.label ?? 'Everywhere';
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
      <div className="timeline__filters timeline__filters--continents" role="group" aria-label="Show events from">
        {CONTINENT_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="timeline__chip"
            aria-pressed={continent === f.id}
            onClick={() => setContinent(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="timeline__count" role="status" aria-live="polite">
        {pack.status === 'ready'
          ? `Showing ${shown.length} ${shown.length === 1 ? 'event' : 'events'}${filter === 'all' ? '' : ` about ${filterName}`}${continent === 'all' ? '' : ` in ${continentName}`}.`
          : ''}
      </p>

      <Ruler events={shown} todayYear={today.getFullYear()} />

      {current !== undefined ? (
        <nav className="timeline__centuries" aria-label="Centuries">
          <button
            type="button"
            className="timeline__chip timeline__step"
            disabled={previous === undefined}
            onClick={() => previous !== undefined && goTo(previous)}
          >
            {previous === undefined ? 'Earlier' : `← ${previous}s`}
          </button>
          <ul className="timeline__century-list">
            {centuries.map((c) => (
              <li key={c}>
                <button type="button" className="timeline__chip" aria-pressed={c === current} onClick={() => goTo(c)}>
                  {c}s
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="timeline__chip timeline__step"
            disabled={next === undefined}
            onClick={() => next !== undefined && goTo(next)}
          >
            {next === undefined ? 'Later' : `${next}s →`}
          </button>
        </nav>
      ) : null}

      {current !== undefined ? (
        <section className="timeline__century" aria-labelledby={`century-${current}`}>
          <h2 id={`century-${current}`} className="timeline__century-title">
            The {current}s
          </h2>
          <p className="timeline__century-count" role="status">
            {visible.length === inThis.length
              ? `All ${inThis.length} ${inThis.length === 1 ? 'event' : 'events'} of the ${current}s.`
              : `A mix of ${visible.length} of the ${inThis.length} events of the ${current}s.`}
          </p>
          <ul className="tl-legend" aria-label="What the colours mean">
            {EVENT_KIND_GROUPS.map((k) => (
              <li key={k.id} className={`tl-legend__item tl-note--${k.id}`}>
                {k.label}
              </li>
            ))}
          </ul>
          <ol className="timeline__list">
            {visible.map((e) => (
              <EventNote key={e.id} event={e} picked={picked?.id === e.id} />
            ))}
          </ol>
          {visible.length < inThis.length ? (
            <button type="button" className="timeline__chip timeline__more" onClick={() => setShowAll(true)}>
              Show all {inThis.length} events of the {current}s
            </button>
          ) : null}
        </section>
      ) : null}
      {pack.status === 'ready' && shown.length === 0 ? <p>Nothing filed under {filterName}{continent === 'all' ? '' : ` in ${continentName}`} yet.</p> : null}

      <p className="timeline__credit">
        Dates and names: <a href="https://www.wikidata.org/">Wikidata</a> (CC0). Each sentence is a fixed template
        filled with those fields.
      </p>
    </section>
  );
}
