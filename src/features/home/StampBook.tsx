/**
 * "Your stamp book" on Home: the most recent stamps the student has
 * collected, a count out of every country in the world, and a dashed slot
 * inviting the next one.
 */
import { Link } from '../../app/navigation.tsx';
import { Stamp, u } from '../../design/paper.tsx';
import { usePack } from '../../lib/packs/load.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { worldBook } from '../stamps/stamps.ts';
import { nextCountry } from './rotation.ts';
import { dayNumber } from './today.ts';

const PLACES: ReadonlyArray<{ left: string; top: string; tilt: number }> = [
  { left: '0%', top: '72%', tilt: -3 },
  { left: '15.77%', top: '70.67%', tilt: 2.5 },
  { left: '31.55%', top: '72.44%', tilt: -2 },
  { left: '47.32%', top: '71.11%', tilt: 3 },
  { left: '63.1%', top: '72.22%', tilt: -1.5 },
];

export function StampBook({ today = new Date() }: { today?: Date }) {
  const progress = useProgress();
  const index = usePack<PackIndex>('countries/index.json');
  const items = index.status === 'ready' ? index.data.items : [];
  const book = worldBook(progress.discovered, items);
  // A different country each day, from the continent with the fewest stamps (19-home-world Req 4).
  const suggestion = nextCountry(dayNumber(today), progress.discovered, items);
  const recent = book.stamps.slice(-PLACES.length);
  const next = PLACES[recent.length] ?? { left: '79.32%', top: '71.78%', tilt: 2 };
  const nextLeft = recent.length < PLACES.length ? next.left : '79.32%';

  return (
    <>
      <h2 className="abs home-stamps__title" style={{ left: 0, top: '57.33%', fontSize: u(44) }}>
        <span>Your stamp book</span>
      </h2>
      <p className="abs home-stamps__count" style={{ left: 0, top: '63.56%', width: u(700), fontSize: u(20) }}>
        <span>
          You have {book.count} of {book.total || 197} countries. Find a country on the globe to
          collect its stamp.
        </span>
      </p>
      {recent.map((s, i) => {
        const place = PLACES[i] as (typeof PLACES)[number];
        return (
          <Stamp
            key={s.id}
            className="abs"
            name={s.name}
            caption={s.caption}
            src={s.src}
            alt={s.alt}
            tilt={place.tilt}
            to={`/article/countries/${s.id}`}
            style={{ left: place.left, top: place.top, width: u(186) }}
          />
        );
      })}
      {recent.length > 0 ? (
        <span aria-hidden="true" className="abs hand home-stamps__postmark crowding" style={{ left: `calc(${PLACES[Math.min(1, recent.length - 1)]?.left ?? '0%'} + 11.6%)`, top: '71.78%', width: u(48), fontSize: u(19), rotate: '-12deg' }}>
          {today.getDate()}
          <br />
          {today.toLocaleDateString('en-GB', { month: 'short' })}
        </span>
      ) : null}
      <Link to={suggestion ? `/atlas?c=${suggestion.id}` : '/stamps'} className="abs lift home-stamps__next" style={{ left: nextLeft, top: '71.78%', width: u(186), height: u(226), rotate: `${next.tilt}deg` }}>
        <span aria-hidden="true" className="hand" style={{ fontSize: u(110), lineHeight: 0.8 }}>
          ?
        </span>
        <span className="hand" style={{ fontSize: u(26), lineHeight: 1 }}>
          {suggestion ? `how about ${suggestion.title}?` : 'every stamp found!'}
        </span>
      </Link>
    </>
  );
}
