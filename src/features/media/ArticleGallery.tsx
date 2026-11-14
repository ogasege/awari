/**
 * The strip of library pictures under an article's heading (23-media-library Req 12). It shows every picture the
 * library holds for this article, except the one already used as the article's lead photo, so no picture is on the
 * page twice (Property 3). Tapping one opens the large view.
 */
import { useMemo, useState } from 'react';
import { fileName, packOf, thumbUrl, useMedia, type MediaFile, type MediaItem } from '../../lib/media/media.ts';
import { SafeImg } from '../../design/SafeImg.tsx';
import { MediaViewer } from './MediaViewer.tsx';
import './media.css';

/** The Commons file name inside an article photo credit (`Wikimedia Commons: Name.jpg`). */
export function leadFileName(creditName: string | undefined): string {
  return (creditName ?? '').replace(/^Wikimedia Commons:\s*/i, '').trim();
}

/** The pictures to show: those of this article, minus the lead photo's own file. */
export function galleryFor(items: readonly MediaItem[], articleKey: string, leadCredit?: string): MediaItem[] {
  const lead = leadFileName(leadCredit).toLowerCase();
  return items.filter((m) => m.article === articleKey && fileName(m.title).toLowerCase() !== lead);
}

export function ArticleGallery({ articleKey, leadCredit }: { articleKey: string; leadCredit?: string }) {
  const file = useMedia<MediaFile>(articleKey.includes('/') && packOf(articleKey) !== 'wiki' ? `${packOf(articleKey)}.json` : null);
  const all = useMemo(() => (file.status === 'ready' ? galleryFor(file.data.items, articleKey, leadCredit) : []), [file, articleKey, leadCredit]);
  // A picture that cannot load (not saved yet, and no connection) is left out, and one line says how many, so the strip
  // is never a row of empty frames (26-final-review F-001).
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const items = useMemo(() => all.filter((m) => !failed.has(m.id)), [all, failed]);
  const [open, setOpen] = useState<number | null>(null);
  if (all.length === 0) return null;
  const current = open === null ? undefined : items[open];
  const missing = all.length - items.length;
  return (
    <section className="gallery" aria-label={`More pictures of ${all[0]?.articleTitle ?? 'this article'}`}>
      <h2 className="gallery__title">More pictures</h2>
      {items.length > 0 ? <p className="gallery__note">From Wikimedia Commons, shown as small copies resized to 480 px. Open one for its author and licence.</p> : null}
      {missing > 0 ? (
        <p className="gallery__note gallery__note--missing" role="status">
          {missing} more {missing === 1 ? 'picture' : 'pictures'} when you are back online. Once you have seen a picture, it stays on this device.
        </p>
      ) : null}
      <ul className="gallery__strip">
        {items.map((m, i) => (
          <li key={m.id}>
            <button type="button" className="gallery__thumb lift" style={{ rotate: `${[-1.5, 1, -0.6, 1.4][i % 4]}deg` }} onClick={() => setOpen(i)}>
              <SafeImg src={thumbUrl(m.thumb)} alt={m.alt} width={m.tw} height={m.th} loading="lazy" decoding="async" onFail={() => setFailed((p) => new Set(p).add(m.id))} />
              <span className="gallery__cap hand">{m.caption}</span>
            </button>
          </li>
        ))}
      </ul>
      {current ? (
        <MediaViewer
          shown={current}
          full={current}
          onClose={() => setOpen(null)}
          onStep={(by) => setOpen((o) => (o === null ? o : (o + by + items.length) % items.length))}
        />
      ) : null}
    </section>
  );
}
