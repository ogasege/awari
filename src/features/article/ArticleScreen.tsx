/**
 * A photo-led article page (03-articles-dictionary): strip headline and
 * lead print on the board, straight reading column on white paper,
 * margin notes, facts card, word side card and full credits.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link, navigate } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, MarginNote, Print, StripHeading, TornEdge } from '../../design/paper.tsx';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import type { Article, FactsPack, PackIndex } from '../../lib/packs/types.ts';
import { update, withDiscovered } from '../../lib/store/progress.ts';
import { ArticleBody } from './ArticleBody.tsx';
import { articleCredits, factRows } from './credit.ts';
import { WordCard } from './WordCard.tsx';
import './article.css';

const PACKS = new Set(['countries', 'physics']);

/** `/article/:pack/random` picks any article in the pack. */
function RandomArticle({ pack }: { pack: string }) {
  const index = usePack<PackIndex>(`${pack}/index.json`);
  useEffect(() => {
    if (index.status === 'ready' && index.data.items.length > 0) {
      const pick = index.data.items[Math.floor(Math.random() * index.data.items.length)];
      if (pick) navigate(`/article/${pack}/${pick.id}`, true);
    }
  }, [index, pack]);
  return <p className="page">Picking a page at random…</p>;
}

function Missing({ id }: { id: string }) {
  useTitle('Article not found');
  return (
    <section className="page squared">
      <StripHeading
        lines={[
          { text: 'No page called', tone: 'paper', tilt: -2 },
          { text: id || 'that', tone: 'yellow', tilt: 1.5 },
        ]}
      />
      <p>
        That article is not in Awari yet.{' '}
        <Link to={`/search?q=${encodeURIComponent(id)}`}>Search for it</Link> or{' '}
        <Link to="/atlas">find a country on the globe</Link>.
      </p>
    </section>
  );
}

function FactsCard({ id }: { id: string }) {
  const facts = usePack<FactsPack>('countries/facts.json');
  if (facts.status !== 'ready') return null;
  const f = facts.data.countries.find((c) => c.id === id);
  if (!f) return null;
  return (
    <section className="facts-card" aria-labelledby="facts-title">
      <h2 id="facts-title">Quick facts</h2>
      <dl>
        {factRows(f).map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="facts-card__credit">
        From{' '}
        <a href={f.source.url} rel="noreferrer">
          Wikidata
        </a>{' '}
        (CC0)
      </p>
    </section>
  );
}

function ArticleView({ article }: { article: Article }) {
  useTitle(article.title);
  const [tap, setTap] = useState<{ word: string; n: number } | null>(null);
  const onWord = useCallback(
    (word: string) => setTap((t) => ({ word, n: (t?.n ?? 0) + 1 })),
    [],
  );
  const lead = article.photos[0];
  const facts = article.notes.filter((n) => n.kind === 'fact' && n.proof);
  const proofs = facts.map((n) => n.proof as string);
  const isCountry = article.pack === 'countries';

  useEffect(() => {
    if (isCountry) void update((p) => withDiscovered(p, article.id));
  }, [article.id, isCountry]);

  // "Where to look" hints and proof links point at a section anchor.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, [article.id]);

  return (
    <article className="article">
      <header className="article__board grain">
        <div className="article__titles">
          <StripHeading
            lines={[{ text: article.title, tone: 'paper', tilt: -2 }]}
            className="article__h1"
          />
          <p className="article__kicker">
            <span className="strip strip--yellow">{isCountry ? 'A country' : 'Electricity'}</span>
          </p>
          <p className="article__summary">{article.summary}</p>
          <div className="article__actions">
            <Button to={`/quiz/${article.pack}/${article.id}`}>Take the quiz</Button>
            {isCountry ? (
              <Button to={`/atlas?c=${article.id}`} tone="outline">
                Find it on the globe
              </Button>
            ) : null}
          </div>
        </div>
        {lead ? (
          <Print
            className="article__lead"
            src={packUrl(lead.file)}
            alt={lead.alt}
            caption={lead.caption}
            tilt={3}
            aspect={`${lead.width} / ${lead.height}`}
            tape={[{ left: '38%', width: 120, tilt: -5 }]}
          />
        ) : null}
        <TornEdge color="var(--paper)" seed={`article-${article.id}`} height={30} />
      </header>

      <div className="article__paper">
        <ArticleBody sections={article.sections} proofs={proofs} onWord={onWord} />
        <div className="article__side">
          {facts.length > 0 ? (
            <div className="article__notes">
              {facts.map((n, i) => (
                <MarginNote key={n.text} tilt={i % 2 ? 2 : -3} color="var(--teal-ink)" size={26}>
                  <a href={`#proof-${i}`}>{n.text}</a>
                </MarginNote>
              ))}
            </div>
          ) : null}
          {isCountry ? <FactsCard id={article.id} /> : null}
          <WordCard tap={tap} />
        </div>
      </div>

      <footer className="page-footer">
        {articleCredits(article).map((c) => (
          <p key={c.text}>
            {c.text}{' '}
            <a href={c.source.url} rel="noreferrer">
              Source
            </a>{' '}
            ·{' '}
            <a href={c.source.licenceUrl} rel="noreferrer">
              Licence
            </a>
          </p>
        ))}
      </footer>
    </article>
  );
}

export default function ArticleScreen({ params }: { params: Record<string, string> }) {
  const pack = params['pack'] ?? '';
  const id = params['id'] ?? '';
  const valid = PACKS.has(pack) && id !== 'random';
  const article = usePack<Article>(valid ? `${pack}/${id}.json` : null);
  if (PACKS.has(pack) && id === 'random') return <RandomArticle pack={pack} />;
  if (!valid || article.status === 'error') return <Missing id={id} />;
  if (article.status === 'loading') return <p className="page">Opening the page…</p>;
  return <ArticleView key={article.data.id} article={article.data} />;
}
