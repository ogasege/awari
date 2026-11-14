/**
 * The credit of every picture in the media library (23-media-library Req 22), read from `/media/<subject>.json`
 * when a subject is chosen: caption, author, licence and the Commons page, 50 to a page. Nothing here is typed
 * by hand; it is the same record the large view shows.
 */
import { useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useMedia, type MediaFile } from '../../lib/media/media.ts';
import { SUBJECTS } from '../../lib/packs/subjects.ts';

const PAGE = 50;

export function MediaCredits() {
  const [subject, setSubject] = useState<string>('');
  const [page, setPage] = useState(0);
  const file = useMedia<MediaFile>(subject === '' ? null : `${subject}.json`);
  const items = file.status === 'ready' ? file.data.items : [];
  const pages = Math.max(1, Math.ceil(items.length / PAGE));
  const shown = items.slice(page * PAGE, page * PAGE + PAGE);
  return (
    <section aria-labelledby="media-credits">
      <h2 id="media-credits">Pictures in the library</h2>
      <p>
        Every picture on the <Link to="/media">Pictures</Link> screen and in the article strips comes from Wikimedia Commons. Choose a
        subject to see who made each picture and the licence that lets us show it. A small copy is saved on this device; the
        author and licence below belong to the original.
      </p>
      <label>
        Subject{' '}
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Pick a subject…</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      {file.status === 'loading' && subject !== '' ? <p>Opening the list…</p> : null}
      {file.status === 'error' ? <p role="alert">The list could not be opened. Try again when you are online once.</p> : null}
      {shown.length > 0 ? (
        <>
          <p role="status">
            Pictures {page * PAGE + 1} to {page * PAGE + shown.length} of {items.length}.
          </p>
          <div className="credits__table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Picture</th>
                  <th scope="col">Author</th>
                  <th scope="col">Licence</th>
                  <th scope="col">Commons page</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link to={`/media?pic=${m.id}`}>{m.caption}</Link> <small>({m.articleTitle})</small>
                    </td>
                    <td>{m.author || 'unknown'}</td>
                    <td>
                      <a href={m.licenceUrl || m.page} rel="noreferrer">
                        {m.licence}
                      </a>
                    </td>
                    <td>
                      <a href={m.page} rel="noreferrer">
                        {m.title.replace(/^File:/, '')}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <button type="button" className="btn btn--outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous 50
            </button>{' '}
            <button type="button" className="btn btn--outline" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
              Next 50
            </button>
          </p>
        </>
      ) : null}
    </section>
  );
}
