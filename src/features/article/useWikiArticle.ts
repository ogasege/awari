/**
 * Opens a wiki article for a page: from the reading cache when the
 * student has read it before (so it works offline), otherwise from
 * Wikipedia, saving it as it goes (14-any-article Req 1 and 3).
 */
import { useEffect, useState } from 'react';
import type { Article } from '../../lib/packs/types.ts';
import { loadWikiArticle } from '../../lib/wiki/api.ts';
import { getArticle, putArticle } from '../../lib/wiki/cache.ts';
import { WikiError, apiTitle } from '../../lib/wiki/convert.ts';

export type WikiState =
  | { status: 'loading' }
  | { status: 'ready'; article: Article; photoSrc?: string; fromCache: boolean }
  | { status: 'error'; reason: WikiError['reason'] };

/** The words shown for each way opening an article can fail. */
export function errorWords(reason: WikiError['reason'], title: string): string {
  const name = apiTitle(title);
  switch (reason) {
    case 'offline':
      return `You are offline, and “${name}” has not been opened on this device yet. Articles you open while online are saved, so they work offline next time.`;
    case 'notfound':
      return `Neither Simple English Wikipedia nor English Wikipedia has a page called “${name}”.`;
    case 'empty':
      return `The page “${name}” has no text to show.`;
    default:
      return `Wikipedia could not give us “${name}” just now. Please try again in a moment.`;
  }
}

export function useWikiArticle(title: string): WikiState {
  const [state, setState] = useState<{ title: string; value: WikiState }>({ title, value: { status: 'loading' } });

  useEffect(() => {
    let live = true;
    let url: string | undefined;
    const done = (value: WikiState): void => {
      if (live) setState({ title, value });
    };
    /** An address for the photo bytes; no photo is better than no article. */
    const show = (photo: Blob | undefined): string | undefined => {
      try {
        return photo ? URL.createObjectURL(photo) : undefined;
      } catch {
        return undefined;
      }
    };
    void (async () => {
      try {
        const cached = await getArticle(title);
        if (cached) {
          url = show(cached.photo);
          done({ status: 'ready', article: cached.article, photoSrc: url, fromCache: true });
          return;
        }
        const loaded = await loadWikiArticle(title);
        await putArticle(title, loaded);
        url = show(loaded.photo);
        done({ status: 'ready', article: loaded.article, photoSrc: url, fromCache: false });
      } catch (error) {
        done({ status: 'error', reason: error instanceof WikiError ? error.reason : 'failed' });
      }
    })();
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [title]);

  return state.title === title ? state.value : { status: 'loading' };
}
