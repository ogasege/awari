/**
 * The stamp book overview (16-world-stamp-book): the count out of every
 * country in the world, a card for each continent with its own count, and
 * the latest stamps. Progress comes from the device, so it works offline.
 */
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { MarginNote, Stamp, StripHeading } from '../../design/paper.tsx';
import { usePack } from '../../lib/packs/load.ts';
import { continentSlug } from '../../lib/packs/subjects.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { worldBook } from './stamps.ts';
import './stamps.css';

const TILTS = [-2.5, 2, -1.5, 3, -3, 1.5] as const;

export default function StampsScreen() {
  useTitle('Stamp book');
  const progress = useProgress();
  const index = usePack<PackIndex>('countries/index.json');
  const items = index.status === 'ready' ? index.data.items : [];
  const book = worldBook(progress.discovered, items);
  const latest = book.stamps.slice(-6).reverse();

  return (
    <section className="page squared stamp-book" aria-labelledby="stamps-title">
      <StripHeading
        id="stamps-title"
        lines={[
          { text: 'Your stamp book', tone: 'paper', tilt: -2 },
          { text: 'one stamp per country', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
        ]}
      />
      <p className="stamp-book__count" role="status">
        You have <strong>{book.count} of {book.total || 197}</strong> countries.
      </p>
      <MarginNote decorative tilt={-3} size={30} className="stamp-book__note crowding" style={{ color: 'var(--teal-ink)' }}>
        Open a country on the globe or read its article to get its stamp.
      </MarginNote>

      {index.status === 'loading' ? <p>Gathering your stamps…</p> : null}
      {index.status === 'error' ? <p>The stamp book could not be opened. Try again when you are online.</p> : null}
      {index.status === 'ready' && book.count === 0 ? (
        <p className="stamp-book__empty">
          Your book is empty so far. <Link to="/atlas">Spin the globe</Link> and open a country to
          collect your first stamp.
        </p>
      ) : null}

      <h2>One page for each continent</h2>
      <ul className="stamp-book__continents">
        {book.perContinent.map((c) => (
          <li key={c.continent}>
            <Link to={`/stamps/${continentSlug(c.continent)}`} className="stamp-book__continent lift">
              <span className="stamp-book__continent-name">{c.continent}</span>
              <span>
                {c.count} of {c.total} countries
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {latest.length > 0 ? (
        <>
          <h2>Latest stamps</h2>
          <ul className="stamp-book__grid">
            {latest.map((s, i) => (
              <li key={s.id}>
                <Stamp
                  name={s.name}
                  caption={s.caption}
                  src={s.src}
                  alt={s.alt}
                  tilt={TILTS[i % TILTS.length]}
                  to={`/article/countries/${s.id}`}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
