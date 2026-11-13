/**
 * The Atlas (04-atlas): a globe to spin, a picker that does the same job
 * from the keyboard, a pinned facts card for the selected country, and
 * the world stamp count drawn as stamps.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, MarginNote, StripHeading } from '../../design/paper.tsx';
import { perforation } from '../../design/wobble.ts';
import { usePack } from '../../lib/packs/load.ts';
import type { FactsPack, PackIndex } from '../../lib/packs/types.ts';
import { update, withDiscovered } from '../../lib/store/progress.ts';
import { useProgress } from '../../lib/store/useProgress.ts';
import { factRows } from '../article/credit.ts';
import { worldBook, type WorldBook } from '../stamps/stamps.ts';
import { Globe, centreOf, type Shapes } from './Globe.tsx';
import { centreOn, type Rotation } from './globeMath.ts';
import './atlas.css';

interface QuizIndex {
  quizzes: Array<{ pack: string; id: string }>;
}

const STAMP = perforation(6, 6);

/**
 * The world stamp count as a stamp sheet: one perforated sheet per
 * continent with its own count, a stamp for every country, filled in as
 * the student finds them (21-review-2 Req 15).
 */
function WorldStamps({ book }: { book: WorldBook }) {
  return (
    <div className="atlas-stamps">
      <p className="atlas-stamps__count">
        <strong>{book.count}</strong> of {book.total || 197} countries discovered
      </p>
      <ul className="atlas-sheets">
        {book.perContinent.map((c, i) => (
          <li key={c.continent} className="atlas-sheet" style={{ rotate: `${[-1.2, 0.9, -0.6, 1.1, -0.9, 0.7][i % 6]}deg` }}>
            <p className="atlas-sheet__head">
              <span className="atlas-sheet__name">{c.continent}</span>
              <span className="atlas-sheet__count">
                {c.count} of {c.total}
              </span>
            </p>
            <div className="atlas-sheet__stamps" aria-hidden="true">
              {Array.from({ length: c.total }, (_, k) => (
                <span key={k} className={k < c.count ? 'is-found' : ''} style={{ clipPath: STAMP }} />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Loaded({ shapes, facts, index, quizzes }: { shapes: Shapes; facts: FactsPack; index: PackIndex; quizzes: QuizIndex }) {
  const progress = useProgress();
  const initial = useMemo(() => new URLSearchParams(window.location.search).get('c'), []);
  const byIso = useMemo(() => new Map(shapes.features.map((f) => [f.properties.iso3, f])), [shapes]);
  const startFeature = initial ? shapes.features.find((f) => f.properties.id === initial) : undefined;
  const [selected, setSelected] = useState<string | null>(startFeature?.properties.iso3 ?? null);
  const [rotation, setRotation] = useState<Rotation>(() =>
    startFeature ? centreOf(startFeature) : centreOn(18, 4),
  );

  const feature = selected ? byIso.get(selected) : undefined;
  const slug = feature?.properties.id ?? null;
  const fact = slug ? facts.countries.find((c) => c.id === slug) : undefined;
  const hasArticle = slug ? index.items.some((i) => i.id === slug) : false;
  const hasQuiz = slug ? quizzes.quizzes.some((q) => q.pack === 'countries' && q.id === slug) : false;
  const discovered = useMemo(() => new Set(progress.discovered), [progress.discovered]);
  const book = worldBook(progress.discovered, index.items);

  useEffect(() => {
    if (slug && hasArticle) void update((p) => withDiscovered(p, slug));
  }, [slug, hasArticle]);

  const select = (iso: string): void => {
    const f = byIso.get(iso);
    if (!f) return;
    setSelected(iso);
    setRotation(centreOf(f));
  };

  const options = useMemo(
    () =>
      [...shapes.features]
        .map((f) => f.properties)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [shapes],
  );

  return (
    <div className="atlas">
      <div className="atlas__side">
        <StripHeading
          lines={[
            { text: 'Spin', tone: 'paper', tilt: -3 },
            { text: 'the globe', tone: 'yellow', tilt: 2, style: { marginLeft: '0.5em' } },
          ]}
          className="atlas__title"
        />
        <p className="atlas__lead">
          Drag the Earth to turn it, then tap a country to visit. Every country you open turns
          yellow and becomes a stamp in your book.
        </p>
        <label className="atlas__picker">
          <span>Or choose a country</span>
          <select value={selected ?? ''} onChange={(e) => select(e.target.value)}>
            <option value="" disabled>
              Pick one…
            </option>
            {options.map((o) => (
              <option key={o.iso3 + o.name} value={o.iso3}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="atlas__globe">
        <Globe
          shapes={shapes}
          rotation={rotation}
          onRotate={setRotation}
          discovered={discovered}
          selected={selected}
          onSelect={select}
        />
        <MarginNote className="atlas__drag crowding" decorative color="var(--yellow)" tilt={-6} size={30}>
          drag me!
        </MarginNote>
      </div>

      <div className="atlas__card-slot" aria-live="polite">
        {feature ? (
          <section className="atlas-card" aria-labelledby="atlas-card-title">
            <span aria-hidden="true" className="atlas-card__pin" />
            <h2 id="atlas-card-title">
              <span className="strip strip--navy">{feature.properties.name}</span>
            </h2>
            {fact ? (
              <dl>
                {factRows(fact).map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>We do not have facts for this place yet.</p>
            )}
            {hasArticle ? (
              <div className="atlas-card__actions">
                <Button to={`/article/countries/${slug}`}>Read about {feature.properties.name}</Button>
                {hasQuiz ? (
                  <Button to={`/quiz/countries/${slug}`} tone="outline">
                    Take the quiz
                  </Button>
                ) : null}
              </div>
            ) : (
              <p>There is no article about this place in Awari yet.</p>
            )}
            {slug && discovered.has(slug) ? <p className="atlas-card__found hand">discovered! ✓ stamp added</p> : null}
            {fact ? (
              <p className="atlas-card__credit">
                Facts from <a href={fact.source.url} rel="noreferrer">Wikidata</a> (CC0).
              </p>
            ) : null}
          </section>
        ) : (
          <p className="atlas-card atlas-card--empty hand">Tap a country to see its facts here.</p>
        )}
      </div>

      <div className="atlas__sheets">
        <WorldStamps book={book} />
      </div>

      <p className="atlas__credit">
        Country shapes from <a href="https://www.naturalearthdata.com/" rel="noreferrer">Natural Earth</a>{' '}
        (public domain). Facts from Wikidata (CC0). <Link to="/credits">All credits</Link>
      </p>
    </div>
  );
}

export default function AtlasScreen() {
  useTitle('Atlas');
  const shapes = usePack<Shapes>('atlas/countries.json');
  const facts = usePack<FactsPack>('countries/facts.json');
  const index = usePack<PackIndex>('countries/index.json');
  const quizzes = usePack<QuizIndex>('quizzes/index.json');
  const all = [shapes, facts, index, quizzes];
  if (all.some((p) => p.status === 'error')) {
    return <p className="page">The atlas could not be opened. Try again when you are online once.</p>;
  }
  if (shapes.status !== 'ready' || facts.status !== 'ready' || index.status !== 'ready' || quizzes.status !== 'ready') {
    return <p className="page">Unrolling the map…</p>;
  }
  return (
    <section className="atlas-board grain" aria-label="Atlas">
      <Loaded shapes={shapes.data} facts={facts.data} index={index.data} quizzes={quizzes.data} />
    </section>
  );
}
