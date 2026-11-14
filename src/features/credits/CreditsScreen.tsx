/** Shows CREDITS.md inside the app, so every licence is one tap away. */
import { Fragment, type ReactNode } from 'react';
import credits from '../../../CREDITS.md?raw';
import { useTitle } from '../../app/useTitle.ts';
import { canSavePictures, savePictures, useOfflineStatus, usePicturesState, type OfflineStatus } from '../../lib/offline/register.ts';
import { MarginNote, StripHeading } from '../../design/paper.tsx';
import { parseMarkdown } from '../../lib/text/markdown.ts';
import { MediaCredits } from './MediaCredits.tsx';
import { PAGE_SIZE, Paged } from './Paged.tsx';
import './credits.css';

/** Renders `code`, [links](url) and plain text without injecting HTML. */
/** A readable label for a bare web address: the file name of a Commons page, else the host. */
function labelFor(url: string): string {
  const m = /commons\.wikimedia\.org\/wiki\/File:([^?#]+)/.exec(url);
  if (m?.[1]) {
    try {
      return decodeURIComponent(m[1]).replace(/_/g, ' ');
    } catch {
      return m[1].replace(/_/g, ' ');
    }
  }
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /`([^`]+)`|\[([^\]]+)\]\((https?:[^)\s]+)\)|(https?:\/\/\S+)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<code key={m.index}>{m[1]}</code>);
    } else if (m[4] !== undefined) {
      // A closing bracket or full stop after the address belongs to the sentence, unless the address itself holds the bracket.
      let url = m[4];
      while (/[).,;]$/.test(url) && !(url.endsWith(')') && (url.match(/\(/g) ?? []).length >= (url.match(/\)/g) ?? []).length)) url = url.slice(0, -1);
      out.push(
        <a key={m.index} href={url} rel="noreferrer">
          {labelFor(url)}
        </a>,
        m[4].slice(url.length),
      );
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

/** Whether this device has the whole site saved (the header stays quiet when it has). */
export function offlineStateText(status: OfflineStatus): string {
  if (status === 'ready') return 'On this device: saved. Articles, quizzes, maps, the atlas and lead photos work without a connection. Other pictures are kept as you look at them.';
  if (status === 'preparing') return 'On this device: still saving for use without a connection.';
  return 'On this device: not saved for use without a connection.';
}

function OfflineState() {
  const status = useOfflineStatus();
  const pics = usePicturesState();
  return (
    <div className="credits__offline">
      <p>{offlineStateText(status)}</p>
      {status === 'ready' && canSavePictures() ? (
        pics.state === 'done' ? (
          <p>All pictures are saved on this device.</p>
        ) : pics.state === 'saving' ? (
          <p role="status">Saving pictures… {pics.total > 0 ? `${Math.floor((pics.saved / pics.total) * 100)}%` : ''}</p>
        ) : (
          <p>
            <button type="button" className="btn btn--ink" onClick={savePictures}>
              Save all pictures (about 85 MB)
            </button>{' '}
            {pics.state === 'failed' ? 'That did not finish. Check your connection and try again.' : 'Do this on a good connection, and every picture works offline.'}
          </p>
        )
      ) : null}
    </div>
  );
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
      <OfflineState />
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
                          <th key={h} scope="col" data-col={h}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.join('|')}>
                          {r.map((c, j) => (
                            <td key={j} data-col={b.head[j]}>{inline(c)}</td>
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
                      <th key={h} scope="col" data-col={h}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r) => (
                    <tr key={r.join('|')}>
                      {r.map((c, j) => (
                        <td key={j} data-col={b.head[j]}>{inline(c)}</td>
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
