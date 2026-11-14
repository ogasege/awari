/**
 * One perforated stamp sheet per continent (22-review-3 Req 5, 6; 24-review-4 Req 10). Every country of the continent
 * has a slot shaped like a postage stamp: a found country shows its stamp picture inside the white perforated
 * border, an unfound one shows a faint "?" in the same outline. The stamp book and the Atlas both draw it, so the
 * two screens always agree. Six continents sit in a 3 x 2 grid (2 x 3 on a phone), so no continent is ever alone on
 * a row.
 */
import { Link } from '../../app/navigation.tsx';
import { perforation } from '../../design/wobble.ts';
import { continentSlug } from '../../lib/packs/subjects.ts';
import type { WorldBook } from './stamps.ts';
import './stamps.css';

const STAMP = perforation(6, 7);
const TILTS = [-1.2, 0.9, -0.6, 1.1, -0.9, 0.7] as const;

export function StampSheets({ book }: { book: WorldBook }) {
  return (
    <ul className="stamp-sheets">
      {book.perContinent.map((c, i) => {
        // The found countries of this continent, in the order they were found; the rest of the sheet is still blank.
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
                  const stamp = found[k];
                  return (
                    <span key={k} className={stamp ? 'stamp-slot is-found' : 'stamp-slot is-empty'} style={{ clipPath: STAMP }} data-slot={stamp ? 'found' : 'empty'}>
                      {stamp ? <img src={stamp.src} alt="" loading="lazy" decoding="async" /> : null}
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
