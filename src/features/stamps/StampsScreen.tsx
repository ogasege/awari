/**
 * The stamp book (08-stamp-book): 54 slots for Africa, filled by the
 * stamps of countries the student has opened, then the stamps from the
 * rest of the world. Progress comes from the device, so it works offline.
 */
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { MarginNote, Stamp, StripHeading } from '../../design/paper.tsx';
import { perforation } from '../../design/wobble.ts';
import { usePack } from '../../lib/packs/load.ts';
import type { PackIndex } from '../../lib/packs/types.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { africaSlots, stampsFor } from './stamps.ts';
import './stamps.css';

const EMPTY_EDGE = perforation(8, 4);
const TILTS = [-2.5, 2, -1.5, 3, -3, 1.5] as const;

export default function StampsScreen() {
  useTitle('Stamp book');
  const progress = useProgress();
  const index = usePack<PackIndex>('countries/index.json');
  const items = index.status === 'ready' ? index.data.items : [];
  const book = stampsFor(progress.discovered, items);
  const slots = africaSlots(book.stamps, items);
  const others = book.stamps.filter((s) => !s.africa);

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
        You have <strong>{book.africaCount} of {book.africaTotal}</strong> African countries.
        {book.stamps.length > 0 ? ` ${book.stamps.length} stamps in all.` : ''}
      </p>
      <MarginNote decorative tilt={-3} size={30} className="stamp-book__note crowding" style={{ color: 'var(--teal-ink)' }}>
        Open a country on the globe or read its article to get its stamp.
      </MarginNote>

      {index.status === 'loading' ? <p>Gathering your stamps…</p> : null}
      {index.status === 'error' ? <p>The stamp book could not be opened. Try again when you are online.</p> : null}

      {index.status === 'ready' && book.stamps.length === 0 ? (
        <p className="stamp-book__empty">
          Your book is empty so far. <Link to="/atlas">Spin the globe</Link> and open a country to
          collect your first stamp.
        </p>
      ) : null}

      <h2>Africa</h2>
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

      {others.length > 0 ? (
        <>
          <h2>Around the world</h2>
          <ul className="stamp-book__grid">
            {others.map((s, i) => (
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
