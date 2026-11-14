/** Shows CREDITS.md inside the app, so every licence is one tap away. */
import { Fragment, type ReactNode } from 'react';
import credits from '../../../CREDITS.md?raw';
import { useTitle } from '../../app/useTitle.ts';
import { MarginNote, StripHeading } from '../../design/paper.tsx';
import { parseMarkdown } from '../../lib/text/markdown.ts';
import { MediaCredits } from './MediaCredits.tsx';
import { PAGE_SIZE, Paged } from './Paged.tsx';
import './credits.css';

/** Renders `code`, [links](url) and plain text without injecting HTML. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /`([^`]+)`|\[([^\]]+)\]\((https?:[^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<code key={m.index}>{m[1]}</code>);
    } else {
      out.push(
        <a key={m.index} href={m[3]} rel="noreferrer">
          {m[2]}
        </a>,
      );
    }
    last = (m.index ?? 0) + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

export default function CreditsScreen() {
  useTitle('Credits');
  const blocks = parseMarkdown(credits).filter((b) => !(b.kind === 'heading' && b.level === 1));
  return (
    <article className="page credits">
      <StripHeading
        lines={[
          { text: 'Thank you,', tone: 'paper', tilt: -2 },
          { text: 'open knowledge', tone: 'yellow', tilt: 1.5 },
        ]}
      />
      <MarginNote decorative tilt={-3} size={28} className="credits__note crowding" style={{ color: 'var(--teal-ink)' }}>
        Every picture here has a name, an author and a licence.
      </MarginNote>
      <p className="credits__lead">
        Everything in Awari comes from people who chose to share. Here is who made each photo, map,
        word list and article, and the licence that lets us use it.
      </p>
      {blocks.map((b, i) => (
        <Fragment key={i}>
          {b.kind === 'heading' ? <h2>{inline(b.text)}</h2> : null}
          {b.kind === 'paragraph' ? <p>{inline(b.text)}</p> : null}
          {b.kind === 'list' ? (
            <ul>
              {b.items.map((it) => (
                <li key={it}>{inline(it)}</li>
              ))}
            </ul>
          ) : null}
          {b.kind === 'table' && b.rows.length > PAGE_SIZE ? (
            <Paged rows={b.rows} text={(r) => r.join(' ')} label="credits">
              {(shown) => (
                <div className="credits__table">
                  <table>
                    <thead>
                      <tr>
                        {b.head.map((h) => (
                          <th key={h} scope="col">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.join('|')}>
                          {r.map((c, j) => (
                            <td key={j}>{inline(c)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Paged>
          ) : null}
          {b.kind === 'table' && b.rows.length <= PAGE_SIZE ? (
            <div className="credits__table">
              <table>
                <thead>
                  <tr>
                    {b.head.map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r) => (
                    <tr key={r.join('|')}>
                      {r.map((c, j) => (
                        <td key={j}>{inline(c)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Fragment>
      ))}
      <MediaCredits />
    </article>
  );
}
