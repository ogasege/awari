/**
 * The Pictures screen (23-media-library Req 18): every picture in the library with filters by subject and kind,
 * a search over captions and article titles, and a "surprise me" pile. Everything comes from `/media/index.json`
 * (loaded on demand); the credit loads from the subject file when a picture is opened.
 */
import { useMemo, useState } from 'react';
import { useTitle } from '../../app/useTitle.ts';
import { MarginNote, StripHeading, TornEdge } from '../../design/paper.tsx';
import { SUBJECTS } from '../../lib/packs/subjects.ts';
import { KIND_LABELS, packOf, thumbUrl, useMedia, type IndexRow, type MediaFile, type MediaIndex } from '../../lib/media/media.ts';
import { MediaViewer } from './MediaViewer.tsx';
import '../timeline/timeline.css';
import { SafeImg } from '../../design/SafeImg.tsx';
import './media.css';

const PAGE = 60;
const SUBJECT_NAME = new Map<string, string>(SUBJECTS.map((s) => [s.id as string, s.label]));

/** A small stable hash of an id, to mix subjects in the default order. */
export function mixOf(id: string): number {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Rows that match a subject, a kind and every word of the query (in the caption or the article's name). */
export function filterRows(rows: readonly IndexRow[], subject: string, kind: string, query: string, titles: ReadonlyMap<string, string> = new Map()): IndexRow[] {
  const words = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return rows.filter((r) => {
    if (subject !== 'all' && packOf(r[1]) !== subject) return false;
    if (kind !== 'all' && r[2] !== kind) return false;
    if (words.length === 0) return true;
    const hay = `${r[5]} ${r[1].split('/')[1]?.replace(/-/g, ' ') ?? ''} ${titles.get(r[1]) ?? ''}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/** `count` rows drawn at random, without repeats. */
export function surprise(rows: readonly IndexRow[], count: number, random: () => number = Math.random): IndexRow[] {
  const pool = [...rows];
  const out: IndexRow[] = [];
  while (out.length < count && pool.length > 0) {
    out.push(pool.splice(Math.floor(random() * pool.length), 1)[0] as IndexRow);
  }
  return out;
}

function Tile({ row, tilt, onOpen }: { row: IndexRow; tilt: number; onOpen: () => void }) {
  return (
    <button type="button" className="tile lift" style={{ rotate: `${tilt}deg` }} onClick={onOpen}>
      <SafeImg src={thumbUrl(`img/${row[0]}.webp`)} alt={row[5]} width={row[3]} height={row[4]} loading="lazy" decoding="async" />
      <span className="tile__cap hand">{row[5]}</span>
    </button>
  );
}

export default function MediaScreen() {
  useTitle('Pictures');
  const index = useMedia<MediaIndex>('index.json');
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [subject, setSubject] = useState(() => (SUBJECT_NAME.has(params.get('subject') ?? '') ? (params.get('subject') as string) : 'all'));
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');
  const [pile, setPile] = useState<IndexRow[]>([]);
  const [open, setOpen] = useState<string | null>(params.get('pic'));

  // How many tiles are shown belongs to the filter it was asked under; a new filter starts again at one page.
  const filterKey = `${subject}|${kind}|${query}`;
  const [more, setMore] = useState<{ key: string; n: number }>({ key: filterKey, n: PAGE });
  const shown = more.key === filterKey ? more.n : PAGE;
  // With no filter the grid opens on the best pictures (Commons Featured, Quality and Valued, then article leads, one per
  // article before any repeats), in the order the build ranked them; rows without a rank keep a fixed mix.
  const rows = useMemo(() => (index.status === 'ready' ? [...index.data.items].sort((a, b) => (a[6] ?? 1e9) - (b[6] ?? 1e9) || mixOf(a[0]) - mixOf(b[0])) : []), [index]);
  const matches = useMemo(() => filterRows(rows, subject, kind, query), [rows, subject, kind, query]);
  // Emblems are not collected, and a diagram only when it is a recognised picture: no chip for a kind the library skips.
  const kinds = useMemo(() => [...new Set(rows.map((r) => r[2]))].filter((k) => k !== 'emblem').sort(), [rows]);
  const current = open ? rows.find((r) => r[0] === open) : undefined;
  const file = useMedia<MediaFile>(current ? `${packOf(current[1])}.json` : null);
  const full = current && file.status === 'ready' ? file.data.items.find((m) => m.id === current[0]) : undefined;

  const list = open ? matches : [];
  const step = (by: -1 | 1): void => {
    const i = list.findIndex((r) => r[0] === open);
    if (i >= 0 && list.length > 0) setOpen((list[(i + by + list.length) % list.length] as IndexRow)[0]);
  };

  return (
    <section className="page squared media" aria-labelledby="media-title">
      <StripHeading
        id="media-title"
        lines={[
          { text: 'Pictures', tone: 'paper', tilt: -2 },
          { text: 'look at the world', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
        ]}
      />
      <p className="media__lead">
        {index.status === 'ready' ? `${index.data.count} pictures` : 'Pictures'} from Wikimedia Commons, each with its author and licence.{' '}
        {/^https?:$/.test(location.protocol)
          ? 'Pictures you have looked at stay on this device; the rest need a connection.'
          : 'Every small picture is on this device; the bigger versions need a connection.'}
      </p>
      {index.status === 'ready' ? (
        <MarginNote decorative tilt={-3} size={30} className="media__note crowding" style={{ color: 'var(--teal-ink)' }}>
          {index.data.count} pictures, and every licence checked against Commons.
        </MarginNote>
      ) : null}

      <div className="media__controls">
        <label className="media__search">
          <span>Search the pictures</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="a lion, a map, a volcano…" />
        </label>
        <button type="button" className="btn btn--yellow" onClick={() => setPile(surprise(rows, 8))} disabled={rows.length === 0}>
          Surprise me
        </button>
      </div>

      {/* Chips on a laptop; two lists on a phone, so the pictures start near the top of the screen. */}
      <div className="media__chips">
        <div className="timeline__filters" role="group" aria-label="Pictures about">
          {[{ id: 'all', label: 'All subjects' }, ...SUBJECTS.map((s) => ({ id: s.id as string, label: s.label }))].map((s) => (
            <button key={s.id} type="button" className="timeline__chip" aria-pressed={subject === s.id} onClick={() => setSubject(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="timeline__filters timeline__filters--continents" role="group" aria-label="Kind of picture">
          {['all', ...kinds].map((k) => (
            <button key={k} type="button" className="timeline__chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
              {k === 'all' ? 'Every kind' : (KIND_LABELS[k] ?? k)}
            </button>
          ))}
        </div>
      </div>
      <div className="media__selects">
        <label>
          <span>Subject</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Kind</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">Every kind</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k] ?? k}
              </option>
            ))}
          </select>
        </label>
      </div>

      {pile.length > 0 ? (
        <section className="media__pile" aria-label="A surprise pile">
          <h2>A surprise pile</h2>
          <div className="media__grid">
            {pile.map((r, i) => (
              <Tile key={r[0]} row={r} tilt={[-3, 2, -1.5, 3][i % 4] ?? 0} onOpen={() => setOpen(r[0])} />
            ))}
          </div>
        </section>
      ) : null}

      {index.status === 'loading' ? <p>Opening the picture box…</p> : null}
      {index.status === 'error' ? <p role="alert">The pictures could not be opened. Try again when you are online once.</p> : null}
      {index.status === 'ready' ? (
        <p className="media__count" role="status">
          Showing {Math.min(shown, matches.length)} of {matches.length} pictures
          {subject === 'all' ? '' : ` about ${SUBJECT_NAME.get(subject) ?? subject}`}.
        </p>
      ) : null}
      <div className="media__table">
        <TornEdge color="var(--coral)" seed="media-top" height={26} />
        <div className="media__grid">
          {matches.slice(0, shown).map((r, i) => (
            <Tile key={r[0]} row={r} tilt={[-1.5, 1, -0.6, 1.4][i % 4] ?? 0} onOpen={() => setOpen(r[0])} />
          ))}
        </div>
      </div>
      {shown < matches.length ? (
        <button type="button" className="btn btn--outline media__more" onClick={() => setMore({ key: filterKey, n: shown + PAGE })}>
          Show {Math.min(PAGE, matches.length - shown)} more
        </button>
      ) : null}
      {index.status === 'ready' && matches.length === 0 ? <p>No picture matches. Try fewer words, or every kind.</p> : null}

      {current ? (
        <MediaViewer
          shown={{ id: current[0], article: current[1], thumb: `img/${current[0]}.webp`, caption: current[5], tw: current[3], th: current[4] }}
          full={full}
          onClose={() => setOpen(null)}
          onStep={list.length > 1 ? step : undefined}
        />
      ) : null}
    </section>
  );
}
