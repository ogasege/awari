/**
 * The media library as the app sees it (23-media-library). Files load on demand from `/media/`, so first load
 * is unaffected: `index.json` is a compact list of every picture, `<subject>.json` holds the full records
 * (author, licence, description) and `daily.json` the picture of each day of the year.
 */
import { useEffect, useState } from 'react';

/** One row of `index.json`: id, article key, kind, thumbnail width and height, caption, and the place in the default order (0 is first). */
export type IndexRow = readonly [id: string, article: string, kind: string, tw: number, th: number, caption: string, rank?: number];

export interface MediaIndex {
  built: string;
  count: number;
  subjects: string[];
  items: IndexRow[];
}

/** The full record of one picture in `<subject>.json`. */
export interface MediaItem {
  id: string;
  article: string;
  articleTitle: string;
  kind: string;
  title: string;
  page: string;
  author: string;
  licence: string;
  licenceUrl: string;
  caption: string;
  captionFrom: string;
  alt: string;
  description: string;
  width: number;
  height: number;
  thumb: string;
  tw: number;
  th: number;
  verified: string;
  /** 3 Commons Featured, 2 Quality image, 1 Valued image, 0 none. */
  quality?: number;
  /** The first picture of its article. */
  lead?: boolean;
}

export interface MediaFile {
  subject: string;
  built: string;
  count: number;
  items: MediaItem[];
}

export const KIND_LABELS: Readonly<Record<string, string>> = {
  photo: 'Photographs',
  portrait: 'Portraits',
  map: 'Maps',
  flag: 'Flags',
  art: 'Art',
  diagram: 'Diagrams',
  emblem: 'Emblems',
};

/** The URL of a thumbnail (`thumb` is `img/<id>.webp`). */
export function thumbUrl(thumb: string): string {
  return `/media/${thumb}`;
}

/** The pack of an article key such as `countries/nigeria`. */
export function packOf(articleKey: string): string {
  return articleKey.split('/')[0] ?? '';
}

/** The Commons file name without `File:`. */
export function fileName(title: string): string {
  return title.replace(/^File:/i, '');
}

/** A larger view of a picture, served by Commons (Special:FilePath redirects to the file at that width). */
export function largeUrl(title: string, width = 1024): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName(title))}?width=${width}`;
}

const cache = new Map<string, Promise<unknown>>();

/** Fetches a media file once per session. */
export function loadMedia<T>(file: string, fetchImpl: typeof fetch = fetch): Promise<T> {
  const url = `/media/${file.replace(/^\/+/, '')}`;
  let p = cache.get(url);
  if (!p) {
    p = fetchImpl(url).then((res) => {
      if (!res.ok) throw new Error(`Could not open ${url} (${res.status})`);
      return res.json() as Promise<unknown>;
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p as Promise<T>;
}

/** Test support: forget every loaded media file. */
export function clearMediaCache(): void {
  cache.clear();
}

export type MediaState<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' };

/** React hook around loadMedia. Pass null to skip loading. */
export function useMedia<T>(file: string | null): MediaState<T> {
  const [state, setState] = useState<{ file: string | null; value: MediaState<T> }>({ file, value: { status: 'loading' } });
  useEffect(() => {
    if (!file) return;
    let live = true;
    loadMedia<T>(file).then(
      (data) => live && setState({ file, value: { status: 'ready', data } }),
      () => live && setState({ file, value: { status: 'error' } }),
    );
    return () => {
      live = false;
    };
  }, [file]);
  return state.file === file ? state.value : { status: 'loading' };
}
