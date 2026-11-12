/**
 * One continent's page of the stamp book (16-world-stamp-book Req 3):
 * a slot for every country there, filled with its stamp when found and
 * otherwise saying "Not found yet" in words.
 */
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { MarginNote, Stamp, StripHeading } from '../../design/paper.tsx';
import { perforation } from '../../design/wobble.ts';
import { usePack } from '../../lib/packs/load.ts';
import { CONTINENTS, continentFromSlug, continentSlug } from '../../lib/packs/subjects.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { slotsFor, worldBook } from './stamps.ts';
import './stamps.css';

const EMPTY_EDGE = perforation(8, 4);
const TILTS = [-2.5, 2, -1.5, 3, -3, 1.5] as const;

export default function ContinentStamps({ params }: { params: Record<string, string> }) {
  const continent = continentFromSlug(params['continent'] ?? '');
  useTitle(continent ? `Stamps: ${continent}` : 'Stamp book');
  const progress = useProgress();
  const index = usePack<PackIndex>('countries/index.json');
  const items = index.status === 'ready' ? index.data.items : [];

  if (!continent) {
    return (
      <section className="page squared stamp-book">
        <StripHeading lines={[{ text: 'No such page', tone: 'yellow', tilt: -2 }]} />
        <p role="alert">There is no stamp page for that place.</p>
        <p>
          Pick a continent: {CONTINENTS.map((c, i) => (
            <span key={c}>
              {i > 0 ? ', ' : ''}
              <Link to={`/stamps/${continentSlug(c)}`}>{c}</Link>
            </span>
          ))}
          .
        </p>
      </section>
    );
  }

  const book = worldBook(progress.discovered, items);
  const slots = slotsFor(continent, book.stamps, items);
  const here = book.perContinent.find((c) => c.continent === continent);

  return (
    <section className="page squared stamp-book" aria-labelledby="continent-title">
      <StripHeading
        id="continent-title"
        lines={[
          { text: continent, tone: 'paper', tilt: -2 },
          { text: 'stamps', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.6em' } },
        ]}
      />
      <p className="stamp-book__count" role="status">
        You have <strong>{here?.count ?? 0} of {here?.total ?? slots.length}</strong> countries here, and{' '}
        <strong>{book.count} of {book.total || 197}</strong> in the world.
      </p>
      <MarginNote decorative tilt={-3} size={30} className="stamp-book__note crowding" style={{ color: 'var(--teal-ink)' }}>
        Every country you open becomes a stamp.
      </MarginNote>
      <p>
        <Link to="/stamps">Back to the whole stamp book</Link>
      </p>
      {index.status === 'loading' ? <p>Gathering your stamps…</p> : null}
      <ul className="stamp-book__grid">
        {slots.map((slot, i) => (
          <li key={slot.id}>
            {slot.stamp ? (
              <Stamp
                name={slot.stamp.name}
                caption={slot.stamp.caption}
                src={slot.stamp.src}
                alt={slot.stamp.alt}
                tilt={TILTS[i % TILTS.length]}
                to={`/article/countries/${slot.stamp.id}`}
              />
            ) : (
              <span className="stamp-book__empty-slot" style={{ clipPath: EMPTY_EDGE }}>
                <span aria-hidden="true" className="hand stamp-book__q">
                  ?
                </span>
                <span>Not found yet</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
