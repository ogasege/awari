/**
 * A photo-led article page (03-articles-dictionary): strip headline and
 * lead print on the board, straight reading column on white paper,
 * margin notes, facts card, word side card and full credits.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, navigate } from '../../app/navigation.tsx';
import { useTitle } from '../../app/useTitle.ts';
import { Button, MarginNote, Print, StripHeading, TornEdge } from '../../design/paper.tsx';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import { isBundledPack, subjectById } from '../../lib/packs/subjects.ts';
import { urlTitle } from '../../lib/wiki/convert.ts';
import type { Article, FactsPack, PackIndex } from '../../lib/packs/types.ts';
import { update, withDiscovered } from '../../lib/store/progress.ts';
import { ArticleGallery } from '../media/ArticleGallery.tsx';
import { thumbUrl } from '../../lib/media/media.ts';
import { SafeImg } from '../../design/SafeImg.tsx';
import { ArticleBody } from './ArticleBody.tsx';
import { articleCredits, factRows } from './credit.ts';
import { WordCard } from './WordCard.tsx';
import { errorWords, useWikiArticle } from './useWikiArticle.ts';
import { TourBar } from '../tours/TourBar.tsx';
import { CountryOutline, useShapes } from '../stamps/CountryOutline.tsx';
import { DidYouKnow, KeepExploring, TAPED, TapedPicture, didYouKnow, useArticlePictures } from './scrapbook.tsx';
import './article.css';


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
  const shapes = useShapes();
  if (facts.status !== 'ready') return null;
  const f = facts.data.countries.find((c) => c.id === id);
  if (!f) return null;
  return (
    <section className="facts-card" aria-labelledby="facts-title">
      <CountryOutline shapes={shapes} id={id} className="facts-card__outline" />
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

/** The name shown on the article's yellow label. */
/** The address form of a wiki article's title. */
function wikiSlug(article: Article): string {
  return urlTitle(article.source.name.replace(/^[^:]*:\s*/, ''));
}

function kicker(article: Article): string {
  if (article.pack === 'countries') return 'A country';
  if (article.pack === 'wiki') {
    return article.source.url.includes('simple.') ? 'From Simple English Wikipedia' : 'From English Wikipedia';
  }
  return subjectById(article.pack)?.name ?? 'Awari';
}

function ArticleView({ article, photoSrc }: { article: Article; photoSrc?: string }) {
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
  const pictures = useArticlePictures(article);
  const taped = useMemo(() => pictures.slice(0, Math.min(TAPED, Math.max(0, article.sections.length - 1))), [pictures, article.sections.length]);
  // One more library picture overlaps the lead print on the board, so the first screen has prints of two sizes.
  const second = pictures[taped.length];
  const notes = useMemo(
    () => didYouKnow(article.sections, article.notes.filter((n) => n.kind === 'fact' && n.proof).map((n) => n.proof as string)),
    [article.sections, article.notes],
  );
  const quizTo = `/quiz/${article.pack}/${article.pack === 'wiki' ? wikiSlug(article) : article.id}`;

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
      <TourBar article={`${article.pack}/${article.id}`} />
      <header className="article__board grain">
        <div className="article__titles">
          <StripHeading
            lines={[{ text: article.title, tone: 'paper', tilt: -2 }]}
            className="article__h1"
          />
          <p className="article__kicker">
            <span className="strip strip--yellow">{kicker(article)}</span>
          </p>
          <p className="article__summary">{article.summary}</p>
          <div className="article__actions">
            <Button to={`/quiz/${article.pack}/${article.pack === 'wiki' ? wikiSlug(article) : article.id}`}>Take the quiz</Button>
            {isCountry ? (
              <Button to={`/atlas?c=${article.id}`} tone="outline">
                Find it on the globe
              </Button>
            ) : null}
          </div>
          <p aria-hidden="true" className="article__tap-note hand">
            tap any word below to look it up ↓
          </p>
        </div>
        {lead ? (
          <Print
            className="article__lead"
            src={article.pack === 'wiki' ? (photoSrc ?? lead.file) : packUrl(lead.file)}
            alt={lead.alt}
            caption={lead.caption}
            tilt={3}
            aspect={`${lead.width} / ${lead.height}`}
            tape={[{ left: '38%', width: 120, tilt: -5 }]}
          />
        ) : null}
        {second ? (
          <figure className="article__second" aria-hidden="true">
            <SafeImg src={thumbUrl(second.thumb)} alt="" loading="lazy" decoding="async" />
          </figure>
        ) : null}
        <TornEdge color="var(--paper)" seed={`article-${article.id}`} height={30} />
      </header>

      <div className="article__paper">
        <ArticleBody
          sections={article.sections}
          proofs={proofs}
          onWord={onWord}
          between={taped.map((m, i) => (
            <TapedPicture key={m.id} item={m} index={i} />
          ))}
        />
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
          <DidYouKnow notes={notes} />
          <WordCard tap={tap} />
        </div>
      </div>

      {article.pack !== 'wiki' ? <ArticleGallery articleKey={`${article.pack}/${article.id}`} leadCredit={lead?.credit.name} skip={taped.length} /> : null}
      {article.pack !== 'wiki' ? <KeepExploring article={article} quizTo={quizTo} /> : null}

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

/** An article loaded on demand from Wikipedia (14-any-article). */
function WikiArticle({ title }: { title: string }) {
  const state = useWikiArticle(title);
  if (state.status === 'loading') return <p className="page">Opening the page…</p>;
  if (state.status === 'error') {
    return (
      <section className="page squared" aria-labelledby="wiki-missing">
        <StripHeading id="wiki-missing" lines={[{ text: 'Not here yet', tone: 'yellow', tilt: -2 }]} />
        <p role="alert">{errorWords(state.reason, title)}</p>
        <p>
          <Link to={`/search?q=${encodeURIComponent(title.replace(/_/g, ' '))}`}>Search for it</Link> or{' '}
          <Link to="/atlas">spin the globe</Link>.
        </p>
      </section>
    );
  }
  return <ArticleView key={state.article.id} article={state.article} photoSrc={state.photoSrc} />;
}

export default function ArticleScreen({ params }: { params: Record<string, string> }) {
  const pack = params['pack'] ?? '';
  const id = params['id'] ?? '';
  const bundled = isBundledPack(pack);
  // `index` and `facts` are data files inside the pack folders, not articles: they get the not-found screen (26-final-review F-004).
  const valid = bundled && id !== 'random' && id !== 'index' && id !== 'facts';
  const article = usePack<Article>(valid ? `${pack}/${id}.json` : null);
  if (pack === 'wiki') return <WikiArticle title={id} />;
  if (bundled && id === 'random') return <RandomArticle pack={pack} />;
  if (!valid || article.status === 'error') return <Missing id={id} />;
  if (article.status === 'loading') return <p className="page">Opening the page…</p>;
  return <ArticleView key={article.data.id} article={article.data} />;
}
