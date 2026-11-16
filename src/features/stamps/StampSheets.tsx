/**
 * One perforated stamp sheet per continent (22-review-3 Req 5, 6; 24-review-4 Req 10). Every country of the continent
 * has a slot shaped like a postage stamp: a found country shows its stamp picture inside the white perforated
 * border, an unfound one shows the faint outline of that country (26-final-review, round 3: the overview was still a
 * grid of "?"), and only a country too small to have a shape in the atlas keeps the "?". The stamp book and the Atlas
 * both draw it, so the two screens always agree. Six continents sit in a 3 x 2 grid (2 x 3 on a phone), so no
 * continent is ever alone on a row.
 */
import { Link } from '../../app/navigation.tsx';
import { perforation } from '../../design/wobble.ts';
import { continentSlug } from '../../lib/packs/subjects.ts';
import type { PackIndexItem } from '../../lib/packs/types.ts';
import { CountryOutline, type Shapes } from './CountryOutline.tsx';
import { slotsFor, type Slot, type WorldBook } from './stamps.ts';
import './stamps.css';

const STAMP = perforation(6, 7);
const TILTS = [-1.2, 0.9, -0.6, 1.1, -0.9, 0.7] as const;

export function StampSheets({ book, items = [], shapes = null }: { book: WorldBook; items?: readonly PackIndexItem[]; shapes?: Shapes | null }) {
  return (
    <ul className="stamp-sheets">
      {book.perContinent.map((c, i) => {
        // One slot for each country of the continent, so every empty stamp can show its own outline. Without the
        // country list (it has not loaded yet) the sheet falls back to the found stamps first, then blanks.
        const named: Slot[] = items.length > 0 ? slotsFor(c.continent, book.stamps, items) : [];
        const found = book.stamps.filter((s) => s.continent === c.continent);
        return (
          <li key={c.continent} className="stamp-sheet" style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}>
            <Link to={`/stamps/${continentSlug(c.continent)}`} className="stamp-sheet__link" aria-label={`${c.continent} ${c.count} of ${c.total}. Open this stamp page`}>
              <span className="stamp-sheet__head">
                <span className="stamp-sheet__name">{c.continent}</span>
                {' '}
                <span className="stamp-sheet__count">
                  {c.count} of {c.total}
                </span>
              </span>
              <span className="stamp-sheet__stamps" aria-hidden="true">
                {Array.from({ length: c.total }, (_, k) => {
                  const slot = named[k];
                  const stamp = slot ? slot.stamp : found[k];
                  return (
                    <span key={k} className={stamp ? 'stamp-slot is-found' : 'stamp-slot is-empty'} style={{ clipPath: STAMP }} data-slot={stamp ? 'found' : 'empty'}>
                      {stamp ? <img src={stamp.src} alt="" loading="lazy" decoding="async" /> : slot ? <CountryOutline shapes={shapes} id={slot.id} className="stamp-slot__outline" /> : null}
                    </span>
                  );
                })}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
