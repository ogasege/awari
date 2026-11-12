/**
 * The reading cache (14-any-article Req 3): every wiki article the
 * student opens is kept on the device, with its lead photo, so it opens
 * offline later. Saved word lookups live here too. Falls back to memory
 * where IndexedDB is unavailable.
 */
import type { Definition } from '../dictionary/lookup.ts';
import type { Article } from '../packs/types.ts';
import type { LoadedArticle } from './api.ts';
import { apiTitle } from './convert.ts';

const DB = 'awari-reading';
const ARTICLES = 'articles';
const WORDS = 'words';

/** The key an article is saved under: its title, lower-case, single spaces. */
export function cacheKey(title: string): string {
  return apiTitle(title).toLowerCase();
}

interface StoredArticle {
  key: string;
  article: Article;
  photo?: { bytes: ArrayBuffer; type: string };
  savedAt: string;
}

interface StoredWord {
  key: string;
  definition: Definition | null;
  savedAt: string;
}

const memory = { articles: new Map<string, StoredArticle>(), words: new Map<string, StoredWord>() };

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(ARTICLES, { keyPath: 'key' });
      req.result.createObjectStore(WORDS, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function put(store: string, value: StoredArticle | StoredWord): Promise<void> {
  const db = await openDb();
  if (!db) {
    return;
  }
  await new Promise<void>((resolve) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
  db.close();
}

async function get<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openDb();
  if (!db) {
    return undefined;
  }
  const value = await new Promise<T | undefined>((resolve) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => resolve(undefined);
  });
  db.close();
  return value;
}

async function all<T>(store: string): Promise<T[]> {
  const db = await openDb();
  if (!db) {
    return [];
  }
  const values = await new Promise<T[]>((resolve) => {
    const req = db.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => resolve([]);
  });
  db.close();
  return values;
}

/** The title an article was resolved to, from its source credit. */
function resolvedTitle(article: Article): string {
  return article.source.name.replace(/^[^:]*:\s*/, '');
}

/** Saves an article under the title asked for and the title it resolved to. */
export async function putArticle(requested: string, loaded: LoadedArticle): Promise<void> {
  const photo = loaded.photo
    ? { bytes: await loaded.photo.arrayBuffer(), type: loaded.photo.type || 'image/jpeg' }
    : undefined;
  const savedAt = new Date().toISOString();
  const keys = new Set([cacheKey(requested), cacheKey(resolvedTitle(loaded.article))]);
  for (const key of keys) {
    const stored: StoredArticle = { key, article: loaded.article, ...(photo ? { photo } : {}), savedAt };
    memory.articles.set(key, stored);
    await put(ARTICLES, stored);
  }
}

function fromStored(stored: StoredArticle): LoadedArticle {
  return {
    article: stored.article,
    ...(stored.photo ? { photo: new Blob([stored.photo.bytes], { type: stored.photo.type }) } : {}),
  };
}

/** The saved article for a title, if the student has read it. */
export async function getArticle(title: string): Promise<LoadedArticle | undefined> {
  const key = cacheKey(title);
  const stored = (await get<StoredArticle>(ARTICLES, key)) ?? memory.articles.get(key);
  return stored ? fromStored(stored) : undefined;
}

/** One line per saved article, for search and the reading list. */
export interface ReadArticle {
  title: string;
  summary: string;
  /** The title as it appears in the address: spaces as underscores. */
  slug: string;
}

/** Every article read so far, newest first, one entry per article. */
export async function listArticles(): Promise<ReadArticle[]> {
  const stored = [...(await all<StoredArticle>(ARTICLES)), ...memory.articles.values()];
  const seen = new Set<string>();
  return stored
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .filter((s) => {
      const id = s.article.source.url;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    })
    .map((s) => {
      const title = resolvedTitle(s.article);
      return { title, summary: s.article.summary, slug: title.replace(/\s+/g, '_') };
    });
}

/** Saves a word lookup (null records "no meaning found"). */
export async function putWord(word: string, definition: Definition | null): Promise<void> {
  const stored: StoredWord = { key: word.toLowerCase(), definition, savedAt: new Date().toISOString() };
  memory.words.set(stored.key, stored);
  await put(WORDS, stored);
}

/** A saved lookup: a definition, null for "none found", undefined if never asked. */
export async function getWord(word: string): Promise<Definition | null | undefined> {
  const key = word.toLowerCase();
  const stored = (await get<StoredWord>(WORDS, key)) ?? memory.words.get(key);
  return stored ? stored.definition : undefined;
}

/** Test helper: forgets everything held in memory. */
export function clearReadingCacheForTests(): void {
  memory.articles.clear();
  memory.words.clear();
}
