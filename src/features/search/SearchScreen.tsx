/**
 * Search (13-search): articles, quizzes, timeline events and a dictionary
 * meaning, all found on the device so it works offline.
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, navigate, usePath } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { StripHeading } from '../../design/paper.tsx';
import { lookupWord, partOfSpeech, type Definition } from '../../lib/dictionary/lookup.ts';
import { loadPack, usePack } from '../../lib/packs/load.ts';
import { BUNDLED_PACKS } from '../../lib/packs/subjects.ts';
import type { PackIndex, PackId, TimelinePack } from '../../lib/packs/types.ts';
import { listArticles, type ReadArticle } from '../../lib/wiki/cache.ts';
import { mergeResults, wikiSearch, type WikiHit } from '../../lib/wiki/search.ts';
import { searchDocs, snippetOf, tokens, type SearchDoc } from './search.ts';
import './search.css';

interface QuizIndex {
  quizzes: Array<{ pack: PackId; id: string }>;
}

const MAX_SHOWN = 40;

/** Every bundled pack index, loaded on demand when search opens (15-subject-packs Req 3.1). */
function usePackIndexes(): { ready: PackIndex[]; loading: boolean } {
  const [state, setState] = useState<{ ready: PackIndex[]; loading: boolean }>({ ready: [], loading: true });
  useEffect(() => {
    let live = true;
    void Promise.allSettled(BUNDLED_PACKS.map((p) => loadPack<PackIndex>(`${p}/index.json`))).then((results) => {
      if (!live) return;
      setState({
        ready: results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : [])),
        loading: false,
      });
    });
    return () => {
      live = false;
    };
  }, []);
  return state;
}

export default function SearchScreen() {
  // The header's search box navigates to /search?q=…; follow the address.
  const path = usePath();
  const urlQuery = new URLSearchParams(path.split('?')[1] ?? '').get('q') ?? '';
  const [seen, setSeen] = useState(urlQuery);
  const [field, setField] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery);
  if (seen !== urlQuery) {
    setSeen(urlQuery);
    setField(urlQuery);
    setQuery(urlQuery);
  }
  useTitle(query.trim() ? `Search: ${query.trim()}` : 'Search');
  // Results follow the typing, a moment after the last key, like an encyclopedia's find-as-you-type box.
  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q === field.trim() ? q : field.trim())), 220);
    return () => clearTimeout(t);
  }, [field]);
  const [letter, setLetter] = useState<string | null>(null);

  const indexes = usePackIndexes();
  const quizzes = usePack<QuizIndex>('quizzes/index.json');
  const timeline = usePack<TimelinePack>('timeline.json');

  const docs = useMemo<SearchDoc[]>(() => {
    const out: SearchDoc[] = [];
    for (const index of indexes.ready) {
      for (const i of index.items) {
        out.push({ kind: 'article', id: `${index.pack}/${i.id}`, title: i.title, text: i.summary, to: `/article/${index.pack}/${i.id}` });
      }
    }
    if (timeline.status === 'ready') {
      for (const e of timeline.data.events) {
        out.push({ kind: 'event', id: e.id, title: e.label, text: e.text, to: `/timeline?year=${Number(e.date.slice(0, 4))}` });
      }
    }
    return out;
  }, [indexes, timeline]);

  const quizSet = useMemo(
    () => new Set(quizzes.status === 'ready' ? quizzes.data.quizzes.map((q) => `${q.pack}/${q.id}`) : []),
    [quizzes],
  );
  const hits = useMemo(() => searchDocs(docs, query), [docs, query]);
  const events = hits.filter((h) => h.kind === 'event').slice(0, MAX_SHOWN);

  // Articles already read on this device, searchable offline (14-any-article Req 3.3).
  const [read, setRead] = useState<ReadArticle[]>([]);
  useEffect(() => {
    let live = true;
    void listArticles().then((list) => live && setRead(list));
    return () => {
      live = false;
    };
  }, []);
  const readHits = useMemo(
    () =>
      searchDocs(
        read.map((r) => ({ kind: 'article' as const, id: r.slug, title: r.title, text: r.summary, to: `/article/wiki/${encodeURIComponent(r.slug)}` })),
        query,
      ),
    [read, query],
  );

  // Any topic, online (14-any-article Req 4.1).
  const [online, setOnline] = useState<{ query: string; hits: WikiHit[] } | null>(null);
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let live = true;
    void wikiSearch(q).then((found) => live && setOnline({ query: q, hits: found }));
    return () => {
      live = false;
    };
  }, [query]);
  const onlineHits = useMemo(() => (online && online.query === query.trim() ? online.hits : []), [online, query]);
  const searching = query.trim() !== '' && online?.query !== query.trim();
  const articles = useMemo(
    () => mergeResults(hits.filter((h) => h.kind === 'article'), readHits, onlineHits).slice(0, MAX_SHOWN),
    [hits, readHits, onlineHits],
  );
  const best = articles[0];

  const words = tokens(query);
  const single = words.length === 1 ? (words[0] ?? null) : null;
  const [meaning, setMeaning] = useState<{ word: string; def: Definition | null } | null>(null);
  useEffect(() => {
    if (!single) return;
    let live = true;
    lookupWord(single).then(
      (def) => live && setMeaning({ word: single, def }),
      () => live && setMeaning({ word: single, def: null }),
    );
    return () => {
      live = false;
    };
  }, [single]);
  const def = single && meaning?.word === single ? meaning.def : null;

  const azLetters = useMemo(() => [...new Set(docs.filter((d) => d.kind === 'article').map((d) => d.title.charAt(0).toUpperCase()).filter((c) => /[A-Z]/.test(c)))].sort(), [docs]);
  const azArticles = useMemo(
    () => (letter ? docs.filter((d) => d.kind === 'article' && d.title.toUpperCase().startsWith(letter)).sort((a, b) => a.title.localeCompare(b.title)) : []),
    [docs, letter],
  );
  const loading = indexes.loading || timeline.status === 'loading' || searching;
  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const q = field.trim();
    setQuery(q);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search', true);
  };

  return (
    <section className="page squared search" aria-labelledby="search-title">
      <StripHeading
        id="search-title"
        lines={[
          { text: 'Search', tone: 'paper', tilt: -2 },
          { text: 'find anything', tone: 'yellow', tilt: 1.5, style: { marginLeft: '0.8em' } },
        ]}
      />
      <form role="search" className="search__form" onSubmit={submit}>
        <label htmlFor="search-field">Search articles, events and words</label>
        <div>
          <input id="search-field" type="search" value={field} onChange={(e) => setField(e.target.value)} />
          <button type="submit" className="btn btn--yellow">
            Search
          </button>
        </div>
      </form>

      <div role="status" aria-live="polite" className="search__status">
        {words.length === 0
          ? 'Type a word or a name to start.'
          : loading
            ? 'Looking through the packs…'
            : `${articles.length + events.length} ${articles.length + events.length === 1 ? 'result' : 'results'} for “${query.trim()}”.${typeof navigator !== 'undefined' && navigator.onLine === false ? ' You are offline, so only saved articles are searched.' : ''}`}
      </div>

      {words.length === 0 && azLetters.length > 0 ? (
        <section className="search__az" aria-labelledby="search-az">
          <h2 id="search-az">Browse A to Z</h2>
          <ul className="search__letters">
            {azLetters.map((l) => (
              <li key={l}>
                <button type="button" className="search__letter" aria-pressed={letter === l} onClick={() => setLetter(letter === l ? null : l)}>
                  {l}
                </button>
              </li>
            ))}
          </ul>
          {letter ? (
            <ul className="search__list search__az-list" aria-label={`Articles starting with ${letter}`}>
              {azArticles.map((d) => (
                <li key={d.to}>
                  <Link to={d.to} className="search__title">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {best && !loading ? (
        <p className="search__best">
          <Link to={best.to} className="btn btn--yellow">
            Open {best.title}
          </Link>
        </p>
      ) : null}

      {def ? (
        <aside className="search__meaning" aria-labelledby="search-meaning">
          <h2 id="search-meaning">The word “{def.lemma}”</h2>
          <ol>
            {def.senses.map((s, i) => (
              <li key={i}>
                <span className="search__pos">{partOfSpeech(s.pos)}</span> {s.gloss}
              </li>
            ))}
          </ol>
        </aside>
      ) : null}

      {articles.length > 0 ? (
        <section aria-labelledby="search-articles">
          <h2 id="search-articles">Articles</h2>
          <ul className="search__list">
            {articles.map((h) => {
              const id = h.to.replace('/article/', '');
              return (
                <li key={h.to}>
                  <Link to={h.to} className="search__title">
                    {h.title}
                  </Link>
                  {h.origin === 'wikipedia' ? <span className="search__origin"> From Wikipedia</span> : null}
                  {h.origin === 'read' ? <span className="search__origin"> You read this</span> : null}
                  <p>{snippetOf(h.text, query)}</p>
                  {quizSet.has(id) ? (
                    <Link to={`/quiz/${id}`} className="search__quiz">
                      Take the {h.title} quiz
                    </Link>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {events.length > 0 ? (
        <section aria-labelledby="search-events">
          <h2 id="search-events">On the timeline</h2>
          <ul className="search__list">
            {events.map((h) => (
              <li key={h.id}>
                <Link to={h.to} className="search__title">
                  {h.title}
                </Link>
                <p>{snippetOf(h.text, query)}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {words.length > 0 && !loading && articles.length === 0 && events.length === 0 && !def ? (
        <p className="search__none">
          Nothing matched. Try a shorter word, or wander instead: <Link to="/atlas">spin the globe</Link> or{' '}
          <Link to="/quizzes">pick a quiz</Link>.
        </p>
      ) : null}
    </section>
  );
}
