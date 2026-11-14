/**
 * A long list shown 100 at a time with a search box (24-review-4 Req 9). The Credits screen holds thousands of rows;
 * painting them all made a page 150,000 px tall. Search matches every word typed against the row's text; paging
 * restarts at the first page whenever the search changes.
 */
import { useId, useState, type ReactNode } from 'react';

export const PAGE_SIZE = 100;

/** The rows whose text contains every word of `query` (all rows when the query is empty). */
export function matching<T>(rows: readonly T[], query: string, text: (row: T) => string): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...rows];
  return rows.filter((r) => {
    const hay = text(r).toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

export function Paged<T>({ rows, text, label, children }: { rows: readonly T[]; text: (row: T) => string; label: string; children: (shown: T[]) => ReactNode }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const id = useId();
  const found = matching(rows, query, text);
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const at = Math.min(page, pages - 1);
  const shown = found.slice(at * PAGE_SIZE, at * PAGE_SIZE + PAGE_SIZE);
  return (
    <div className="credits__paged">
      <label htmlFor={id}>
        Search the {label}{' '}
        <input
          id={id}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="a name, an author, a licence…"
        />
      </label>
      <p role="status">
        {found.length === 0 ? 'Nothing matches.' : `${label.charAt(0).toUpperCase()}${label.slice(1)} ${at * PAGE_SIZE + 1} to ${at * PAGE_SIZE + shown.length} of ${found.length}.`}
      </p>
      {shown.length > 0 ? children(shown) : null}
      {pages > 1 ? (
        <p>
          <button type="button" className="btn btn--outline" disabled={at === 0} onClick={() => setPage(at - 1)}>
            Previous {PAGE_SIZE}
          </button>{' '}
          <button type="button" className="btn btn--outline" disabled={at >= pages - 1} onClick={() => setPage(at + 1)}>
            Next {PAGE_SIZE}
          </button>
        </p>
      ) : null}
    </div>
  );
}
