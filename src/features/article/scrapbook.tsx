/**
 * The article as a scrapbook spread (28-every-screen-like-home task 3): pictures taped in between sections at
 * different sizes on alternating sides, "Did you know" sticky notes in the article's own words, and "Keep exploring"
 * as overlapping prints with the quiz as a ticket. The reading text itself stays one calm column (Rule 7).
 */
import { useMemo, useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { Print, Tape } from '../../design/paper.tsx';
import { SafeImg } from '../../design/SafeImg.tsx';
import { thumbUrl, useMedia, type MediaFile, type MediaItem } from '../../lib/media/media.ts';
import { coverFor } from '../../lib/packs/covers.ts';
import { packUrl, usePack } from '../../lib/packs/load.ts';
import type { Article, ArticleSection, FactsPack, PackIndex } from '../../lib/packs/types.ts';
import { splitSentences } from '../../lib/quiz/sentences.ts';
import { unsuitableTopic } from '../../lib/text/suitability.ts';
import { galleryFor } from '../media/ArticleGallery.tsx';
import { relatedQuizzes } from '../quiz/related.ts';

/** How many library pictures are taped in between sections; the rest stay in the "More pictures" strip. */
export const TAPED = 4;

/** The article's library pictures (minus the lead photo), for taping in and for the strip. */
export function useArticlePictures(article: Article): MediaItem[] {
  const key = `${article.pack}/${article.id}`;
  const file = useMedia<MediaFile>(article.pack !== 'wiki' ? `${article.pack}.json` : null);
  const lead = article.photos[0]?.credit.name;
  return useMemo(() => (file.status === 'ready' ? galleryFor(file.data.items, key, lead) : []), [file, key, lead]);
}

const SIZES = [300, 240, 270, 220];
const TILTS = [-3, 2.5, -2, 3];

/** One picture taped onto the page between sections; left out if it cannot load (offline and not saved). */
export function TapedPicture({ item, index }: { item: MediaItem; index: number }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  const side = index % 2 ? 'right' : 'left';
  return (
    <figure className={`taped taped--${side}`} style={{ width: SIZES[index % SIZES.length], rotate: `${TILTS[index % TILTS.length]}deg` }}>
      <Tape left={side === 'left' ? '30%' : '40%'} width={90} tilt={index % 2 ? 6 : -6} tone={index % 3 ? 'clear' : 'yellow'} />
      <SafeImg src={thumbUrl(item.thumb)} alt={item.alt} width={item.tw} height={item.th} loading="lazy" decoding="async" onFail={() => setGone(true)} />
      <figcaption className="hand">{item.caption}</figcaption>
      <p className="taped__credit">
        {item.author || 'Unknown author'}, {item.licence}, Wikimedia Commons
      </p>
    </figure>
  );
}

/** Sentences worth a sticky note: short, with a number or a "most" word, suitable, not the lead, not a proof. */
export function didYouKnow(sections: readonly ArticleSection[], proofs: readonly string[], count = 3): string[] {
  const pool: string[] = [];
  sections.forEach((s, si) => {
    if (si === 0) return;
    for (const p of s.paragraphs) {
      for (const sentence of splitSentences(p)) {
        if (sentence.length < 45 || sentence.length > 150) continue;
        if (!/\d|largest|biggest|highest|longest|oldest|first|only|most|smallest/i.test(sentence)) continue;
        if (/^(He|She|It|They|This|These|Those|His|Her|Its|Their|There|However|But|And|Also)\b/.test(sentence)) continue;
        if (proofs.includes(sentence) || unsuitableTopic(sentence)) continue;
        // A sticky note is for a fun fact, not for war and conflict, even where the article covers them.
        if (/\b(war|wars|conflict|attack|insurgen|kill|slave|bandit|armed|rebel|terror|religio|massacre|genocide|bomb)/i.test(sentence)) continue;
        pool.push(sentence);
      }
    }
  });
  if (pool.length <= count) return pool;
  // Spread the notes through the article: the first, the middle and the last candidate.
  const step = (pool.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => pool[Math.round(i * step)] as string);
}

export function DidYouKnow({ notes }: { notes: readonly string[] }) {
  if (notes.length === 0) return null;
  return (
    <section className="dyk" aria-label="Did you know?">
      {notes.map((n, i) => (
        <figure key={n} className={`dyk__note dyk__note--${i % 3}`}>
          <span aria-hidden="true" className="dyk__pin" />
          <p className="dyk__kicker hand">Did you know?</p>
          <blockquote>{n}</blockquote>
        </figure>
      ))}
    </section>
  );
}

/** "Keep exploring": three related articles as overlapping prints, and the quiz as a ticket. */
export function KeepExploring({ article, quizTo }: { article: Article; quizTo: string }) {
  const index = usePack<PackIndex>(article.pack !== 'wiki' ? `${article.pack}/index.json` : null);
  const facts = usePack<FactsPack>(article.pack === 'countries' ? 'countries/facts.json' : null);
  const next = index.status === 'ready' ? relatedQuizzes(index.data.items, article.id, facts.status === 'ready' ? facts.data.countries : [], 3) : [];
  return (
    <section className="explore-on" aria-labelledby="explore-on-title">
      <h2 id="explore-on-title" className="explore-on__title">
        Keep exploring
      </h2>
      <div className="explore-on__table">
        <Link to={quizTo} className="explore-on__ticket">
          <span className="explore-on__admit hand">admit one</span>
          <span className="explore-on__quiz">Take the {article.title} quiz</span>
          <span className="explore-on__small">five questions, three hints each</span>
        </Link>
        <div className="explore-on__prints">
          {next.map((item, i) => (
            <Print
              key={item.id}
              className={`explore-on__print explore-on__print--${i}`}
              src={item.thumb ? packUrl(item.thumb) : (coverFor(article.pack)?.file ?? '')}
              alt=""
              caption={item.title}
              captionSize={24}
              width={[230, 200, 215][i] ?? 210}
              tilt={[-5, 3, -2][i] ?? 0}
              to={`/article/${article.pack}/${item.id}`}
              tape={[{ left: '35%', width: 80, tilt: i % 2 ? 6 : -6, tone: 'yellow' }]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
