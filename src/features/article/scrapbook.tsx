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
export function TapedPicture({ item, index, side }: { item: MediaItem; index: number; side: 'left' | 'right' }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
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

/** One sticky note: in the right-hand column on a wide screen, between sections on a phone (28, owner feedback). */
export function StickyNote({ text, index, where }: { text: string; index: number; where: 'inline' | 'side' }) {
  return (
    <figure className={`dyk__note dyk__note--${index % 3} dyk__note--${where}`}>
      <span aria-hidden="true" className="dyk__pin" />
      <p className="dyk__kicker hand">Did you know?</p>
      <blockquote>{text}</blockquote>
    </figure>
  );
}

const STOP = new Set(
  'the and with from that this near view photo picture image taken during between about into over under their there which while where after before other some more most also very just than then them they these those were was are for but not all can has have had its his her one two three four five six seven eight nine ten many much first second new old big small large long short high low area part city town village people'.split(' '),
);

/** The words of a caption that could tie it to a section: four letters or more, not filler, not the article's own title. */
function captionWords(caption: string, title: string): string[] {
  const own = new Set(title.toLowerCase().match(/\p{L}{4,}/gu) ?? []);
  return [...new Set(caption.toLowerCase().match(/\p{L}{4,}/gu) ?? [])].filter((w) => !STOP.has(w) && !own.has(w));
}

/**
 * Which picture goes beside which section: a picture sits in a section only when one of its caption words (not the
 * article's own name) appears in that section's heading or text, so a dam never lands in the history of the slave
 * trade. A picture with no such section stays in the strip at the end (28-every-screen-like-home, owner feedback).
 * One picture per section; the best match first.
 */
export function placePictures(article: Pick<Article, 'title' | 'sections'>, pictures: readonly MediaItem[]): Map<number, MediaItem> {
  // Whole words only: "resident" is not in "president".
  const text = article.sections.map((s) => new Set(`${s.heading} ${s.paragraphs.join(' ')}`.toLowerCase().match(/\p{L}{4,}/gu) ?? []));
  const options: Array<{ si: number; pi: number; score: number }> = [];
  pictures.forEach((m, pi) => {
    const words = captionWords(m.caption, article.title);
    for (let si = 1; si < article.sections.length; si += 1) {
      const heading = new Set((article.sections[si]?.heading ?? '').toLowerCase().match(/\p{L}{4,}/gu) ?? []);
      const score = words.reduce((n, w) => n + (text[si]?.has(w) ? 1 : 0) + (heading.has(w) ? 2 : 0), 0);
      if (score > 0) options.push({ si, pi, score });
    }
  });
  options.sort((x, y) => y.score - x.score || x.si - y.si || x.pi - y.pi);
  const placed = new Map<number, MediaItem>();
  const used = new Set<number>();
  for (const o of options) {
    if (placed.has(o.si) || used.has(o.pi)) continue;
    placed.set(o.si, pictures[o.pi] as MediaItem);
    used.add(o.pi);
  }
  return placed;
}

/** Spreads the sticky notes through the article: note k goes beside section 1 + floor((k + 0.5) / n * (sections - 1)). */
export function spreadNotes(notes: readonly string[], sectionCount: number): Map<number, string> {
  const out = new Map<number, string>();
  if (sectionCount < 2) return out;
  notes.forEach((n, k) => {
    let si = 1 + Math.floor(((k + 0.5) / notes.length) * (sectionCount - 1));
    while (out.has(si) && si < sectionCount - 1) si += 1;
    if (!out.has(si)) out.set(si, n);
  });
  return out;
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
