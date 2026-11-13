/**
 * The large view of one library picture, with its credit (23-media-library Req 12, 17, 21). The saved small picture
 * shows at once; the larger one comes from Commons when there is a connection. Offline, the small picture stays and
 * the page says so in words.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from '../../app/navigation.tsx';
import { largeUrl, thumbUrl, type MediaItem } from '../../lib/media/media.ts';
import './media.css';

/** What the viewer needs to show a picture before its full record has loaded. */
export interface Shown {
  id: string;
  article: string;
  thumb: string;
  caption: string;
  tw: number;
  th: number;
}

export function MediaViewer({
  shown,
  full,
  onClose,
  onStep,
}: {
  shown: Shown;
  /** The full record, once loaded (author and licence). */
  full: MediaItem | undefined;
  onClose: () => void;
  /** Moves to the previous (-1) or next (1) picture, when there is one. */
  onStep?: (by: -1 | 1) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [result, setResult] = useState<{ id: string; state: 'ready' | 'failed' } | null>(null);
  // The larger picture starts loading again for each new picture; the result is only valid for its own id.
  const large: 'loading' | 'ready' | 'failed' = result?.id === shown.id ? result.state : 'loading';
  const [openedFrom] = useState(() => document.activeElement as HTMLElement | null);

  useEffect(() => {
    closeRef.current?.focus();
    return () => openedFrom?.focus?.();
  }, [openedFrom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onStep?.(-1);
      if (e.key === 'ArrowRight') onStep?.(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  const articlePath = `/article/${shown.article}`;
  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={`Picture: ${shown.caption}`}>
      <button type="button" className="viewer__scrim" aria-label="Close the picture" tabIndex={-1} onClick={onClose} />
      <div className="viewer__card">
        <button ref={closeRef} type="button" className="viewer__close btn btn--ink" onClick={onClose}>
          Close
        </button>
        <div className="viewer__frame" style={{ aspectRatio: `${shown.tw} / ${shown.th}` }}>
          <img className="viewer__small" src={thumbUrl(shown.thumb)} alt={full?.alt ?? shown.caption} width={shown.tw} height={shown.th} />
          {full && large !== 'failed' ? (
            <img
              key={shown.id}
              className={`viewer__large${large === 'ready' ? ' is-ready' : ''}`}
              src={largeUrl(full.title)}
              alt=""
              onLoad={() => setResult({ id: shown.id, state: 'ready' })}
              onError={() => setResult({ id: shown.id, state: 'failed' })}
            />
          ) : null}
        </div>
        <p className="viewer__caption hand">{shown.caption}</p>
        {large === 'failed' ? (
          <p className="viewer__note" role="status">
            The bigger picture needs a connection. This is the small copy saved on this device.
          </p>
        ) : null}
        <p className="viewer__credit">
          {full ? (
            <>
              By {full.author || 'an unknown author'} ·{' '}
              <a href={full.licenceUrl || full.page} rel="noreferrer">
                {full.licence}
              </a>{' '}
              ·{' '}
              <a href={full.page} rel="noreferrer">
                Commons page
              </a>
            </>
          ) : (
            'Loading the credit…'
          )}
        </p>
        <p className="viewer__links">
          <Link to={articlePath}>Read the article{full ? `: ${full.articleTitle}` : ''}</Link>
          {onStep ? (
            <span className="viewer__steps">
              <button type="button" className="btn btn--outline" onClick={() => onStep(-1)}>
                Previous
              </button>
              <button type="button" className="btn btn--outline" onClick={() => onStep(1)}>
                Next
              </button>
            </span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
