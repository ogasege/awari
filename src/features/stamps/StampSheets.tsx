/**
 * One perforated stamp sheet per continent, found stamps filled and the rest
 * blank (22-review-3 Req 5, 6). The stamp book and the Atlas both draw it,
 * so the two screens always agree. Six continents sit in a 3 x 2 grid (2 x 3
 * on a phone), so no continent is ever alone on a row.
 */
import { Link } from '../../app/navigation.tsx';
import { perforation } from '../../design/wobble.ts';
import { continentSlug } from '../../lib/packs/subjects.ts';
import type { WorldBook } from './stamps.ts';
import './stamps.css';

const STAMP = perforation(6, 6);
const TILTS = [-1.2, 0.9, -0.6, 1.1, -0.9, 0.7] as const;

export function StampSheets({ book }: { book: WorldBook }) {
  return (
    <ul className="stamp-sheets">
      {book.perContinent.map((c, i) => (
        <li key={c.continent} className="stamp-sheet" style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}>
          <Link to={`/stamps/${continentSlug(c.continent)}`} className="stamp-sheet__link" aria-label={`${c.continent}: ${c.count} of ${c.total} countries. Open this page`}>
            <span className="stamp-sheet__head">
              <span className="stamp-sheet__name">{c.continent}</span>
              <span className="stamp-sheet__count">
                {c.count} of {c.total}
              </span>
            </span>
            <span className="stamp-sheet__stamps" aria-hidden="true">
              {Array.from({ length: c.total }, (_, k) => (
                <span key={k} className={k < c.count ? 'is-found' : ''} style={{ clipPath: STAMP }} />
              ))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
