/**
 * "On this day": a tear-off calendar for today and three dated events from
 * the timeline pack, pinned along a hand-drawn line.
 */
import type { CSSProperties } from 'react';
import { Link } from '../../app/navigation.tsx';
import { u } from '../../design/paper.tsx';
import { cutPolygon, seedFrom } from '../../design/wobble.ts';
import { usePack } from '../../lib/packs/load.ts';
import type { TimelinePack } from '../../lib/packs/types.ts';
import { onThisDayOrNext } from './today.ts';

const SLOTS: ReadonlyArray<{ left: string; top: string; width: number; tilt: number; year: string; yearTilt: number; style: 'lined' | 'teal' | 'sticky' }> = [
  { left: '25%', top: '24.89%', width: 292, tilt: -2.5, year: '34.97%', yearTilt: -4, style: 'lined' },
  { left: '49.7%', top: '28.44%', width: 280, tilt: 3, year: '59.52%', yearTilt: 3, style: 'teal' },
  { left: '74.4%', top: '24.22%', width: 262, tilt: -3.5, year: '84.08%', yearTilt: -2, style: 'sticky' },
];

export function OnThisDay({ today = new Date() }: { today?: Date }) {
  const pack = usePack<TimelinePack>('timeline.json');
  const picked = pack.status === 'ready' ? onThisDayOrNext(pack.data.events, today) : { events: [], comingUp: false };
  const events = picked.events;
  const month = today.toLocaleDateString('en-GB', { month: 'long' });
  const weekday = today.toLocaleDateString('en-GB', { weekday: 'long' });

  return (
    <>
      <h2 className="abs home-otd__title" style={{ left: '24%', top: 0, fontSize: u(56) }}>
        On this day
      </h2>
      <Link to="/timeline" className="abs home-link home-otd__more" style={{ right: 0, top: '1.89%', fontSize: u(18) }}>
        Open the whole timeline
      </Link>

      <div className="abs home-calendar" style={{ left: '0.6%', top: '-12.78%', width: u(262), rotate: '-4deg' }}>
        <span aria-hidden="true" className="tape tape--yellow" style={{ left: '30%', top: u(-12), width: u(110), rotate: '5deg' }} />
        <div className="home-calendar__page" style={{ clipPath: cutPolygon(seedFrom('calendar'), 0.6) }}>
          <p className="home-calendar__month" style={{ fontSize: u(26) }}>
            {month}
          </p>
          <p className="home-calendar__day" style={{ fontSize: u(200) }}>
            {today.getDate()}
          </p>
          <p className="home-calendar__weekday" style={{ fontSize: u(24) }}>
            {weekday}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="abs home-otd__empty hand" style={{ left: '30%', top: '28%', width: u(600), fontSize: u(34) }}>
          {pack.status === 'loading'
            ? 'Turning the pages…'
            : 'No events filed for today yet. Open the timeline to wander through the years.'}
        </p>
      ) : null}

      {picked.comingUp ? (
        <p className="abs hand home-otd__empty" style={{ left: '24%', top: '12.4%', width: u(640), fontSize: u(26) }}>
          {events.length === 0 ? '' : 'Coming up on the calendar:'}
        </p>
      ) : null}

      {events.map((e, i) => {
        const slot = SLOTS[i];
        if (!slot) {
          return null;
        }
        const year = e.date.slice(0, 4).replace(/^0+/, '');
        const style: CSSProperties = { left: slot.left, top: slot.top, width: u(slot.width), rotate: `${slot.tilt}deg` };
        return (
          <div key={e.id + e.date} className="home-otd__item">
            <span aria-hidden="true" className="abs hand home-otd__year crowding" style={{ left: slot.year, top: '8.67%', width: u(200), marginLeft: u(-100), fontSize: u(70), rotate: `${slot.yearTilt}deg` }}>
              {year}
            </span>
            <Link to={`/timeline?year=${year}`} className={`abs lift home-otd__note home-otd__note--${slot.style}`} style={style}>
              {slot.style === 'teal' ? (
                <span aria-hidden="true" className="tape tape--yellow" style={{ left: '32%', top: u(-14), width: u(104), rotate: '-6deg' }} />
              ) : null}
              <span className="hand" style={{ clipPath: cutPolygon(seedFrom(e.id), 0.8) }}>
                <span className="home-otd__sr-year">{year}: </span>
                {e.text}
              </span>
            </Link>
          </div>
        );
      })}
    </>
  );
}
