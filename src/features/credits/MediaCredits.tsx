/**
 * The credit of every picture in the media library (23-media-library Req 22, 24-review-4 Req 9), read from
 * `/media/<subject>.json` when a subject is chosen: caption, author, licence and the Commons page, 100 to a page,
 * with a search box. Nothing here is typed by hand; it is the same record the large view shows.
 */
import { useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useMedia, type MediaFile } from '../../lib/media/media.ts';
import { SUBJECTS } from '../../lib/packs/subjects.ts';
import { Paged } from './Paged.tsx';

export function MediaCredits() {
  const [subject, setSubject] = useState<string>('');
  const file = useMedia<MediaFile>(subject === '' ? null : `${subject}.json`);
  const items = file.status === 'ready' ? file.data.items : [];
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
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
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
      {items.length > 0 ? (
        <Paged key={subject} rows={items} text={(m) => `${m.caption} ${m.articleTitle} ${m.author} ${m.licence} ${m.title}`} label="pictures">
          {(shown) => (
            <div className="credits__table" role="region" aria-label="Picture credits table" tabIndex={0}>
              <table>
                <thead>
                  <tr>
                    <th scope="col" data-col="Picture">Picture</th>
                    <th scope="col" data-col="Author">Author</th>
                    <th scope="col" data-col="Licence">Licence</th>
                    <th scope="col" data-col="Commons page">Commons page</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((m) => (
                    <tr key={m.id}>
                      <td data-col="Picture">
                        <Link to={`/media?pic=${m.id}`}>{m.caption}</Link> <small>({m.articleTitle})</small>
                      </td>
                      <td data-col="Author">{m.author || 'unknown'}</td>
                      <td data-col="Licence">
                        <a href={m.licenceUrl || m.page} rel="noreferrer">
                          {m.licence}
                        </a>
                      </td>
                      <td data-col="Commons page">
                        <a href={m.page} rel="noreferrer">
                          {m.title.replace(/^File:/, '')}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Paged>
      ) : null}
    </section>
  );
}
